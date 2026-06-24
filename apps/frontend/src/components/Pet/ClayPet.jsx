import React from 'react';

export function ClayPet({ stats }) {
  const { hunger, energy, happiness } = stats;
  
  let state = 'neutral';
  if (energy < 30) state = 'tired';
  else if (hunger < 40) state = 'hungry';
  else if (happiness > 60) state = 'happy';
  else if (happiness < 30) state = 'sad';
  
  // A soft blob shape for the pet
  const blobPaths = {
    happy: "M45.5,15.5 C60.5,5.5 85.5,10.5 90.5,30.5 C95.5,50.5 80.5,85.5 50.5,90.5 C20.5,95.5 5.5,70.5 10.5,45.5 C15.5,20.5 30.5,25.5 45.5,15.5 Z",
    neutral: "M40.5,10.5 C60.5,15.5 80.5,10.5 85.5,35.5 C90.5,60.5 85.5,85.5 50.5,85.5 C15.5,85.5 10.5,60.5 15.5,35.5 C20.5,10.5 20.5,5.5 40.5,10.5 Z",
    tired: "M35.5,25.5 C65.5,20.5 85.5,25.5 90.5,45.5 C95.5,65.5 80.5,75.5 50.5,75.5 C20.5,75.5 5.5,65.5 10.5,45.5 C15.5,25.5 5.5,30.5 35.5,25.5 Z",
    hungry: "M50.5,10.5 C75.5,5.5 95.5,20.5 95.5,50.5 C95.5,80.5 75.5,95.5 50.5,95.5 C25.5,95.5 5.5,80.5 5.5,50.5 C5.5,20.5 25.5,15.5 50.5,10.5 Z",
    sad: "M50.5,20.5 C70.5,5.5 85.5,25.5 90.5,50.5 C95.5,75.5 70.5,95.5 50.5,90.5 C30.5,85.5 5.5,75.5 10.5,50.5 C15.5,25.5 30.5,35.5 50.5,20.5 Z"
  };

  const colors = {
    happy: "#fbcfe8", // pink
    neutral: "#c7d2fe", // indigo
    tired: "#e2e8f0", // slate
    hungry: "#fde68a", // yellow
    sad: "#bfdbfe" // blue
  };
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '250px' }}>
      <svg className="clay-svg-filter" viewBox="0 0 100 100" width="200" height="200" style={{ overflow: 'visible' }}>
        <path d={blobPaths[state]} fill={colors[state]} style={{ transition: 'all 0.5s ease' }} />
        {/* Eyes */}
        <circle cx="35" cy="40" r="4" fill="#334155" />
        <circle cx="65" cy="40" r="4" fill="#334155" />
        
        {/* Mouths */}
        {state === 'happy' && <path d="M40 55 Q 50 65 60 55" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" />}
        {state === 'neutral' && <path d="M45 55 L 55 55" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" />}
        {state === 'sad' && <path d="M40 60 Q 50 50 60 60" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" />}
        {state === 'hungry' && <circle cx="50" cy="55" r="4" fill="#334155" />}
        {state === 'tired' && <path d="M45 55 Q 50 50 55 55" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" />}
      </svg>
    </div>
  );
}
