import React from 'react';
import { TrendingUp, Calendar, Target, DollarSign } from 'lucide-react';

interface SalesPredictionCardProps {
  currentRevenue: number;
  currentDay: number;
  daysInMonth: number;
  dailyAverage: number;
  projectedRevenue: number;
}

export const SalesPredictionCard: React.FC<SalesPredictionCardProps> = ({
  currentRevenue,
  currentDay,
  daysInMonth,
  dailyAverage,
  projectedRevenue
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const remainingDays = daysInMonth - currentDay;
  const projectedAdditional = remainingDays * dailyAverage;
  const totalProjected = currentRevenue + projectedAdditional;
  const growthPercentage = currentRevenue > 0 ? ((totalProjected - currentRevenue) / currentRevenue) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <TrendingUp className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Previsão de Vendas</h3>
          <p className="text-sm text-gray-600">Projeção baseada na performance atual</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Atual</span>
            </div>
            <div className="text-xl font-bold text-blue-900">
              {formatCurrency(currentRevenue)}
            </div>
            <div className="text-xs text-blue-700">
              Dia {currentDay} de {daysInMonth}
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Projetado</span>
            </div>
            <div className="text-xl font-bold text-green-900">
              {formatCurrency(totalProjected)}
            </div>
            <div className="text-xs text-green-700">
              Final do mês
            </div>
          </div>
        </div>

        {/* Daily Average */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Média Diária</span>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {formatCurrency(dailyAverage)}
          </div>
          <div className="text-xs text-gray-600">
            Baseado nos últimos {currentDay} dias
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progresso do mês</span>
            <span>{((currentDay / daysInMonth) * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentDay / daysInMonth) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Projection Details */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Detalhes da Projeção</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Faturamento atual:</span>
              <span className="font-medium">{formatCurrency(currentRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dias restantes:</span>
              <span className="font-medium">{remainingDays} dias</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Projeção adicional:</span>
              <span className="font-medium text-green-600">+{formatCurrency(projectedAdditional)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="text-gray-900 font-medium">Total projetado:</span>
              <span className="font-bold text-green-600">{formatCurrency(totalProjected)}</span>
            </div>
          </div>
        </div>

        {/* Growth Indicator */}
        {growthPercentage > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                Crescimento projetado: +{growthPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};