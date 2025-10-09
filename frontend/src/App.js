import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './components/Login';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import Cash from './components/Cash';
import ListViewPage from './components/ListViewPage';
import CashInEntry from './components/CashInEntry';
import CashOutEntry from './components/CashOutEntry';
import FuelDispenser from './components/FuelDispenser';
import FuelDispenserDetails from './components/FuelDispenserDetails';
import ToDoList from './components/ToDoList';
import StaffPage from './components/StaffPage';
import StaffManagementPage from './components/StaffManagementPage';
import PayrollManagement from './components/PayrollManagement';
import { BusinessProvider } from './contexts/BusinessContext';
import { RoleProvider } from './contexts/RoleContext';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
    }

    // Listen for storage changes (for logout from another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        setToken(e.newValue);
      }
      if (e.key === 'user') {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch (err) {
          console.error('Error parsing user from storage event:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogin = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <BusinessProvider>
      <RoleProvider>
        <Router>
          <Routes>
            <Route 
              path="/" 
              element={token ? <Dashboard onLogout={handleLogout} user={user} /> : <Navigate to="/login" />} 
            />
            <Route path="/login" element={!token ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" />} />
            <Route path="/admin" element={token && (user?.role === 'admin' || user?.role === 'super_admin' || user?.is_admin) ? <AdminDashboard user={user} /> : <Navigate to="/login" />} />
            <Route path="/list/cash" element={token ? <Cash /> : <Navigate to="/login" />} />
            <Route path="/list/:key" element={token ? <ListViewPage /> : <Navigate to="/login" />} />
            <Route path="/cash-in" element={token ? <CashInEntry /> : <Navigate to="/login" />} />
            <Route path="/cash-out" element={token ? <CashOutEntry /> : <Navigate to="/login" />} />
            <Route path="/fuel-dispenser" element={token ? <FuelDispenser /> : <Navigate to="/login" />} />
            <Route path="/fuel-dispenser/:dispenserId" element={token ? <FuelDispenserDetails /> : <Navigate to="/login" />} />
            <Route path="/todo" element={token ? <ToDoList /> : <Navigate to="/login" />} />
            <Route path="/staff" element={token ? <StaffPage /> : <Navigate to="/login" />} />
            <Route path="/staff-management" element={token ? <StaffManagementPage /> : <Navigate to="/login" />} />
            <Route path="/payroll-management" element={token ? <PayrollManagement /> : <Navigate to="/login" />} />
          </Routes>
        </Router>
      </RoleProvider>
    </BusinessProvider>
  );
}

export default App;