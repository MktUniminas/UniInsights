import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Target, 
  ShoppingBag, 
  Calculator,
  Percent,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { FilterPanel } from '../components/FilterPanel';
import { FeedbackModal } from '../components/FeedbackModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ROASModal } from '../components/ROASModal';
import { SalesPredictionCard } from '../components/SalesPredictionCard';
import { LossAnalysisCard } from '../components/LossAnalysisCard';
import { ConsultantTable } from '../components/ConsultantTable';
import { useApiWithCache } from '../hooks/useGlobalCache';
import { apiService } from '../services/apiService';
import { FilterState, Feedback } from '../types';

export const AdminDashboard: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: '', end: '' },
    consultantIds: [],
    campaignIds: []
  });
  const [selectedConsultant, setSelectedConsultant] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [showROASModal, setShowROASModal] = useState(false);
  
  // Get saved CPL from localStorage
  const [costPerLead, setCostPerLead] = useState(() => {
    const saved = localStorage.getItem('dashboard_cost_per_lead');
    return saved ? parseFloat(saved) : 0;
  });

  // Check if filters are applied
  const hasFilters = filters.dateRange.start || filters.dateRange.end || 
                    filters.consultantIds.length > 0 || filters.campaignIds.length > 0;

  // Create cache keys based on filters
  const kpiCacheKey = hasFilters 
    ? `kpis_filtered_${filters.dateRange.start}_${filters.dateRange.end}_${filters.consultantIds.join(',')}_${filters.campaignIds.join(',')}`
    : 'kpis_current_month';

  const consultantsCacheKey = hasFilters 
    ? `consultants_filtered_${filters.dateRange.start}_${filters.dateRange.end}`
    : 'consultants_current_month';

  const campaignsCacheKey = hasFilters 
    ? `campaigns_filtered_${filters.dateRange.start}_${filters.dateRange.end}`
    : 'campaigns_current_month';

  // API hooks with global cache
  const { 
    data: kpiData, 
    loading: kpiLoading, 
    error: kpiError, 
    refetch: refetchKPIs,
    isFromCache: kpiFromCache
  } = useApiWithCache(
    kpiCacheKey,
    () => apiService.getKPIs(hasFilters ? {
      startDate: filters.dateRange.start,
      endDate: filters.dateRange.end,
      consultantIds: filters.consultantIds,
      campaignIds: filters.campaignIds
    } : undefined),
    [kpiCacheKey],
    10 // 10 minutes cache
  );

  const { 
    data: consultants, 
    loading: consultantsLoading, 
    error: consultantsError,
    refetch: refetchConsultants,
    isFromCache: consultantsFromCache
  } = useApiWithCache(
    consultantsCacheKey,
    () => apiService.getConsultants(true, hasFilters ? {
      startDate: filters.dateRange.start,
      endDate: filters.dateRange.end
    } : undefined),
    [consultantsCacheKey],
    10
  );

  const { 
    data: campaigns, 
    loading: campaignsLoading, 
    error: campaignsError 
  } = useApiWithCache(
    campaignsCacheKey,
    () => apiService.getCampaigns(true, hasFilters ? {
      startDate: filters.dateRange.start,
      endDate: filters.dateRange.end
    } : undefined),
    [campaignsCacheKey],
    15
  );

  const { 
    data: lossAnalysis, 
    loading: lossLoading, 
    error: lossError 
  } = useApiWithCache(
    'loss_analysis',
    () => apiService.getLossAnalysis(hasFilters ? {
      startDate: filters.dateRange.start,
      endDate: filters.dateRange.end
    } : undefined),
    ['loss_analysis'],
    15
  );

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

  const handleRefresh = async () => {
    await Promise.all([
      refetchKPIs(),
      refetchConsultants()
    ]);
  };

  const handleCostPerLeadChange = (cpl: number) => {
    setCostPerLead(cpl);
    localStorage.setItem('dashboard_cost_per_lead', cpl.toString());
  };

  // Calculate ROAS with saved CPL - using TOTAL DEALS CREATED (not just won)
  const calculateROAS = () => {
    if (!kpiData || costPerLead <= 0) return 0;
    const investment = kpiData.totalDealsCreated * costPerLead; // USAR NEGÓCIOS CRIADOS
    return investment > 0 ? kpiData.totalRevenue / investment : 0;
  };

  // Calculate sales prediction
  const calculateSalesPrediction = () => {
    if (!kpiData) return null;

    const now = new Date();
    const currentDay = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dailyAverage = currentDay > 0 ? kpiData.totalRevenue / currentDay : 0;

    return {
      currentRevenue: kpiData.totalRevenue,
      currentDay,
      daysInMonth,
      dailyAverage,
      projectedRevenue: kpiData.totalRevenue + (dailyAverage * (daysInMonth - currentDay))
    };
  };

  const selectedConsultantData = consultants?.find(c => c.id === selectedConsultant);

  // Get current month info for display
  const currentMonth = new Date().toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });

  const salesPrediction = calculateSalesPrediction();
  const currentROAS = calculateROAS();

  // Show loading state for initial load (only if not from cache)
  if ((kpiLoading && !kpiFromCache) && (consultantsLoading && !consultantsFromCache)) {
    return <LoadingSpinner message="Carregando dados do dashboard..." />;
  }

  // Show error state if critical data failed to load
  if (kpiError && consultantsError) {
    return (
      <ErrorMessage 
        message="Erro ao carregar dados principais do dashboard" 
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Painel Administrativo</h2>
          <p className="text-gray-600 mt-1">
            {hasFilters 
              ? 'Dados filtrados do CRM - Visão personalizada'
              : `Dados do mês atual (${currentMonth}) - Visão geral de todas as métricas`
            }
          </p>
          {(kpiFromCache || consultantsFromCache) && (
            <p className="text-xs text-blue-600 mt-1">
              📊 Dados em cache - Atualizados automaticamente a cada 10 segundos
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={kpiLoading || consultantsLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${(kpiLoading || consultantsLoading) ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
          
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            consultants={consultants || []}
            campaigns={campaigns || []}
            isAdmin={true}
          />
        </div>
      </div>

      {/* Period Indicator */}
      {!hasFilters && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 font-medium">
              Exibindo dados do mês atual: {currentMonth}
            </span>
            <span className="text-blue-600">
              - Use os filtros acima para visualizar outros períodos
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      {kpiError ? (
        <ErrorMessage message="Erro ao carregar KPIs" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Negócios Criados"
            value={kpiData?.totalDealsCreated || 0}
            icon={<ShoppingBag className="h-6 w-6" />}
            color="blue"
            trend={{ value: 12.5, isPositive: true }}
          />
          
          <KPICard
            title="Negócios Ganhos"
            value={kpiData?.totalDealsWon || 0}
            icon={<Target className="h-6 w-6" />}
            color="green"
            trend={{ value: 8.3, isPositive: true }}
          />

          <KPICard
            title="Negócios Perdidos"
            value={kpiData?.totalDealsLost || 0}
            icon={<TrendingDown className="h-6 w-6" />}
            color="red"
            trend={{ value: 3.2, isPositive: false }}
          />
          
          <KPICard
            title="Faturamento Total"
            value={formatCurrency(kpiData?.totalRevenue || 0)}
            icon={<DollarSign className="h-6 w-6" />}
            color="purple"
            trend={{ value: 15.7, isPositive: true }}
          />
        </div>
      )}

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Taxa de Conversão"
          value={`${(kpiData?.conversionRate || 0).toFixed(1)}%`}
          icon={<Percent className="h-6 w-6" />}
          color="orange"
          trend={{ value: 3.2, isPositive: true }}
        />
        
        <KPICard
          title="Ticket Médio"
          value={formatCurrency(kpiData?.averageTicket || 0)}
          icon={<Calculator className="h-6 w-6" />}
          color="blue"
        />
        
        <div 
          onClick={() => setShowROASModal(true)}
          className="cursor-pointer transform hover:scale-105 transition-transform"
        >
          <KPICard
            title="ROAS (Clique para configurar)"
            value={costPerLead > 0 ? `${currentROAS.toFixed(2)}x` : 'Configure CPL'}
            icon={<TrendingUp className="h-6 w-6" />}
            color="green"
          />
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Prediction */}
        {salesPrediction && (
          <SalesPredictionCard {...salesPrediction} />
        )}

        {/* Loss Analysis */}
        {lossLoading ? (
          <LoadingSpinner message="Carregando análise de perdas..." />
        ) : lossError ? (
          <ErrorMessage message="Erro ao carregar análise de perdas" />
        ) : (
          <LossAnalysisCard 
            lossData={lossAnalysis || []} 
            totalLostDeals={kpiData?.totalDealsLost || 0}
          />
        )}
      </div>

      {/* Consultant Ranking Table */}
      {consultantsLoading && !consultantsFromCache ? (
        <LoadingSpinner message="Carregando ranking..." />
      ) : consultantsError ? (
        <ErrorMessage message="Erro ao carregar consultores" />
      ) : (
        <ConsultantTable 
          consultants={consultants || []} 
          onFeedback={handleFeedback}
          isAdmin={true}
        />
      )}

      {/* ROAS Modal */}
      <ROASModal
        isOpen={showROASModal}
        onClose={() => setShowROASModal(false)}
        currentROAS={currentROAS}
        totalRevenue={kpiData?.totalRevenue || 0}
        totalInvestment={(kpiData?.totalDealsCreated || 0) * costPerLead}
        totalDeals={kpiData?.totalDealsCreated || 0}
        onCostPerLeadChange={handleCostPerLeadChange}
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