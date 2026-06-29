import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../services/store';
import { logOut } from '../services/auth';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { BookOpen, Award, Share2, Terminal, Trophy, Target, Play, Save, Star, Zap, CheckCircle2, Lock, GitBranch, Search, Mail } from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import GradientCards from '../components/GradientCards';

const WORKSHOPS = [
  { id: 'demo-session-123', title: 'Python Bootcamp - Batch 1', date: 'Today, 2:00 PM', status: 'live' },
  { id: 'ws-2', title: 'Data Structures with Python', date: 'Tomorrow, 10:00 AM', status: 'scheduled' },
];

export default function StudentDashboard() {
  const user = useStore(state => state.user);
  const clearUser = useStore(state => state.clearUser);
  const navigate = useNavigate();

  const [notes, setNotes] = useState('');
  const [points, setPoints] = useState(0);
  const [progress, setProgress] = useState(0); // percentage 0-100
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef(null);
  const textareaRef = useRef(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateGranted, setCertificateGranted] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    // Fetch user data from Firestore on mount
    const fetchUserData = async () => {
      try {
        const docRef = doc(db, 'users', user.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNotes(data.notes || '');
          setPoints(data.points || 150); // Default points if undefined
          setProgress(data.progressPct || 45); // Default progress if undefined
          setCertificateGranted(data.certificateGranted || false);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchUserData();
  }, [user.id]);

  const handleNotesChange = (e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    
    // Auto-save debounce
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setIsSaving(true);
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const docRef = doc(db, 'users', user.id);
        await updateDoc(docRef, { notes: newNotes });
      } catch (err) {
        console.error("Error saving notes:", err);
      } finally {
        setIsSaving(false);
      }
    }, 1000);
  };

  const insertIcon = (iconStr) => {
    if (!textareaRef.current) return;
    const cursorPosition = textareaRef.current.selectionStart;
    const textBefore = notes.substring(0, cursorPosition);
    const textAfter  = notes.substring(cursorPosition);
    const newNotes = textBefore + iconStr + textAfter;
    setNotes(newNotes);

    // Auto-save logic
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const docRef = doc(db, 'users', user.id);
        await updateDoc(docRef, { notes: newNotes });
      } catch (err) {} finally { setIsSaving(false); }
    }, 1000);
    
    // Maintain cursor focus
    setTimeout(() => {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(cursorPosition + iconStr.length, cursorPosition + iconStr.length);
    }, 0);
  };

  const handleLinkedInShare = () => {
    const text = encodeURIComponent(`I'm currently learning Python with Improps! Just hit ${points} points on my learning journey. 🚀 #Python #Improps`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=https://improps.com&summary=${text}`, '_blank');
  };

  const handleDownloadCertificate = async () => {
    try {
      setIsGeneratingPdf(true);
      const url = '/certificate-template.pdf';
      const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { width, height } = firstPage.getSize();

      // Draw the name (adjust coordinates as needed based on the PDF design)
      const fontSize = 48;
      const textWidth = timesRomanFont.widthOfTextAtSize(user.name, fontSize);
      
      firstPage.drawText(user.name, {
        x: width / 2 - textWidth / 2,
        y: height / 2 + 30, // Moved up to sit exactly on the blank line
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${user.name.replace(' ', '_')}_Certificate.pdf`;
      link.click();
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate certificate. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="app-container" style={{ 
      padding: '32px', maxWidth: '100%', margin: 0, gap: '32px', display: 'flex', flexDirection: 'column', overflowY: 'auto',
      background: '#1d1d25', fontFamily: "'Quicksand', sans-serif", color: '#e2e8f0', minHeight: '100vh'
    }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 700, color: '#ffffff' }}>
            Hello, <span style={{ fontFamily: "'Dancing Script', cursive", background: 'linear-gradient(135deg, #a855f7, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '3rem', paddingLeft: '8px' }}>{user.name}</span>
          </h1>
          <p style={{ color: '#a0a0ab', margin: '4px 0 0 0', fontSize: '1rem', fontWeight: 500 }}>Welcome back!</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#252530', borderRadius: '12px', padding: '10px 16px', gap: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Search size={16} color="#a0a0ab" />
            <input type="text" placeholder="Search" style={{ background: 'transparent', border: 'none', color: '#e2e8f0', outline: 'none', width: '100px', fontSize: '0.85rem' }} />
          </div>
          <div style={{ background: '#252530', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
            <Mail size={18} color="#a0a0ab" />
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #a855f7, #ec4899)', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }} onClick={async () => { await logOut(); clearUser(); window.location.href = '/'; }}>
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Main Banner / Your Journey */}
          <div style={{ 
            background: 'linear-gradient(135deg, #2a2a35 0%, #1e1e27 100%)', 
            borderRadius: '24px', 
            padding: '32px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '1.75rem', fontWeight: 700, color: '#fff', maxWidth: '300px', lineHeight: 1.2 }}>
                Continue your<br/>Learning Journey
              </h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ background: '#e2e8f0', color: '#0f172a', padding: '8px 16px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  <Trophy size={16} /> {points} XP
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: '#fff', padding: '8px 16px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  <CheckCircle2 size={16} color="#d8b4fe" /> {progress}% Complete
                </div>
              </div>
            </div>
            
            {/* Abstract 3D shape illustration representation */}
            <div style={{ position: 'relative', width: '150px', height: '120px', zIndex: 0 }}>
              <div style={{ position: 'absolute', right: '10px', top: '-10px', width: '100px', height: '100px', background: 'linear-gradient(135deg, #a855f7, #ec4899)', borderRadius: '50%', filter: 'blur(2px)', opacity: 0.8, boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.4)' }}></div>
              <div style={{ position: 'absolute', right: '50px', top: '30px', width: '60px', height: '60px', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', borderRadius: '50%', filter: 'blur(1px)', opacity: 0.9, boxShadow: 'inset -5px -5px 10px rgba(0,0,0,0.4)' }}></div>
              <div style={{ position: 'absolute', right: '30px', top: '80px', width: '140px', height: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '50%', filter: 'blur(4px)' }}></div>
            </div>
          </div>

          {/* Premium Purple 3D Dock / Quick Actions */}
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Dancing+Script:wght@600;700&display=swap');
            
            /* Custom Purple Scrollbar */
            ::-webkit-scrollbar {
              width: 8px;
            }
            ::-webkit-scrollbar-track {
              background: #1d1d25; 
            }
            ::-webkit-scrollbar-thumb {
              background: linear-gradient(180deg, #a855f7, #6b21a8);
              border-radius: 8px;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(180deg, #c084fc, #7e22ce);
            }

            .dock-grid {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 16px;
            }
            
            .dock-card {
              position: relative;
              aspect-ratio: 1 / 1;
              border-radius: 20px;
              background: linear-gradient(160deg, #6b21a8, #3b0764);
              box-shadow: 
                0 15px 30px rgba(0,0,0,0.3),
                inset 0 3px 6px rgba(216, 180, 254, 0.3),
                inset 0 -20px 40px rgba(0,0,0,0.6);
              border: 1px solid rgba(216, 180, 254, 0.15);
              padding: 16px;
              display: flex;
              flex-direction: column;
              text-align: left;
              cursor: pointer;
              transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s;
              font-family: 'Quicksand', sans-serif;
              overflow: hidden;
            }
            
            .dock-card:hover:not(.disabled) {
              transform: translateY(-8px);
              box-shadow: 
                0 25px 40px rgba(0,0,0,0.4),
                inset 0 3px 6px rgba(216, 180, 254, 0.4),
                inset 0 -20px 40px rgba(0,0,0,0.7);
            }
            
            .dock-card.disabled {
              cursor: not-allowed;
              opacity: 0.7;
              background: linear-gradient(160deg, #4c1d95, #1e1b4b);
            }
            
            .dock-card::after {
              content: '';
              position: absolute;
              top: 0; left: 0; right: 0; bottom: 0;
              background: radial-gradient(circle at 100% 0%, rgba(216, 180, 254, 0.15) 0%, transparent 50%);
              pointer-events: none;
            }

            .dock-label {
              font-size: 0.55rem;
              font-weight: 700;
              letter-spacing: 0.15em;
              color: rgba(216, 180, 254, 0.7);
              text-transform: uppercase;
              margin-bottom: 8px;
            }

            .dock-title {
              font-size: 1.1rem;
              font-weight: 700;
              color: #ffffff;
              line-height: 1.1;
              letter-spacing: -0.02em;
            }

            .dock-footer {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-top: auto;
            }

            .dock-orb {
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: radial-gradient(circle at 30% 30%, #f3e8ff, #a855f7);
              box-shadow: 
                inset -3px -3px 6px rgba(0,0,0,0.4),
                0 4px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .dock-orb svg {
              width: 14px;
              height: 14px;
              color: #3b0764;
            }

            .dock-arrow {
              color: rgba(216, 180, 254, 0.6);
              transition: transform 0.2s, color 0.2s;
            }
            
            .dock-card:hover:not(.disabled) .dock-arrow {
              transform: translateX(3px);
              color: rgba(216, 180, 254, 1);
            }
            
            .dock-badge {
              position: absolute;
              top: 12px;
              right: 12px;
              background: #ec4899;
              color: #fff;
              font-size: 0.55rem;
              font-weight: 800;
              letter-spacing: 0.05em;
              padding: 2px 6px;
              border-radius: 12px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
          `}</style>
          
          <div className="dock-grid">
            <button className="dock-card" onClick={() => navigate('/materials')}>
              <div className="dock-label">RESOURCE</div>
              <div className="dock-title">Study<br/>Materials</div>
              <div className="dock-footer">
                <div className="dock-orb"><BookOpen /></div>
                <div className="dock-arrow">→</div>
              </div>
            </button>
            
            <button 
              className={`dock-card ${!certificateGranted ? 'disabled' : ''}`}
              onClick={() => certificateGranted && setShowCertificate(true)}
              title={certificateGranted ? 'View Certificate' : 'Complete the workshop to unlock'}
            >
              <div className="dock-label">ACHIEVEMENT</div>
              <div className="dock-title">{certificateGranted ? 'View' : 'Locked'}<br/>Certificate</div>
              <div className="dock-footer">
                <div className="dock-orb" style={{ background: certificateGranted ? 'radial-gradient(circle at 30% 30%, #d1fae5, #10b981)' : 'radial-gradient(circle at 30% 30%, #9ca3af, #4b5563)' }}>
                  {certificateGranted ? <Award /> : <Lock />}
                </div>
                <div className="dock-arrow">→</div>
              </div>
            </button>
            
            <button className="dock-card" onClick={handleLinkedInShare}>
              <div className="dock-label">SOCIAL</div>
              <div className="dock-title">Share<br/>Progress</div>
              <div className="dock-footer">
                <div className="dock-orb" style={{ background: 'radial-gradient(circle at 30% 30%, #bae6fd, #0284c7)' }}>
                  <Share2 />
                </div>
                <div className="dock-arrow">→</div>
              </div>
            </button>
            
            <button className="dock-card" onClick={() => navigate('/flow-lab')}>
              <div className="dock-badge">NEW</div>
              <div className="dock-label">PRACTICE</div>
              <div className="dock-title">Flow<br/>Lab</div>
              <div className="dock-footer">
                <div className="dock-orb" style={{ background: 'radial-gradient(circle at 30% 30%, #e0e7ff, #4f46e5)' }}>
                  <GitBranch />
                </div>
                <div className="dock-arrow">→</div>
              </div>
            </button>
            
            <button className="dock-card" onClick={() => navigate('/projects')}>
              <div className="dock-badge">NEW</div>
              <div className="dock-label">APPLICATION</div>
              <div className="dock-title">Code<br/>Projects</div>
              <div className="dock-footer">
                <div className="dock-orb" style={{ background: 'radial-gradient(circle at 30% 30%, #fce7f3, #db2777)' }}>
                  <Target />
                </div>
                <div className="dock-arrow">→</div>
              </div>
            </button>
          </div>
          
          {/* Upcoming Workshops */}
          <div style={{ marginTop: '8px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={20} color="#3b82f6" /> Upcoming Workshops
            </h2>
            <GradientCards workshops={WORKSHOPS} />
          </div>

        </div>

        {/* Right Column - Notepad (Reports style) */}
        <div style={{ 
          background: 'linear-gradient(145deg, #262631 0%, #1c1c24 100%)', 
          borderRadius: '24px', 
          padding: '24px', 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%', 
          minHeight: '600px',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0' }}>
              Personal Notes
            </h2>
            <div style={{ background: '#252530', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', color: '#a0a0ab', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
              {isSaving ? <><Save size={12} className="pulse-indicator" /> Saving...</> : <><CheckCircle2 size={12} color="#10b981" /> Saved</>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button title="Insert Star" onClick={() => insertIcon('⭐')} style={{ background: '#252530', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#a0a0ab', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#2d2d3a'} onMouseOut={e => e.currentTarget.style.background = '#252530'}><Star size={14}/></button>
            <button title="Insert Target" onClick={() => insertIcon('🎯')} style={{ background: '#252530', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#a0a0ab', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#2d2d3a'} onMouseOut={e => e.currentTarget.style.background = '#252530'}><Target size={14}/></button>
            <button title="Insert Zap" onClick={() => insertIcon('⚡')} style={{ background: '#252530', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: '#a0a0ab', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#2d2d3a'} onMouseOut={e => e.currentTarget.style.background = '#252530'}><Zap size={14}/></button>
          </div>

          <textarea
            ref={textareaRef}
            value={notes}
            onChange={handleNotesChange}
            placeholder="Jot down important concepts, code snippets, or questions here. They autosave automatically!"
            style={{
              flex: 1,
              width: '100%',
              background: '#1d1d25',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: '20px',
              color: '#e2e8f0',
              fontFamily: "'Quicksand', sans-serif",
              fontSize: '1rem',
              fontWeight: 500,
              lineHeight: 1.5,
              resize: 'none',
              outline: 'none',
              boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.2)'
            }}
          />
        </div>

      </div>

      {showCertificate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', padding: '24px' }} onClick={() => setShowCertificate(false)}>
          <div className="glass-panel" style={{ padding: '40px', maxWidth: '600px', width: '100%', textAlign: 'center', border: '2px solid #a855f7', borderRadius: '16px', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <Award size={64} color="#a855f7" style={{ marginBottom: '24px' }} />
            <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Certificate of Completion</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.125rem' }}>
              This certifies that <strong>{user.name}</strong> has successfully completed the Python Mastery Bootcamp.
            </p>
            <div style={{ color: '#a855f7', fontWeight: 600, letterSpacing: '2px', marginBottom: '24px' }}>
              IMPROPS TRAINING INSTITUTE
            </div>
            <button 
              className="btn btn-primary" 
              style={{ padding: '12px 24px', fontSize: '1rem', background: 'var(--status-green)', color: '#000', fontWeight: 700, width: '100%', marginBottom: '12px' }} 
              onClick={handleDownloadCertificate}
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? 'Generating PDF...' : 'Download Official PDF'}
            </button>
            <button className="btn btn-secondary" style={{ position: 'absolute', top: '16px', right: '16px' }} onClick={() => setShowCertificate(false)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
