import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Sidebar } from './Sidebar';
import { AdminPage, UserPage } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: AdminPage | UserPage;
  onPageChange: (page: AdminPage | UserPage) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isAdmin={user?.role === 'admin'} 
        currentPage={currentPage}
        onPageChange={onPageChange}
      />
      
      <div className="flex-1 flex flex-col ml-64">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentPage === 'dashboard' && 'Dashboard'}
                  {currentPage === 'consultants' && 'Gestão de Consultores'}
                  {currentPage === 'campaigns' && 'Gestão de Campanhas'}
                  {currentPage === 'analytics' && 'Análises Avançadas'}
                  {currentPage === 'settings' && 'Configurações'}
                  {currentPage === 'goals' && 'Minhas Metas'}
                  {currentPage === 'performance' && 'Minha Performance'}
                </h2>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user?.role === 'admin' ? 'Admin' : 'Usuário'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Sair</span>
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};