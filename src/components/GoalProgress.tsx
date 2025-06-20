import React, { useState } from 'react';
import { Target, Edit3, Save, X } from 'lucide-react';
import { Goal } from '../types';

interface GoalProgressProps {
  goal: Goal;
  onUpdateGoal: (goalId: string, updates: Partial<Goal>) => void;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({ goal, onUpdateGoal }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTargetRevenue, setTempTargetRevenue] = useState(goal.targetRevenue);
  const [tempTargetDeals, setTempTargetDeals] = useState(goal.targetDeals);

  const handleSave = () => {
    onUpdateGoal(goal.id, {
      targetRevenue: tempTargetRevenue,
      targetDeals: tempTargetDeals
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempTargetRevenue(goal.targetRevenue);
    setTempTargetDeals(goal.targetDeals);
    setIsEditing(false);
  };

  const revenueProgress = (goal.currentRevenue / goal.targetRevenue) * 100;
  const dealsProgress = (goal.currentDeals / goal.targetDeals) * 100;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Target className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Minhas Metas</h3>
            <p className="text-sm text-gray-600">Período: {goal.period}</p>
          </div>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            <span className="text-sm">Editar</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
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
        )}
      </div>

      <div className="space-y-6">
        {/* Revenue Goal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Meta de Receita</span>
            {isEditing ? (
              <input
                type="number"
                value={tempTargetRevenue}
                onChange={(e) => setTempTargetRevenue(Number(e.target.value))}
                className="w-32 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <span className="text-sm font-medium text-gray-900">
                R$ {goal.targetRevenue.toLocaleString('pt-BR')}
              </span>
            )}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(revenueProgress, 100)}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>R$ {goal.currentRevenue.toLocaleString('pt-BR')} atual</span>
            <span>{revenueProgress.toFixed(1)}% concluído</span>
          </div>
        </div>

        {/* Deals Goal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Meta de Negócios</span>
            {isEditing ? (
              <input
                type="number"
                value={tempTargetDeals}
                onChange={(e) => setTempTargetDeals(Number(e.target.value))}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <span className="text-sm font-medium text-gray-900">{goal.targetDeals} negócios</span>
            )}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(dealsProgress, 100)}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>{goal.currentDeals} negócios atuais</span>
            <span>{dealsProgress.toFixed(1)}% concluído</span>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Insights do seu desempenho</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Ticket médio atual: R$ {goal.currentDeals > 0 ? (goal.currentRevenue / goal.currentDeals).toLocaleString('pt-BR') : '0'}</li>
            <li>• Restam R$ {Math.max(0, goal.targetRevenue - goal.currentRevenue).toLocaleString('pt-BR')} para atingir a meta</li>
            <li>• {goal.targetDeals - goal.currentDeals > 0 ? `Precisa de mais ${goal.targetDeals - goal.currentDeals} negócios` : 'Meta de negócios atingida!'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};