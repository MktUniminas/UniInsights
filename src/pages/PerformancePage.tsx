import React from 'react';
import { 
  DollarSign, 
  Target, 
  TrendingUp, 
  Percent,
  Award,
  Star,
  Calendar
} from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { useAuth } from '../hooks/useAuth';
import { mockDeals, mockConsultants, mockFeedbacks } from '../services/mockData';

export const PerformancePage: React.FC = () => {
  const { user } = useAuth();
  
  const consultant = mockConsultants.find(c => c.id === user?.consultantId);
  const userFeedbacks = mockFeedbacks.filter(f => f.consultantId === user?.consultantId);
  const userDeals = mockDeals.filter(deal => deal.consultantId === user?.consultantId);
  const wonDeals = userDeals.filter(deal => deal.stage === 'won');
  const totalRevenue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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

  if (!consultant) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Dados do consultor não encontrados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Minha Performance</h3>
        <p className="text-gray-600 mt-1">Análise detalhada do seu desempenho e evolução</p>
      </div>

      {/* Performance KPIs */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gamification Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Meu Progresso</h4>
          <div className="grid grid-cols-2 gap-4 mb-6">
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
            <div className="pt-4 border-t border-gray-200">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Minhas Conquistas</h5>
              <div className="flex flex-wrap gap-2">
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

        {/* Monthly Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Mensal</h4>
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
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Feedbacks Recebidos</h4>
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
    </div>
  );
};