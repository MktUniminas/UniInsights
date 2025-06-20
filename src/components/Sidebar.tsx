import React from 'react';
import { 
  BarChart3, 
  Users, 
  Target, 
  TrendingUp, 
  Settings, 
  Home,
  Award,
  PieChart
} from 'lucide-react';
import { AdminPage, UserPage } from '../types';

interface SidebarProps {
  isAdmin: boolean;
  currentPage: AdminPage | UserPage;
  onPageChange: (page: AdminPage | UserPage) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isAdmin, currentPage, onPageChange }) => {
  const adminMenuItems = [
    { id: 'dashboard' as AdminPage, label: 'Dashboard', icon: Home },
    { id: 'consultants' as AdminPage, label: 'Consultores', icon: Users },
    { id: 'campaigns' as AdminPage, label: 'Campanhas', icon: Target },
    { id: 'analytics' as AdminPage, label: 'Análises', icon: PieChart },
    { id: 'settings' as AdminPage, label: 'Configurações', icon: Settings },
  ];

  const userMenuItems = [
    { id: 'dashboard' as UserPage, label: 'Dashboard', icon: Home },
    { id: 'goals' as UserPage, label: 'Minhas Metas', icon: Target },
    { id: 'performance' as UserPage, label: 'Performance', icon: Award },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Sistema de Relatórios
            </h1>
            <p className="text-xs text-gray-500">
              {isAdmin ? 'Painel Admin' : 'Painel Consultor'}
            </p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};