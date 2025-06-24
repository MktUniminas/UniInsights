import React from 'react';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import { LossAnalysis } from '../types';

interface LossAnalysisCardProps {
  lossData: LossAnalysis[];
  totalLostDeals: number;
}

export const LossAnalysisCard: React.FC<LossAnalysisCardProps> = ({ 
  lossData, 
  totalLostDeals 
}) => {
  const getReasonColor = (index: number) => {
    const colors = [
      'bg-red-100 text-red-800',
      'bg-orange-100 text-orange-800',
      'bg-yellow-100 text-yellow-800',
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800'
    ];
    return colors[index % colors.length];
  };

  const getBarColor = (index: number) => {
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-yellow-500',
      'bg-blue-500',
      'bg-purple-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-red-100 rounded-lg">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Análise de Negócios Perdidos</h3>
          <p className="text-sm text-gray-600">Principais motivos de perda do mês atual</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center space-x-2 text-center p-3 bg-red-50 rounded-lg">
          <TrendingDown className="h-5 w-5 text-red-600" />
          <div>
            <div className="text-2xl font-bold text-red-900">{totalLostDeals}</div>
            <div className="text-sm text-red-700">Negócios Perdidos</div>
          </div>
        </div>
      </div>

      {lossData.length > 0 ? (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {lossData.map((item, index) => (
            <div key={item.reason} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReasonColor(index)}`}>
                  {item.reason}
                </span>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{item.count} negócios</div>
                  <div className="text-xs text-gray-600">
                    {item.percentage.toFixed(1)}% dos casos
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getBarColor(index)}`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600">Nenhum negócio perdido no período</p>
          <p className="text-sm text-gray-500">Excelente performance!</p>
        </div>
      )}

      {lossData.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-900 mb-2">💡 Dicas para Reduzir Perdas</h4>
          <ul className="text-xs text-yellow-800 space-y-1">
            <li>• Qualifique melhor os leads antes de iniciar negociações</li>
            <li>• Desenvolva argumentos de valor mais convincentes</li>
            <li>• Implemente follow-up estruturado para negócios em andamento</li>
            <li>• Analise a concorrência e ajuste estratégias de precificação</li>
          </ul>
        </div>
      )}
    </div>
  );
};