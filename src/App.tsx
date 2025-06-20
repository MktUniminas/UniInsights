import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/LoginForm';
import { Layout } from './components/Layout';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { ConsultantsPage } from './pages/ConsultantsPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { GoalsPage } from './pages/GoalsPage';
import { PerformancePage } from './pages/PerformancePage';
import { AdminPage, UserPage } from './types';

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<AdminPage | UserPage>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderPage = () => {
    if (user.role === 'admin') {
      switch (currentPage as AdminPage) {
        case 'dashboard':
          return <AdminDashboard />;
        case 'consultants':
          return <ConsultantsPage />;
        case 'campaigns':
          return <CampaignsPage />;
        case 'analytics':
          return <AnalyticsPage />;
        case 'settings':
          return <div className="text-center py-8"><p className="text-gray-600">Página de configurações em desenvolvimento</p></div>;
        default:
          return <AdminDashboard />;
      }
    } else {
      switch (currentPage as UserPage) {
        case 'dashboard':
          return <UserDashboard />;
        case 'goals':
          return <GoalsPage />;
        case 'performance':
          return <PerformancePage />;
        default:
          return <UserDashboard />;
      }
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;