import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './services/store';
import MentorDashboard from './pages/MentorDashboard';
import StudentWorkspace from './pages/StudentWorkspace';
import AdminDashboard from './pages/AdminDashboard';
import PlacementMaterials from './pages/PlacementMaterials';
import CodeAPet from './pages/CodeAPet';

import ImpropsHero from './components/ImpropsHero';

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const user = useStore(state => state.user);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!user ? <ImpropsHero /> : <Navigate to={user.role === 'mentor' ? '/mentor' : user.role === 'admin' ? '/admin' : '/workspace'} />} />
        <Route path="/mentor" element={<MentorDashboard />} />
        <Route path="/workspace" element={<StudentWorkspace />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/materials" element={<PlacementMaterials />} />
        <Route path="/code-a-pet" element={user?.role === 'student' ? <CodeAPet /> : <Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}
