import express from 'express';
import cors from 'cors';
import { CRMService } from './services/CRMService.js';
import { DataProcessor } from './services/DataProcessor.js';
import { CacheManager } from './services/CacheManager.js';
import { WebhookService } from './services/WebhookService.js';
import { IndependentSystemService } from './services/IndependentSystemService.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true // Allow all origins in production for Vercel
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Initialize services
const crmService = new CRMService();
const dataProcessor = new DataProcessor();
const cacheManager = new CacheManager();
const webhookService = new WebhookService(crmService, dataProcessor, cacheManager);
const independentSystem = new IndependentSystemService(crmService, dataProcessor, cacheManager, webhookService);

// Global error handler
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Helper function to get current month date range
const getCurrentMonthRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    startDate: startOfMonth.toISOString().split('T')[0],
    endDate: endOfMonth.toISOString().split('T')[0]
  };
};

// WEBHOOK ENDPOINTS - Receber notificações do RD Station
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

// Health check - Important for Vercel
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

// System status endpoint
app.get('/api/system/status', (req, res) => {
  const systemStatus = independentSystem.getSystemStatus();
  
  res.json({
    success: true,
    data: systemStatus,
    timestamp: new Date().toISOString()
  });
});

// Force system reload (for maintenance)
app.post('/api/system/reload', asyncHandler(async (req, res) => {
  await independentSystem.forceFullReload();
  
  res.json({
    success: true,
    message: 'System reloaded successfully',
    timestamp: new Date().toISOString()
  });
}));

