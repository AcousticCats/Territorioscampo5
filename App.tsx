import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { TerritoryListScreen } from './screens/TerritoryListScreen';
import { MapScreen } from './screens/MapScreen';
import { NotesScreen } from './screens/NotesScreen';
import { ReportScreen } from './screens/ReportScreen';
import { SettingsScreen } from './screens/SettingsScreen';

const App = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/home" element={<TerritoryListScreen />} />
          <Route path="/map/:id" element={<MapScreen />} />
          <Route path="/notes/:id" element={<NotesScreen />} />
          <Route path="/reports" element={<ReportScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          
          {/* Fallback routes */}
          <Route path="/global-map" element={<Navigate to="/home" replace />} />
          <Route path="/profile" element={<Navigate to="/settings" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
};

export default App;