export class IncrementalUpdateService {
  constructor(crmService, dataProcessor, cacheManager) {
    this.crmService = crmService;
    this.dataProcessor = dataProcessor;
    this.cacheManager = cacheManager;
    
    // Intervalos de atualização
    this.NEW_DEALS_INTERVAL = 10 * 1000; // 10 segundos
    this.CHANGES_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos
    
    // Timers
    this.newDealsTimer = null;
    this.changesTimer = null;
    
    // Estado
    this.isRunning = false;
    this.dealIds = new Set(); // IDs dos negócios no cache
    this.lastChangesCheck = Date.now(); // Timestamp da última verificação de mudanças
    
    // Estatísticas
    this.stats = {
      newDealsChecks: 0,
      changesChecks: 0,
      newDealsFound: 0,
      changedDealsFound: 0,
      lastNewDealsCheck: null,
      lastChangesCheck: null,
      errors: 0
    };
  }
  
  start() {
    if (this.isRunning) {
      console.log('Incremental update service already running');
      return;
    }
    
    this.isRunning = true;
    console.log('🚀 Starting incremental update service...');
    
    // Inicializar conjunto de IDs dos negócios
    this.initializeDealIds();
    
    // Inicializar timestamp da última verificação
    this.lastChangesCheck = Date.now();
    
    // Iniciar timers
    this.startNewDealsCheck();
    this.startChangesCheck();
  }
  
  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    console.log('⏹️ Stopping incremental update service...');
    
    if (this.newDealsTimer) {
      clearInterval(this.newDealsTimer);
      this.newDealsTimer = null;
    }
    
