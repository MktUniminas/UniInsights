import React, { useState } from 'react';
import { Filter, Calendar, User, Target, X } from 'lucide-react';
import { FilterState, Consultant, Campaign } from '../types';

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  consultants: Consultant[];
  campaigns: Campaign[];
  isAdmin: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  consultants,
  campaigns,
  isAdmin
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    });
  };

  const handleConsultantToggle = (consultantId: string) => {
    const newConsultantIds = filters.consultantIds.includes(consultantId)
      ? filters.consultantIds.filter(id => id !== consultantId)
      : [...filters.consultantIds, consultantId];
    
    onFiltersChange({
      ...filters,
      consultantIds: newConsultantIds
    });
  };

  const handleCampaignToggle = (campaignId: string) => {
    const newCampaignIds = filters.campaignIds.includes(campaignId)
      ? filters.campaignIds.filter(id => id !== campaignId)
      : [...filters.campaignIds, campaignId];
    
    onFiltersChange({
      ...filters,
      campaignIds: newCampaignIds
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      dateRange: { start: '', end: '' },
      consultantIds: [],
      campaignIds: [],
      costPerLead: undefined
    });
  };

  const activeFiltersCount = 
    (filters.dateRange.start ? 1 : 0) +
    (filters.dateRange.end ? 1 : 0) +
    filters.consultantIds.length +
    filters.campaignIds.length +
    (filters.costPerLead ? 1 : 0);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filtros</span>
        {activeFiltersCount > 0 && (
          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-6">
            {/* Date Range */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
                <Calendar className="h-4 w-4" />
                <span>Período</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Data Inicial</label>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => handleDateChange('start', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Data Final</label>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => handleDateChange('end', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Consultants */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
                <User className="h-4 w-4" />
                <span>Consultores</span>
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {consultants.map((consultant) => (
                  <label key={consultant.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.consultantIds.includes(consultant.id)}
                      onChange={() => handleConsultantToggle(consultant.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{consultant.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Campaigns */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-3">
                <Target className="h-4 w-4" />
                <span>Campanhas</span>
              </label>
              <div className="space-y-2">
                {campaigns.map((campaign) => (
                  <label key={campaign.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.campaignIds.includes(campaign.id)}
                      onChange={() => handleCampaignToggle(campaign.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{campaign.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 flex justify-between">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Limpar Filtros
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};