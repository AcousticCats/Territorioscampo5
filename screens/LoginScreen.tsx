import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const LoginScreen = () => {
  const navigate = useNavigate();
  const { login } = useApp();

  useEffect(() => {
    // Simulate auto-login delay
    const timer = setTimeout(() => {
      login("João da Silva", "joao.silva@example.com", true); // Default as Admin for demo
      navigate('/home');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate, login]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-very-light-gray p-6">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="w-24 h-24 mb-8 flex items-center justify-center bg-soft-lavender rounded-[2rem] shadow-sm">
          <span className="material-symbols-outlined text-5xl text-principal-purple">location_on</span>
        </div>
        
        <h1 className="text-3xl font-bold text-dark-gray mb-2">Bem-vindo de volta!</h1>
        <p className="text-lg text-dark-gray/60 mb-12">Entrando automaticamente...</p>
        
        <div className="w-12 h-12 border-4 border-principal-purple/30 border-t-principal-purple rounded-full animate-spin mb-16"></div>
        
        <button 
          onClick={() => navigate('/register')}
          className="text-sm text-dark-gray/70"
        >
          Não é você? <span className="text-principal-purple font-bold hover:underline">Sair</span>
        </button>
      </div>
    </div>
  );
};