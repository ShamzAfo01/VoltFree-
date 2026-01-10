
import React from 'react';

interface CircuitDiagramProps {
  vin: string;
  vout: string;
  r1: string;
  r2: string;
}

const CircuitDiagram: React.FC<CircuitDiagramProps> = ({ vin, vout, r1, r2 }) => {
  const textColor = "#474747";
  const primaryColor = "#0038df";

  return (
    <div className="flex justify-center items-center py-6">
      <svg width="200" height="280" viewBox="0 0 240 320" className="opacity-90">
        {/* Input line */}
        <line x1="120" y1="20" x2="120" y2="60" stroke={textColor} strokeWidth="2" />
        <circle cx="120" cy="20" r="3" fill={textColor} />
        <text x="130" y="25" fontSize="12" fontWeight="700" fill={primaryColor}>{vin}V</text>

        {/* R1 Zigzag */}
        <path d="M120,60 L120,70 L110,75 L130,85 L110,95 L130,105 L110,115 L120,120 L120,130" fill="none" stroke={textColor} strokeWidth="2" />
        <text x="140" y="100" fontSize="12" fontWeight="600" fill={textColor}>R1: {r1}</text>

        {/* Junction */}
        <circle cx="120" cy="160" r="4" fill={textColor} />
        <line x1="120" y1="130" x2="120" y2="190" stroke={textColor} strokeWidth="2" />
        
        {/* Vout branch */}
        <line x1="120" y1="160" x2="180" y2="160" stroke={textColor} strokeWidth="2" />
        <circle cx="180" cy="160" r="3" fill={textColor} />
        <text x="185" y="155" fontSize="12" fontWeight="700" fill={primaryColor}>{vout}V</text>

        {/* R2 Zigzag */}
        <path d="M120,190 L120,200 L110,205 L130,215 L110,225 L130,235 L110,245 L120,250 L120,260" fill="none" stroke={textColor} strokeWidth="2" />
        <text x="140" y="230" fontSize="12" fontWeight="600" fill={textColor}>R2: {r2}</text>

        {/* GND */}
        <line x1="120" y1="260" x2="120" y2="290" stroke={textColor} strokeWidth="2" />
        <line x1="100" y1="290" x2="140" y2="290" stroke={textColor} strokeWidth="2" />
        <line x1="110" y1="298" x2="130" y2="298" stroke={textColor} strokeWidth="2" />
        <line x1="118" y1="306" x2="122" y2="306" stroke={textColor} strokeWidth="2" />
      </svg>
    </div>
  );
};

export default CircuitDiagram;
