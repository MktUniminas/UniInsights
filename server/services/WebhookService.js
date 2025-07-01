export class WebhookService {
  constructor(crmService, dataProcessor, cacheManager) {
    this.crmService = crmService;
    this.dataProcessor = dataProcessor;
    this.cacheManager = cacheManager;
    
    // Webhook URLs configuradas
    this.webhookUrls = {
      dealCreated: 'https://uninsights-crm-dealcreated.com',
      dealUpdated: 'https://uninsights-crm-dealupdated.com'
    };
    
    // Estatísticas dos webhooks
    this.stats = {
      dealCreatedReceived: 0,
      dealUpdatedReceived: 0,
      lastDealCreated: null,
      lastDealUpdated: null,
      errors: 0
    };
  }
  
  // Processar webhook de negócio criado
  async handleDealCreated(webhookPayload) {
    try {
      console.log('🔔 Webhook deal_created recebido:', webhookPayload.document?.name);
      
      const dealId = webhookPayload.document?.id;
      if (!dealId) {
        throw new Error('Deal ID não encontrado no webhook');
      }
      
      // Buscar detalhes completos do negócio na API
      const dealDetails = await this.crmService.getDealById(dealId);
      
      if (dealDetails) {
        // Adicionar ao cache
        await this.addDealToCache(dealDetails);
        
        // Recalcular KPIs afetados
        await this.recalculateAffectedKPIs([dealDetails]);
        
        // Atualizar estatísticas
        this.stats.dealCreatedReceived++;
        this.stats.lastDealCreated = new Date().toISOString();
        
        console.log('✅ Negócio criado processado com sucesso:', dealDetails.title);
      }
      
    } catch (error) {
      console.error('❌ Erro processando webhook deal_created:', error);
      this.stats.errors++;
    }
  }
  
  // Processar webhook de negócio atualizado
  async handleDealUpdated(webhookPayload) {
    try {
      console.log('🔔 Webhook deal_updated recebido:', webhookPayload.document?.name);
      
      const dealId = webhookPayload.document?.id;
      if (!dealId) {
        throw new Error('Deal ID não encontrado no webhook');
      }
      
      // Buscar detalhes completos do negócio na API
      const dealDetails = await this.crmService.getDealById(dealId);
      
      if (dealDetails) {
        // Verificar se o negócio está no cache (sendo monitorado)
        const isMonitored = this.isDealMonitored(dealId);
        
        if (isMonitored) {
          // Atualizar no cache
          await this.updateDealInCache(dealDetails);
          
          // Recalcular KPIs afetados
          await this.recalculateAffectedKPIs([dealDetails]);
          
          console.log('✅ Negócio atualizado processado:', dealDetails.title);
        } else {
          // Negócio novo que não estava sendo monitorado
          await this.addDealToCache(dealDetails);
          console.log('✅ Novo negócio adicionado via update:', dealDetails.title);
        }
        
        // Atualizar estatísticas
        this.stats.dealUpdatedReceived++;
        this.stats.lastDealUpdated = new Date().toISOString();
      }
      
    } catch (error) {
      console.error('❌ Erro processando webhook deal_updated:', error);
      this.stats.errors++;
    }
  }
  
  // Verificar se um negócio está sendo monitorado
  isDealMonitored(dealId) {
    const allDeals = this.cacheManager.get('deals_all');
    if (!allDeals || !Array.isArray(allDeals)) return false;
    
    return allDeals.some(deal => deal.id === dealId);
  }
  
  // Adicionar negócio ao cache
  async addDealToCache(dealDetails) {
    const normalizedDeal = this.crmService.normalizeDeals([dealDetails])[0];
    
    // Adicionar a todos os caches relevantes
    const cacheKeys = this.cacheManager.keys();
    
    cacheKeys.forEach(key => {
      if (key.includes('deals') && !key.includes('user_deals')) {
        this.cacheManager.appendToCacheData(key, [normalizedDeal]);
      }
    });
    
    console.log(`📊 Negócio adicionado ao cache: ${normalizedDeal.title}`);
  }
  
  // Atualizar negócio no cache
  async updateDealInCache(dealDetails) {
    const normalizedDeal = this.crmService.normalizeDeals([dealDetails])[0];
    const cacheKeys = this.cacheManager.keys();
    
    cacheKeys.forEach(key => {
      if (key.includes('deals')) {
        this.cacheManager.updateCacheData(key, (deals) => {
          if (!Array.isArray(deals)) return deals;
          
          return deals.map(deal => 
            deal.id === normalizedDeal.id ? normalizedDeal : deal
          );
        });
      }
    });
    
    console.log(`🔄 Negócio atualizado no cache: ${normalizedDeal.title}`);
  }
  
  // Recalcular KPIs afetados
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
      
      // Invalidar caches relacionados
      this.invalidateRelatedCaches(affectedConsultants, affectedCampaigns);
      
      console.log(`🔄 KPIs recalculados para ${affectedConsultants.size} consultores e ${affectedCampaigns.size} campanhas`);
      
    } catch (error) {
      console.error('❌ Erro recalculando KPIs:', error);
    }
  }
  
  // Recalcular KPIs gerais
  async recalculateGeneralKPIs() {
    const allDeals = this.cacheManager.get('deals_all');
    if (!allDeals || !allDeals.length) return;
    
    const kpis = this.dataProcessor.calculateKPIs(allDeals);
    this.cacheManager.set('kpis_current_month', kpis, 600);
    
    console.log('✅ KPIs gerais recalculados');
  }
  
  // Invalidar caches relacionados
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
    
    console.log(`🗑️ ${invalidatedCaches} caches invalidados via webhook`);
  }
  
  // Obter estatísticas dos webhooks
  getStats() {
    return {
      ...this.stats,
      webhookUrls: this.webhookUrls
    };
  }
  
  // Resetar estatísticas
  resetStats() {
    this.stats = {
      dealCreatedReceived: 0,
      dealUpdatedReceived: 0,
      lastDealCreated: null,
      lastDealUpdated: null,
      errors: 0
    };
    console.log('📊 Estatísticas de webhook resetadas');
  }
}