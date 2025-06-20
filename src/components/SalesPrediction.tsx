import React from 'react';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import { SalesPrediction as SalesPredictionType } from '../types';

interface SalesPredictionProps {
  predictions: SalesPredictionType[];
}

export const SalesPrediction: React.FC<SalesPredictionProps> = ({ predictions }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Target className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Previsão de Vendas</h3>
          <p className="text-sm text-gray-600">Baseado em dados históricos e tendências</p>
        </div>
      </div>

      <div className="space-y-4">
        {predictions.map((prediction, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">{prediction.period}</h4>
              <div className="flex items-center space-x-2">
                {getTrendIcon(prediction.trend)}
                <span className={`text-sm font-medium ${getTrendColor(prediction.trend)}`}>
                  {prediction.trend === 'up' ? 'Crescimento' : 
                   prediction.trend === 'down' ? 'Declínio' : 'Estável'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-sm text-gray-600">Receita Prevista</p>
                <p className="text-lg font-semibold text-gray-900">
                  R$ {prediction.predictedRevenue.toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Negócios Previstos</p>
                <p className="text-lg font-semibold text-gray-900">
                  {prediction.predictedDeals}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Confiança da previsão:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceColor(prediction.confidence)}`}>
                {prediction.confidence}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Como interpretamos as previsões</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Análise baseada em performance dos últimos 3 meses</li>
          <li>• Considera sazonalidade e tendências de mercado</li>
          <li>• Confiança acima de 80% indica alta precisão</li>
          <li>• Previsões são atualizadas semanalmente</li>
        </ul>
      </div>
    </div>
  );
};