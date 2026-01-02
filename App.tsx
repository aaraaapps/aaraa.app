
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Submissions from './pages/Submissions';
import Approvals from './pages/Approvals';
import ProjectCreationPage from './pages/ProjectCreationPage';
import MediaVault from './pages/MediaVault';
import { Employee, UserRole } from './types';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AIWidget from './components/AIWidget';
import { authService } from './services/supabase';

interface AuthContextType {
  user: Employee | null;
  login: (id: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {}
});

const App: React.FC = () => {
  const [user, setUser] = useState<Employee | null>(() => {
    const saved = localStorage.getItem('aaraa_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (id: string) => {
    try {
      const profile = await authService.loginEmployee(id);
      setUser(profile);
      localStorage.setItem('aaraa_user', JSON.stringify(profile));
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aaraa_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <div className="min-h-screen flex flex-col md:flex-row">
          {user && <Sidebar />}
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            {user && <Header />}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
              <Routes>
                {!user ? (
                  <>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                  </>
                ) : (
                  <>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/submissions" element={<Submissions />} />
                    <Route path="/media-vault" element={<MediaVault />} />
                    <Route path="/project-creation" element={<ProjectCreationPage />} />
                    {user.role !== UserRole.USER && (
                      <Route path="/approvals" element={<Approvals />} />
                    )}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </>
                )}
              </Routes>
            </main>
            {user && <AIWidget />}
          </div>
        </div>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
