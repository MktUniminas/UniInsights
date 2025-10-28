// index.js (completo)

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { CRMService } from './services/CRMService.js';
import { DataProcessor } from './services/DataProcessor.js';
import { CacheManager } from './services/CacheManager.js';
import { WebhookService } from './services/WebhookService.js';
import { IndependentSystemService } from './services/IndependentSystemService.js';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? true
      : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
  }
});

// Torna o io acessível globalmente (se você quiser emitir de outros módulos futuramente)
global.io = io;

const PORT = process.env.PORT || 3001;

// ====================== Middleware ======================
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? true // Vercel: allow all
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// ====================== Serviços ======================
const crmService = new CRMService();
const dataProcessor = new DataProcessor();
const cacheManager = new CacheManager();
const webhookService = new WebhookService(crmService, dataProcessor, cacheManager);
const independentSystem = new IndependentSystemService(
  crmService, dataProcessor, cacheManager, webhookService
);

// ====================== Helpers ======================
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const getCurrentMonthRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: startOfMonth.toISOString().split('T')[0],
    endDate: endOfMonth.toISOString().split('T')[0]
  };
};

// ====================== Webhooks ======================
app.post('/webhooks/deal-created', asyncHandler(async (req, res) => {
  console.log('🔔 Webhook deal_created recebido');
  try {
    await independentSystem.processWebhook('crm_deal_created', req.body);
    res.status(200).json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('❌ Erro processando webhook deal_created:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}));

app.post('/webhooks/deal-updated', asyncHandler(async (req, res) => {
  console.log('🔔 Webhook deal_updated recebido');
  try {
    await independentSystem.processWebhook('crm_deal_updated', req.body);
    res.status(200).json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('❌ Erro processando webhook deal_updated:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}));

// ====================== Health & System ======================
app.get('/api/health', (req, res) => {
  const systemStatus = independentSystem.getSystemStatus();
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    system: systemStatus
  });
});

app.get('/api/system/status', (req, res) => {
  const systemStatus = independentSystem.getSystemStatus();
  res.json({
    success: true,
    data: systemStatus,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/system/reload', asyncHandler(async (req, res) => {
  await independentSystem.forceFullReload();
  res.json({
    success: true,
    message: 'System reloaded successfully',
    timestamp: new Date().toISOString()
  });
}));

// ====================== Dashboard KPIs ======================
// Sempre mês atual por padrão. Se filtros vierem, respeitar.
app.get('/api/dashboard/kpis', asyncHandler(async (req, res) => {
  const { startDate, endDate, consultantIds, campaignIds, consultantEmail } = req.query;

  try {
    // 1) Determinar período com prioridade: fechamento > criação > manual > mês atual
    let startStr, endStr, dateType;

    if (req.query.closureStart && req.query.closureEnd) {
      startStr = req.query.closureStart;
      endStr   = req.query.closureEnd;
      dateType = 'fechamento';
    } else if (req.query.creationStart && req.query.creationEnd) {
      startStr = req.query.creationStart;
      endStr   = req.query.creationEnd;
      dateType = 'criação';
    } else if (startDate && endDate) {
      startStr = startDate;
      endStr   = endDate;
      dateType = 'manual';
    } else {
      const defaultRange = getCurrentMonthRange();
      startStr = defaultRange.startDate;
      endStr   = defaultRange.endDate;
      dateType = 'mês atual';
    }

    console.log(`📅 KPIs - período (${dateType}): ${startStr} → ${endStr}`);

    // 2) Busca negociações no CRM com os filtros ativos
    const { deals: rawDeals = [] } = await crmService.getDeals({
      startDate: startStr,
      endDate: endStr,

      consultantIds: consultantIds ? consultantIds.split(',') : undefined,
      campaignIds: campaignIds ? campaignIds.split(',') : undefined,
      consultantEmail: consultantEmail || undefined,

      // Enviar também marcadores de tipo de período, se vierem
      creationStart: req.query.creationStart,
      creationEnd: req.query.creationEnd,
      closureStart: req.query.closureStart,
      closureEnd: req.query.closureEnd
    });

    console.log(`📦 Total recebido do CRM (antes da limpeza): ${rawDeals.length}`);

    // Alimenta cache base para outras rotas/atualização incremental
    if (rawDeals.length) {
      cacheManager.set('deals_all', rawDeals, 300);
    }

    // 3) Deduplicar por ID
    const mapById = new Map();
    for (const d of rawDeals) {
      if (d?.id && !mapById.has(d.id)) mapById.set(d.id, d);
    }
    let deals = Array.from(mapById.values());
    console.log(`🧽 Após dedupe por ID: ${deals.length}`);

    // 4) Filtrar por data conforme o tipo selecionado
    const inDateWindow = (d) => {
      const dateField = (dateType === 'fechamento') ? d.closedAt : d.createdAt;
      const dateStr = (dateField || '').slice(0, 10);
      return dateStr >= startStr && dateStr <= endStr;
    };

    // 5) Filtros opcionais (consultor, campanha, e-mail)
    const idsConsultores = consultantIds ? consultantIds.split(',').map(String) : null;
    const idsCampanhas   = campaignIds ? campaignIds.split(',').map(String) : null;

    deals = deals.filter(d => {
      if (!inDateWindow(d)) return false;
      let ok = true;
      if (idsConsultores) ok = ok && idsConsultores.includes(String(d.consultantId || ''));
      if (idsCampanhas) ok = ok && idsCampanhas.includes(String(d.campaignId || ''));
      if (consultantEmail) ok = ok && d.consultantEmail?.toLowerCase() === consultantEmail.toLowerCase();
      return ok;
    });

    console.log(`📊 Negócios dentro do período filtrado: ${deals.length}`);

    // 6) Classificação de status
    const isWon = (d) => d.stage === 'won' || /ganho|vendid|fechad/i.test(d.dealStage || '');
    const isLost = (d) => d.stage === 'lost' || /perdid|cancelad/i.test(d.dealStage || '');

    const ganhos    = deals.filter(isWon);
    const perdidos  = deals.filter(isLost);
    const andamento = deals.filter(d => !isWon(d) && !isLost(d));

    // 7) KPIs
    const toNumber = (v) => Number.isFinite(v) ? v : Number(v) || 0;
    const faturamento = ganhos.reduce((acc, d) => acc + toNumber(d.value), 0);
    const ticketMedio = ganhos.length ? +(faturamento / ganhos.length).toFixed(2) : 0;

    const finalKpis = {
      periodo: `${startStr} a ${endStr}`,
      totalDealsCreated: deals.length,
      totalDealsWon: ganhos.length,
      totalDealsLost: perdidos.length,
      totalRevenue: +faturamento.toFixed(2),
      averageTicket: ticketMedio,
      conversionRate: deals.length ? +((ganhos.length / deals.length) * 100).toFixed(2) : 0
    };

    res.json({
      success: true,
      data: finalKpis,
      timestamp: new Date().toISOString(),
      fromCache: false
    });

  } catch (error) {
    console.error('❌ Erro ao gerar KPIs:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

// ====================== Consultants ======================
app.get('/api/consultants', asyncHandler(async (req, res) => {
  const { includePerformance = 'true', startDate, endDate } = req.query;

  try {
    const cacheKey = `consultants_${includePerformance}_${startDate || ''}_${endDate || ''}`;
    let cachedData = cacheManager.get(cacheKey);

    if (!cachedData) {
      let users = cacheManager.get('users_all');
      if (!users) {
        users = await crmService.getUsers();
        cacheManager.set('users_all', users, 3600);
      }

      if (includePerformance === 'true') {
        let dateRange = {};
        if (startDate && endDate) {
          dateRange = { startDate, endDate };
        } else {
          dateRange = getCurrentMonthRange();
        }

        let deals = cacheManager.get('deals_all');
        if (!deals) {
          const dealsResult = await crmService.getDeals({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          });
          deals = dealsResult.deals || [];
          cacheManager.set('deals_all', deals, 300);
        } else if (startDate && endDate) {
          deals = deals.filter(deal => {
            const dealDate = new Date(deal.createdAt);
            return dealDate >= new Date(startDate) && dealDate <= new Date(endDate);
          });
        }

        cachedData = dataProcessor.calculateConsultantPerformance(users, deals);
      } else {
        cachedData = users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          active: user.active
        }));
      }

      cacheManager.set(cacheKey, cachedData, 600);
    }

    res.json({
      success: true,
      data: cachedData,
      timestamp: new Date().toISOString(),
      fromCache: true
    });
  } catch (error) {
    console.error('Error fetching consultants:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

// ====================== Campaigns ======================
app.get('/api/campaigns', asyncHandler(async (req, res) => {
  const { includeMetrics = 'true', startDate, endDate } = req.query;

  try {
    const cacheKey = `campaigns_${includeMetrics}_${startDate || ''}_${endDate || ''}`;
    let cachedData = cacheManager.get(cacheKey);

    if (!cachedData) {
      let campaigns = cacheManager.get('campaigns_all');

      if (!campaigns) {
        campaigns = await crmService.getCampaigns();
        cacheManager.set('campaigns_all', campaigns, 3600);
      }

      if (includeMetrics === 'true') {
        let dateRange = {};
        if (startDate && endDate) {
          dateRange = { startDate, endDate };
        } else {
          dateRange = getCurrentMonthRange();
        }

        let deals = cacheManager.get('deals_all');
        if (!deals) {
          const dealsResult = await crmService.getDeals({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          });
          deals = dealsResult.deals || [];
          cacheManager.set('deals_all', deals, 300);
        } else if (startDate && endDate) {
          deals = deals.filter(deal => {
            const dealDate = new Date(deal.createdAt);
            return dealDate >= new Date(startDate) && dealDate <= new Date(endDate);
          });
        }

        cachedData = dataProcessor.calculateCampaignMetrics(campaigns, deals);
      } else {
        cachedData = campaigns;
      }

      cacheManager.set(cacheKey, cachedData, 900);
    }

    res.json({
      success: true,
      data: cachedData,
      timestamp: new Date().toISOString(),
      fromCache: true
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

// ====================== Deals (com filtros) ======================
app.get('/api/deals', asyncHandler(async (req, res) => {
  const {
    creationStart,
    creationEnd,
    closureStart,
    closureEnd,
    consultantId,
    consultantEmail,
    campaignId,
    stage,
    page = 1,
    limit = 50
  } = req.query;

  try {
    const cacheKey = `deals_${creationStart || ''}_${creationEnd || ''}_${closureStart || ''}_${closureEnd || ''}_${consultantId || ''}_${campaignId || ''}_${stage || ''}`;
    let deals = cacheManager.get(cacheKey);

    if (!deals) {
      const rdFilters = {};

      if (creationStart || creationEnd) {
        rdFilters.created_at_period = true;
        if (creationStart) rdFilters.start_date = creationStart;
        if (creationEnd) rdFilters.end_date = creationEnd;
      }

      if (closureStart || closureEnd) {
        rdFilters.closed_at_period = true;
        rdFilters.closed_at = true;
        if (closureStart) rdFilters.start_date = closureStart;
        if (closureEnd) rdFilters.end_date = closureEnd;
      }

      if (consultantId) rdFilters.user_id = consultantId;
      if (consultantEmail) rdFilters.consultantEmail = consultantEmail; // pós-processamento no CRMService
      if (campaignId) rdFilters.campaign_id = campaignId;
      if (stage) rdFilters.stage = stage;

      rdFilters.limit = parseInt(limit);

      console.log('📤 Enviando filtros para CRMService:', rdFilters);

      const dealsResult = await crmService.getDeals(rdFilters);
      deals = dealsResult.deals || [];

      // Alimentar cache base também
      const allDealsCache = cacheManager.get('deals_all') || [];
      if (deals.length && allDealsCache.length === 0) {
        cacheManager.set('deals_all', deals, 300);
      }

      cacheManager.set(cacheKey, deals, 120);
    }

    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedDeals = deals.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      success: true,
      data: paginatedDeals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: deals.length
      },
      timestamp: new Date().toISOString(),
      fromCache: !!cacheManager.get(cacheKey)
    });

  } catch (error) {
    console.error('❌ Error fetching deals:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

// ====================== Analytics ======================
app.get('/api/analytics/sales-prediction', asyncHandler(async (req, res) => {
  const { months = 3, startDate, endDate } = req.query;

  try {
    const cacheKey = `sales_prediction_${months}_${startDate || ''}_${endDate || ''}`;
    let cachedData = cacheManager.get(cacheKey);

    if (!cachedData) {
      let dateRange = {};
      if (startDate && endDate) {
        dateRange = { startDate, endDate };
      } else {
        const _end = new Date();
        const _start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        dateRange = {
          startDate: _start.toISOString().split('T')[0],
          endDate: _end.toISOString().split('T')[0]
        };
      }

      let deals = cacheManager.get('deals_all');
      if (!deals) {
        const dealsResult = await crmService.getDeals({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        });
        deals = dealsResult.deals || [];
        cacheManager.set('deals_all', deals, 300);
      }

      cachedData = dataProcessor.generateSalesPrediction(deals, parseInt(months));
      cacheManager.set(cacheKey, cachedData, 3600);
    }

    res.json({
      success: true,
      data: cachedData,
      timestamp: new Date().toISOString(),
      fromCache: true
    });
  } catch (error) {
    console.error('Error generating sales prediction:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

app.get('/api/analytics/loss-analysis', asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const cacheKey = `loss_analysis_${startDate || ''}_${endDate || ''}`;
    let cachedData = cacheManager.get(cacheKey);

    if (!cachedData) {
      let dateRange = {};
      if (startDate && endDate) {
        dateRange = { startDate, endDate };
      } else {
        dateRange = getCurrentMonthRange();
      }

      let deals = cacheManager.get('deals_all');

      if (!deals) {
        const dealsResult = await crmService.getDeals({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        });
        deals = dealsResult.deals || [];
        cacheManager.set('deals_all', deals, 300);
      }

      cachedData = dataProcessor.analyzeLossReasons(deals);
      cacheManager.set(cacheKey, cachedData, 1800);
    }

    res.json({
      success: true,
      data: cachedData,
      timestamp: new Date().toISOString(),
      fromCache: true
    });
  } catch (error) {
    console.error('Error analyzing loss reasons:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

// ====================== Goals ======================
app.get('/api/goals', asyncHandler(async (req, res) => {
  const { consultantId, consultantEmail } = req.query;

  try {
    const currentMonth = getCurrentMonthRange();

    let deals = cacheManager.get('deals_all');
    if (!deals) {
      const dealsResult = await crmService.getDeals({
        consultantId,
        consultantEmail,
        startDate: currentMonth.startDate,
        endDate: currentMonth.endDate
      });
      deals = dealsResult.deals || [];
      cacheManager.set('deals_all', deals, 300);
    } else {
      deals = deals.filter(deal => {
        const dealDate = new Date(deal.createdAt);
        const startFilter = new Date(currentMonth.startDate);
        const endFilter = new Date(currentMonth.endDate);

        let matchesDate = dealDate >= startFilter && dealDate <= endFilter;
        let matchesConsultant = true;

        if (consultantId) matchesConsultant = deal.consultantId === consultantId;
        if (consultantEmail) matchesConsultant = deal.consultantEmail?.toLowerCase() === consultantEmail.toLowerCase();

        return matchesDate && matchesConsultant;
      });
    }

    const goals = dataProcessor.calculateGoals(deals, consultantId || consultantEmail);

    res.json({
      success: true,
      data: goals,
      timestamp: new Date().toISOString(),
      fromCache: true
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

// ====================== Error Handler ======================
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// ====================== Inicialização (sync periódico) ======================
const startIncrementalSync = async () => {
  const SYNC_INTERVAL_MS = Number(process.env.SYNC_INTERVAL_MS || 60 * 60 * 1000); // 1 hora
  let isSyncing = false;
  let lastCheck = Date.now();

  try {
    console.log(`🌀 Sincronização incremental periódica habilitada (intervalo: ${SYNC_INTERVAL_MS / 60000} min)`);

    // Semeia cache inicial (se vazio) usando mês atual — isso não interfere nos filtros
    let cached = cacheManager.get('deals_all');
    if (!cached) {
      const base = getCurrentMonthRange();
      const seed = await crmService.getDeals({
        startDate: base.startDate,
        endDate: base.endDate
      });
      cached = seed.deals || [];
      cacheManager.set('deals_all', cached, 300);
      console.log(`✅ Cache inicial deals_all: ${cached.length}`);
    }

    setInterval(async () => {
      if (isSyncing) return; // evita concorrência
      isSyncing = true;

      try {
        // busca somente atualizações desde a última execução
        const updated = await crmService.getUpdatedDeals(lastCheck);
        lastCheck = Date.now();

        const updatedDeals = updated.deals || [];
        if (updatedDeals.length === 0) {
          isSyncing = false;
          return;
        }

        // Mescla no cache base sem tocar em caches de filtro
        const current = cacheManager.get('deals_all') || [];
        const map = new Map(current.map(d => [d.id, d]));
        for (const d of updatedDeals) map.set(d.id, d);
        const merged = Array.from(map.values());

        cacheManager.set('deals_all', merged, 300);

        // Notifica o front — opcional
        if (global.io) {
          global.io.emit('deals_update', {
            total: merged.length,
            newDeals: updatedDeals
          });
        }

        console.log(`📈 Sync horário: ${updatedDeals.length} novos/atualizados. Total: ${merged.length}`);
      } catch (e) {
        console.warn('⚠️ Incremental sync falhou:', e.message);
      } finally {
        isSyncing = false;
      }
    }, SYNC_INTERVAL_MS);

  } catch (error) {
    console.error('❌ Erro ao iniciar sync incremental:', error);
  }
};


const initializeIndependentSystem = async () => {
  try {
    console.log('🌟 Inicializando sistema independente...');
    await independentSystem.start();
    await startIncrementalSync(); // inicia atualização em background
  } catch (error) {
    console.error('❌ Erro crítico na inicialização:', error);
    setTimeout(initializeIndependentSystem, 30000);
  }
};

//initializeIndependentSystem();

// ====================== Start Server ======================
if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`🚀 CRM Backend Server running on port ${PORT}`);
    console.log(`📊 Dashboard API available at http://localhost:${PORT}/api`);
    console.log(`🔔 Webhook endpoints:`);
    console.log(`   - Deal Created: http://localhost:${PORT}/webhooks/deal-created`);
    console.log(`   - Deal Updated: http://localhost:${PORT}/webhooks/deal-updated`);
  });
}

export default app;
