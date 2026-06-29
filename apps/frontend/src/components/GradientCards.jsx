import React from 'react';
import { ArrowRight, Play, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GradientCards = ({ workshops = [] }) => {
  const navigate = useNavigate();

  // Define themes to cycle through
  const themes = [
    {
      theme: 'orange',
      labelColor: '#e87c48',
      bgGradient: 'linear-gradient(135deg, #fef6ed 0%, #fbe3cf 100%)',
      svgShapes: (
        <>
          <div className="bg-shape circle-orange-1"></div>
          <div className="bg-shape vase-group">
            <div className="vase-neck"></div>
            <div className="vase-base"></div>
          </div>
        </>
      )
    },
    {
      theme: 'purple',
      labelColor: '#9353d3',
      bgGradient: 'linear-gradient(135deg, #f2eff9 0%, #e3dcf4 100%)',
      svgShapes: (
        <>
          <div className="bg-shape circle-purple-1"></div>
          <div className="bg-shape rect-purple-1"></div>
        </>
      )
    }
  ];

  return (
    <div className="gradient-cards-container">
      {workshops.map((ws, index) => {
        const themeDef = themes[index % themes.length];
        return (
          <div key={ws.id} className={`g-card g-card-${themeDef.theme}`} style={{ background: themeDef.bgGradient }}>
            {/* Background Shapes */}
            <div className="g-card-bg">
              {themeDef.svgShapes}
            </div>
            
            {/* Content */}
            <div className="g-card-content">
              <div className="g-card-label" style={{ color: themeDef.labelColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> {ws.date.toUpperCase()}
              </div>
              <h3 className="g-card-title">{ws.title}</h3>
              <p className="g-card-desc">Master the upcoming concepts in this interactive live session.</p>
              
              <div style={{ marginTop: 'auto', zIndex: 2 }}>
                {ws.status === 'live' ? (
                  <button 
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#111827', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => navigate('/workspace')}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Play size={16} fill="currentColor" /> Join Live
                  </button>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'rgba(255,255,255,0.5)', color: '#4b5563', borderRadius: '12px', fontWeight: 600, fontSize: '0.85rem' }}>
                    Scheduled
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <style>{`
        .gradient-cards-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-top: 24px;
        }

        .g-card {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          padding: 32px;
          min-height: 260px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }

        .g-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.08);
        }

        .g-card-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 0;
        }

        .bg-shape {
          position: absolute;
        }

        /* Orange Theme Shapes */
        .circle-orange-1 {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, #f8dfcb 0%, #f7d5bc 100%);
          top: 20px;
          right: -40px;
          opacity: 0.8;
          filter: blur(8px);
        }
        .vase-group {
          bottom: -20px;
          right: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .vase-neck {
          width: 45px;
          height: 60px;
          background: linear-gradient(180deg, #f3b28b 0%, #eca073 100%);
          border-radius: 8px 8px 0 0;
          margin-bottom: -15px;
          position: relative;
          z-index: 1;
        }
        .vase-base {
          width: 140px;
          height: 140px;
          background: linear-gradient(135deg, #f0a379 0%, #e07f4a 100%);
          border-radius: 50%;
          box-shadow: inset -10px -10px 20px rgba(0,0,0,0.05);
        }

        /* Purple Theme Shapes */
        .circle-purple-1 {
          width: 250px;
          height: 250px;
          border-radius: 50%;
          background: radial-gradient(circle, #e4dff2 0%, #dad2eb 100%);
          top: -30px;
          right: 20px;
          opacity: 0.7;
          filter: blur(10px);
        }
        .rect-purple-1 {
          width: 70px;
          height: 200px;
          background: linear-gradient(180deg, #c3b2e5 0%, #a487d6 100%);
          bottom: -20px;
          right: 40px;
          border-radius: 12px 12px 0 0;
          box-shadow: inset -10px 0px 20px rgba(0,0,0,0.05);
        }

        /* Green Theme Shapes */
        .circle-green-1 {
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, #dbefd8 0%, #cde8ca 100%);
          bottom: 20px;
          right: -20px;
          opacity: 0.8;
          filter: blur(8px);
        }
        .tree-group {
          bottom: 0px;
          right: 50px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .tree-top {
          width: 0; height: 0;
          border-left: 40px solid transparent;
          border-right: 40px solid transparent;
          border-bottom: 60px solid #73c87e;
          margin-bottom: -25px;
          position: relative; z-index: 3;
        }
        .tree-mid {
          width: 0; height: 0;
          border-left: 60px solid transparent;
          border-right: 60px solid transparent;
          border-bottom: 70px solid #82d48c;
          margin-bottom: -30px;
          position: relative; z-index: 2;
        }
        .tree-bottom {
          width: 0; height: 0;
          border-left: 80px solid transparent;
          border-right: 80px solid transparent;
          border-bottom: 80px solid #95df9e;
          position: relative; z-index: 1;
        }
        .tree-trunk {
          width: 20px;
          height: 30px;
          background: linear-gradient(180deg, #a6e7ae 0%, #b8f2bf 100%);
          border-radius: 4px 4px 0 0;
        }

        /* Pink Theme Shapes */
        .circle-pink-1 {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: radial-gradient(circle, #f9d5f0 0%, #f4c2e8 100%);
          top: 30px;
          right: 40px;
          opacity: 0.7;
          filter: blur(10px);
        }
        .star-pink-1 {
          width: 160px;
          height: 160px;
          bottom: -30px;
          right: -20px;
        }

        /* Content Styling */
        .g-card-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .g-card-label {
          background: #ffffff;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          align-self: flex-start;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .g-card-title {
          margin: 24px 0 12px 0;
          font-size: 1.8rem;
          font-weight: 800;
          color: #1f2937;
          line-height: 1.2;
        }

        .g-card-desc {
          margin: 0;
          font-size: 0.9rem;
          color: #4b5563;
          line-height: 1.5;
          max-width: 65%;
          font-weight: 500;
        }

        .g-card-link {
          margin-top: auto;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
          font-weight: 700;
          color: #111827;
          text-decoration: none;
          align-self: flex-start;
          padding-bottom: 2px;
          border-bottom: 2px solid #111827;
          transition: gap 0.2s ease;
        }

        .g-card:hover .g-card-link {
          gap: 10px;
        }
        
        @media (max-width: 768px) {
          .gradient-cards-container {
            grid-template-columns: 1fr;
          }
          .g-card-desc {
            max-width: 80%;
          }
        }
      `}</style>
    </div>
  );
};

export default GradientCards;
