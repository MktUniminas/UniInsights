import { Deal, Consultant, Campaign, KPIData, Goal, Badge, Feedback, SalesPrediction, LossAnalysis } from '../types';

// Mock data to simulate CRM integration
export const mockDeals: Deal[] = [
  {
    id: '1',
    title: 'Enterprise Software License',
    value: 15000,
    stage: 'won',
    consultantId: 'consultant1',
    campaignId: 'campaign1',
    createdAt: '2024-01-15T10:00:00Z',
    closedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: '2',
    title: 'Marketing Automation Platform',
    value: 8500,
    stage: 'won',
    consultantId: 'consultant2',
    campaignId: 'campaign2',
    createdAt: '2024-01-16T09:15:00Z',
    closedAt: '2024-01-25T16:45:00Z'
  },
  {
    id: '3',
    title: 'Customer Support System',
    value: 12000,
    stage: 'lost',
    consultantId: 'consultant1',
    campaignId: 'campaign1',
    createdAt: '2024-01-18T11:30:00Z',
    closedAt: '2024-01-28T10:15:00Z',
    lossReason: 'Preço muito alto'
  },
  {
    id: '4',
    title: 'Data Analytics Dashboard',
    value: 22000,
    stage: 'won',
    consultantId: 'consultant3',
    campaignId: 'campaign3',
    createdAt: '2024-01-20T14:00:00Z',
    closedAt: '2024-01-30T17:20:00Z'
  },
  {
    id: '5',
    title: 'E-commerce Platform',
    value: 18500,
    stage: 'in_progress',
    consultantId: 'consultant2',
    campaignId: 'campaign2',
    createdAt: '2024-01-22T08:45:00Z'
  },
  {
    id: '6',
    title: 'Mobile App Development',
    value: 35000,
    stage: 'won',
    consultantId: 'consultant4',
    campaignId: 'campaign1',
    createdAt: '2024-01-25T13:20:00Z',
    closedAt: '2024-02-05T11:30:00Z'
  },
  {
    id: '7',
    title: 'Cloud Migration Service',
    value: 28000,
    stage: 'lost',
    consultantId: 'consultant5',
    campaignId: 'campaign2',
    createdAt: '2024-01-28T10:00:00Z',
    closedAt: '2024-02-08T15:30:00Z',
    lossReason: 'Cliente escolheu concorrente'
  },
  {
    id: '8',
    title: 'Security Audit Service',
    value: 9500,
    stage: 'won',
    consultantId: 'consultant6',
    campaignId: 'campaign3',
    createdAt: '2024-02-01T11:15:00Z',
    closedAt: '2024-02-10T16:45:00Z'
  },
  {
    id: '9',
    title: 'Training Program',
    value: 7200,
    stage: 'lost',
    consultantId: 'consultant7',
    campaignId: 'campaign1',
    createdAt: '2024-02-03T14:30:00Z',
    closedAt: '2024-02-12T09:20:00Z',
    lossReason: 'Orçamento insuficiente'
  },
  {
    id: '10',
    title: 'Integration Platform',
    value: 19800,
    stage: 'won',
    consultantId: 'consultant8',
    campaignId: 'campaign2',
    createdAt: '2024-02-05T09:45:00Z',
    closedAt: '2024-02-15T14:10:00Z'
  }
];

export const mockBadges: Badge[] = [
  {
    id: 'first_sale',
    name: 'Primeira Venda',
    description: 'Conquistou sua primeira venda',
    icon: '🎯',
    color: 'bg-blue-500',
    earnedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'top_performer',
    name: 'Top Performer',
    description: 'Entre os 3 melhores do mês',
    icon: '🏆',
    color: 'bg-yellow-500',
    earnedAt: '2024-01-31T23:59:59Z'
  },
  {
    id: 'high_ticket',
    name: 'Grande Negócio',
    description: 'Fechou negócio acima de R$ 30.000',
    icon: '💎',
    color: 'bg-purple-500',
    earnedAt: '2024-02-05T11:30:00Z'
  },
  {
    id: 'consistency',
    name: 'Consistência',
    description: 'Vendas por 3 semanas consecutivas',
    icon: '🔥',
    color: 'bg-red-500',
    earnedAt: '2024-02-01T00:00:00Z'
  }
];

