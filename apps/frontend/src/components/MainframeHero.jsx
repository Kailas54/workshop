import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4';

const SENSITIVITY = 0.8;

const TYPEWRITER_TEXT =
  "Glad you stopped in. Good taste tends to find us. Now, what are we building?";

const WHITE_PILLS = [
  'Pitch us an idea',
  'Come work here',
  'Send a brief hello',
  'See how we operate',
];

// ─── Copy icon (two overlapping rectangles) ───────────────────────────────────
function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="3.5" y="0.5" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1" />
      <rect x="0.5" y="3.5" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.08" />
    </svg>
  );
}

// ─── Hamburger / Close button ─────────────────────────────────────────────────
function HamburgerButton({ open, onClick }) {
  const barBase = 'w-6 h-[2px] bg-black origin-center transition-all duration-300';
  return (
    <button
      onClick={onClick}
      aria-label={open ? 'Close menu' : 'Open menu'}
      className="flex flex-col items-center justify-center gap-[5px] w-8 h-8 md:hidden"
    >
      <span
        className={barBase}
        style={{
          transform: open ? 'translateY(7px) rotate(45deg)' : 'none',
        }}
      />
      <span
        className={barBase}
        style={{ opacity: open ? 0 : 1 }}
      />
      <span
        className={barBase}
        style={{
          transform: open ? 'translateY(-7px) rotate(-45deg)' : 'none',
        }}
      />
    </button>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
const NAV_LINKS = ['Labs', 'Studio', 'Openings', 'Shop'];

function Navbar({ onEnterWorkshop }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 flex justify-between items-center px-5 sm:px-8 py-4 sm:py-5 bg-white/80 backdrop-blur-sm"
        style={{ zIndex: 10 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span
            className="text-[21px] sm:text-[26px] tracking-tight text-black select-none"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Mainframe®
          </span>
          <span
            className="text-[25px] sm:text-[30px] text-black select-none leading-none"
            style={{ letterSpacing: '-0.02em' }}
          >
            ✳︎
          </span>
        </div>

        {/* Desktop nav links */}
        <div
          className="hidden md:flex items-center gap-0 text-[23px] text-black"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {NAV_LINKS.map((link, i) => (
            <React.Fragment key={link}>
              <a href="#" className="hover:opacity-60 transition-opacity">
                {link}
              </a>
              {i < NAV_LINKS.length - 1 && (
                <span className="opacity-40 mx-1">, </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-5">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); onEnterWorkshop(); }}
            className="text-[23px] text-black underline underline-offset-2 hover:opacity-60 transition-opacity"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Get in touch
          </a>
        </div>

        {/* Mobile hamburger */}
        <HamburgerButton open={menuOpen} onClick={() => setMenuOpen(o => !o)} />
      </nav>

      {/* Mobile overlay */}
      <div
        className="md:hidden fixed inset-0 bg-white/95 backdrop-blur-sm flex flex-col justify-center px-8 gap-8 transition-opacity duration-300"
        style={{
          zIndex: 9,
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
        }}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href="#"
            className="text-[32px] font-medium text-black hover:opacity-60 transition-opacity"
            style={{ fontFamily: 'var(--font-body)' }}
            onClick={() => setMenuOpen(false)}
          >
            {link}
          </a>
        ))}
        <a
          href="#"
          className="text-[32px] font-medium text-black underline underline-offset-2 hover:opacity-60 transition-opacity"
          style={{ fontFamily: 'var(--font-body)' }}
          onClick={(e) => { e.preventDefault(); setMenuOpen(false); onEnterWorkshop(); }}
        >
          Get in touch
        </a>
      </div>
    </>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export default function MainframeHero({ onEnterWorkshop }) {
  // ── video scrub refs ──
  const videoRef = useRef(null);
  const prevXRef = useRef(null);
  const targetTimeRef = useRef(0);
  const seekingRef = useRef(false);

  // ── pill fade-in state ──
  const [pillsVisible, setPillsVisible] = useState(false);

  // ── copy toast ──
  const [copied, setCopied] = useState(false);

  // ── typewriter ──
  const { displayed, done } = useTypewriter(TYPEWRITER_TEXT, 38, 600);

  // Show pills 400ms after mount (independent of typewriter)
  useEffect(() => {
    const t = setTimeout(() => setPillsVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  // Video scrub: mouse moves forward/backward through the video
  const handleMouseMove = useCallback((e) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const currentX = e.clientX;
    if (prevXRef.current !== null) {
      const delta = currentX - prevXRef.current;
      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      targetTimeRef.current = Math.max(
        0,
        Math.min(video.duration, targetTimeRef.current + timeOffset)
      );

      if (!seekingRef.current) {
        seekingRef.current = true;
        video.currentTime = targetTimeRef.current;
      }
    }
    prevXRef.current = currentX;
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleSeeked = () => {
      if (Math.abs(video.currentTime - targetTimeRef.current) > 0.05) {
        // More seeks queued — do the next one
        video.currentTime = targetTimeRef.current;
      } else {
        seekingRef.current = false;
      }
    };

    video.addEventListener('seeked', handleSeeked);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      video.removeEventListener('seeked', handleSeeked);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  // Copy email to clipboard
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('hello@mainframe.co');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  return (
    <div
      className="relative min-h-screen bg-white overflow-hidden"
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {/* ── Background Video ── */}
      <video
        ref={videoRef}
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: '70% center',
        }}
      />

      {/* ── Navbar ── */}
      <Navbar onEnterWorkshop={onEnterWorkshop} />

      {/* ── Hero Section ── */}
      <section
        className="relative flex flex-col h-screen px-5 sm:px-8 md:px-10 overflow-hidden justify-end pb-12 md:justify-center md:pb-0"
        style={{ zIndex: 1 }}
      >
        <div className="max-w-xl relative" style={{ zIndex: 10 }}>

          {/* 1. Blurred intro label */}
          <div
            className="mb-5 sm:mb-6 pointer-events-none select-none"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.3,
              fontWeight: 400,
              color: '#000',
              filter: 'blur(4px)',
            }}
          >
            Hey there, meet A.R.I.A,<br />
            Mainframe's Adaptive Response Interface Agent
          </div>

          {/* 2. Typewriter text */}
          <p
            className="text-black mb-5 sm:mb-6"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.35,
              fontWeight: 400,
              minHeight: '54px',
            }}
          >
            {displayed}
            {!done && <span className="cursor-blink" aria-hidden="true" />}
          </p>

          {/* 3. Action pill buttons */}
          <div
            className="flex flex-wrap gap-y-1"
            style={{
              opacity: pillsVisible ? 1 : 0,
              transform: pillsVisible ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
            }}
          >
            {/* 4 white pills */}
            {WHITE_PILLS.map((label) => (
              <button
                key={label}
                className="
                  inline-flex items-center justify-center
                  bg-white text-black
                  border border-black/10
                  rounded-full
                  text-[13px] sm:text-[15px]
                  px-4 sm:px-5 py-[0.3em]
                  mx-[0.2em] mb-[0.4em]
                  whitespace-nowrap
                  hover:bg-black hover:text-white
                  transition-colors duration-200
                "
              >
                {label}
              </button>
            ))}

            {/* 1 outline pill — email */}
            <button
              onClick={handleCopyEmail}
              className="
                inline-flex items-center justify-center
                gap-2 sm:gap-3
                text-white bg-transparent
                border border-white
                rounded-full
                text-[13px] sm:text-[15px]
                px-4 sm:px-5 py-[0.3em]
                mx-[0.2em] mb-[0.4em]
                whitespace-nowrap
                hover:bg-white hover:text-black
                transition-colors duration-200
              "
            >
              <span>
                Reach us:{' '}
                <span className="underline underline-offset-1">
                  {copied ? 'Copied!' : 'hello@mainframe.co'}
                </span>
              </span>
              <CopyIcon />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
