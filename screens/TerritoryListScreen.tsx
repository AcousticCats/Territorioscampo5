import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';
import { TerritoryStatus } from '../types';

export const TerritoryListScreen = () => {
  const navigate = useNavigate();
  const { territories, updateTerritoryStatus, user, congregation } = useApp();
  const [returnModalOpen, setReturnModalOpen] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'occupied' | 'returned' | 'least_worked'>('all');

  const handleTake = (id: number) => {
    // Agora não pede nome, usa o do usuário logado
    updateTerritoryStatus(id, TerritoryStatus.Occupied);
  };

  const handleReturn = (id: number) => {
    updateTerritoryStatus(id, TerritoryStatus.Returned);
    setReturnModalOpen(null);
  };

  const parseDate = (dateStr?: string) => {
    if (!dateStr) return 0;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return 0;
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
  };

  const filteredTerritories = useMemo(() => {
    let result = [...territories];
    switch (activeFilter) {
      case 'occupied': return result.filter(t => t.status === TerritoryStatus.Occupied);
      case 'returned': return result.filter(t => t.status !== TerritoryStatus.Occupied);
      case 'least_worked': 
        return result
          .filter(t => t.status !== TerritoryStatus.Occupied)
          .sort((a, b) => parseDate(a.lastWorked) - parseDate(b.lastWorked));
      default: return result;
    }
  }, [territories, activeFilter]);

  return (
    <Layout 
      title="Territórios" 
      subtitle={`Congregação ${congregation.name}`}
      rightAction={
        <div className="w-10 h-10 rounded-full bg-principal-purple flex items-center justify-center text-pure-white shadow-md cursor-pointer" onClick={() => navigate('/settings')}>
           <span className="text-sm font-bold">{user?.name.charAt(0)}</span>
        </div>
      }
    >
      <div className="sticky top-0 bg-very-light-gray z-20 pb-4 pt-1 -mx-4 px-4 overflow-x-auto no-scrollbar">
         <div className="flex gap-2 w-max">
            <button onClick={() => setActiveFilter('all')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeFilter === 'all' ? 'bg-principal-purple text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'}`}>Todos</button>
            <button onClick={() => setActiveFilter('occupied')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeFilter === 'occupied' ? 'bg-principal-purple text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'}`}>Em uso</button>
            <button onClick={() => setActiveFilter('returned')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeFilter === 'returned' ? 'bg-principal-purple text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'}`}>Livres</button>
            <button onClick={() => setActiveFilter('least_worked')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeFilter === 'least_worked' ? 'bg-principal-purple text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'}`}>Menos Usados</button>
         </div>
      </div>

      <div className="flex flex-col gap-4">
        {filteredTerritories.map((territory) => {
          const isOccupied = territory.status === TerritoryStatus.Occupied;
          const hasObservations = territory.observations && territory.observations.trim().length > 0;
          const isMyTerritory = territory.publisherId === user?.id; // Opcional: Destacar territórios do próprio usuário
          
          return (
            <div key={territory.id} className={`bg-pure-white rounded-2xl p-5 shadow-sm border ${isMyTerritory ? 'border-principal-purple/30' : 'border-gray-100/50'} flex flex-col gap-4 transition-all`}>
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1 w-full mr-2">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h3 className="text-lg font-bold text-dark-gray whitespace-nowrap">Território {territory.name}</h3>
                      {isOccupied && (
                        <span className="text-[11px] leading-tight text-gray-600 font-medium bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md inline-block">
                          Pego por: <strong>{territory.publisherName}</strong> em {territory.lastWorked}
                        </span>
                      )}
                  </div>
                  {!isOccupied && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <span className="material-symbols-outlined text-[14px]">history</span>
                      <span>Última vez: {territory.lastWorked}</span>
                    </div>
                  )}
                </div>
                
                <div className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${isOccupied ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isOccupied ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                    {isOccupied ? 'Em Uso' : 'Livre'}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-1 w-full">
                {isOccupied ? (
                   <button 
                     onClick={() => setReturnModalOpen(territory.id)}
                     className="flex-[2] bg-deep-purple hover:bg-principal-purple text-pure-white py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm shadow-deep-purple/20"
                   >
                     <div className="w-2 h-2 rounded-full bg-red-400"></div>
                     Devolver
                   </button>
                ) : (
                  <button 
                    onClick={() => handleTake(territory.id)}
                    className="flex-[2] bg-principal-purple hover:bg-deep-purple text-pure-white py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm shadow-principal-purple/20"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    Pegar
                  </button>
                )}

                <button 
                  onClick={() => navigate(`/map/${territory.id}`)}
                  className="flex-1 py-2.5 flex items-center justify-center bg-soft-lavender/30 text-principal-purple rounded-full hover:bg-soft-lavender/50 transition-colors"
                >
                   <span className="material-symbols-outlined">map</span>
                </button>
                
                <button 
                   onClick={() => navigate(`/notes/${territory.id}`)}
                   className="relative flex-1 py-2.5 flex items-center justify-center bg-soft-lavender/30 text-principal-purple rounded-full hover:bg-soft-lavender/50 transition-colors"
                >
                   <span className="material-symbols-outlined">notes</span>
                   {hasObservations && (
                     <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(249,115,22,0.8)]"></span>
                   )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {returnModalOpen !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-slideUp">
             <div className="w-12 h-12 bg-deep-purple/10 rounded-full flex items-center justify-center mx-auto mb-4 text-deep-purple">
                <span className="material-symbols-outlined">assignment_return</span>
             </div>
             <h3 className="text-xl font-bold text-dark-gray text-center mb-2">Confirmar Devolução</h3>
             <p className="text-center text-gray-500 mb-6 text-sm">Tem certeza que deseja marcar este território como devolvido?</p>
             <div className="flex flex-col gap-3">
                <button onClick={() => handleReturn(returnModalOpen)} className="w-full bg-principal-purple text-white font-bold py-3.5 rounded-full hover:bg-deep-purple transition-colors">Confirmar Devolução</button>
                <button onClick={() => setReturnModalOpen(null)} className="w-full bg-gray-100 text-dark-gray font-bold py-3.5 rounded-full hover:bg-gray-200 transition-colors">Cancelar</button>
             </div>
          </div>
        </div>
      )}
    </Layout>
  );
};