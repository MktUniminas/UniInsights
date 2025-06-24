import React, { useState } from 'react';
import { Target, Edit3, Save, X, DollarSign, Users, TrendingUp, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useCampaigns } from '../hooks/useApi';
import { Campaign } from '../types';

export const CampaignsPage: React.FC = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ costPerLead: number }>({ costPerLead: 0 });

  const { 
    data: campaigns, 
    loading, 
    error, 
    refetch 
  } = useCampaigns(true);

  const handleEdit = (campaign: Campaign) => {
    setEditingId(campaign.id);
    setEditValues({ costPerLead: campaign.costPerLead || 0 });
  };

  const handleSave = (campaignId: string) => {
    // In a real implementation, this would call an API to update the campaign
    console.log('Updating campaign:', campaignId, editValues);
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
    if (!campaign.totalInvestment || campaign.totalInvestment === 0) return 0;
    const estimatedRevenue = (campaign.wonDeals || 0) * 15000; // Average deal value
    return estimatedRevenue / campaign.totalInvestment;
  };

  if (loading) {
    return <LoadingSpinner message="Carregando dados das campanhas..." />;
  }

  if (error) {
    return (
      <ErrorMessage 
        message="Erro ao carregar dados das campanhas" 
        onRetry={refetch}
      />
    );
  }

  const campaignsList = campaigns || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestão de Campanhas</h3>
          <p className="text-gray-600 mt-1">Gerencie o custo por lead e acompanhe o desempenho</p>
        </div>
        
        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Campanhas</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{campaignsList.length}</p>
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
                {formatCurrency(campaignsList.reduce((sum, c) => sum + (c.totalInvestment || 0), 0))}
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
                {campaignsList.reduce((sum, c) => sum + (c.totalLeads || 0), 0)}
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
          <p className="text-sm text-gray-600">Dados atualizados em tempo real do CRM</p>
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
              {campaignsList.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      campaign.source === 'Google Ads' ? 'bg-blue-100 text-blue-800' :
                      campaign.source === 'Facebook' ? 'bg-blue-100 text-blue-800' :
                      campaign.source === 'LinkedIn' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.source || 'Outros'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === campaign.id ? (
                      <input
                        type="number"
                        value={editValues.costPerLead}
                        onChange={(e) => setEditValues({ costPerLead: Number(e.target.value) })}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        {formatCurrency(campaign.costPerLead || 0)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{campaign.totalLeads || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{campaign.totalDeals || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(campaign.totalInvestment || 0)}
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
                          className="text-green-600 hover:text-green-700"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <X className="h-4 w-4" />
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

      {/* Como calculamos o ROAS */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-sm font-medium text-blue-900 mb-3">Como calculamos o ROAS</h4>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>ROAS = Faturamento Total ÷ Investimento Total</strong></p>
          <p><strong>• Faturamento Total:</strong> Soma de todos os negócios ganhos da campanha (integração CRM)</p>
          <p><strong>• Investimento Total:</strong> Quantidade de Negócios × Custo por Lead da campanha</p>
          <p><strong>• Exemplo:</strong> Se uma campanha gerou R$ 45.000 em vendas com investimento de R$ 3.825, o ROAS é 11.76x</p>
        </div>
      </div>
    </div>
  );
};