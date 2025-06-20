import React from 'react';
import { AlertTriangle, PieChart } from 'lucide-react';
import { LossAnalysis as LossAnalysisType } from '../types';

interface LossAnalysisProps {
  lossData: LossAnalysisType[];
}

export const LossAnalysis: React.FC<LossAnalysisProps> = ({ lossData }) => {
  const totalLosses = lossData.reduce((sum, item) => sum + item.count, 0);
  const totalValue = lossData.reduce((sum, item) => sum + item.totalValue, 0);

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
          <p className="text-sm text-gray-600">Principais motivos de perda e impacto financeiro</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{totalLosses}</div>
          <div className="text-sm text-gray-600">Total de Perdas</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            R$ {totalValue.toLocaleString('pt-BR')}
          </div>
          <div className="text-sm text-gray-600">Valor Perdido</div>
        </div>
      </div>

      <div className="space-y-4">
        {lossData.map((item, index) => (
          <div key={item.reason} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReasonColor(index)}`}>
                {item.reason}
              </span>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{item.count} negócios</div>
                <div className="text-xs text-gray-600">
                  R$ {item.totalValue.toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${getBarColor(index)}`}
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>{item.percentage.toFixed(1)}% dos casos</span>
              <span>Ticket médio: R$ {(item.totalValue / item.count).toLocaleString('pt-BR')}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">Recomendações de Melhoria</h4>
        <ul className="text-xs text-yellow-800 space-y-1">
          <li>• Revisar estratégia de precificação para reduzir perdas por preço</li>
          <li>• Melhorar argumentação de valor para competir com concorrentes</li>
          <li>• Qualificar melhor leads para evitar problemas de orçamento</li>
          <li>• Implementar follow-up estruturado para negócios em andamento</li>
        </ul>
      </div>
    </div>
  );
};