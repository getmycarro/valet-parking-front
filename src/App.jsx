import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import AdminApp from './pages/AdminApp.jsx';
import { VehicleStoreProvider } from './store.jsx';

export default function App() {
  return (
    <VehicleStoreProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </VehicleStoreProvider>
  );
}
