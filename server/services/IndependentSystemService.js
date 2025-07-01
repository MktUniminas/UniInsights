import cron from 'node-cron';

export class IndependentSystemService {
  constructor(crmService, dataProcessor, cacheManager, webhookService) {
    this.crmService = crmService;
    this.dataProcessor = dataProcessor;
    this.cacheManager = cacheManager;
    this.webhookService = webhookService;
    
    // Estado do sistema
    this.isRunning = false;
    this.lastFullLoad = null;
    this.systemStartTime = Date.now();
    
    // Timers para operações contínuas
    this.frontendUpdateTimer = null;
    
    // Estatísticas do sistema
    this.stats = {
      fullLoadsCompleted: 0,
      webhooksProcessed: 0,
      frontendUpdates: 0,
      systemUptime: 0,
      lastFullLoad: null,
      lastWebhookReceived: null,
      errors: 0
    };
  }
  
  // Iniciar sistema independente
  async start() {
    if (this.isRunning) {
      console.log('⚠️ Sistema independente já está rodando');
      return;
    }
    
    this.isRunning = true;
    console.log('🚀 Iniciando sistema independente 24/7...');
    
    try {
      // 1. Carregamento inicial completo
      await this.performFullDataLoad();
      
      // 2. Configurar reset diário às 00:00
      this.scheduleDailyReset();
      
      // 3. Iniciar timer de atualização do frontend (10 segundos)
      this.startFrontendUpdateTimer();
      
      console.log('✅ Sistema independente iniciado com sucesso!');
      console.log('📊 Operando 24/7 - Dados sempre prontos para usuários');
      
    } catch (error) {
      console.error('❌ Erro iniciando sistema independente:', error);
      this.stats.errors++;
      this.isRunning = false;
    }
  }
  
  // Parar sistema independente
  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    console.log('⏹️ Parando sistema independente...');
    
    // Parar timers
    if (this.frontendUpdateTimer) {
      clearInterval(this.frontendUpdateTimer);
      this.frontendUpdateTimer = null;
    }
    
