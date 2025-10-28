import axios from 'axios';

export class CRMService {
  constructor() {
    // Configuration - In production, use environment variables
    this.config = {
      baseUrl: process.env.CRM_BASE_URL || 'https://crm.rdstation.com/api/v1',
      token: process.env.CRM_TOKEN || '67bdacd9c873b50014f10d74',
      pipelineId: process.env.CRM_PIPELINE_ID || '6798f2b0b1c4c200162ee947',
      timeout: 30000,
      retryAttempts: 3
    };
    
    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    // Add request interceptor for authentication
    this.axiosInstance.interceptors.request.use((config) => {
      config.params = {
        ...config.params,
        token: this.config.token
      };
      return config;
    });
    
    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.config && error.config.retryCount < this.config.retryAttempts) {
          error.config.retryCount = error.config.retryCount || 0;
          error.config.retryCount++;
          
          console.log(`Retrying request (${error.config.retryCount}/${this.config.retryAttempts})`);
          
          // Exponential backoff
          const delay = Math.pow(2, error.config.retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          
          return this.axiosInstance(error.config);
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  // NOVO: Buscar negócio específico por ID (para webhooks)
  async getDealById(dealId) {
    try {
      console.log(`🔍 Buscando negócio específico: ${dealId}`);
      
      const response = await this.axiosInstance.get(`/deals/${dealId}`);
      const deal = response.data;
      
      if (deal) {
        console.log(`✅ Negócio encontrado: ${deal.name}`);
        return deal;
      }
      
      return null;
    } catch (error) {
      console.error(`❌ Erro buscando negócio ${dealId}:`, error.message);
      return null;
    }
  }
  
  async getDeals(filters = {}) {
    try {
      console.log('Fetching deals from CRM...', filters);

      const params = {
        deal_pipeline_id: this.config.pipelineId,
        limit: 200
      };

      /**
       * 🧩 1. Filtro por DATA DE CRIAÇÃO (RD → created_at_period)
       */
      if (filters.creationStart && filters.creationEnd) {
        params.created_at_period = 'true';
        params.start_date = new Date(filters.creationStart).toISOString();
        params.end_date = new Date(filters.creationEnd).toISOString();
        console.log(`📅 Filtrando por criação: ${params.start_date} → ${params.end_date}`);
      }

      /**
       * 🧩 2. Filtro por DATA DE FECHAMENTO (RD → closed_at_period)
       */
      if (filters.closureStart && filters.closureEnd) {
        params.closed_at_period = 'true';
        params.start_date = new Date(filters.closureStart).toISOString();
        params.end_date = new Date(filters.closureEnd).toISOString();
        console.log(`📅 Filtrando por fechamento: ${params.start_date} → ${params.end_date}`);
      }

      /**
       * 🧩 3. Consultores (user_id)
       * A RD aceita apenas um user_id por vez — se houver vários, usamos o primeiro.
       */
      if (filters.consultantId) {
        params.user_id = filters.consultantId;
        console.log(`👤 Filtrando por consultor único: ${filters.consultantId}`);
      } else if (filters.consultantIds && filters.consultantIds.length > 0) {
        params.user_id = filters.consultantIds[0];
        console.log(`👥 Filtrando por consultores: ${filters.consultantIds.join(', ')}`);
      }

      /**
       * 🧩 4. Campanhas (campaign_id)
       */
      if (filters.campaignId) {
        params.campaign_id = filters.campaignId;
        console.log(`🏷️ Filtrando por campanha única: ${filters.campaignId}`);
      } else if (filters.campaignIds && filters.campaignIds.length > 0) {
        params.campaign_id = filters.campaignIds[0];
        console.log(`🏷️ Filtrando por campanhas: ${filters.campaignIds.join(', ')}`);
      }

      /**
       * 🔁 Paginação
       */
      if (filters.nextPage) {
        params.next_page = filters.nextPage;
        console.log(`➡️ Usando paginação: ${filters.nextPage}`);
      }

      /**
       * 🕓 Atualizações recentes (opcional)
       */
      if (filters.updatedSince) {
        params.updated_at_period = 'true';
        params.start_date = new Date(filters.updatedSince).toISOString();
        params.end_date = new Date().toISOString();
        console.log(`🕓 Verificando atualizações desde: ${params.start_date}`);
      }

      const allDeals = [];
      let nextPage = filters.nextPage || null;
      let hasMore = true;
      let pageCount = 0;

      while (hasMore && pageCount < 50) {
        const requestParams = { ...params };
        if (nextPage) requestParams.next_page = nextPage;

        console.log(`📨 Página ${pageCount + 1} - params:`, requestParams);

        const response = await this.axiosInstance.get('/deals', { params: requestParams });
        const data = response.data;

        if (data.deals && Array.isArray(data.deals)) {
          allDeals.push(...data.deals);
          console.log(`📄 Página ${pageCount + 1}: ${data.deals.length} negócios (total ${allDeals.length})`);
        }

        hasMore = data.has_more && data.next_page;
        nextPage = data.next_page;
        pageCount++;

        if (allDeals.length > 10000) {
          console.warn('⚠️ Máximo de 10.000 negócios atingido, interrompendo busca.');
          break;
        }
      }

      console.log(`✅ Total final: ${allDeals.length} negócios em ${pageCount} páginas`);

      let normalizedDeals = this.normalizeDeals(allDeals);

      // 🔹 Filtro opcional por e-mail de consultor
      if (filters.consultantEmail) {
        const before = normalizedDeals.length;
        normalizedDeals = normalizedDeals.filter(d => 
          d.consultantEmail &&
          d.consultantEmail.toLowerCase() === filters.consultantEmail.toLowerCase()
        );
        console.log(`📧 Filtro por email: ${before} → ${normalizedDeals.length}`);
      }

      return {
        deals: normalizedDeals,
        pagination: {
          nextPage,
          hasMore,
          totalFetched: allDeals.length
        }
      };

    } catch (error) {
      console.error('❌ Erro ao buscar negócios:', error.message);
      throw new Error(`Failed to fetch deals: ${error.message}`);
    }
  }

  // Buscar apenas negócios novos usando paginação
  async getNewDeals(lastNextPage) {
    try {
      console.log('🔍 Fetching new deals from last pagination token:', lastNextPage);
      
      const result = await this.getDeals({
        nextPage: lastNextPage,
        incrementalSearch: true // Flag para buscar apenas uma página
      });
      
      console.log(`📈 Found ${result.deals.length} new deals`);
      return result;
    } catch (error) {
      console.error('Error fetching new deals:', error.message);
      throw error;
    }
  }
  
  // NOVA IMPLEMENTAÇÃO: Verificar mudanças usando updated_at
  async getUpdatedDeals(lastCheckTimestamp) {
    try {
      console.log(`🔄 Checking for deals updated since: ${new Date(lastCheckTimestamp).toISOString()}`);
      
      const result = await this.getDeals({
        updatedSince: lastCheckTimestamp,
        incrementalSearch: false // Buscar várias páginas se necessário
      });
      
      // Filtrar apenas deals que realmente foram atualizados após o timestamp
      const updatedDeals = result.deals.filter(deal => {
        const dealUpdatedAt = new Date(deal.updatedAt).getTime();
        return dealUpdatedAt > lastCheckTimestamp;
      });
      
      console.log(`📝 Found ${updatedDeals.length} updated deals out of ${result.deals.length} total`);
      
      return {
        deals: updatedDeals,
        pagination: result.pagination
      };
    } catch (error) {
      console.error('Error fetching updated deals:', error.message);
      throw error;
    }
  }
  
  async getUsers() {
    try {
      console.log('Fetching users from CRM...');
      
      const response = await this.axiosInstance.get('/users');
      const data = response.data;
      
      let users = [];
      if (Array.isArray(data)) {
        users = data;
      } else if (data.users && Array.isArray(data.users)) {
        users = data.users;
      }
      
      // Filter active users
      const activeUsers = users.filter(user => 
        user.id && user.name && (user.active !== false)
      );
      
      console.log(`✅ Fetched ${activeUsers.length} active users`);
      return this.normalizeUsers(activeUsers);
      
    } catch (error) {
      console.error('Error fetching users:', error.message);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }
  
  async getCampaigns() {
    try {
      console.log('Fetching campaigns from CRM...');
      
      const response = await this.axiosInstance.get('/campaigns?limit=200');
      const data = response.data;
      
      let campaigns = [];
      if (Array.isArray(data)) {
        campaigns = data;
      } else if (data.campaigns && Array.isArray(data.campaigns)) {
        campaigns = data.campaigns;
      }
      
      console.log(`✅ Fetched ${campaigns.length} campaigns`);
      return this.normalizeCampaigns(campaigns);
      
    } catch (error) {
      console.error('Error fetching campaigns:', error.message);
      throw new Error(`Failed to fetch campaigns: ${error.message}`);
    }
  }
  
  // Data normalization methods
  normalizeDeals(deals) {
    return deals.map(deal => ({
      id: deal.id || deal._id,
      title: deal.name || 'Sem título',
      value: this.parseAmount(deal.amount_total || deal.amount_unique || 0),
      stage: this.normalizeStage(deal),
      consultantId: deal.user?.id,
      consultantName: deal.user?.name,
      consultantEmail: deal.user?.email, // Include consultant email
      campaignId: deal.campaign?.id,
      campaignName: deal.campaign?.name,
      createdAt: deal.created_at,
      updatedAt: deal.updated_at, // IMPORTANTE: Incluir updated_at
      closedAt: deal.closed_at,
      lossReason: deal.deal_lost_reason?.name,
      dealStage: deal.deal_stage?.name,
      source: deal.deal_source?.name,
      contacts: deal.contacts || [],
      customFields: deal.deal_custom_fields || [],
      products: deal.deal_products || [],
      rating: deal.rating || 0,
      interactions: deal.interactions || 0
    }));
  }
  
  normalizeUsers(users) {
    return users.map(user => ({
      id: user.id || user._id,
      name: user.name,
      nickname: user.nickname,
      email: user.email,
      active: user.active !== false,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));
  }
  
  normalizeCampaigns(campaigns) {
    return campaigns.map(campaign => ({
      id: campaign.id || campaign._id,
      name: campaign.name,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at
    }));
  }
  
  normalizeStage(deal) {
    // Determine stage based on deal data
    if (deal.win === true || deal.win === 'true') {
      return 'won';
    } else if (deal.win === false || deal.win === 'false') {
      return 'lost';
    } else if (deal.deal_stage?.name) {
      const stageName = deal.deal_stage.name.toLowerCase();
      if (stageName.includes('ganho') || stageName.includes('fechado') || stageName.includes('vendido')) {
        return 'won';
      } else if (stageName.includes('perdido') || stageName.includes('cancelado')) {
        return 'lost';
      } else {
        return 'in_progress';
      }
    }
    return 'created';
  }
  
  parseAmount(amount) {
    if (typeof amount === 'number') return amount;
    if (typeof amount === 'string') {
      const parsed = parseFloat(amount.replace(/[^\d.-]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }
}