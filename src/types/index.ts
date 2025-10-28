export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  consultantId?: string;
  consultantEmail?: string; // Email para buscar no CRM
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: 'created' | 'won' | 'lost' | 'in_progress';
  consultantId: string;
  consultantEmail?: string; // Email do consultor
  campaignId: string;
  createdAt: string;
  closedAt?: string;
  lossReason?: string;
}

export interface Consultant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  totalRevenue: number;
  totalDeals: number;
  conversionRate: number;
  rank: number;
  roas: number;
  points: number;
  badges: Badge[];
  level: number;
  totalInvestment: number;
}

export interface Campaign {
  id: string;
  name: string;
  source: string;
  costPerLead: number;
  totalLeads: number;
  totalInvestment: number;
  totalDeals: number; // Quantidade de negócios desta campanha
  wonDeals?: number; // Negócios ganhos desta campanha
  totalRevenue?: number; // Receita total desta campanha
}

export interface KPIData {
  totalDealsCreated: number;
  totalDealsWon: number;
  totalDealsLost: number;
  totalRevenue: number;
  averageTicket: number;
  conversionRate: number;
  roas: number;
  totalInvestment: number;
}

export interface Goal {
  id: string;
  consultantId: string;
  targetRevenue: number;
  targetDeals: number;
  period: string;
  currentRevenue: number;
  currentDeals: number;
  progress: number;
}

export interface FilterState {
  creationDateRange: {
    start: string;
    end: string;
  };
  closureDateRange: {
    start: string;
    end: string;
  };
  consultantIds: string[];
  campaignIds: string[];
}


export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
}

export interface Feedback {
  id: string;
  consultantId: string;
  adminId: string;
  adminName: string;
  message: string;
  rating: number;
  createdAt: string;
  type: 'positive' | 'constructive' | 'neutral';
}

export interface SalesPrediction {
  period: string;
  predictedRevenue: number;
  predictedDeals: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

export interface LossAnalysis {
  reason: string;
  count: number;
  percentage: number;
  totalValue: number;
}

// RD Station specific types
export interface RDStationDeal {
  _id: string;
  id: string;
  name: string;
  amount_montly: number;
  amount_unique: number;
  amount_total: number;
  prediction_date?: string;
  markup: string;
  last_activity_at?: string;
  interactions: number;
  created_at: string;
  updated_at: string;
  rating: number;
  win?: boolean;
  closed_at?: string;
  user: {
    _id: string;
    id: string;
    name: string;
    nickname: string;
    email: string;
  };
  deal_stage: {
    _id: string;
    id: string;
    name: string;
    nickname: string;
    created_at: string;
    updated_at: string;
  };
  campaign?: {
    _id: string;
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
  };
  deal_source?: {
    _id: string;
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
  };
  contacts: Array<{
    name: string;
    title?: string;
    emails: Array<{ email: string }>;
    phones: Array<{ phone: string; type?: string }>;
  }>;
  deal_custom_fields: Array<{
    value: any;
    custom_field_id: string;
    custom_field: {
      _id: string;
      id: string;
      label: string;
      type: string;
      order: number;
    };
  }>;
  deal_products: Array<{
    _id: string;
    id: string;
    product_id: string;
    name: string;
    price: number;
    amount: number;
    total: number;
  }>;
}

export type AdminPage = 'dashboard' | 'consultants' | 'campaigns' | 'analytics' | 'settings';
export type UserPage = 'dashboard' | 'goals' | 'performance';