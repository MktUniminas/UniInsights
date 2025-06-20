import React, { useState } from 'react';
import { ConsultantTable } from '../components/ConsultantTable';
import { FeedbackModal } from '../components/FeedbackModal';
import { FilterPanel } from '../components/FilterPanel';
import { mockConsultants, mockCampaigns, mockFeedbacks } from '../services/mockData';
import { FilterState, Feedback } from '../types';

export const ConsultantsPage: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: '', end: '' },
    consultantIds: [],
    campaignIds: []
  });
  const [selectedConsultant, setSelectedConsultant] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(mockFeedbacks);

  const handleFeedback = (consultantId: string) => {
    setSelectedConsultant(consultantId);
  };

  const handleFeedbackSubmit = (feedback: {
    consultantId: string;
    message: string;
    rating: number;
    type: 'positive' | 'constructive' | 'neutral';
  }) => {
    const newFeedback: Feedback = {
      id: `feedback_${Date.now()}`,
      consultantId: feedback.consultantId,
      adminId: 'admin1',
      adminName: 'Admin User',
      message: feedback.message,
      rating: feedback.rating,
      type: feedback.type,
      createdAt: new Date().toISOString()
    };

    setFeedbacks(prev => [newFeedback, ...prev]);
  };

  const selectedConsultantData = mockConsultants.find(c => c.id === selectedConsultant);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestão de Consultores</h3>
          <p className="text-gray-600 mt-1">Acompanhe o desempenho e envie feedback para sua equipe</p>
        </div>
        
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          consultants={mockConsultants}
          campaigns={mockCampaigns}
          isAdmin={true}
        />
      </div>

      <ConsultantTable 
        consultants={mockConsultants} 
        onFeedback={handleFeedback}
        isAdmin={true}
      />

      {selectedConsultantData && (
        <FeedbackModal
          consultant={selectedConsultantData}
          isOpen={!!selectedConsultant}
          onClose={() => setSelectedConsultant(null)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
};