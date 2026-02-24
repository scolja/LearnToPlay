'use client';

import { useState } from 'react';

const FACES = [
  { icon: '⏱', label: 'Time', color: '#4a8fbf' },
  { icon: '❤', label: 'Morale', color: '#d4802a' },
  { icon: '🛡', label: 'Health', color: '#c94444' },
  { icon: '⚠', label: 'Setback', color: '#888' },
  { icon: '·', label: 'Blank', color: '#555' },
  { icon: '·', label: 'Blank', color: '#555' },
];

interface DieResult {
  icon: string;
  label: string;
  color: string;
}

export function DiceRoller() {
  const [dice, setDice] = useState<DieResult[]>([
    { icon: '?', label: '', color: 'rgba(245,239,224,0.4)' },
    { icon: '?', label: '', color: 'rgba(245,239,224,0.4)' },
    { icon: '?', label: '', color: 'rgba(245,239,224,0.4)' },
  ]);
  const [results, setResults] = useState<DieResult[]>([]);

  function roll() {
    const rolled = [0, 1, 2].map(() => FACES[Math.floor(Math.random() * FACES.length)]);
    setDice(rolled);
    setResults(rolled);
  }

  function describeResult(face: DieResult) {
    if (face.label === 'Blank') return `${face.icon} Blank — no effect, discard this die`;
    if (face.label === 'Setback') return `${face.icon} Setback — must place on a setback slot`;
    return `${face.icon} ${face.label} — place on a slot or lose 1 ${face.label.toLowerCase()}`;
  }

  const dieStyle: React.CSSProperties = {
    width: '68px',
    height: '68px',
    borderRadius: '10px',
    background: '#2c2c2c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    transition: 'all 0.2s',
  };

  return (
    <div className="diagram" style={{ background: 'var(--bg-dark)' }}>
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '12px',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        color: 'var(--gold)',
        marginBottom: '1.2rem',
      }}>
        Interactive: Challenge Dice Roll
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
        minHeight: '72px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        {dice.map((die, i) => (
          <div
            key={i}
            style={{
              ...dieStyle,
              borderColor: die.color,
              color: die.color,
              border: `2.5px solid ${die.label ? die.color : 'rgba(255,255,255,0.12)'}`,
            }}
          >
            {die.icon}
          </div>
        ))}
      </div>
      <button
        onClick={roll}
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '14px',
          fontWeight: 600,
          padding: '0.6rem 1.8rem',
          borderRadius: '6px',
          border: '2px solid var(--gold)',
          background: 'transparent',
          color: 'var(--gold)',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        Roll 3 Dice
      </button>
      {results.length > 0 && (
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '14px',
          color: 'rgba(245,239,224,0.6)',
          marginTop: '1rem',
          lineHeight: 1.5,
        }}>
          {results.map((face, i) => (
            <div key={i} style={{ color: face.color, marginBottom: '0.3rem' }}>
              {describeResult(face)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
