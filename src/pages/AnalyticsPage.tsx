import React from 'react';
import { SalesPrediction } from '../components/SalesPrediction';
import { LossAnalysis } from '../components/LossAnalysis';
import { generateSalesPrediction, generateLossAnalysis } from '../services/mockData';

export const AnalyticsPage: React.FC = () => {
  const predictions = generateSalesPrediction();
  const lossAnalysis = generateLossAnalysis();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Análises Avançadas</h3>
        <p className="text-gray-600 mt-1">Insights detalhados sobre vendas e performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesPrediction predictions={predictions} />
        <LossAnalysis lossData={lossAnalysis} />
      </div>

      {/* Additional Analytics Components can be added here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Funil de Conversão</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Leads Gerados</span>
              <span className="text-sm font-medium">95</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Negócios Criados</span>
              <span className="text-sm font-medium">10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '10.5%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Negócios Ganhos</span>
              <span className="text-sm font-medium text-green-600">7</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '7.4%' }}></div>
            </div>
          </div>
        </div>

        {/* Performance Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendências de Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-900">Taxa de Conversão</span>
              <span className="text-lg font-bold text-green-900">70%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-900">Ticket Médio</span>
              <span className="text-lg font-bold text-blue-900">R$ 18.571</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-purple-900">ROAS Médio</span>
              <span className="text-lg font-bold text-purple-900">8.45x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};