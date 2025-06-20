import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target, 
  ShoppingBag, 
  X,
  Calculator,
  Percent
} from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { ConsultantTable } from '../components/ConsultantTable';
import { FilterPanel } from '../components/FilterPanel';
import { FeedbackModal } from '../components/FeedbackModal';
import { SalesPrediction } from '../components/SalesPrediction';
import { LossAnalysis } from '../components/LossAnalysis';
import { 
  generateKPIData, 
  mockConsultants, 
  mockCampaigns, 
  generateSalesPrediction,
  generateLossAnalysis,
  mockFeedbacks
} from '../services/mockData';
import { FilterState, Feedback } from '../types';

export const AdminDashboard: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: '', end: '' },
    consultantIds: [],
    campaignIds: []
  });
  const [selectedConsultant, setSelectedConsultant] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(mockFeedbacks);

  const kpiData = generateKPIData();
  const predictions = generateSalesPrediction();
  const lossAnalysis = generateLossAnalysis();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleFeedback = (consultantId: string) => {
    setSelectedConsultant(consultantId);
  };

  const handleFeedbackSubmit = (feedback: {
    consultantId: string;
    message: string;
    rating: number;
    type: 'positive' | 'constructive' | 'neutral';
  }) => {
    const newFeedback: Feedback = {
      id: `feedback_${Date.now()}`,
      consultantId: feedback.consultantId,
      adminId: 'admin1',
      adminName: 'Admin User',
      message: feedback.message,
      rating: feedback.rating,
      type: feedback.type,
      createdAt: new Date().toISOString()
    };

    setFeedbacks(prev => [newFeedback, ...prev]);
  };

  const selectedConsultantData = mockConsultants.find(c => c.id === selectedConsultant);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Painel Administrativo</h2>
          <p className="text-gray-600 mt-1">Visão geral de todas as métricas e performance dos consultores</p>
        </div>
        
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          consultants={mockConsultants}
          campaigns={mockCampaigns}
          isAdmin={true}
        />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Negócios Criados"
          value={kpiData.totalDealsCreated}
          icon={<ShoppingBag className="h-6 w-6" />}
          color="blue"
          trend={{ value: 12.5, isPositive: true }}
        />
        
        <KPICard
          title="Negócios Ganhos"
          value={kpiData.totalDealsWon}
          icon={<Target className="h-6 w-6" />}
          color="green"
          trend={{ value: 8.3, isPositive: true }}
        />
        
        <KPICard
          title="Faturamento Total"
          value={formatCurrency(kpiData.totalRevenue)}
          icon={<DollarSign className="h-6 w-6" />}
          color="purple"
          trend={{ value: 15.7, isPositive: true }}
        />
        
        <KPICard
          title="Taxa de Conversão"
          value={`${kpiData.conversionRate.toFixed(1)}%`}
          icon={<Percent className="h-6 w-6" />}
          color="orange"
          trend={{ value: 3.2, isPositive: true }}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Ticket Médio"
          value={formatCurrency(kpiData.averageTicket)}
          icon={<Calculator className="h-6 w-6" />}
          color="blue"
        />
        
        <KPICard
          title="ROAS"
          value={`${kpiData.roas.toFixed(2)}x`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="green"
        />
        
        <KPICard
          title="Investimento Total"
          value={formatCurrency(kpiData.totalInvestment)}
          icon={<DollarSign className="h-6 w-6" />}
          color="red"
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesPrediction predictions={predictions} />
        <LossAnalysis lossData={lossAnalysis} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Funil de Vendas</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Negócios Criados</span>
              <span className="text-sm font-medium">{kpiData.totalDealsCreated}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Em Progresso</span>
              <span className="text-sm font-medium">1</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '10%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Negócios Ganhos</span>
              <span className="text-sm font-medium text-green-600">{kpiData.totalDealsWon}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${kpiData.conversionRate}%` }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Negócios Perdidos</span>
              <span className="text-sm font-medium text-red-600">{kpiData.totalDealsLost}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-600 h-2 rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div>

        {/* Performance by Consultant */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance por Consultor</h3>
          <div className="space-y-4">
            {mockConsultants.slice(0, 4).map((consultant, index) => (
              <div key={consultant.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{consultant.name}</span>
                  <span className="text-sm font-medium">{formatCurrency(consultant.totalRevenue)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(consultant.totalRevenue / 35000) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Consultants Table */}
      <ConsultantTable 
        consultants={mockConsultants} 
        onFeedback={handleFeedback}
        isAdmin={true}
      />

      {/* Feedback Modal */}
      {selectedConsultantData && (
        <FeedbackModal
          consultant={selectedConsultantData}
          isOpen={!!selectedConsultant}
          onClose={() => setSelectedConsultant(null)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
};