    console.log('✅ Sistema independente parado');
  }
  
  // Carregamento inicial completo de dados
  async performFullDataLoad() {
    console.log('🔄 Iniciando carregamento completo de dados...');
    const startTime = Date.now();
    
    try {
      // Limpar cache existente
      this.cacheManager.clear();
      
      // 1. Buscar todos os negócios do mês atual
      const currentMonth = this.getCurrentMonthRange();
      console.log(`📅 Carregando dados do mês atual: ${currentMonth.startDate} a ${currentMonth.endDate}`);
      
      const dealsResult = await this.crmService.getDeals({
        startDate: currentMonth.startDate,
        endDate: currentMonth.endDate
      });
      
      const deals = dealsResult.deals;
      console.log(`📊 ${deals.length} negócios carregados`);
      
      // 2. Buscar usuários e campanhas
      const [users, campaigns] = await Promise.all([
        this.crmService.getUsers(),
        this.crmService.getCampaigns()
      ]);
      
      console.log(`👥 ${users.length} usuários carregados`);
      console.log(`🎯 ${campaigns.length} campanhas carregadas`);
      
      // 3. Salvar dados no cache
      this.cacheManager.set('deals_all', deals, 86400); // 24 horas
      this.cacheManager.set('users_all', users, 86400);
      this.cacheManager.set('campaigns_all', campaigns, 86400);
      
      // 4. Salvar token de paginação para atualizações incrementais
      if (dealsResult.pagination.nextPage) {
        this.cacheManager.set('deals_pagination', {}, 86400, {
          nextPage: dealsResult.pagination.nextPage,
          lastCheck: Date.now()
        });
      }
      
      // 5. Calcular e cachear KPIs iniciais
      const kpis = this.dataProcessor.calculateKPIs(deals);
      this.cacheManager.set('kpis_current_month', kpis, 3600); // 1 hora
      
      // 6. Calcular performance dos consultores
      const consultantsPerformance = this.dataProcessor.calculateConsultantPerformance(users, deals);
      this.cacheManager.set('consultants_current_month', consultantsPerformance, 3600);
      
      // 7. Calcular métricas das campanhas
      const campaignMetrics = this.dataProcessor.calculateCampaignMetrics(campaigns, deals);
      this.cacheManager.set('campaigns_current_month', campaignMetrics, 3600);
      
      // 8. Marcar carregamento completo
      this.cacheManager.markFullRefresh();
      this.lastFullLoad = Date.now();
      this.stats.fullLoadsCompleted++;
      this.stats.lastFullLoad = new Date().toISOString();
      
      const duration = Date.now() - startTime;
      console.log(`✅ Carregamento completo finalizado em ${duration}ms`);
      console.log(`📈 Cache populado com ${deals.length} negócios, ${users.length} usuários, ${campaigns.length} campanhas`);
      
    } catch (error) {
      console.error('❌ Erro no carregamento completo:', error);
      this.stats.errors++;
      throw error;
    }
  }
  
  // Configurar reset diário às 00:00
  scheduleDailyReset() {
    // Reset diário às 00:00 (meia-noite)
    cron.schedule('0 0 * * *', async () => {
      console.log('🌅 Executando reset diário às 00:00...');
      
      try {
        await this.performFullDataLoad();
        console.log('✅ Reset diário concluído com sucesso');
      } catch (error) {
        console.error('❌ Erro no reset diário:', error);
        this.stats.errors++;
      }
    }, {
      timezone: 'America/Sao_Paulo' // Fuso horário do Brasil
    });
    
    console.log('⏰ Reset diário agendado para 00:00 (horário de Brasília)');
  }
  
  // Timer de atualização do frontend (10 segundos)
  startFrontendUpdateTimer() {
    this.frontendUpdateTimer = setInterval(() => {
      // Este timer serve para manter o cache "fresco" e detectar mudanças
      // Os webhooks já fazem as atualizações em tempo real
      // Aqui apenas atualizamos estatísticas e verificamos saúde do sistema
      
      this.stats.frontendUpdates++;
      this.stats.systemUptime = Date.now() - this.systemStartTime;
      
      // Log silencioso a cada 60 atualizações (10 minutos)
      if (this.stats.frontendUpdates % 60 === 0) {
        console.log(`💓 Sistema ativo - ${this.stats.frontendUpdates} atualizações, uptime: ${Math.round(this.stats.systemUptime / 1000 / 60)} min`);
      }
      
    }, 10000); // 10 segundos
    
    console.log('⏱️ Timer de atualização do frontend iniciado (10s)');
  }
  
  // Obter range do mês atual
  getCurrentMonthRange() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0]
    };
  }
  
  // Processar webhook recebido
  async processWebhook(eventType, payload) {
    if (!this.isRunning) {
      console.log('⚠️ Sistema não está rodando, ignorando webhook');
      return;
    }
    
    try {
      this.stats.webhooksProcessed++;
      this.stats.lastWebhookReceived = new Date().toISOString();
      
      switch (eventType) {
        case 'crm_deal_created':
          await this.webhookService.handleDealCreated(payload);
          break;
          
        case 'crm_deal_updated':
          await this.webhookService.handleDealUpdated(payload);
          break;
          
        default:
          console.log(`⚠️ Evento de webhook não reconhecido: ${eventType}`);
      }
      
    } catch (error) {
      console.error('❌ Erro processando webhook:', error);
      this.stats.errors++;
    }
  }
  
  // Verificar se o sistema precisa de carregamento inicial
  needsInitialLoad() {
    const hasDealsCache = this.cacheManager.get('deals_all');
    return !hasDealsCache || this.cacheManager.needsFullRefresh();
  }
  
  // Obter status do sistema
  getSystemStatus() {
    const cacheStats = this.cacheManager.stats();
    const webhookStats = this.webhookService.getStats();
    
    return {
      isRunning: this.isRunning,
      systemUptime: Date.now() - this.systemStartTime,
      lastFullLoad: this.lastFullLoad,
      needsInitialLoad: this.needsInitialLoad(),
      cache: cacheStats,
      webhooks: webhookStats,
      statistics: this.stats,
      currentMonth: this.getCurrentMonthRange()
    };
  }
  
  // Forçar carregamento completo (para manutenção)
  async forceFullReload() {
    console.log('🔧 Forçando carregamento completo...');
    await this.performFullDataLoad();
  }
}