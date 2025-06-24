import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Save, 
  RotateCcw, 
  Eye, 
  Monitor,
  Sun,
  Moon,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface ThemeColors {
  // Primary colors
  primary: string;
  primaryHover: string;
  primaryLight: string;
  
  // Secondary colors
  secondary: string;
  secondaryHover: string;
  secondaryLight: string;
  
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundCard: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Border colors
  border: string;
  borderLight: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Icon colors
  iconPrimary: string;
  iconSecondary: string;
  iconMuted: string;
}

interface ColorPreset {
  name: string;
  description: string;
  colors: ThemeColors;
}

const defaultTheme: ThemeColors = {
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  primaryLight: '#dbeafe',
  secondary: '#64748b',
  secondaryHover: '#475569',
  secondaryLight: '#f1f5f9',
  background: '#f9fafb',
  backgroundSecondary: '#f3f4f6',
  backgroundCard: '#ffffff',
  textPrimary: '#111827',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  iconPrimary: '#374151',
  iconSecondary: '#6b7280',
  iconMuted: '#9ca3af'
};

const colorPresets: ColorPreset[] = [
  {
    name: 'Azul Padrão',
    description: 'Tema padrão com tons de azul',
    colors: defaultTheme
  },
  {
    name: 'Verde Corporativo',
    description: 'Tema profissional com verde',
    colors: {
      ...defaultTheme,
      primary: '#059669',
      primaryHover: '#047857',
      primaryLight: '#d1fae5',
      iconPrimary: '#047857'
    }
  },
  {
    name: 'Roxo Moderno',
    description: 'Tema moderno com roxo',
    colors: {
      ...defaultTheme,
      primary: '#7c3aed',
      primaryHover: '#6d28d9',
      primaryLight: '#ede9fe',
      iconPrimary: '#6d28d9'
    }
  },
  {
    name: 'Laranja Vibrante',
    description: 'Tema energético com laranja',
    colors: {
      ...defaultTheme,
      primary: '#ea580c',
      primaryHover: '#dc2626',
      primaryLight: '#fed7aa',
      iconPrimary: '#dc2626'
    }
  },
  {
    name: 'Modo Escuro',
    description: 'Tema escuro para reduzir fadiga visual',
    colors: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      primaryLight: '#1e293b',
      secondary: '#64748b',
      secondaryHover: '#475569',
      secondaryLight: '#334155',
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      backgroundCard: '#334155',
      textPrimary: '#f8fafc',
      textSecondary: '#e2e8f0',
      textMuted: '#94a3b8',
      border: '#475569',
      borderLight: '#334155',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      iconPrimary: '#e2e8f0',
      iconSecondary: '#94a3b8',
      iconMuted: '#64748b'
    }
  }
];

