import React, { useState } from 'react';
import { 
  DollarSign, 
  Target, 
  TrendingUp, 
  ShoppingBag,
  Award,
  Calendar,
  Percent,
  MessageSquare,
  Star,
  RefreshCw
} from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { GoalProgress } from '../components/GoalProgress';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { useApiWithCache } from '../hooks/useGlobalCache';
import { apiService } from '../services/apiService';
import { Goal } from '../types';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  
  // API hooks for user-specific data using consultant email
  const { 
    data: kpiData, 
    loading: kpiLoading, 
    error: kpiError,
    refetch: refetchKPIs,
    isFromCache: kpiFromCache
  } = useApiWithCache(
    `user_kpis_${user?.consultantEmail}`,
    () => apiService.getKPIs({
      consultantEmail: user?.consultantEmail // Use email instead of ID
    }),
    [user?.consultantEmail],
    10
  );

  const { 
    data: userGoals, 
    loading: goalsLoading, 
    error: goalsError 
  } = useApiWithCache(
    `user_goals_${user?.consultantEmail}`,
    () => apiService.getGoals(user?.consultantEmail),
    [user?.consultantEmail],
    15
  );

  const { 
    data: userDeals, 
    loading: dealsLoading, 
    error: dealsError 
  } = useApiWithCache(
    `user_deals_${user?.consultantEmail}`,
    () => apiService.getDeals({
      consultantEmail: user?.consultantEmail,
      limit: 10
    }),
    [user?.consultantEmail],
    10
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleUpdateGoal = (goalId: string, updates: Partial<Goal>) => {
    setGoals(prevGoals => 
      prevGoals.map(goal => 
        goal.id === goalId 
          ? { ...goal, ...updates }
          : goal
      )
    );
  };

  const handleRefresh = async () => {
    await refetchKPIs();
  };

  // Show loading state for initial load (only if not from cache)
  if ((kpiLoading && !kpiFromCache) && goalsLoading) {
    return <LoadingSpinner message="Carregando seus dados..." />;
  }

  // Show error state if critical data failed to load
  if (kpiError) {
    return (
      <ErrorMessage 
        message="Erro ao carregar seus dados de performance" 
        onRetry={handleRefresh}
      />
    );
  }

  const userGoal = userGoals?.[0]; // Get the first goal for current period

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Olá, {user?.name}!</h2>
          <p className="text-gray-600 mt-1">Acompanhe seu desempenho e progresso das suas metas em tempo real</p>
          {kpiFromCache && (
            <p className="text-xs text-blue-600 mt-1">
              📊 Dados em cache - Atualizados automaticamente a cada 10 segundos
            </p>
          )}
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={kpiLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${kpiLoading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Personal KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Minha Receita Total"
          value={formatCurrency(kpiData?.totalRevenue || 0)}
          icon={<DollarSign className="h-6 w-6" />}
          color="green"
          trend={{ value: 15.2, isPositive: true }}
        />
        
        <KPICard
          title="Negócios Ganhos"
          value={kpiData?.totalDealsWon || 0}
          icon={<Target className="h-6 w-6" />}
          color="blue"
          trend={{ value: 8.7, isPositive: true }}
        />
        
        <KPICard
          title="Taxa de Conversão"
          value={`${(kpiData?.conversionRate || 0).toFixed(1)}%`}
          icon={<Percent className="h-6 w-6" />}
          color="purple"
          trend={{ value: 2.1, isPositive: true }}
        />
        
        <KPICard
          title="Meu ROAS"
          value={`${(kpiData?.roas || 0).toFixed(2)}x`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="orange"
          trend={{ value: 5.3, isPositive: true }}
        />
      </div>

      {/* Goal Progress and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goalsLoading ? (
          <LoadingSpinner message="Carregando suas metas..." />
        ) : goalsError ? (
          <ErrorMessage message="Erro ao carregar metas" showRetry={false} />
        ) : userGoal ? (
          <GoalProgress 
            goal={userGoal} 
            onUpdateGoal={handleUpdateGoal}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Minhas Metas</h3>
            <p className="text-gray-600">Nenhuma meta encontrada para este período.</p>
          </div>
        )}
        
        {/* Personal Performance Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Meu Desempenho Mensal</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <span className="text-lg font-bold text-blue-900">
                {formatCurrency(kpiData?.totalRevenue || 0)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{kpiData?.totalDealsWon || 0}</div>
                <div className="text-sm text-gray-600">Vendas Realizadas</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(kpiData?.averageTicket || 0)}
                </div>
                <div className="text-sm text-gray-600">Ticket Médio</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Deals */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Meus Negócios Recentes</h3>
        </div>
        
        {dealsLoading ? (
          <div className="p-6">
            <LoadingSpinner size="sm" message="Carregando seus negócios..." />
          </div>
        ) : dealsError ? (
          <div className="p-6">
            <ErrorMessage message="Erro ao carregar negócios" showRetry={false} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Negócio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(userDeals || []).map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{deal.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(deal.value)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                        ${deal.stage === 'won' 
                          ? 'bg-green-100 text-green-800' 
                          : deal.stage === 'lost'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {deal.stage === 'won' ? 'Ganho' : deal.stage === 'lost' ? 'Perdido' : 'Em Progresso'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(deal.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};