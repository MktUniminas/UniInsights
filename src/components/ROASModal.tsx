import React, { useState, useEffect, useMemo } from 'react';
import { X, Calculator, Info, DollarSign, Target } from 'lucide-react';

interface ROASModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentROAS: number;
  totalRevenue: number;
  totalInvestment: number;
  totalDeals: number;
  onCostPerLeadChange?: (cpl: number) => void; // NEW: Callback to save CPL
}

export const ROASModal: React.FC<ROASModalProps> = ({
  isOpen,
  onClose,
  currentROAS,
  totalRevenue,
  totalInvestment,
  totalDeals,
  onCostPerLeadChange
}) => {
  // Get saved CPL from localStorage or default to 0
  const [costPerLead, setCostPerLead] = useState<number>(() => {
    const saved = localStorage.getItem('dashboard_cost_per_lead');
    return saved ? parseFloat(saved) : 0;
  });

  // Calculate custom values using useMemo to prevent infinite loops
  const customInvestment = useMemo(() => {
    return totalDeals * costPerLead;
  }, [totalDeals, costPerLead]);

  const customROAS = useMemo(() => {
    return customInvestment > 0 ? totalRevenue / customInvestment : 0;
  }, [totalRevenue, customInvestment]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Save CPL to localStorage when it changes
  const handleCostPerLeadChange = (value: number) => {
    setCostPerLead(value);
    localStorage.setItem('dashboard_cost_per_lead', value.toString());
    
    // Notify parent component if callback is provided
    if (onCostPerLeadChange) {
      onCostPerLeadChange(value);
    }
  };

  // Load saved CPL when modal opens
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('dashboard_cost_per_lead');
      if (saved) {
        setCostPerLead(parseFloat(saved));
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calculator className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Calculadora de ROAS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current ROAS Display */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">ROAS Atual</h4>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {costPerLead > 0 ? customROAS.toFixed(2) : '0.00'}x
              </div>
              <p className="text-sm text-gray-600">
                {costPerLead > 0 
                  ? `Para cada R$ 1,00 investido, você obtém R$ ${customROAS.toFixed(2)} de retorno`
                  : 'Defina o Custo por Lead para calcular o ROAS'
                }
              </p>
            </div>
          </div>

          {/* Formula Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-900 mb-2">Fórmula do ROAS</h5>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>ROAS = Faturamento Total ÷ Investimento Total</strong></p>
                  <p>• <strong>Faturamento Total:</strong> Soma de todos os negócios ganhos</p>
                  <p>• <strong>Investimento Total:</strong> Quantidade de Negócios CRIADOS × Custo por Lead</p>
                  <p className="text-blue-700 font-medium">⚠️ Usa TODOS os negócios criados (ganhos + perdidos + em andamento)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(totalRevenue)}
              </div>
              <div className="text-sm text-gray-600">Faturamento Total</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-gray-900">{totalDeals}</div>
              <div className="text-sm text-gray-600">Negócios Criados</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Calculator className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(customInvestment)}
              </div>
              <div className="text-sm text-gray-600">Investimento Calculado</div>
            </div>
          </div>

          {/* CPL Input */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-4">Definir Custo por Lead (CPL)</h5>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custo por Lead (CPL)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="number"
                    value={costPerLead}
                    onChange={(e) => handleCostPerLeadChange(Number(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Este valor será salvo e usado nos cálculos do dashboard
                </p>
              </div>

              {costPerLead > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">Investimento Total</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(customInvestment)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {totalDeals} negócios criados × {formatCurrency(costPerLead)}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-sm text-gray-600">ROAS Calculado</div>
                    <div className="text-lg font-semibold text-green-700">
                      {customROAS.toFixed(2)}x
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(totalRevenue)} ÷ {formatCurrency(customInvestment)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ROAS Interpretation */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">Como Interpretar o ROAS</h5>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span><strong>ROAS &lt; 2x:</strong> Investimento pode não ser sustentável</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span><strong>ROAS 2x - 4x:</strong> Retorno moderado, analise outros custos</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span><strong>ROAS &gt; 4x:</strong> Excelente retorno sobre investimento</span>
              </div>
            </div>
          </div>

          {/* Example Calculation */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h5 className="font-medium text-purple-900 mb-2">Exemplo Prático</h5>
            <div className="text-sm text-purple-800">
              <p>Se uma campanha gerou <strong>R$ 45.000</strong> em vendas com investimento de <strong>R$ 3.825</strong>:</p>
              <p className="mt-1"><strong>ROAS = R$ 45.000 ÷ R$ 3.825 = 11.76x</strong></p>
              <p className="mt-1">Isso significa que para cada R$ 1,00 investido, a empresa obteve R$ 11,76 de retorno.</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Salvar e Fechar
          </button>
        </div>
      </div>
    </div>
  );
};