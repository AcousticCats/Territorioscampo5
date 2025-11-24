import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { summarizeObservations } from '../services/geminiService';

export const NotesScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { territories, updateObservation } = useApp();
  const territory = territories.find(t => t.id === Number(id));
  
  const [text, setText] = useState(territory?.observations || "");
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleSave = () => {
    if (territory) {
        updateObservation(territory.id, text);
        navigate(-1);
    }
  };

  const handleAISummary = async () => {
    if (!text) return;
    setIsSummarizing(true);
    const summary = await summarizeObservations(text);
    setText(prev => `${prev}\n\n[Resumo IA]: ${summary}`);
    setIsSummarizing(false);
  };

  if (!territory) return null;

  return (
    <div className="flex flex-col h-screen bg-very-light-gray font-display">
        <header className="bg-very-light-gray/90 backdrop-blur-md sticky top-0 z-10 px-4 py-4 flex items-center justify-between border-b border-gray-200">
            <button onClick={() => navigate(-1)} className="text-principal-purple flex items-center gap-1">
                <span className="material-symbols-outlined">arrow_back_ios_new</span>
                <span className="font-semibold">Voltar</span>
            </button>
            <h1 className="text-lg font-bold text-dark-gray">Observações</h1>
            <button 
              onClick={handleSave}
              className="bg-principal-purple text-white px-5 py-2 rounded-full text-sm font-bold shadow-md hover:bg-deep-purple transition-colors"
            >
                Salvar
            </button>
        </header>

        <main className="flex-grow p-4">
            <h2 className="text-xl font-bold text-dark-gray mb-4 px-1">Cartão {territory.name}</h2>
            
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[calc(100vh-200px)] relative">
                <textarea 
                    className="w-full h-full p-6 text-dark-gray text-base leading-relaxed resize-none focus:outline-none placeholder-gray-400"
                    placeholder="Digite suas observações aqui... Detalhes sobre visitas, contatos e pontos de interesse."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                
                {/* AI Assistant Button */}
                <button 
                    onClick={handleAISummary}
                    disabled={isSummarizing || !text}
                    className="absolute bottom-4 right-4 bg-soft-lavender/50 backdrop-blur-md text-principal-purple hover:bg-principal-purple hover:text-white transition-all p-3 rounded-2xl flex items-center gap-2 shadow-sm group disabled:opacity-50"
                >
                    {isSummarizing ? (
                        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                        <span className="material-symbols-outlined">auto_awesome</span>
                    )}
                    <span className="text-xs font-bold group-hover:block hidden">Resumir</span>
                </button>
            </div>
        </main>
    </div>
  );
};