import React, { useState } from 'react';
import { Trophy, TrendingUp, Award, ChevronDown, ChevronUp, Star, MessageSquare } from 'lucide-react';
import { Consultant } from '../types';

interface ConsultantTableProps {
  consultants: Consultant[];
  onFeedback?: (consultantId: string) => void;
  isAdmin?: boolean;
}

export const ConsultantTable: React.FC<ConsultantTableProps> = ({ 
  consultants, 
  onFeedback,
  isAdmin = false 
}) => {
  const [displayCount, setDisplayCount] = useState(5);
  const [sortBy, setSortBy] = useState<'revenue' | 'deals' | 'conversion' | 'roas'>('revenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedConsultants = [...consultants].sort((a, b) => {
    let aValue: number, bValue: number;
    
    switch (sortBy) {
      case 'revenue':
        aValue = a.totalRevenue;
        bValue = b.totalRevenue;
        break;
      case 'deals':
        aValue = a.totalDeals;
        bValue = b.totalDeals;
        break;
      case 'conversion':
        aValue = a.conversionRate;
        bValue = b.conversionRate;
        break;
      case 'roas':
        aValue = a.roas;
        bValue = b.roas;
        break;
      default:
        aValue = a.totalRevenue;
        bValue = b.totalRevenue;
    }

    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  const handleSort = (field: 'revenue' | 'deals' | 'conversion' | 'roas') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Award className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-gray-500">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    }
    return 'bg-gray-100 text-gray-700';
  };

  const getLevelColor = (level: number) => {
    if (level >= 5) return 'bg-purple-100 text-purple-800';
    if (level >= 3) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const SortButton: React.FC<{ field: 'revenue' | 'deals' | 'conversion' | 'roas', children: React.ReactNode }> = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
    >
      <span>{children}</span>
      {sortBy === field && (
        sortOrder === 'desc' ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />
      )}
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Ranking de Consultores</h3>
        <p className="text-sm text-gray-600">Performance e classificação em tempo real</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ranking
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Consultor
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="revenue">Receita Total</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="deals">Negócios Ganhos</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="conversion">Taxa de Conversão</SortButton>
              </th>
              <th className="px-6 py-3 text-left">
                <SortButton field="roas">ROAS</SortButton>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gamificação
              </th>
              {isAdmin && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedConsultants.slice(0, displayCount).map((consultant, index) => (
              <tr key={consultant.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getRankIcon(consultant.rank)}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRankBadge(consultant.rank)}`}>
                      #{consultant.rank}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {consultant.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{consultant.name}</div>
                      <div className="text-sm text-gray-500">{consultant.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    R$ {consultant.totalRevenue.toLocaleString('pt-BR')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">{consultant.totalDeals}</span>
                    <TrendingUp className="h-4 w-4 text-green-500 ml-1" />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 w-16">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${consultant.conversionRate}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {consultant.conversionRate.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {consultant.roas.toFixed(2)}x
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(consultant.level)}`}>
                      Nível {consultant.level}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-xs text-gray-600">{consultant.points}</span>
                    </div>
                    <div className="flex space-x-1">
                      {consultant.badges.slice(0, 2).map((badge) => (
                        <span key={badge.id} className="text-sm" title={badge.description}>
                          {badge.icon}
                        </span>
                      ))}
                      {consultant.badges.length > 2 && (
                        <span className="text-xs text-gray-500">+{consultant.badges.length - 2}</span>
                      )}
                    </div>
                  </div>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onFeedback?.(consultant.id)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm">Feedback</span>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {displayCount < consultants.length && (
        <div className="px-6 py-4 border-t border-gray-200 text-center">
          <button
            onClick={() => setDisplayCount(prev => Math.min(prev + 5, consultants.length))}
            className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>Ver mais consultores</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Mostrando {displayCount} de {consultants.length} consultores
          </p>
        </div>
      )}
    </div>
  );
};