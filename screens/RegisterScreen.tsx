import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const RegisterScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useApp();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isInvite, setIsInvite] = useState(false);

  useEffect(() => {
    // Verifica se é um link de convite (simulado via query params)
    const params = new URLSearchParams(location.search);
    if (params.get('invite')) {
        setIsInvite(true);
    }
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
        // Se é convite, entra como publicador. Se não, entra como admin.
        const isAdmin = !isInvite;
        login(name, email, isAdmin);
        navigate('/home');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-very-light-gray font-display text-dark-gray">
      <header className="bg-principal-purple h-48 w-full pt-12 px-6 flex items-start justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-pure-white tracking-tight">Territórios Congregação</h1>
          <h2 className="text-2xl font-bold text-pure-white tracking-tight opacity-90">Sul Pelotas</h2>
        </div>
      </header>
      
      <main className="flex-grow bg-very-light-gray rounded-t-[2.5rem] -mt-10 shadow-2xl px-8 py-10 flex flex-col">
        <h2 className="text-2xl font-bold text-dark-gray mb-2 text-center">
            {isInvite ? "Aceitar Convite" : "Criar Conta Mestre"}
        </h2>
        <p className="text-center text-sm text-gray-500 mb-8">
            {isInvite 
                ? "Registre-se para acessar os territórios da congregação." 
                : "Configure a conta principal para gerenciar a congregação."}
        </p>

        <form className="flex-grow flex flex-col space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-dark-gray ml-2">Nome Completo</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: João da Silva" 
              className="w-full bg-transparent border border-soft-lavender rounded-full px-5 py-3 text-dark-gray focus:outline-none focus:border-principal-purple focus:ring-1 focus:ring-principal-purple placeholder-gray-400"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-semibold text-dark-gray ml-2">E-mail (Login Google)</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com" 
              className="w-full bg-transparent border border-soft-lavender rounded-full px-5 py-3 text-dark-gray focus:outline-none focus:border-principal-purple focus:ring-1 focus:ring-principal-purple placeholder-gray-400"
            />
          </div>

          <div className="mt-8">
            <button type="submit" className="w-full bg-principal-purple text-pure-white font-bold py-4 rounded-full shadow-lg shadow-principal-purple/20 hover:bg-deep-purple transition-all transform active:scale-95">
              {isInvite ? "Entrar na Congregação" : "Criar Congregação"}
            </button>
          </div>
        </form>

        {!isInvite && (
            <div className="text-center mt-8">
            <p className="text-sm text-dark-gray/80">
                Já tem uma conta? <button onClick={() => navigate('/')} className="font-bold text-principal-purple hover:underline">Entrar</button>
            </p>
            </div>
        )}
      </main>
    </div>
  );
};