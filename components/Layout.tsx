import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showNav = true, 
  title, 
  subtitle, 
  showBack = false,
  rightAction 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getNavClass = (path: string) => {
    const isActive = location.pathname === path;
    return `flex flex-col items-center justify-center w-full h-full space-y-1 ${
      isActive ? 'text-principal-purple' : 'text-gray-400 hover:text-principal-purple'
    }`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-very-light-gray font-display text-dark-gray">
      {/* Header */}
      {(title || showBack) && (
        <header className="sticky top-0 z-30 bg-very-light-gray/90 backdrop-blur-sm px-4 pt-12 pb-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                {showBack && (
                <button onClick={() => navigate(-1)} className="text-principal-purple">
                    <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
                </button>
                )}
                <div>
                {title && <h1 className="text-xl font-bold text-dark-gray leading-tight">{title}</h1>}
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                </div>
            </div>
            {rightAction}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-grow p-4 pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-pure-white/90 backdrop-blur-lg border-t border-gray-100 flex justify-around items-center px-2 z-40 pb-2">
          <button onClick={() => navigate('/home')} className={getNavClass('/home')}>
            <span className={`material-symbols-outlined ${location.pathname === '/home' ? 'filled' : ''}`}>grid_view</span>
            <span className="text-[10px] font-medium">Territórios</span>
          </button>
          
          <button onClick={() => navigate('/global-map')} className={getNavClass('/global-map')}>
            <span className={`material-symbols-outlined ${location.pathname === '/global-map' ? 'filled' : ''}`}>map</span>
            <span className="text-[10px] font-medium">Mapa Global</span>
          </button>

          <button onClick={() => navigate('/reports')} className={getNavClass('/reports')}>
            <span className={`material-symbols-outlined ${location.pathname === '/reports' ? 'filled' : ''}`}>bar_chart</span>
            <span className="text-[10px] font-medium">Relatórios</span>
          </button>

           <button onClick={() => navigate('/settings')} className={getNavClass('/settings')}>
            <span className={`material-symbols-outlined ${location.pathname === '/settings' ? 'filled' : ''}`}>settings</span>
            <span className="text-[10px] font-medium">Configurações</span>
          </button>
        </nav>
      )}
    </div>
  );
};