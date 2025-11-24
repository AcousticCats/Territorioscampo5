
import React, { useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';
import { TerritoryStatus } from '../types';

export const ReportScreen = () => {
  const { territories, history, congregation } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  
  // States for Overview
  const [filter, setFilter] = useState<'all' | 'occupied' | 'returned'>('all');
  const [search, setSearch] = useState('');

  // States for History
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // --- Logic for Overview Tab ---
  const filteredOverview = territories.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          (t.publisherName && t.publisherName.toLowerCase().includes(search.toLowerCase()));
    
    // Logic: 'returned' (Livres) means NOT Occupied
    const statusMatch = filter === 'all' 
        ? true 
        : filter === 'occupied' 
            ? t.status === TerritoryStatus.Occupied 
            : t.status !== TerritoryStatus.Occupied;

    return matchesSearch && statusMatch;
  });

  // --- Logic for History Tab ---
  const filteredHistory = useMemo(() => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    return history.filter(log => {
      return log.timestamp >= start && log.timestamp <= end.getTime();
    }).sort((a, b) => b.timestamp - a.timestamp); // Newest first
  }, [history, startDate, endDate]);

  // --- Actions ---
  const handleShareWhatsApp = () => {
    let message = `*Relatório de Movimentações - ${congregation.name}*\n`;
    message += `Período: ${startDate.split('-').reverse().join('/')} a ${endDate.split('-').reverse().join('/')}\n\n`;
    
    if (filteredHistory.length === 0) {
        message += "Nenhuma movimentação neste período.";
    } else {
        filteredHistory.forEach(log => {
            message += `📍 *Território ${log.territoryName}*\n`;
            message += `👤 ${log.publisherName}\n`;
            message += `🔄 ${log.action} em ${log.date}\n`;
            message += `------------------\n`;
        });
    }

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <Layout title="Relatórios" subtitle="Gestão de Territórios" showNav={true}>
        {/* Tab Switcher - Hidden when printing */}
        <div className="flex bg-white p-1 rounded-xl mb-4 border border-gray-100 shadow-sm print:hidden">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-principal-purple text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                Visão Geral
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'history' ? 'bg-principal-purple text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                Histórico
            </button>
        </div>

        {/* --- VISÃO GERAL TAB --- */}
        {activeTab === 'overview' && (
            <div className="animate-fadeIn print:hidden">
                <div className="sticky top-0 bg-very-light-gray z-20 pb-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-4">
                        <div className="flex items-center gap-2 px-2">
                            <span className="material-symbols-outlined text-gray-400">search</span>
                            <input 
                                type="text" 
                                placeholder="Buscar território ou publicador..." 
                                className="w-full bg-transparent border-none focus:ring-0 text-sm text-dark-gray placeholder-gray-400"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 w-max pb-2">
                        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === 'all' ? 'bg-principal-purple text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'}`}>Todos</button>
                        <button onClick={() => setFilter('occupied')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === 'occupied' ? 'bg-principal-purple text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'}`}>Em uso</button>
                        <button onClick={() => setFilter('returned')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === 'returned' ? 'bg-principal-purple text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'}`}>Livres</button>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {filteredOverview.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <span className="material-symbols-outlined text-4xl mb-2">folder_off</span>
                            <p>Nenhum território encontrado</p>
                        </div>
                    ) : (
                        filteredOverview.map(t => (
                            <div key={t.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                                <div className="flex flex-col">
                                    <h3 className="font-bold text-dark-gray">Território {t.name}</h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <span className="material-symbols-outlined text-[14px]">
                                            {t.status === TerritoryStatus.Occupied ? 'person' : 'calendar_month'}
                                        </span>
                                        <span>
                                            {t.status === TerritoryStatus.Occupied ? t.publisherName : `Última vez: ${t.lastWorked}`}
                                        </span>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${t.status === TerritoryStatus.Occupied ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                    {t.status === TerritoryStatus.Occupied ? 'Em uso' : 'Livre'}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}

        {/* --- HISTÓRICO TAB --- */}
        {activeTab === 'history' && (
            <div className="animate-fadeIn">
                {/* Controls - Hidden when printing */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4 space-y-3 print:hidden">
                    <h3 className="text-sm font-bold text-dark-gray">Filtrar Período</h3>
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="text-[10px] text-gray-400 font-bold uppercase">Início</label>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:ring-1 focus:ring-principal-purple outline-none"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] text-gray-400 font-bold uppercase">Fim</label>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-2 text-xs focus:ring-1 focus:ring-principal-purple outline-none"
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                         <button 
                            onClick={handleShareWhatsApp}
                            className="flex-1 bg-green-500 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-green-600 transition-colors"
                         >
                            <span className="material-symbols-outlined text-sm">share</span>
                            WhatsApp
                         </button>
                         <button 
                            onClick={handlePrintPDF}
                            className="flex-1 bg-principal-purple text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:bg-deep-purple transition-colors"
                         >
                            <span className="material-symbols-outlined text-sm">print</span>
                            Gerar PDF
                         </button>
                    </div>
                </div>

                {/* Report Header - Visible ONLY when printing */}
                <div className="hidden print:block text-center mb-6">
                    <h1 className="text-2xl font-bold text-dark-gray">Relatório de Movimentações</h1>
                    <h2 className="text-lg text-gray-600">{congregation.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">Período: {startDate.split('-').reverse().join('/')} a {endDate.split('-').reverse().join('/')}</p>
                </div>

                {/* Results List */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide px-1 print:hidden">Resultados ({filteredHistory.length})</h3>
                    
                    {filteredHistory.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                            <span className="material-symbols-outlined text-4xl mb-2">history_toggle_off</span>
                            <p>Sem movimentações no período</p>
                        </div>
                    ) : (
                        filteredHistory.map(log => (
                            <div key={log.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between print:border-b print:border-gray-300 print:shadow-none print:rounded-none">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${log.action === 'Saiu' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                            {log.action}
                                        </span>
                                        <span className="font-bold text-dark-gray">Território {log.territoryName}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                        <span className="material-symbols-outlined text-[16px]">person</span>
                                        <span>{log.publisherName}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-dark-gray">{log.date}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}
    </Layout>
  );
};