// Calculate ROAS properly: Revenue from campaign / Investment in campaign
const calculateConsultantROAS = (consultantId: string): number => {
  const consultantDeals = mockDeals.filter(deal => 
    deal.consultantId === consultantId && deal.stage === 'won'
  );
  
  const totalRevenue = consultantDeals.reduce((sum, deal) => sum + deal.value, 0);
  
  // Calculate investment based on campaigns
  let totalInvestment = 0;
  consultantDeals.forEach(deal => {
    const campaign = mockCampaigns.find(c => c.id === deal.campaignId);
    if (campaign) {
      totalInvestment += campaign.costPerLead;
    }
  });
  
  return totalInvestment > 0 ? totalRevenue / totalInvestment : 0;
};

export const mockConsultants: Consultant[] = [
  {
    id: 'consultant1',
    name: 'Ana Silva',
    email: 'ana.silva@company.com',
    totalRevenue: 27000,
    totalDeals: 3,
    conversionRate: 66.7,
    rank: 3,
    roas: 7.06,
    points: 2700,
    badges: [mockBadges[0], mockBadges[3]],
    level: 3,
    totalInvestment: 3825
  },
  {
    id: 'consultant2',
    name: 'Carlos Santos',
    email: 'carlos.santos@company.com',
    totalRevenue: 27000,
    totalDeals: 2,
    conversionRate: 100,
    rank: 2,
    roas: 12.98,
    points: 2700,
    badges: [mockBadges[0], mockBadges[1]],
    level: 4,
    totalInvestment: 2080
  },
  {
    id: 'consultant3',
    name: 'Maria Oliveira',
    email: 'maria.oliveira@company.com',
    totalRevenue: 22000,
    totalDeals: 1,
    conversionRate: 100,
    rank: 4,
    roas: 10.19,
    points: 2200,
    badges: [mockBadges[0]],
    level: 2,
    totalInvestment: 2160
  },
  {
    id: 'consultant4',
    name: 'João Ferreira',
    email: 'joao.ferreira@company.com',
    totalRevenue: 35000,
    totalDeals: 1,
    conversionRate: 100,
    rank: 1,
    roas: 9.15,
    points: 3500,
    badges: [mockBadges[0], mockBadges[1], mockBadges[2]],
    level: 5,
    totalInvestment: 3825
  },
  {
    id: 'consultant5',
    name: 'Pedro Costa',
    email: 'pedro.costa@company.com',
    totalRevenue: 0,
    totalDeals: 0,
    conversionRate: 0,
    rank: 8,
    roas: 0,
    points: 0,
    badges: [],
    level: 1,
    totalInvestment: 2080
  },
  {
    id: 'consultant6',
    name: 'Lucia Mendes',
    email: 'lucia.mendes@company.com',
    totalRevenue: 9500,
    totalDeals: 1,
    conversionRate: 100,
    rank: 6,
    roas: 4.40,
    points: 950,
    badges: [mockBadges[0]],
    level: 2,
    totalInvestment: 2160
  },
  {
    id: 'consultant7',
    name: 'Roberto Lima',
    email: 'roberto.lima@company.com',
    totalRevenue: 0,
    totalDeals: 0,
    conversionRate: 0,
    rank: 7,
    roas: 0,
    points: 0,
    badges: [],
    level: 1,
    totalInvestment: 3825
  },
  {
    id: 'consultant8',
    name: 'Fernanda Rocha',
    email: 'fernanda.rocha@company.com',
    totalRevenue: 19800,
    totalDeals: 1,
    conversionRate: 100,
    rank: 5,
    roas: 9.52,
    points: 1980,
    badges: [mockBadges[0]],
    level: 3,
    totalInvestment: 2080
  }
];