    if (this.changesTimer) {
      clearInterval(this.changesTimer);
      this.changesTimer = null;
    }
  }
  
  initializeDealIds() {
    // Extrair IDs dos negócios do cache
    const allDeals = this.getAllDealsFromCache();
    
    this.dealIds.clear();
    allDeals.forEach(deal => {
      if (deal.id) this.dealIds.add(deal.id);
    });
    
    console.log(`📊 Initialized with ${this.dealIds.size} deal IDs for monitoring`);
  }
  
  startNewDealsCheck() {
    this.newDealsTimer = setInterval(async () => {
      try {
        await this.checkForNewDeals();
        this.stats.newDealsChecks++;
        this.stats.lastNewDealsCheck = new Date().toISOString();
      } catch (error) {
        console.error('❌ Error in new deals check:', error);
        this.stats.errors++;
      }
    }, this.NEW_DEALS_INTERVAL);
    
    console.log(`⏰ New deals check started (every ${this.NEW_DEALS_INTERVAL / 1000}s)`);
  }
  
  startChangesCheck() {
    this.changesTimer = setInterval(async () => {
      try {
        await this.checkForChanges();
        this.stats.changesChecks++;
        this.stats.lastChangesCheck = new Date().toISOString();
      } catch (error) {
        console.error('❌ Error in changes check:', error);
        this.stats.errors++;
      }
    }, this.CHANGES_CHECK_INTERVAL);
    
    console.log(`⏰ Changes check started (every ${this.CHANGES_CHECK_INTERVAL / 1000}s)`);
  }
  
  async checkForNewDeals() {
    if (!this.isRunning) return;
    
    try {
      // Pegar o último token de paginação do cache
      const paginationData = this.cacheManager.getMetadata('deals_pagination');
      const lastPaginationToken = paginationData?.nextPage;
      
      if (!lastPaginationToken) {
        console.log('📄 No pagination token found, skipping new deals check');
        return;
      }
      
      console.log('🔍 Checking for new deals...');
      
      const result = await this.crmService.getNewDeals(lastPaginationToken);
      
      if (result.deals && result.deals.length > 0) {
        console.log(`📈 Found ${result.deals.length} new deals`);
        
        // Adicionar novos negócios ao cache
        await this.updateCacheWithNewDeals(result.deals);
        
        // Atualizar token de paginação
        if (result.pagination.nextPage) {
          this.cacheManager.updateMetadata('deals_pagination', {
            nextPage: result.pagination.nextPage,
            lastCheck: Date.now()
          });
        }
        
        // Adicionar novos IDs ao conjunto
        result.deals.forEach(deal => this.dealIds.add(deal.id));
        
        // Recalcular KPIs afetados
        await this.recalculateAffectedKPIs(result.deals);
        
        // Atualizar estatísticas
        this.stats.newDealsFound += result.deals.length;
        
      } else {
        console.log('📊 No new deals found');
      }
      
    } catch (error) {
      console.error('❌ Error checking for new deals:', error);
      throw error;
    }
  }
  
  async checkForChanges() {
    if (!this.isRunning || this.dealIds.size === 0) return;
    
    try {
      console.log(`🔄 Checking for changes since: ${new Date(this.lastChangesCheck).toISOString()}`);
      
      // NOVA IMPLEMENTAÇÃO: Usar getUpdatedDeals com timestamp
      const result = await this.crmService.getUpdatedDeals(this.lastChangesCheck);
      
      if (result.deals.length > 0) {
        console.log(`📝 Found ${result.deals.length} updated deals`);
        
        // Filtrar apenas deals que estão no nosso cache (que estamos monitorando)
        const monitoredUpdatedDeals = result.deals.filter(deal => this.dealIds.has(deal.id));
        
        if (monitoredUpdatedDeals.length > 0) {
          console.log(`📋 ${monitoredUpdatedDeals.length} of the updated deals are being monitored`);
          
          // Atualizar negócios no cache
          await this.updateCacheWithChangedDeals(monitoredUpdatedDeals);
          
          // Recalcular KPIs afetados
          await this.recalculateAffectedKPIs(monitoredUpdatedDeals);
          
          // Atualizar estatísticas
          this.stats.changedDealsFound += monitoredUpdatedDeals.length;
        } else {
          console.log('📊 No monitored deals were updated');
        }
        
        // Adicionar novos deals que não estavam sendo monitorados
        const newDealsFromUpdate = result.deals.filter(deal => !this.dealIds.has(deal.id));
        if (newDealsFromUpdate.length > 0) {
          console.log(`📈 Found ${newDealsFromUpdate.length} new deals during changes check`);
          await this.updateCacheWithNewDeals(newDealsFromUpdate);
          newDealsFromUpdate.forEach(deal => this.dealIds.add(deal.id));
          this.stats.newDealsFound += newDealsFromUpdate.length;
        }
        
      } else {
        console.log('📊 No deal changes found');
      }
      
      // Atualizar timestamp da última verificação
      this.lastChangesCheck = Date.now();
      
    } catch (error) {
      console.error('❌ Error checking for changes:', error);
      throw error;
    }
  }
  
  async updateCacheWithNewDeals(newDeals) {
    const cacheKeys = this.cacheManager.keys();
    let updatedCaches = 0;
    
    // Atualizar caches que contêm deals
    cacheKeys.forEach(key => {
      if (key.includes('deals') && !key.includes('user_deals')) {
        const success = this.cacheManager.appendToCacheData(key, newDeals);
        if (success) updatedCaches++;
      }
    });
    
    console.log(`✅ Added ${newDeals.length} new deals to ${updatedCaches} cache entries`);
  }
  
  async updateCacheWithChangedDeals(changedDeals) {
    const cacheKeys = this.cacheManager.keys();
    const changedDealsMap = new Map(changedDeals.map(deal => [deal.id, deal]));
    let updatedCaches = 0;
    
    // Atualizar caches que contêm deals
    cacheKeys.forEach(key => {
      if (key.includes('deals')) {
        const success = this.cacheManager.updateCacheData(key, (deals) => {
          if (!Array.isArray(deals)) return deals;
          
          let hasChanges = false;
          const updatedDeals = deals.map(deal => {
            const updatedDeal = changedDealsMap.get(deal.id);
            if (updatedDeal) {
              hasChanges = true;
              return updatedDeal;
            }
            return deal;
          });
          
          return hasChanges ? updatedDeals : deals;
        });
        
        if (success) updatedCaches++;
      }
    });
    
    console.log(`✅ Updated ${changedDeals.length} changed deals in ${updatedCaches} cache entries`);
  }
  
  async recalculateAffectedKPIs(affectedDeals) {
    try {
      // Identificar consultores e campanhas afetados
      const affectedConsultants = new Set();
      const affectedCampaigns = new Set();
      
      affectedDeals.forEach(deal => {
        if (deal.consultantId) affectedConsultants.add(deal.consultantId);
        if (deal.consultantEmail) affectedConsultants.add(deal.consultantEmail);
        if (deal.campaignId) affectedCampaigns.add(deal.campaignId);
      });
      
      // Recalcular KPIs gerais
      await this.recalculateGeneralKPIs();
      
      // Recalcular KPIs por consultor
      for (const consultantId of affectedConsultants) {
        await this.recalculateConsultantKPIs(consultantId);
      }
      
      // Invalidar caches relacionados para forçar recálculo
      this.invalidateRelatedCaches(affectedConsultants, affectedCampaigns);
      
      console.log(`🔄 Recalculated KPIs for ${affectedConsultants.size} consultants and ${affectedCampaigns.size} campaigns`);
      
    } catch (error) {
      console.error('❌ Error recalculating KPIs:', error);
    }
  }
  
  invalidateRelatedCaches(affectedConsultants, affectedCampaigns) {
    const cacheKeys = this.cacheManager.keys();
    let invalidatedCaches = 0;
    
    cacheKeys.forEach(key => {
      let shouldInvalidate = false;
      
      // Invalidar caches de KPIs gerais
      if (key.includes('kpis_') || key.includes('consultants_') || key.includes('campaigns_')) {
        shouldInvalidate = true;
      }
      
      // Invalidar caches específicos de consultores afetados
      for (const consultantId of affectedConsultants) {
        if (key.includes(consultantId)) {
          shouldInvalidate = true;
          break;
        }
      }
      
      if (shouldInvalidate) {
        this.cacheManager.delete(key);
        invalidatedCaches++;
      }
    });
    
    console.log(`🗑️ Invalidated ${invalidatedCaches} related cache entries`);
  }
  
  async recalculateGeneralKPIs() {
    const allDeals = this.getAllDealsFromCache();
    if (!allDeals.length) return;
    
    const kpis = this.dataProcessor.calculateKPIs(allDeals);
    
    // Atualizar cache de KPIs gerais
    this.cacheManager.set('kpis_current_month', kpis, 600); // 10 minutos
    
    console.log('✅ Recalculated general KPIs');
  }
  
  async recalculateConsultantKPIs(consultantId) {
    const allDeals = this.getAllDealsFromCache();
    const consultantDeals = allDeals.filter(deal => 
      deal.consultantId === consultantId || deal.consultantEmail === consultantId
    );
    
    if (!consultantDeals.length) return;
    
    const kpis = this.dataProcessor.calculateKPIs(consultantDeals);
    
    // Atualizar cache específico do consultor
    this.cacheManager.set(`user_kpis_${consultantId}`, kpis, 600);
    
    console.log(`✅ Recalculated KPIs for consultant ${consultantId}`);
  }
  
  getAllDealsFromCache() {
    const cacheKeys = this.cacheManager.keys();
    let allDeals = [];
    
    // Priorizar o cache principal de deals
    const mainDealsCache = this.cacheManager.get('deals_all');
    if (mainDealsCache && Array.isArray(mainDealsCache)) {
      return mainDealsCache;
    }
    
    // Fallback: buscar em outros caches
    cacheKeys.forEach(key => {
      if (key.includes('deals') && !key.includes('user_deals')) {
        const deals = this.cacheManager.get(key);
        if (Array.isArray(deals)) {
          allDeals = allDeals.concat(deals);
        }
      }
    });
    
    // Remover duplicatas baseado no ID
    const uniqueDeals = allDeals.filter((deal, index, self) => 
      index === self.findIndex(d => d.id === deal.id)
    );
    
    return uniqueDeals;
  }
  
  // Verificar se precisa de refresh completo (24 horas)
  checkFullRefreshNeeded() {
    if (this.cacheManager.needsFullRefresh()) {
      console.log('🔄 24-hour cache expiry reached, triggering full refresh...');
      this.stop();
      this.cacheManager.clear();
      return true;
    }
    return false;
  }
  
  getStatus() {
    return {
      isRunning: this.isRunning,
      monitoredDeals: this.dealIds.size,
      newDealsInterval: this.NEW_DEALS_INTERVAL,
      changesInterval: this.CHANGES_CHECK_INTERVAL,
      lastChangesCheck: new Date(this.lastChangesCheck).toISOString(),
      lastFullRefresh: this.cacheManager.lastFullRefresh,
      needsFullRefresh: this.cacheManager.needsFullRefresh(),
      statistics: this.stats
    };
  }
  
  // Método para resetar estatísticas
  resetStats() {
    this.stats = {
      newDealsChecks: 0,
      changesChecks: 0,
      newDealsFound: 0,
      changedDealsFound: 0,
      lastNewDealsCheck: null,
      lastChangesCheck: null,
      errors: 0
    };
    console.log('📊 Statistics reset');
  }
}