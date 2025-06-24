import React, { useState } from 'react';
import { ConsultantTable } from '../components/ConsultantTable';
import { FeedbackModal } from '../components/FeedbackModal';
import { FilterPanel } from '../components/FilterPanel';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useConsultants, useCampaigns } from '../hooks/useApi';
import { FilterState, Feedback } from '../types';

export const ConsultantsPage: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: '', end: '' },
    consultantIds: [],
    campaignIds: []
  });
  const [selectedConsultant, setSelectedConsultant] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  const { 
    data: consultants, 
    loading: consultantsLoading, 
    error: consultantsError,
    refetch: refetchConsultants 
  } = useConsultants(true);

  const { 
    data: campaigns, 
    loading: campaignsLoading, 
    error: campaignsError 
  } = useCampaigns(false);

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

  const selectedConsultantData = consultants?.find(c => c.id === selectedConsultant);

  if (consultantsLoading) {
    return <LoadingSpinner message="Carregando dados dos consultores..." />;
  }

  if (consultantsError) {
    return (
      <ErrorMessage 
        message="Erro ao carregar dados dos consultores" 
        onRetry={refetchConsultants}
      />
    );
  }

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
          consultants={consultants || []}
          campaigns={campaigns || []}
          isAdmin={true}
        />
      </div>

      <ConsultantTable 
        consultants={consultants || []} 
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