export const mockCampaigns: Campaign[] = [
  {
    id: 'campaign1',
    name: 'Google Ads - Enterprise',
    source: 'Google Ads',
    costPerLead: 85,
    totalLeads: 45,
    totalInvestment: 3825,
    totalDeals: 3 // Negócios gerados por esta campanha
  },
  {
    id: 'campaign2',
    name: 'Facebook Ads - SMB',
    source: 'Facebook',
    costPerLead: 65,
    totalLeads: 32,
    totalInvestment: 2080,
    totalDeals: 4
  },
  {
    id: 'campaign3',
    name: 'LinkedIn Ads - B2B',
    source: 'LinkedIn',
    costPerLead: 120,
    totalLeads: 18,
    totalInvestment: 2160,
    totalDeals: 2
  }
];

export const mockGoals: Goal[] = [
  {
    id: 'goal1',
    consultantId: 'consultant1',
    targetRevenue: 50000,
    targetDeals: 5,
    period: '2024-01',
    currentRevenue: 27000,
    currentDeals: 3,
    progress: 54
  },
  {
    id: 'goal2',
    consultantId: 'consultant2',
    targetRevenue: 40000,
    targetDeals: 4,
    period: '2024-01',
    currentRevenue: 27000,
    currentDeals: 2,
    progress: 67.5
  }
];

export const mockFeedbacks: Feedback[] = [
  {
    id: 'feedback1',
    consultantId: 'consultant1',
    adminId: 'admin1',
    adminName: 'Admin User',
    message: 'Excelente trabalho na negociação com o cliente Enterprise. Continue assim!',
    rating: 5,
    createdAt: '2024-02-01T10:00:00Z',
    type: 'positive'
  },
  {
    id: 'feedback2',
    consultantId: 'consultant2',
    adminId: 'admin1',
    adminName: 'Admin User',
    message: 'Ótima taxa de conversão. Sugiro focar em negócios de maior valor.',
    rating: 4,
    createdAt: '2024-02-02T14:30:00Z',
    type: 'constructive'
  }
];

export const generateKPIData = (): KPIData => {
  const totalDealsCreated = mockDeals.length;
  const totalDealsWon = mockDeals.filter(deal => deal.stage === 'won').length;
  const totalDealsLost = mockDeals.filter(deal => deal.stage === 'lost').length;
  const totalRevenue = mockDeals
    .filter(deal => deal.stage === 'won')
    .reduce((sum, deal) => sum + deal.value, 0);
  const averageTicket = totalDealsWon > 0 ? totalRevenue / totalDealsWon : 0;
  const conversionRate = totalDealsCreated > 0 ? (totalDealsWon / totalDealsCreated) * 100 : 0;
  
  // Calculate total investment: sum of (deals per campaign * cost per lead)
  const totalInvestment = mockCampaigns.reduce((sum, campaign) => {
    return sum + (campaign.totalDeals * campaign.costPerLead);
  }, 0);
  
  const roas = totalInvestment > 0 ? totalRevenue / totalInvestment : 0;

  return {
    totalDealsCreated,
    totalDealsWon,
    totalDealsLost,
    totalRevenue,
    averageTicket,
    conversionRate,
    roas,
    totalInvestment
  };
};

export const generateSalesPrediction = (): SalesPrediction[] => {
  return [
    {
      period: 'Março 2024',
      predictedRevenue: 145000,
      predictedDeals: 8,
      confidence: 85,
      trend: 'up'
    },
    {
      period: 'Abril 2024',
      predictedRevenue: 162000,
      predictedDeals: 9,
      confidence: 78,
      trend: 'up'
    },
    {
      period: 'Maio 2024',
      predictedRevenue: 158000,
      predictedDeals: 9,
      confidence: 72,
      trend: 'stable'
    }
  ];
};

export const generateLossAnalysis = (): LossAnalysis[] => {
  const lostDeals = mockDeals.filter(deal => deal.stage === 'lost');
  const totalLostValue = lostDeals.reduce((sum, deal) => sum + deal.value, 0);
  
  const reasonCounts = lostDeals.reduce((acc, deal) => {
    const reason = deal.lossReason || 'Não especificado';
    if (!acc[reason]) {
      acc[reason] = { count: 0, value: 0 };
    }
    acc[reason].count++;
    acc[reason].value += deal.value;
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  return Object.entries(reasonCounts).map(([reason, data]) => ({
    reason,
    count: data.count,
    percentage: (data.count / lostDeals.length) * 100,
    totalValue: data.value
  }));
};