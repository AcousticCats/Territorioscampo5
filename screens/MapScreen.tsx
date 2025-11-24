import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TerritoryStatus } from '../types';

export const MapScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { territories, updateTerritoryConfig } = useApp();
  const territory = territories.find(t => t.id === Number(id));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Estados locais para os inputs de configuração
  const [imgInput, setImgInput] = useState("");
  const [gmapsInput, setGmapsInput] = useState("");

  // Refs para acesso dentro do useEffect sem dependências que resetam o canvas
  const territoryRef = useRef(territory);
  const updateConfigRef = useRef(updateTerritoryConfig);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    territoryRef.current = territory;
    updateConfigRef.current = updateTerritoryConfig;
    
    if (territory) {
      setImgInput(territory.imageUrl);
      setGmapsInput(territory.googleMapsLink || "");
    }
  }, [territory, updateTerritoryConfig]);

  // Lógica de desenho no Canvas
  useEffect(() => {
    if (!isFullscreen || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar tamanho do canvas (Isso limpa o canvas, então só fazemos ao abrir)
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Restaurar desenho salvo
    const currentData = territoryRef.current?.drawingData;
    if (currentData) {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
        };
        img.src = currentData;
    }
    
    // Estilos do traço
    ctx.strokeStyle = '#5A3D85';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const getPos = (e: MouseEvent | TouchEvent) => {
        const rect = canvas.getBoundingClientRect();
        let x, y;
        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = (e as MouseEvent).clientX - rect.left;
            y = (e as MouseEvent).clientY - rect.top;
        }
        return { x, y };
    };

    const startDrawing = (e: any) => {
        // Bloqueia desenho se não estiver Em Uso
        if (territoryRef.current?.status !== TerritoryStatus.Occupied) return;

        isDrawingRef.current = true;
        const { x, y } = getPos(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: any) => {
        if (!isDrawingRef.current) return;
        // Bloqueia se status mudou durante desenho (raro, mas seguro)
        if (territoryRef.current?.status !== TerritoryStatus.Occupied) return;

        e.preventDefault(); // Previne scroll no touch
        const { x, y } = getPos(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;
        ctx.beginPath();
        
        // AUTO-SAVE: Salvar automaticamente ao terminar o traço
        const dataUrl = canvas.toDataURL();
        if (territoryRef.current) {
            // Usamos o ref para chamar a função sem recriar o efeito
            updateConfigRef.current(territoryRef.current.id, { drawingData: dataUrl });
        }
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mouseout', stopDrawing);
        
        canvas.removeEventListener('touchstart', startDrawing);
        canvas.removeEventListener('touchmove', draw);
        canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [isFullscreen]); // Dependência APENAS isFullscreen para não resetar o canvas a cada save

  const closeFullscreen = () => {
      setIsFullscreen(false);
  };

  const clearCanvas = () => {
      if(!canvasRef.current || !territory) return;
      const ctx = canvasRef.current.getContext('2d');
      if(ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Limpa também no contexto global
      updateTerritoryConfig(territory.id, { drawingData: undefined });
  };

  const handleSaveImage = () => {
    if (territory) {
      updateTerritoryConfig(territory.id, { imageUrl: imgInput });
      alert("Link da imagem salvo com sucesso!");
    }
  };

  const handleSaveGmaps = () => {
    if (territory) {
      updateTerritoryConfig(territory.id, { googleMapsLink: gmapsInput });
      alert("Link do Google Maps salvo com sucesso!");
    }
  };

  const openGoogleMaps = () => {
    if (territory?.googleMapsLink) {
      window.open(territory.googleMapsLink, '_blank');
    } else {
      alert("Nenhum link do Google Maps configurado para este território.");
    }
  };

  if (!territory) return <div>Território não encontrado</div>;

  const isOccupied = territory.status === TerritoryStatus.Occupied;

  return (
    <div className="flex flex-col h-screen bg-very-light-gray relative overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-transparent pointer-events-none">
        <div className="pointer-events-auto">
            <button onClick={() => navigate(-1)} className="bg-white/90 backdrop-blur-md p-2 rounded-full shadow-sm text-principal-purple">
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
            </button>
        </div>
        <h1 className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold shadow-sm pointer-events-auto">
            Território {territory.name}
        </h1>
        <div className="w-10"></div>
      </header>

      {/* Visualização Principal do Mapa (Thumbnail) */}
      <div className="flex-grow flex flex-col justify-center items-center p-4">
        <div 
          onClick={() => setIsFullscreen(true)}
          className="relative w-full aspect-[4/5] bg-white rounded-3xl shadow-xl overflow-hidden cursor-pointer border-4 border-white transition-transform active:scale-95 group"
        >
            <img src={territory.imageUrl} alt="Mapa do Território" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="material-symbols-outlined text-4xl text-white drop-shadow-lg">fullscreen</span>
            </div>
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full">
                <span className="material-symbols-outlined">fullscreen</span>
            </div>
        </div>

        {/* Botões de Ação na Tela Principal */}
        <div className="flex gap-3 mt-8 w-full max-w-sm justify-center">
            {/* Botão Configurar */}
            <button 
              onClick={() => setShowSettings(true)}
              className="px-6 py-3 bg-soft-lavender text-principal-purple rounded-full font-bold flex items-center gap-2 shadow-sm hover:bg-soft-lavender/80 transition-colors"
            >
                <span className="material-symbols-outlined">settings</span>
                Configurar
            </button>

            {/* Botão Google Maps */}
            <button 
              onClick={openGoogleMaps}
              className="px-6 py-3 bg-principal-purple text-white rounded-full font-bold flex items-center gap-2 shadow-lg shadow-principal-purple/30 hover:bg-deep-purple transition-colors"
            >
                <span className="material-symbols-outlined">map</span>
                Google Maps
            </button>
        </div>
      </div>

      {/* Modal de Configurações */}
      {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setShowSettings(false)}>
              <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-dark-gray flex items-center gap-2">
                        <span className="material-symbols-outlined text-principal-purple">settings</span>
                        Configurações
                    </h3>
                    <button onClick={() => setShowSettings(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                      {/* Campo 1: Link da Imagem */}
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Link da Imagem do Mapa</label>
                          <div className="flex gap-2">
                            <input 
                              className="flex-grow bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-principal-purple focus:ring-1 focus:ring-principal-purple outline-none transition-all placeholder-gray-300 text-dark-gray" 
                              value={imgInput}
                              onChange={(e) => setImgInput(e.target.value)}
                              placeholder="Cole o link da imagem aqui..."
                            />
                            <button 
                              onClick={handleSaveImage}
                              className="bg-principal-purple text-white font-bold px-4 rounded-xl text-sm shadow-md hover:bg-deep-purple transition-colors shrink-0"
                            >
                              OK
                            </button>
                          </div>
                      </div>

                      {/* Campo 2: Link Google Maps */}
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Link do Google Maps</label>
                          <div className="flex gap-2">
                            <input 
                              className="flex-grow bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-principal-purple focus:ring-1 focus:ring-principal-purple outline-none transition-all placeholder-gray-300 text-dark-gray" 
                              value={gmapsInput}
                              onChange={(e) => setGmapsInput(e.target.value)}
                              placeholder="Cole o link do Maps aqui..."
                            />
                             <button 
                              onClick={handleSaveGmaps}
                              className="bg-principal-purple text-white font-bold px-4 rounded-xl text-sm shadow-md hover:bg-deep-purple transition-colors shrink-0"
                            >
                              OK
                            </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Tela Cheia / Desenho */}
      <div className={`fixed inset-0 z-40 bg-white transition-transform duration-300 ease-in-out ${isFullscreen ? 'translate-y-0' : 'translate-y-full'}`}>
         {/* Camada da Imagem */}
         <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
             <img src={territory.imageUrl} alt="Mapa Fullscreen" className="w-full h-full object-contain" />
         </div>
         
         {/* Camada do Canvas */}
         <canvas ref={canvasRef} className={`absolute inset-0 touch-none ${isOccupied ? 'cursor-crosshair' : 'pointer-events-none'}`} />

         {/* Controles do Modo Tela Cheia */}
         <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4 px-4 pointer-events-none">
             {isOccupied && (
                 <button 
                    onClick={clearCanvas}
                    className="pointer-events-auto px-6 py-3 bg-white/90 backdrop-blur-md shadow-lg rounded-full text-red-500 font-bold flex items-center gap-2 hover:bg-white transition-colors"
                >
                    <span className="material-symbols-outlined">delete</span>
                    Limpar Desenho
                </button>
             )}
             <button 
               onClick={closeFullscreen}
               className="pointer-events-auto px-6 py-3 bg-principal-purple text-white shadow-lg shadow-principal-purple/30 rounded-full font-bold flex items-center gap-2 hover:bg-deep-purple transition-colors"
             >
                <span className="material-symbols-outlined">close</span>
                Fechar
             </button>
         </div>
      </div>
    </div>
  );
};