// Dashboard KPIs - Always current month unless filters are applied
app.get('/api/dashboard/kpis', asyncHandler(async (req, res) => {
  const { startDate, endDate, consultantIds, campaignIds, consultantEmail } = req.query;
  
  try {
    // Use current month if no date filters are provided
    let dateRange = {};
    if (startDate && endDate) {
      dateRange = { startDate, endDate };
    } else {
      dateRange = getCurrentMonthRange();
    }
    
    // Check cache first
    const cacheKey = `kpis_${dateRange.startDate}_${dateRange.endDate}_${consultantIds || ''}_${campaignIds || ''}_${consultantEmail || ''}`;
    let cachedData = cacheManager.get(cacheKey);
    
    if (!cachedData) {
      // Tentar usar dados do cache primeiro
      let deals = cacheManager.get('deals_all');
      
      if (!deals) {
        // Se não tiver no cache, buscar do CRM
        const dealsResult = await crmService.getDeals({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          consultantIds: consultantIds ? consultantIds.split(',') : undefined,
          campaignIds: campaignIds ? campaignIds.split(',') : undefined,
          consultantEmail: consultantEmail
        });
        deals = dealsResult.deals;
      } else {
        // Filtrar dados do cache conforme necessário
        deals = deals.filter(deal => {
          const dealDate = new Date(deal.createdAt);
          const startFilter = new Date(dateRange.startDate);
          const endFilter = new Date(dateRange.endDate);
          
          let matchesDate = dealDate >= startFilter && dealDate <= endFilter;
          let matchesConsultant = true;
          let matchesCampaign = true;
          let matchesEmail = true;
          
          if (consultantIds) {
            const consultantIdArray = consultantIds.split(',');
            matchesConsultant = consultantIdArray.includes(deal.consultantId);
          }
          
          if (campaignIds) {
            const campaignIdArray = campaignIds.split(',');
            matchesCampaign = campaignIdArray.includes(deal.campaignId);
          }
          
          if (consultantEmail) {
            matchesEmail = deal.consultantEmail && deal.consultantEmail.toLowerCase() === consultantEmail.toLowerCase();
          }
          
          return matchesDate && matchesConsultant && matchesCampaign && matchesEmail;
        });
      }
      
      // Process data to calculate KPIs
      cachedData = dataProcessor.calculateKPIs(deals);
      
      // Cache for 5 minutes
      cacheManager.set(cacheKey, cachedData, 300);
    }
    
    res.json({
      success: true,
      data: cachedData,
      timestamp: new Date().toISOString(),
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      fromCache: true
    });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

// Consultants data
app.get('/api/consultants', asyncHandler(async (req, res) => {
  const { includePerformance = 'true', startDate, endDate } = req.query;
  
  try {
    const cacheKey = `consultants_${includePerformance}_${startDate || ''}_${endDate || ''}`;
    let cachedData = cacheManager.get(cacheKey);
    
    if (!cachedData) {
      // Tentar usar dados do cache primeiro
      let users = cacheManager.get('users_all');
      
      if (!users) {
        users = await crmService.getUsers();
        cacheManager.set('users_all', users, 3600);
      }
      
      if (includePerformance === 'true') {
        // Use date range if provided, otherwise use current month
        let dateRange = {};
        if (startDate && endDate) {
          dateRange = { startDate, endDate };
        } else {
          dateRange = getCurrentMonthRange();
        }
        
        // Tentar usar deals do cache
        let deals = cacheManager.get('deals_all');
        
        if (!deals) {
          const dealsResult = await crmService.getDeals({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          });
          deals = dealsResult.deals;
        } else {
          // Filtrar por data se necessário
          if (startDate && endDate) {
            deals = deals.filter(deal => {
              const dealDate = new Date(deal.createdAt);
              return dealDate >= new Date(startDate) && dealDate <= new Date(endDate);
            });
          }
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
      
      // Cache for 10 minutes
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

// Campaigns data
app.get('/api/campaigns', asyncHandler(async (req, res) => {
  const { includeMetrics = 'true', startDate, endDate } = req.query;
  
  try {
    const cacheKey = `campaigns_${includeMetrics}_${startDate || ''}_${endDate || ''}`;
    let cachedData = cacheManager.get(cacheKey);
    
    if (!cachedData) {
      // Tentar usar dados do cache primeiro
      let campaigns = cacheManager.get('campaigns_all');
      
      if (!campaigns) {
        campaigns = await crmService.getCampaigns();
        cacheManager.set('campaigns_all', campaigns, 3600);
      }
      
      if (includeMetrics === 'true') {
        // Use date range if provided, otherwise use current month
        let dateRange = {};
        if (startDate && endDate) {
          dateRange = { startDate, endDate };
        } else {
          dateRange = getCurrentMonthRange();
        }
        
        // Tentar usar deals do cache
        let deals = cacheManager.get('deals_all');
        
        if (!deals) {
          const dealsResult = await crmService.getDeals({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          });
          deals = dealsResult.deals;
        } else {
          // Filtrar por data se necessário
          if (startDate && endDate) {
            deals = deals.filter(deal => {
              const dealDate = new Date(deal.createdAt);
              return dealDate >= new Date(startDate) && dealDate <= new Date(endDate);
            });
          }
        }
        
        cachedData = dataProcessor.calculateCampaignMetrics(campaigns, deals);
      } else {
        cachedData = campaigns;
      }
      
      // Cache for 15 minutes
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

// Deals data
app.get('/api/deals', asyncHandler(async (req, res) => {
  const { 
    startDate, 
    endDate, 
    consultantId, 
    consultantEmail,
    campaignId, 
    stage, 
    page = 1, 
    limit = 50 
  } = req.query;
  
  try {
    // Tentar usar dados do cache primeiro
    let deals = cacheManager.get('deals_all');
    
    if (!deals) {
      const dealsResult = await crmService.getDeals({
        startDate,
        endDate,
        consultantId,
        consultantEmail,
        campaignId,
        stage,
        page: parseInt(page),
        limit: parseInt(limit)
      });
      deals = dealsResult.deals;
    } else {
      // Filtrar dados do cache
      deals = deals.filter(deal => {
        let matches = true;
        
        if (startDate && endDate) {
          const dealDate = new Date(deal.createdAt);
          matches = matches && dealDate >= new Date(startDate) && dealDate <= new Date(endDate);
        }
        
        if (consultantId) {
          matches = matches && deal.consultantId === consultantId;
        }
        
        if (consultantEmail) {
          matches = matches && deal.consultantEmail && deal.consultantEmail.toLowerCase() === consultantEmail.toLowerCase();
        }
        
        if (campaignId) {
          matches = matches && deal.campaignId === campaignId;
        }
        
        if (stage) {
          matches = matches && deal.stage === stage;
        }
        
        return matches;
      });
      
      // Aplicar paginação
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      deals = deals.slice(startIndex, startIndex + parseInt(limit));
    }
    
    res.json({
      success: true,
      data: deals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: deals.length
      },
      timestamp: new Date().toISOString(),
      fromCache: true
    });
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

// Analytics endpoints
app.get('/api/analytics/sales-prediction', asyncHandler(async (req, res) => {
  const { months = 3, startDate, endDate } = req.query;
  
  try {
    const cacheKey = `sales_prediction_${months}_${startDate || ''}_${endDate || ''}`;
    let cachedData = cacheManager.get(cacheKey);
    
    if (!cachedData) {
      // Use provided date range or default to last 90 days
      let dateRange = {};
      if (startDate && endDate) {
        dateRange = { startDate, endDate };
      } else {
        const endDate = new Date();
        const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        dateRange = {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        };
      }
      
      // Tentar usar dados do cache primeiro
      let deals = cacheManager.get('deals_all');
      
      if (!deals) {
        const dealsResult = await crmService.getDeals({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        });
        deals = dealsResult.deals;
      }
      
      cachedData = dataProcessor.generateSalesPrediction(deals, parseInt(months));
      
      // Cache for 1 hour
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
      // Use provided date range or current month
      let dateRange = {};
      if (startDate && endDate) {
        dateRange = { startDate, endDate };
      } else {
        dateRange = getCurrentMonthRange();
      }
      
      // Tentar usar dados do cache primeiro
      let deals = cacheManager.get('deals_all');
      
      if (!deals) {
        const dealsResult = await crmService.getDeals({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        });
        deals = dealsResult.deals;
      }
      
      cachedData = dataProcessor.analyzeLossReasons(deals);
      
      // Cache for 30 minutes
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

// Goals endpoints
app.get('/api/goals', asyncHandler(async (req, res) => {
  const { consultantId, consultantEmail } = req.query;
  
  try {
    // Always use current month for goals
    const currentMonth = getCurrentMonthRange();
    
    // Tentar usar dados do cache primeiro
    let deals = cacheManager.get('deals_all');
    
    if (!deals) {
      const dealsResult = await crmService.getDeals({
        consultantId,
        consultantEmail,
        startDate: currentMonth.startDate,
        endDate: currentMonth.endDate
      });
      deals = dealsResult.deals;
    } else {
      // Filtrar dados do cache
      deals = deals.filter(deal => {
        const dealDate = new Date(deal.createdAt);
        const startFilter = new Date(currentMonth.startDate);
        const endFilter = new Date(currentMonth.endDate);
        
        let matchesDate = dealDate >= startFilter && dealDate <= endFilter;
        let matchesConsultant = true;
        
        if (consultantId) {
          matchesConsultant = deal.consultantId === consultantId;
        }
        
        if (consultantEmail) {
          matchesConsultant = deal.consultantEmail && deal.consultantEmail.toLowerCase() === consultantEmail.toLowerCase();
        }
        
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

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// INICIALIZAÇÃO DO SISTEMA INDEPENDENTE
// Este sistema roda 24/7, independente de usuários logados
const initializeIndependentSystem = async () => {
  try {
    console.log('🌟 Inicializando sistema independente...');
    await independentSystem.start();
  } catch (error) {
    console.error('❌ Erro crítico na inicialização:', error);
    // Tentar novamente em 30 segundos
    setTimeout(initializeIndependentSystem, 30000);
  }
};

// Inicializar sistema independente imediatamente
initializeIndependentSystem();

// Start server only in development
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 CRM Backend Server running on port ${PORT}`);
    console.log(`📊 Dashboard API available at http://localhost:${PORT}/api`);
    console.log(`🔔 Webhook endpoints:`);
    console.log(`   - Deal Created: http://localhost:${PORT}/webhooks/deal-created`);
    console.log(`   - Deal Updated: http://localhost:${PORT}/webhooks/deal-updated`);
  });
}

// Export for Vercel
export default app;