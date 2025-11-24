
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Territory, TerritoryStatus, Congregation, HistoryLog, User } from '../types';
import { INITIAL_TERRITORIES } from '../constants';

interface AppContextType {
  user: User | null;
  users: User[]; // Lista de todos os usuários da congregação
  login: (name: string, email: string, isAdmin?: boolean) => void;
  logout: () => void;
  updateUser: (name: string) => void;
  removeUser: (userId: string) => void;
  
  territories: Territory[];
  history: HistoryLog[];
  congregation: Congregation;
  
  updateTerritoryStatus: (id: number, status: TerritoryStatus) => void;
  updateObservation: (id: number, text: string) => void;
  updateTerritoryConfig: (id: number, updates: { imageUrl?: string; googleMapsLink?: string; drawingData?: string }) => void;
  updateCongregationSettings: (name: string, count: number) => void;
  
  downloadBackup: () => void;
  restoreBackup: (data: any) => void;
  getInviteLink: () => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_HISTORY: HistoryLog[] = [];

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  // O usuário logado atualmente no dispositivo
  const [user, setUser] = useState<User | null>(null);
  
  // Lista de usuários registrados na congregação
  const [users, setUsers] = useState<User[]>([]);

  const [territories, setTerritories] = useState<Territory[]>(INITIAL_TERRITORIES);
  const [history, setHistory] = useState<HistoryLog[]>(INITIAL_HISTORY);
  const [congregation, setCongregation] = useState<Congregation>({
    id: "CONG-SUL-PELOTAS",
    name: "Sul Pelotas",
    territoryCount: 25,
    adminId: "" // Será definido no primeiro login/registro
  });

  const login = (name: string, email: string, isAdmin: boolean = false) => {
    const userId = email.replace(/[^a-zA-Z0-9]/g, ''); // Simple ID gen
    
    const newUser: User = {
      id: userId,
      name: name,
      email: email,
      role: isAdmin ? 'admin' : 'publisher',
      joinedAt: new Date().toLocaleDateString('pt-BR')
    };

    setUser(newUser);

    // Se for o primeiro usuário ou admin explícito, define como admin da congregação
    if (users.length === 0 || isAdmin) {
        setCongregation(prev => ({ ...prev, adminId: userId }));
    }

    // Adiciona à lista de usuários se não existir
    setUsers(prev => {
        if (!prev.find(u => u.id === userId)) {
            return [...prev, newUser];
        }
        return prev;
    });
  };

  const logout = () => setUser(null);

  const updateUser = (newName: string) => {
    if (user) {
        const updatedUser = { ...user, name: newName };
        setUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    }
  };

  const removeUser = (userId: string) => {
    // Não permite remover a si mesmo
    if (user && user.id === userId) return;
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // Atualiza status usando o usuário logado
  const updateTerritoryStatus = (id: number, status: TerritoryStatus) => {
    if (!user) return; // Segurança

    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR');
    
    setTerritories(prev => prev.map(t => {
      if (t.id === id) {
        const logEntry: HistoryLog = {
            id: crypto.randomUUID(),
            territoryName: t.name,
            publisherName: user.name, // Usa o nome do usuário logado
            action: status === TerritoryStatus.Occupied ? 'Saiu' : 'Devolvido',
            date: dateStr,
            timestamp: today.getTime()
        };
        
        setHistory(prevHistory => [logEntry, ...prevHistory]);

        const shouldClearDrawing = status === TerritoryStatus.Returned;
        
        return {
          ...t,
          status,
          publisherName: status === TerritoryStatus.Occupied ? user.name : undefined,
          publisherId: status === TerritoryStatus.Occupied ? user.id : undefined,
          lastWorked: status === TerritoryStatus.Occupied ? dateStr : t.lastWorked,
          drawingData: shouldClearDrawing ? undefined : t.drawingData
        };
      }
      return t;
    }));
  };

  const updateObservation = (id: number, text: string) => {
    setTerritories(prev => prev.map(t => (t.id === id ? { ...t, observations: text } : t)));
  };

  const updateTerritoryConfig = (id: number, updates: { imageUrl?: string; googleMapsLink?: string; drawingData?: string }) => {
    setTerritories(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const updateCongregationSettings = (name: string, count: number) => {
    setCongregation(prev => ({ ...prev, name, territoryCount: count }));
    
    setTerritories(prev => {
        const currentCount = prev.length;
        if (count > currentCount) {
            const newTerritories = Array.from({ length: count - currentCount }, (_, i) => {
                const id = currentCount + i + 1;
                return {
                    id,
                    name: `${id}`,
                    status: TerritoryStatus.Available,
                    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsRoyV-6L8kxFoEsrUSmx3Au_MN5xTTTFP8KSk0b3fWX9Mjw2rNUqWSMPyeHFuJyAwWit1vxR0HfTJxFs5UCgxe0nJh-KV9bLBRRo2bNMM4faR2XdOGH2-Y8J_Ppt2YadBNh9Dgq03XqUUhfM5K1HwCLBeXLY1-PMWxDuXYK2v5P5JhHHG4A2mJ25XorXwWoMHTYn4PMEjrklr2D3gXOrEOfd1g_c5myqV-IM0FGZ1SxqvShlnqvaLFb4vkP3k9IrZZlpg0qZU-ZI",
                    googleMapsLink: "",
                    observations: ""
                };
            });
            return [...prev, ...newTerritories];
        } else if (count < currentCount) {
            return prev.slice(0, count);
        }
        return prev;
    });
  };

  const downloadBackup = () => {
    const data = {
        timestamp: new Date().toISOString(),
        congregation,
        users, // Inclui lista de usuários no backup
        territories,
        history
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-${congregation.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const restoreBackup = (data: any) => {
    if (!data) return;
    if (data.congregation) setCongregation(data.congregation);
    if (data.territories) setTerritories(data.territories);
    if (data.history) setHistory(data.history);
    if (data.users) setUsers(data.users);
  };

  const getInviteLink = () => {
    // Em um app real, isso seria um link profundo. Aqui, simulamos com a rota de registro e ID da cong.
    const baseUrl = window.location.href.split('#')[0];
    return `${baseUrl}#/register?invite=${congregation.id}`;
  };

  return (
    <AppContext.Provider value={{ 
        user, 
        users,
        login, 
        logout, 
        updateUser,
        removeUser,
        territories, 
        history,
        congregation,
        updateTerritoryStatus, 
        updateObservation, 
        updateTerritoryConfig,
        updateCongregationSettings,
        downloadBackup,
        restoreBackup,
        getInviteLink
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