export const ThemeCustomization: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeColors>(defaultTheme);
  const [selectedPreset, setSelectedPreset] = useState<string>('Azul Padrão');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        setCurrentTheme(parsedTheme);
        setIsCustomMode(true);
      } catch (error) {
        console.error('Error loading saved theme:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Apply theme to CSS variables
    if (previewMode || localStorage.getItem('app_theme')) {
      applyThemeToCSS(currentTheme);
    }
  }, [currentTheme, previewMode]);

  useEffect(() => {
    // Clear save message after 3 seconds
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  const applyThemeToCSS = (theme: ThemeColors) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-primary-hover', theme.primaryHover);
    root.style.setProperty('--color-primary-light', theme.primaryLight);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-secondary-hover', theme.secondaryHover);
    root.style.setProperty('--color-secondary-light', theme.secondaryLight);
    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-background-secondary', theme.backgroundSecondary);
    root.style.setProperty('--color-background-card', theme.backgroundCard);
    root.style.setProperty('--color-text-primary', theme.textPrimary);
    root.style.setProperty('--color-text-secondary', theme.textSecondary);
    root.style.setProperty('--color-text-muted', theme.textMuted);
    root.style.setProperty('--color-border', theme.border);
    root.style.setProperty('--color-border-light', theme.borderLight);
    root.style.setProperty('--color-success', theme.success);
    root.style.setProperty('--color-warning', theme.warning);
    root.style.setProperty('--color-error', theme.error);
    root.style.setProperty('--color-info', theme.info);
    root.style.setProperty('--color-icon-primary', theme.iconPrimary);
    root.style.setProperty('--color-icon-secondary', theme.iconSecondary);
    root.style.setProperty('--color-icon-muted', theme.iconMuted);
  };

  const handlePresetSelect = (preset: ColorPreset) => {
    setCurrentTheme(preset.colors);
    setSelectedPreset(preset.name);
    setIsCustomMode(false);
  };

  const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
    setCurrentTheme(prev => ({
      ...prev,
      [colorKey]: value
    }));
    setIsCustomMode(true);
    setSelectedPreset('Personalizado');
  };

  const saveTheme = () => {
    try {
      localStorage.setItem('app_theme', JSON.stringify(currentTheme));
      applyThemeToCSS(currentTheme);
      setSaveMessage({
        type: 'success',
        text: 'Tema salvo com sucesso! As alterações foram aplicadas.'
      });
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: 'Erro ao salvar tema. Tente novamente.'
      });
    }
  };

  const resetToDefault = () => {
    setCurrentTheme(defaultTheme);
    setSelectedPreset('Azul Padrão');
    setIsCustomMode(false);
    localStorage.removeItem('app_theme');
    applyThemeToCSS(defaultTheme);
    setSaveMessage({
      type: 'success',
      text: 'Tema resetado para o padrão.'
    });
  };

  const togglePreview = () => {
    if (previewMode) {
      // Restore original theme
      const savedTheme = localStorage.getItem('app_theme');
      if (savedTheme) {
        applyThemeToCSS(JSON.parse(savedTheme));
      } else {
        applyThemeToCSS(defaultTheme);
      }
    } else {
      // Apply current theme for preview
      applyThemeToCSS(currentTheme);
    }
    setPreviewMode(!previewMode);
  };

  const ColorInput: React.FC<{ 
    label: string; 
    value: string; 
    onChange: (value: string) => void;
    description?: string;
  }> = ({ label, value, onChange, description }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center space-x-3">
        <div 
          className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm"
          style={{ backgroundColor: value }}
          onClick={() => document.getElementById(`color-${label}`)?.click()}
        />
        <input
          id={`color-${label}`}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="#000000"
        />
      </div>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Palette className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Personalização Visual</h3>
            <p className="text-sm text-gray-600">Customize as cores e aparência do sistema</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={togglePreview}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              previewMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>{previewMode ? 'Sair da Prévia' : 'Visualizar'}</span>
          </button>
        </div>
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

      {/* Preview Banner */}
      {previewMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Monitor className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 font-medium">Modo de Prévia Ativo</span>
            <span className="text-blue-600">- As alterações são temporárias até salvar</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Presets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Temas Predefinidos</h4>
          <div className="space-y-3">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handlePresetSelect(preset)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedPreset === preset.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{preset.name}</span>
                  <div className="flex space-x-1">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: preset.colors.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: preset.colors.secondary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: preset.colors.success }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600">{preset.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Color Customization */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900">Personalização de Cores</h4>
            <span className="text-sm text-gray-500">
              {isCustomMode ? 'Modo Personalizado' : `Preset: ${selectedPreset}`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Colors */}
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
                Cores Primárias
              </h5>
              <ColorInput
                label="Cor Principal"
                value={currentTheme.primary}
                onChange={(value) => handleColorChange('primary', value)}
                description="Cor principal dos botões e links"
              />
              <ColorInput
                label="Cor Principal (Hover)"
                value={currentTheme.primaryHover}
                onChange={(value) => handleColorChange('primaryHover', value)}
                description="Cor ao passar o mouse"
              />
              <ColorInput
                label="Cor Principal (Clara)"
                value={currentTheme.primaryLight}
                onChange={(value) => handleColorChange('primaryLight', value)}
                description="Cor de fundo para elementos destacados"
              />
            </div>

            {/* Background Colors */}
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
                Cores de Fundo
              </h5>
              <ColorInput
                label="Fundo Principal"
                value={currentTheme.background}
                onChange={(value) => handleColorChange('background', value)}
                description="Cor de fundo da página"
              />
              <ColorInput
                label="Fundo Secundário"
                value={currentTheme.backgroundSecondary}
                onChange={(value) => handleColorChange('backgroundSecondary', value)}
                description="Cor de fundo de seções"
              />
              <ColorInput
                label="Fundo dos Cards"
                value={currentTheme.backgroundCard}
                onChange={(value) => handleColorChange('backgroundCard', value)}
                description="Cor de fundo dos cartões"
              />
            </div>

            {/* Text Colors */}
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
                Cores do Texto
              </h5>
              <ColorInput
                label="Texto Principal"
                value={currentTheme.textPrimary}
                onChange={(value) => handleColorChange('textPrimary', value)}
                description="Cor do texto principal"
              />
              <ColorInput
                label="Texto Secundário"
                value={currentTheme.textSecondary}
                onChange={(value) => handleColorChange('textSecondary', value)}
                description="Cor do texto secundário"
              />
              <ColorInput
                label="Texto Esmaecido"
                value={currentTheme.textMuted}
                onChange={(value) => handleColorChange('textMuted', value)}
                description="Cor do texto de apoio"
              />
            </div>

            {/* Icon Colors */}
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
                Cores dos Ícones
              </h5>
              <ColorInput
                label="Ícones Principais"
                value={currentTheme.iconPrimary}
                onChange={(value) => handleColorChange('iconPrimary', value)}
                description="Cor dos ícones principais"
              />
              <ColorInput
                label="Ícones Secundários"
                value={currentTheme.iconSecondary}
                onChange={(value) => handleColorChange('iconSecondary', value)}
                description="Cor dos ícones secundários"
              />
              <ColorInput
                label="Ícones Esmaecidos"
                value={currentTheme.iconMuted}
                onChange={(value) => handleColorChange('iconMuted', value)}
                description="Cor dos ícones de apoio"
              />
            </div>

            {/* Status Colors */}
            <div className="md:col-span-2 space-y-4">
              <h5 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
                Cores de Status
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorInput
                  label="Sucesso"
                  value={currentTheme.success}
                  onChange={(value) => handleColorChange('success', value)}
                />
                <ColorInput
                  label="Aviso"
                  value={currentTheme.warning}
                  onChange={(value) => handleColorChange('warning', value)}
                />
                <ColorInput
                  label="Erro"
                  value={currentTheme.error}
                  onChange={(value) => handleColorChange('error', value)}
                />
                <ColorInput
                  label="Informação"
                  value={currentTheme.info}
                  onChange={(value) => handleColorChange('info', value)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200">
            <button
              onClick={resetToDefault}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Resetar para Padrão</span>
            </button>

            <button
              onClick={saveTheme}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Salvar Tema</span>
            </button>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-sm font-medium text-blue-900 mb-3">Como usar a personalização</h4>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>1. Escolha um tema predefinido</strong> ou personalize as cores manualmente</p>
          <p><strong>2. Use o botão "Visualizar"</strong> para ver as alterações em tempo real</p>
          <p><strong>3. Clique em "Salvar Tema"</strong> para aplicar permanentemente as alterações</p>
          <p><strong>4. Use "Resetar para Padrão"</strong> para voltar ao tema original</p>
        </div>
      </div>
    </div>
  );
};