import React from 'react';
import { ThemeCustomization } from '../components/ThemeCustomization';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
        <p className="text-gray-600 mt-1">
          Personalize a aparência e configure o comportamento do sistema
        </p>
      </div>

      <ThemeCustomization />
    </div>
  );
};