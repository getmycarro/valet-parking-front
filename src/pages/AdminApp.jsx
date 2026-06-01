import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import api from '../lib/api.js';
import {
  LoginScreen, DashboardScreen, VehiclesScreen, EmployeesScreen, RegisterVehicleModal,
  PaymentMethodsScreen,
} from '../screens/screens.jsx';
import { CompaniesScreen, UsersScreen, AttendantDashboard } from '../screens/role-screens.jsx';
import TicketDetailScreen from '../screens/TicketDetailScreen.jsx';
import { NotificationsScreen } from '../screens/NotificationsScreen.jsx';
import WorkdaysScreen from '../screens/WorkdaysScreen.jsx';
import { Sidebar, Topbar, PageHead, Toast } from '../components/ui.jsx';
import { Icon } from '../components/icons.jsx';

const TITLES = {
  dashboard: 'Dashboard',
  vehicles:  'Vehículos',
  employees: 'Empleados',
  companies: 'Compañías',
  users:     'Usuarios',
  invoices:  'Facturas',
  workdays:  'Jornadas',
  methods:   'Métodos de pago',
  reports:       'Reportes',
  notifications: 'Notificaciones',
};

const ROLE_DEFAULT_NAV = {
  SUPER_ADMIN: 'companies',
  ADMIN:       'dashboard',
  MANAGER:     'dashboard',
  ATTENDANT:   'attendant',
};

export default function AdminApp() {
  const [user, setUser]               = useState(null);
  const [active, setActive]           = useState('dashboard');
  const [registerOpen, setRegisterOpen] = useState(false);
  const [toast, setToast]             = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate                      = useNavigate();
  const location                      = useLocation();

  const handleNav = (section) => {
    setSidebarOpen(false);
    setActive(section);
    if (location.pathname.startsWith('/admin/ticket')) {
      navigate('/admin');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('gmc_token');
    if (token) {
      api.get('/auth/me')
        .then(res => {
          const u = res.data.data;
          setUser({ name: u.name, email: u.email, role: u.role, id: u.id });
          setActive(ROLE_DEFAULT_NAV[u.role] || 'dashboard');
        })
        .catch(() => localStorage.removeItem('gmc_token'));
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleLogin = (u) => {
    setUser(u);
    setActive(ROLE_DEFAULT_NAV[u.role] || 'dashboard');
  };

  if (!user) return <LoginScreen onLogin={handleLogin} onBack={() => navigate('/')} />;

  const role = user.role;
  const openReg = () => setRegisterOpen(true);

  function handleLogout() {
    localStorage.removeItem('gmc_token');
    setUser(null);
  }

  if (role === 'ATTENDANT') {
    return <AttendantDashboard user={user} onLogout={handleLogout} />;
  }

  let body = null;
  if (active === 'dashboard')      body = <DashboardScreen onRegister={openReg} />;
  else if (active === 'vehicles')  body = <VehiclesScreen  onRegister={openReg} user={user} />;
  else if (active === 'employees') body = <EmployeesScreen />;
  else if (active === 'companies') body = <CompaniesScreen />;
  else if (active === 'users')     body = <UsersScreen />;
  else if (active === 'workdays')       body = <WorkdaysScreen user={user} />;
  else if (active === 'methods')        body = <PaymentMethodsScreen />;
  else if (active === 'notifications')  body = <NotificationsScreen />;
  else {
    body = (
      <div className="page">
        <PageHead title={TITLES[active]} subtitle="Esta sección está en construcción." />
        <div className="glass empty" style={{ padding: 80 }}>
          <Icon name={active === 'invoices' ? 'file' : active === 'reports' ? 'bar' : 'dashboard'} size={56} className="ico" />
          <p>Vista <strong style={{ color: '#fff' }}>{TITLES[active]}</strong> — próximamente.</p>
          <button className="btn btn-secondary" onClick={() => setActive(ROLE_DEFAULT_NAV[role])}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="shell">
      <Sidebar
        active={active} onNav={handleNav}
        role={role} user={user}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="shell-main">
        <Topbar
          title={TITLES[active] || active}
          isDark={true}
          onToggleTheme={() => {}}
          user={user}
          onNavNotifications={() => handleNav('notifications')}
          onMenuToggle={() => setSidebarOpen(v => !v)}
        />
        <Routes>
          <Route path="ticket/:id" element={<TicketDetailScreen user={user} />} />
          <Route path="*" element={body} />
        </Routes>
      </main>
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <RegisterVehicleModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        user={user}
        onDone={({ plate }) => { setRegisterOpen(false); setToast(`Vehículo ${plate} registrado`); }}
      />
      <Toast message={toast} />
    </div>
  );
}
