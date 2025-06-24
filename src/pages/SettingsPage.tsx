import React from 'react';
import { Settings, Wrench, Code, Database, Palette, Shield } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const upcomingFeatures = [
    {
      icon: Database,
      title: 'Integração com CRM',
      description: 'Conecte com diferentes sistemas de CRM para sincronizar dados em tempo real',
      status: 'Em desenvolvimento'
    },
    {
      icon: Palette,
      title: 'Personalização Visual',
      description: 'Customize cores, temas e layout do sistema conforme sua marca',
      status: 'Planejado'
    },
    {
      icon: Shield,
      title: 'Configurações de Segurança',
      description: 'Gerencie permissões, autenticação e políticas de acesso',
      status: 'Planejado'
    },
    {
      icon: Code,
      title: 'API e Webhooks',
      description: 'Configure integrações personalizadas e notificações automáticas',
      status: 'Planejado'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em desenvolvimento':
        return 'bg-blue-100 text-blue-800';
      case 'Planejado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <Wrench className="h-8 w-8 text-orange-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Configurações do Sistema</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Esta seção está em desenvolvimento. Em breve você poderá personalizar e configurar 
          todos os aspectos do sistema de acordo com suas necessidades.
        </p>
      </div>

      {/* Status atual */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Status Atual</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">100%</div>
            <div className="text-sm text-gray-600">Dashboard Funcional</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">85%</div>
            <div className="text-sm text-gray-600">Relatórios Completos</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-orange-600">60%</div>
            <div className="text-sm text-gray-600">Configurações</div>
          </div>
        </div>
      </div>

      {/* Funcionalidades futuras */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Funcionalidades em Desenvolvimento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Icon className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{feature.title}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(feature.status)}`}>
                        {feature.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Roadmap */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Roadmap de Desenvolvimento</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Dashboard e Relatórios Básicos</span>
                <span className="text-sm text-green-600 font-medium">Concluído</span>
              </div>
              <p className="text-sm text-gray-600">Sistema de dashboard com KPIs e visualizações</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Integração com APIs de CRM</span>
                <span className="text-sm text-blue-600 font-medium">Em Desenvolvimento</span>
              </div>
              <p className="text-sm text-gray-600">Conexão com RD Station e outros CRMs</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Sistema de Configurações Avançadas</span>
                <span className="text-sm text-gray-600 font-medium">Próxima Versão</span>
              </div>
              <p className="text-sm text-gray-600">Personalização completa do sistema</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Relatórios Avançados e IA</span>
                <span className="text-sm text-gray-600 font-medium">Futuro</span>
              </div>
              <p className="text-sm text-gray-600">Análises preditivas e insights automáticos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Informações de contato */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h4 className="text-lg font-medium text-gray-900 mb-2">Precisa de algo específico?</h4>
        <p className="text-gray-600 mb-4">
          Estamos sempre trabalhando para melhorar o sistema. Se você tem sugestões ou 
          necessidades específicas, entre em contato conosco.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Enviar Sugestão
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
            Ver Documentação
          </button>
        </div>
      </div>
    </div>
  );
};