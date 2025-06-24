import React from 'react';
import { Trophy, Users, Calculator } from 'lucide-react';
import { Consultant } from '../types';

interface ConsultantRankingCardProps {
  consultants: Consultant[];
  costPerLead: number;
}

export const ConsultantRankingCard: React.FC<ConsultantRankingCardProps> = ({ 
  consultants, 
  costPerLead 
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calculate ROAS for each consultant
  const consultantsWithROAS = consultants.map(consultant => {
    const investment = consultant.totalDeals * costPerLead;
    const roas = investment > 0 ? consultant.totalRevenue / investment : 0;
    
    return {
      ...consultant,
      calculatedROAS: roas,
      investment
    };
  }).sort((a, b) => b.calculatedROAS - a.calculatedROAS);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>;
      case 3:
        return <div className="w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>;
      default:
        return <span className="text-gray-500 text-sm">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    }
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Users className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Ranking de Consultores</h3>
          <p className="text-sm text-gray-600">Classificação por ROAS individual</p>
        </div>
      </div>

      {/* CPL Display */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Calculator className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            Custo por Lead: {formatCurrency(costPerLead)}
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {consultantsWithROAS.map((consultant, index) => {
          const rank = index + 1;
          
          return (
            <div key={consultant.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getRankIcon(rank)}
                  <div>
                    <div className="font-medium text-gray-900">{consultant.name}</div>
                    <div className="text-sm text-gray-600">{consultant.email}</div>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRankBadge(rank)}`}>
                  #{rank}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(consultant.totalRevenue)}
                  </div>
                  <div className="text-gray-600">Faturamento</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{consultant.totalDeals}</div>
                  <div className="text-gray-600">Negócios</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">
                    {consultant.calculatedROAS.toFixed(2)}x
                  </div>
                  <div className="text-gray-600">ROAS</div>
                </div>
              </div>

              {/* Gamification - All Level 1, 0 stars for now */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-800 font-medium">
                      Nível 1
                    </span>
                    <span className="text-gray-600">⭐ 0 estrelas</span>
                  </div>
                  <div className="text-gray-500">
                    Investimento: {formatCurrency(consultant.investment)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {consultantsWithROAS.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Nenhum consultor encontrado</p>
        </div>
      )}

      {/* ROAS Calculation Info */}
      <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
        <h4 className="text-sm font-medium text-purple-900 mb-2">Como calculamos o ROAS individual</h4>
        <div className="text-xs text-purple-800 space-y-1">
          <p><strong>ROAS = Faturamento do Consultor ÷ Investimento do Consultor</strong></p>
          <p>• <strong>Faturamento:</strong> Soma dos negócios ganhos pelo consultor</p>
          <p>• <strong>Investimento:</strong> Negócios ganhos × Custo por Lead ({formatCurrency(costPerLead)})</p>
        </div>
      </div>
    </div>
  );
};