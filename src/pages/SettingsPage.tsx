import React, { useState } from 'react';
import { 
  Settings as SettingsIcon,
  Database,
  Zap,
  Clock,
  Users,
  Target,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [systemSettings, setSystemSettings] = useState({
    autoRefreshInterval: 10,
    cacheTimeout: 24,
    webhookRetries: 3,
    defaultCostPerLead: 85
  });

  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSettingChange = (key: string, value: number) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Simular salvamento das configurações
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Salvar no localStorage para persistência
      localStorage.setItem('system_settings', JSON.stringify(systemSettings));
      
      setSaveMessage({
        type: 'success',
        text: 'Configurações salvas com sucesso!'
      });
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: 'Erro ao salvar configurações. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = () => {
    setSystemSettings({
      autoRefreshInterval: 10,
      cacheTimeout: 24,
      webhookRetries: 3,
      defaultCostPerLead: 85
    });
    localStorage.removeItem('system_settings');
    setSaveMessage({
      type: 'success',
      text: 'Configurações resetadas para os valores padrão.'
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
        <p className="text-gray-600 mt-1">
          Configure parâmetros de funcionamento e integração com o CRM
        </p>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-4 rounded-lg border ${
          saveMessage.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {saveMessage.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            <span>{saveMessage.text}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
              <p className="text-sm text-gray-600">Configurações de velocidade e cache</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intervalo de Atualização Automática (segundos)
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={systemSettings.autoRefreshInterval}
                onChange={(e) => handleSettingChange('autoRefreshInterval', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Frequência de atualização silenciosa da interface
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempo de Cache (horas)
              </label>
              <input
                type="number"
                min="1"
                max="48"
                value={systemSettings.cacheTimeout}
                onChange={(e) => handleSettingChange('cacheTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tempo antes do reset automático do cache
              </p>
            </div>
          </div>
        </div>

        {/* CRM Integration Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Database className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Integração CRM</h3>
              <p className="text-sm text-gray-600">Configurações de conexão e webhooks</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tentativas de Webhook
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={systemSettings.webhookRetries}
                onChange={(e) => handleSettingChange('webhookRetries', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Número de tentativas em caso de falha no webhook
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custo por Lead Padrão (R$)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={systemSettings.defaultCostPerLead}
                onChange={(e) => handleSettingChange('defaultCostPerLead', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Valor padrão para cálculo de ROAS quando não especificado
              </p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Status do Sistema</h3>
              <p className="text-sm text-gray-600">Monitoramento em tempo real</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-900">Sistema Independente</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✅ Ativo
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-900">Cache de Dados</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                📊 Carregado
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium text-orange-900">Webhooks</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                🔔 Escutando
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Última Atualização</span>
              <span className="text-xs text-gray-600">
                {new Date().toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>

        {/* Webhook URLs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">URLs dos Webhooks</h3>
              <p className="text-sm text-gray-600">Configure no RD Station CRM</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deal Created (crm_deal_created)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value="https://uninsights-crm-dealcreated.com"
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm"
                />
                <button
                  onClick={() => navigator.clipboard.writeText('https://uninsights-crm-dealcreated.com')}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Copiar
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deal Updated (crm_deal_updated)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value="https://uninsights-crm-dealupdated.com"
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm"
                />
                <button
                  onClick={() => navigator.clipboard.writeText('https://uninsights-crm-dealupdated.com')}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                />
                  Copiar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-8 border-t border-gray-200">
        <button
          onClick={resetSettings}
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Resetar Configurações</span>
        </button>

        <button
          onClick={saveSettings}
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{loading ? 'Salvando...' : 'Salvar Configurações'}</span>
        </button>
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-2">Informações Importantes</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• O sistema opera de forma independente 24/7, não dependendo de usuários logados</p>
              <p>• Reset diário automático às 00:00 (horário de Brasília) para garantir consistência</p>
              <p>• Webhooks processam atualizações em tempo real do RD Station CRM</p>
              <p>• Cache é atualizado automaticamente com novos negócios e alterações</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};