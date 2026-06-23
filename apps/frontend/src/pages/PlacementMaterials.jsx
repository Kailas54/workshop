import React from 'react';
import { FileText, ExternalLink, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DRIVE_LINK = "https://drive.google.com/drive/u/0/mobile/folders/1o_p__DEqs9bXoWfcSaH5FUHaX4OXXPyr?usp=sharing";

const MATERIALS = [
  {
    title: "Data Structures & Algorithms",
    description: "Comprehensive guide for DSA interview prep."
  },
  {
    title: "System Design Concepts",
    description: "Key concepts for high-level system design."
  },
  {
    title: "Core CS Subjects",
    description: "OS, DBMS, and Computer Networks notes."
  },
  {
    title: "Resume Templates & Tips",
    description: "ATS friendly templates and action verbs."
  },
  {
    title: "HR Interview Prep",
    description: "Common behavioral questions and STAR method."
  },
  {
    title: "Company Specific Guides",
    description: "Previous year questions for top tech companies."
  }
];

export default function PlacementMaterials() {
  const navigate = useNavigate();

  return (
    <div className="app-container" style={{ padding: '32px', overflowY: 'auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
        <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Placement Materials</h1>
      </header>

      <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {MATERIALS.map((mat, idx) => (
          <div key={idx} className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent-cyan)' }}>
              <FileText size={24} />
              <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: 0 }}>{mat.title}</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', flex: 1, margin: 0, lineHeight: 1.5 }}>{mat.description}</p>
            <a 
              href={DRIVE_LINK} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary" 
              style={{ display: 'flex', justifyContent: 'center', gap: '8px', textDecoration: 'none', marginTop: '16px' }}
            >
              Open PDF <ExternalLink size={16} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
