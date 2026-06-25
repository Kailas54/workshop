import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './services/store';
import MentorDashboard from './pages/MentorDashboard';
import StudentWorkspace from './pages/StudentWorkspace';
import AdminDashboard from './pages/AdminDashboard';
import PlacementMaterials from './pages/PlacementMaterials';
import CodeAPet from './pages/CodeAPet';

import ImpropsHero from './components/ImpropsHero';

import { subscribeToAuthChanges } from './services/auth';

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);
  const clearUser = useStore(state => state.clearUser);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((data) => {
      if (data) {
        setUser({ id: data.user.uid, email: data.user.email, ...data.profile });
      } else {
        clearUser();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser, clearUser]);

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#09090b', color: '#a855f7' }}>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!user ? <ImpropsHero /> : <Navigate to={user.role === 'mentor' ? '/mentor' : user.role === 'admin' ? '/admin' : '/workspace'} />} />
        <Route path="/mentor" element={user?.role === 'mentor' ? <MentorDashboard /> : <Navigate to="/" />} />
        <Route path="/workspace" element={user?.role === 'student' ? <StudentWorkspace /> : <Navigate to="/" />} />
        <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/materials" element={<PlacementMaterials />} />
        <Route path="/code-a-pet" element={user?.role === 'student' ? <CodeAPet /> : <Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}
