
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/Layout';
import { useApp } from '../context/AppContext';

export const SettingsScreen = () => {
  const { 
    congregation, 
    updateCongregationSettings, 
    downloadBackup, 
    restoreBackup, 
    user, 
    users, // Lista completa
    updateUser,
    removeUser,
    logout,
    getInviteLink
  } = useApp();
  
  const [congName, setCongName] = useState(congregation.name);
  const [territoryCount, setTerritoryCount] = useState(congregation.territoryCount);
  const [myDisplayName, setMyDisplayName] = useState(user?.name || "");
  const [showQR, setShowQR] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutPassword, setLogoutPassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    setCongName(congregation.name);
    setTerritoryCount(congregation.territoryCount);
    setMyDisplayName(user?.name || "");
  }, [congregation, user]);

  const handleSaveCongregation = () => {
    if (!isAdmin) return;
    updateCongregationSettings(congName, Number(territoryCount));
    alert('Configurações da congregação salvas!');
  };

  const handleSaveProfile = () => {
    updateUser(myDisplayName);
    alert('Seu nome foi atualizado!');
  };

  const handleInviteWhatsApp = () => {
    const link = getInviteLink();
    const msg = `Olá! Junte-se à nossa congregação no App Territórios: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        restoreBackup(json);
        alert('Backup restaurado com sucesso!');
      } catch (error) {
        alert('Erro ao processar arquivo.');
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleLogoutConfirm = () => {
    if (logoutPassword === "1234") {
      logout();
    } else {
      alert("Senha incorreta.");
      setLogoutPassword("");
    }
  };

  return (
    <Layout title="Configurações" subtitle={isAdmin ? "Administração" : "Meu Perfil"} showNav={true}>
      <div className="flex flex-col gap-6">

        {/* 1. Perfil do Usuário (Todos veem) */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-dark-gray mb-4 flex items-center gap-2">
             <span className="material-symbols-outlined text-principal-purple">person</span>
             Meu Perfil
          </h3>
          <div className="space-y-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Meu Nome</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={myDisplayName}
                        onChange={(e) => setMyDisplayName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-dark-gray focus:border-principal-purple focus:ring-1 focus:ring-principal-purple outline-none"
                    />
                    <button onClick={handleSaveProfile} className="bg-principal-purple text-white px-4 rounded-xl font-bold shadow-md">OK</button>
                </div>
             </div>
             <p className="text-xs text-gray-400">Tipo de conta: <span className="font-bold uppercase text-principal-purple">{user?.role === 'admin' ? 'Administrador' : 'Publicador'}</span></p>
          </div>
        </div>
        
        {/* 2. Dados da Congregação (Apenas Admin edita) */}
        {isAdmin && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-dark-gray mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-principal-purple">home</span>
                Dados da Congregação
            </h3>
            
            <div className="space-y-4">
                <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nome da Congregação</label>
                <input 
                    type="text" 
                    value={congName}
                    onChange={(e) => setCongName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-dark-gray focus:border-principal-purple focus:ring-1 focus:ring-principal-purple outline-none"
                />
                </div>
                
                <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Número de Territórios</label>
                <input 
                    type="number" 
                    min="1"
                    max="500"
                    value={territoryCount}
                    onChange={(e) => setTerritoryCount(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-dark-gray focus:border-principal-purple focus:ring-1 focus:ring-principal-purple outline-none"
                />
                </div>

                <button 
                onClick={handleSaveCongregation}
                className="w-full bg-principal-purple text-white font-bold py-3 rounded-xl shadow-md shadow-principal-purple/20 hover:bg-deep-purple transition-colors mt-2"
                >
                Salvar Alterações
                </button>
            </div>
            </div>
        )}

        {/* 3. Compartilhar / Convites */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-dark-gray mb-4 flex items-center gap-2">
             <span className="material-symbols-outlined text-principal-purple">group_add</span>
             Convidar Publicadores
          </h3>
          
          <div className="space-y-3">
             <button 
               onClick={handleInviteWhatsApp}
               className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 rounded-xl shadow-md hover:bg-green-600 transition-colors"
             >
                <span className="material-symbols-outlined">share</span>
                Enviar Convite WhatsApp
             </button>

             <button 
               onClick={() => setShowQR(!showQR)}
               className="w-full flex items-center justify-center gap-2 bg-soft-lavender text-principal-purple font-bold py-3 rounded-xl hover:bg-soft-lavender/80 transition-colors"
             >
               <span className="material-symbols-outlined">qr_code</span>
               {showQR ? 'Ocultar QR Code' : 'Mostrar QR Code'}
             </button>

             {showQR && (
                <div className="flex justify-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 mt-2">
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getInviteLink())}`} 
                        alt="QR Code" 
                        className="w-48 h-48 mix-blend-multiply"
                    />
                </div>
             )}
          </div>
        </div>

        {/* 4. Lista de Usuários (Apenas Admin) */}
        {isAdmin && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-dark-gray mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-principal-purple">group</span>
                    Usuários Convidados ({users.filter(u => u.id !== user?.id).length})
                </h3>
                
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                    {users.filter(u => u.id !== user?.id).length === 0 ? (
                        <p className="text-sm text-gray-400 italic text-center py-4">Nenhum convidado ainda.</p>
                    ) : (
                        users.filter(u => u.id !== user?.id).map((u) => (
                            <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <p className="font-bold text-dark-gray text-sm">{u.name}</p>
                                    <p className="text-xs text-gray-500">{u.email}</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        if(confirm(`Remover ${u.name} da congregação?`)) removeUser(u.id);
                                    }}
                                    className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition-colors"
                                    title="Remover Usuário"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}

        {/* 5. Manutenção */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
           <h3 className="text-lg font-bold text-dark-gray mb-4 flex items-center gap-2">
             <span className="material-symbols-outlined text-principal-purple">settings_backup_restore</span>
             Manutenção e Conta
          </h3>

          <div className="space-y-3">
             <button 
                onClick={downloadBackup}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
             >
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-soft-lavender/50 rounded-full flex items-center justify-center text-principal-purple">
                      <span className="material-symbols-outlined">download</span>
                   </div>
                   <div className="text-left">
                      <p className="font-bold text-dark-gray">Fazer Backup</p>
                      <p className="text-xs text-gray-500">Baixar dados (JSON)</p>
                   </div>
                </div>
             </button>

             {isAdmin && (
                <>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-soft-lavender/50 rounded-full flex items-center justify-center text-principal-purple">
                            <span className="material-symbols-outlined">upload_file</span>
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-dark-gray">Carregar Backup</p>
                            <p className="text-xs text-gray-500">Restaurar dados</p>
                        </div>
                        </div>
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileUpload} />
                </>
             )}

             <button 
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors group"
             >
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                      <span className="material-symbols-outlined">logout</span>
                   </div>
                   <div className="text-left">
                      <p className="font-bold text-red-600">Sair da Conta</p>
                   </div>
                </div>
             </button>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
             <h3 className="text-xl font-bold text-dark-gray text-center mb-2">Segurança</h3>
             <p className="text-center text-gray-500 mb-6 text-sm">Digite a senha para confirmar.</p>
             <input 
                type="password"
                placeholder="Senha (1234)"
                value={logoutPassword}
                onChange={(e) => setLogoutPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center text-dark-gray mb-6 tracking-widest font-bold outline-none focus:border-principal-purple"
                autoFocus
             />
             <div className="flex flex-col gap-3">
                <button onClick={handleLogoutConfirm} className="w-full bg-red-500 text-white font-bold py-3.5 rounded-full hover:bg-red-600">Confirmar</button>
                <button onClick={() => { setShowLogoutModal(false); setLogoutPassword(""); }} className="w-full bg-gray-100 text-dark-gray font-bold py-3.5 rounded-full">Cancelar</button>
             </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
