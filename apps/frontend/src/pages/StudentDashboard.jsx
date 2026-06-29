import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../services/store';
import { logOut } from '../services/auth';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { BookOpen, Award, Share2, Terminal, Trophy, Target, Play, Save, Star, Zap, CheckCircle2, Lock, GitBranch } from 'lucide-react';
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
    <div className="app-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', gap: '24px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      
      {/* Header */}
      <header className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            Welcome back, <span style={{ color: '#a855f7' }}>{user.name}</span>!
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '8px 0 0 0' }}>Ready to crush some code today?</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={async () => { await logOut(); clearUser(); window.location.href = '/'; }}>Log Out</button>
        </div>
      </header>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Progress & Points */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={20} color="#a855f7" /> Your Journey
              </h2>
              <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', padding: '6px 16px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-yellow)', fontWeight: 600 }}>
                <Trophy size={16} /> {points} XP
              </div>
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
                <span>Course Progress</span>
                <span style={{ color: '#a855f7' }}>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #a855f7, #c084fc)', borderRadius: '6px', transition: 'width 1s ease' }}></div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
            <button className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => navigate('/materials')}>
              <div style={{ background: 'rgba(59,130,246,0.1)', padding: '12px', borderRadius: '50%' }}><BookOpen size={24} color="#3b82f6" /></div>
              <span style={{ fontWeight: 600 }}>Study Materials</span>
            </button>
            <button 
              className="glass-panel" 
              style={{ 
                padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', 
                background: certificateGranted ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)', 
                border: certificateGranted ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.1)', 
                cursor: certificateGranted ? 'pointer' : 'not-allowed', 
                transition: 'all 0.2s',
                opacity: certificateGranted ? 1 : 0.6
              }} 
              onClick={() => certificateGranted && setShowCertificate(true)}
              title={certificateGranted ? 'View Certificate' : 'Complete the workshop to unlock'}
            >
              <div style={{ background: certificateGranted ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '50%' }}>
                {certificateGranted ? <Award size={24} color="#10b981" /> : <Lock size={24} color="var(--text-secondary)" />}
              </div>
              <span style={{ fontWeight: 600 }}>{certificateGranted ? 'View Certificate' : 'Locked'}</span>
            </button>
            <button className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: 'rgba(14,118,168,0.05)', border: '1px solid rgba(14,118,168,0.2)', cursor: 'pointer', transition: 'all 0.2s' }} onClick={handleLinkedInShare}>
              <div style={{ background: 'rgba(14,118,168,0.1)', padding: '12px', borderRadius: '50%' }}><Share2 size={24} color="#0e76a8" /></div>
              <span style={{ fontWeight: 600 }}>Share Progress</span>
            </button>
            <button
              className="glass-panel"
              id="flow-lab-card"
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.25)', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
              onClick={() => navigate('/flow-lab')}
            >
              <div style={{ background: 'rgba(99,102,241,0.15)', padding: '12px', borderRadius: '50%' }}><GitBranch size={24} color="#6366f1" /></div>
              <span style={{ fontWeight: 600 }}>Flow Lab</span>
              <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: '#fff', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.05em', padding: '2px 6px', borderRadius: '8px' }}>NEW</span>
            </button>
            <button
              className="glass-panel"
              style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.25)', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
              onClick={() => navigate('/projects')}
            >
              <div style={{ background: 'rgba(168,85,247,0.15)', padding: '12px', borderRadius: '50%' }}><Target size={24} color="#a855f7" /></div>
              <span style={{ fontWeight: 600 }}>Projects</span>
              <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.05em', padding: '2px 6px', borderRadius: '8px' }}>NEW</span>
            </button>
          </div>
          
          {/* Featured Learning Paths / Gradient Cards */}
          <div style={{ marginTop: '8px' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={20} color="#f59e0b" /> Recommended Modules
            </h2>
            <GradientCards />
          </div>

          {/* Upcoming Workshops */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={20} color="#3b82f6" /> Upcoming Workshops
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {WORKSHOPS.map(ws => (
                <div key={ws.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>{ws.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{ws.date}</div>
                  </div>
                  {ws.status === 'live' ? (
                    <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--status-green)', color: '#000', fontWeight: 700 }} onClick={() => navigate('/workspace')}>
                      <Play size={14} /> Join Live
                    </button>
                  ) : (
                    <span style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '24px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Scheduled</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Real-World Projects Section */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={20} color="#a855f7" /> Real-World Projects
              </h2>
              <button 
                className="btn btn-secondary" 
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                onClick={() => navigate('/projects')}
              >
                View All
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div 
                style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => navigate('/projects/quickbill')}
                className="card"
              >
                <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>QuickBill (Café)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Billing System</div>
              </div>
              <div 
                style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => navigate('/projects/simbank')}
                className="card"
              >
                <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>SimBank</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ATM Simulator</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Notepad */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Personal Notes
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {isSaving ? <><Save size={12} className="pulse-indicator" /> Saving...</> : <><CheckCircle2 size={12} color="var(--status-green)" /> Saved</>}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button title="Insert Star" onClick={() => insertIcon('⭐')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#fff' }}><Star size={16}/></button>
            <button title="Insert Target" onClick={() => insertIcon('🎯')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#fff' }}><Target size={16}/></button>
            <button title="Insert Zap" onClick={() => insertIcon('⚡')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#fff' }}><Zap size={16}/></button>
          </div>

          <textarea
            ref={textareaRef}
            value={notes}
            onChange={handleNotesChange}
            placeholder="Jot down important concepts, code snippets, or questions here. They autosave automatically!"
            style={{
              flex: 1,
              width: '100%',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '8px',
              padding: '16px',
              color: '#e5e7eb',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              resize: 'none',
              outline: 'none',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
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
