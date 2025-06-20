export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  consultantId?: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: 'created' | 'won' | 'lost' | 'in_progress';
  consultantId: string;
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
  dateRange: {
    start: string;
    end: string;
  };
  consultantIds: string[];
  campaignIds: string[];
  costPerLead?: number;
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

export type AdminPage = 'dashboard' | 'consultants' | 'campaigns' | 'analytics' | 'settings';
export type UserPage = 'dashboard' | 'goals' | 'performance';