// Frontend API Service to communicate with backend
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

class ApiService {
  private baseUrl: string;

  constructor() {
    // Use relative URL in production (Vercel) and localhost in development
    if (import.meta.env.PROD) {
      this.baseUrl = '/api'; // Relative URL for production
    } else {
      this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Dashboard KPIs
  async getKPIs(filters?: {
    startDate?: string;
    endDate?: string;
    consultantIds?: string[];
    campaignIds?: string[];
    consultantEmail?: string; // NEW: Filter by consultant email
  }) {
    const params = new URLSearchParams();
    
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.consultantIds?.length) params.append('consultantIds', filters.consultantIds.join(','));
    if (filters?.campaignIds?.length) params.append('campaignIds', filters.campaignIds.join(','));
    if (filters?.consultantEmail) params.append('consultantEmail', filters.consultantEmail);

    return this.request(`/dashboard/kpis?${params.toString()}`);
  }

  // Consultants
  async getConsultants(includePerformance = true, filters?: {
    startDate?: string;
    endDate?: string;
  }) {
    const params = new URLSearchParams();
    params.append('includePerformance', includePerformance.toString());
    
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    return this.request(`/consultants?${params.toString()}`);
  }

  // Campaigns
  async getCampaigns(includeMetrics = true, filters?: {
    startDate?: string;
    endDate?: string;
  }) {
    const params = new URLSearchParams();
    params.append('includeMetrics', includeMetrics.toString());
    
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    return this.request(`/campaigns?${params.toString()}`);
  }

  // Deals
  async getDeals(filters?: {
    startDate?: string;
    endDate?: string;
    consultantId?: string;
    consultantEmail?: string; // NEW: Filter by consultant email
    campaignId?: string;
    stage?: string;
    page?: number;
    limit?: number;
  }) {
    const params = new URLSearchParams();
    
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.consultantId) params.append('consultantId', filters.consultantId);
    if (filters?.consultantEmail) params.append('consultantEmail', filters.consultantEmail);
    if (filters?.campaignId) params.append('campaignId', filters.campaignId);
    if (filters?.stage) params.append('stage', filters.stage);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return this.request(`/deals?${params.toString()}`);
  }

  // Analytics
  async getSalesPrediction(months = 3, filters?: {
    startDate?: string;
    endDate?: string;
  }) {
    const params = new URLSearchParams();
    params.append('months', months.toString());
    
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    return this.request(`/analytics/sales-prediction?${params.toString()}`);
  }

  async getLossAnalysis(filters?: {
    startDate?: string;
    endDate?: string;
  }) {
    const params = new URLSearchParams();
    
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    return this.request(`/analytics/loss-analysis?${params.toString()}`);
  }

  // Goals
  async getGoals(consultantEmail?: string) {
    const params = consultantEmail ? `?consultantEmail=${consultantEmail}` : '';
    return this.request(`/goals${params}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;