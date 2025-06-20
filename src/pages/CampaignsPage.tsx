import React, { useState } from 'react';
import { Target, Edit3, Save, X, Plus, DollarSign, Users, TrendingUp } from 'lucide-react';
import { Campaign } from '../types';
import { mockCampaigns } from '../services/mockData';

export const CampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ costPerLead: number }>({ costPerLead: 0 });

  const handleEdit = (campaign: Campaign) => {
    setEditingId(campaign.id);
    setEditValues({ costPerLead: campaign.costPerLead });
  };

  const handleSave = (campaignId: string) => {
    setCampaigns(prev => 
      prev.map(campaign => 
        campaign.id === campaignId 
          ? { 
              ...campaign, 
              costPerLead: editValues.costPerLead,
              totalInvestment: editValues.costPerLead * campaign.totalDeals
            }
          : campaign
      )
    );
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({ costPerLead: 0 });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateROAS = (campaign: Campaign) => {
    if (campaign.totalInvestment === 0) return 0;
    // Aqui você calcularia a receita real da campanha baseada nos negócios ganhos
    // Por simplicidade, vamos usar um valor estimado
    const estimatedRevenue = campaign.totalDeals * 15000; // Valor médio por negócio
    return estimatedRevenue / campaign.totalInvestment;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestão de Campanhas</h3>
          <p className="text-gray-600 mt-1">Configure o custo por lead de cada campanha para cálculo preciso do ROAS</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Campanhas</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{campaigns.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Investimento Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(campaigns.reduce((sum, c) => sum + c.totalInvestment, 0))}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Leads</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {campaigns.reduce((sum, c) => sum + c.totalLeads, 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Campanhas Ativas</h4>
          <p className="text-sm text-gray-600">Gerencie o custo por lead e acompanhe o desempenho</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campanha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fonte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Custo por Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total de Leads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Negócios Gerados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Investimento Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROAS Estimado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {campaign.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === campaign.id ? (
                      <input
                        type="number"
                        value={editValues.costPerLead}
                        onChange={(e) => setEditValues({ costPerLead: Number(e.target.value) })}
                        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{formatCurrency(campaign.costPerLead)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{campaign.totalLeads}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{campaign.totalDeals}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(campaign.totalInvestment)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">
                        {calculateROAS(campaign).toFixed(2)}x
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === campaign.id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSave(campaign.id)}
                          className="flex items-center space-x-1 text-green-600 hover:text-green-700 transition-colors"
                        >
                          <Save className="h-4 w-4" />
                          <span className="text-sm">Salvar</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          <span className="text-sm">Cancelar</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(campaign)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span className="text-sm">Editar</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROAS Calculation Info */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Como calculamos o ROAS</h4>
        <div className="text-xs text-blue-800 space-y-1">
          <p><strong>ROAS = Faturamento Total ÷ Investimento Total</strong></p>
          <p>• <strong>Faturamento Total:</strong> Soma de todos os negócios ganhos da campanha (integração CRM)</p>
          <p>• <strong>Investimento Total:</strong> Quantidade de Negócios × Custo por Lead da campanha</p>
          <p>• <strong>Exemplo:</strong> Se uma campanha gerou R$ 45.000 em vendas com investimento de R$ 3.825, o ROAS é 11.76x</p>
        </div>
      </div>
    </div>
  );
};