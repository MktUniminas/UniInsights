import React, { useState } from 'react';
import { GoalProgress } from '../components/GoalProgress';
import { useAuth } from '../hooks/useAuth';
import { mockGoals } from '../services/mockData';
import { Goal } from '../types';

export const GoalsPage: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState(mockGoals);
  
  const userGoal = goals.find(g => g.consultantId === user?.consultantId);

  const handleUpdateGoal = (goalId: string, updates: Partial<Goal>) => {
    setGoals(prevGoals => 
      prevGoals.map(goal => 
        goal.id === goalId 
          ? { ...goal, ...updates }
          : goal
      )
    );
  };

  if (!userGoal) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Nenhuma meta encontrada para seu perfil.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Minhas Metas</h3>
        <p className="text-gray-600 mt-1">Acompanhe e gerencie suas metas de performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GoalProgress 
          goal={userGoal} 
          onUpdateGoal={handleUpdateGoal}
        />
        
        {/* Goal History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Metas</h4>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Dezembro 2023</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Concluída
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Meta: R$ 40.000 | Alcançado: R$ 42.500 (106%)
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Novembro 2023</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Parcial
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Meta: R$ 35.000 | Alcançado: R$ 28.000 (80%)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};