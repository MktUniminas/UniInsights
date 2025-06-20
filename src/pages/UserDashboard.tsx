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
  Star
} from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { GoalProgress } from '../components/GoalProgress';
import { useAuth } from '../hooks/useAuth';
import { mockDeals, mockConsultants, mockGoals, mockFeedbacks } from '../services/mockData';
import { Goal } from '../types';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState(mockGoals);
  
  // Find user's consultant data
  const consultant = mockConsultants.find(c => c.id === user?.consultantId);
  const userGoal = goals.find(g => g.consultantId === user?.consultantId);
  const userFeedbacks = mockFeedbacks.filter(f => f.consultantId === user?.consultantId);
  
  // Filter deals for this consultant
  const userDeals = mockDeals.filter(deal => deal.consultantId === user?.consultantId);
  const wonDeals = userDeals.filter(deal => deal.stage === 'won');
  const totalRevenue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
  
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

  const getLevelColor = (level: number) => {
    if (level >= 5) return 'bg-purple-100 text-purple-800';
    if (level >= 3) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getFeedbackTypeColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'constructive':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!consultant || !userGoal) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Dados do consultor não encontrados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Olá, {user?.name}!</h2>
        <p className="text-gray-600 mt-1">Acompanhe seu desempenho e progresso das suas metas</p>
      </div>

      {/* Personal KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Minha Receita Total"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign className="h-6 w-6" />}
          color="green"
          trend={{ value: 15.2, isPositive: true }}
        />
        
        <KPICard
          title="Negócios Ganhos"
          value={wonDeals.length}
          icon={<Target className="h-6 w-6" />}
          color="blue"
          trend={{ value: 8.7, isPositive: true }}
        />
        
        <KPICard
          title="Taxa de Conversão"
          value={`${consultant.conversionRate.toFixed(1)}%`}
          icon={<Percent className="h-6 w-6" />}
          color="purple"
          trend={{ value: 2.1, isPositive: true }}
        />
        
        <KPICard
          title="Meu ROAS"
          value={`${consultant.roas.toFixed(2)}x`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="orange"
          trend={{ value: 5.3, isPositive: true }}
        />
      </div>

      {/* Gamification Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Meu Progresso</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">#{consultant.rank}</div>
            <div className="text-sm text-gray-600">Posição no Ranking</div>
          </div>
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(consultant.level)}`}>
              Nível {consultant.level}
            </div>
            <div className="text-sm text-gray-600 mt-1">Nível Atual</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900">{consultant.points}</span>
            </div>
            <div className="text-sm text-gray-600">Pontos Totais</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{consultant.badges.length}</div>
            <div className="text-sm text-gray-600">Conquistas</div>
          </div>
        </div>
        
        {/* Badges */}
        {consultant.badges.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Minhas Conquistas</h4>
            <div className="flex flex-wrap gap-3">
              {consultant.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg"
                  title={badge.description}
                >
                  <span className="text-lg">{badge.icon}</span>
                  <span className="text-sm font-medium text-yellow-800">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Goal Progress and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GoalProgress 
          goal={userGoal} 
          onUpdateGoal={handleUpdateGoal}
        />
        
        {/* Personal Performance Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Meu Desempenho Mensal</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Janeiro 2024</span>
              </div>
              <span className="text-lg font-bold text-blue-900">
                {formatCurrency(totalRevenue)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{wonDeals.length}</div>
                <div className="text-sm text-gray-600">Vendas Realizadas</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0)}
                </div>
                <div className="text-sm text-gray-600">Ticket Médio</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      {userFeedbacks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Feedbacks Recebidos</h3>
          </div>
          <div className="space-y-4">
            {userFeedbacks.map((feedback) => (
              <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{feedback.adminName}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFeedbackTypeColor(feedback.type)}`}>
                      {feedback.type === 'positive' ? 'Positivo' : 
                       feedback.type === 'constructive' ? 'Construtivo' : 'Neutro'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-700">{feedback.message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(feedback.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Deals */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Meus Negócios Recentes</h3>
        </div>
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
              {userDeals.map((deal) => (
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
      </div>
    </div>
  );
};