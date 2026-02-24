'use client';

import { useState } from 'react';

export function ScoringDemo() {
  const [fav, setFav] = useState('red');
  const [card, setCard] = useState('red');
  const [num, setNum] = useState('1');
  const [slot, setSlot] = useState('1');
  const [result, setResult] = useState<{ pts: number; reason: string; color: string } | null>(null);

  function calcScore() {
    if (card === 'idol') {
      setResult({ pts: 2, reason: 'Idols always score 2 points, regardless of position.', color: '#c4882d' });
      return;
    }
    if (card === 'skeleton') {
      setResult({ pts: 0, reason: 'Skeletons are always worth nothing. Replace them!', color: '#e87070' });
      return;
    }

    const colorMatch = card === fav;
    const posMatch = num === slot;
    let pts = 0;
    let reason = '';

    if (colorMatch && posMatch) {
      pts = 3;
      reason = 'Favorite color + correct position = maximum score!';
    } else if (colorMatch && !posMatch) {
      pts = 2;
      reason = `Favorite color, but card #${num} is in slot ${slot} (not matching).`;
    } else if (!colorMatch && posMatch) {
      pts = 1;
      reason = `Not your color, but position matches (card #${num} in slot ${slot}).`;
    } else {
      pts = 0;
      reason = 'Wrong color and wrong position. No points!';
    }

    const color = pts === 3 ? '#7cc98e' : pts === 2 ? '#c4882d' : pts === 1 ? '#7eaee0' : '#e87070';
    setResult({ pts, reason, color });
  }

  const selectStyle: React.CSSProperties = {
    fontFamily: 'var(--font-ui)',
    fontSize: '13px',
    padding: '4px 8px',
    borderRadius: '5px',
    border: '1px solid rgba(245,239,224,0.15)',
    background: 'rgba(245,239,224,0.08)',
    color: 'var(--text-light)',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-ui)',
    fontSize: '10px',
    color: 'rgba(245,239,224,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '4px',
  };

  return (
    <div className="demo">
      <div className="demo-title">Interactive: Score a Card</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={labelStyle}>Favorite Color</div>
          <select value={fav} onChange={e => setFav(e.target.value)} style={selectStyle}>
            <option value="red">Red</option>
            <option value="blue">Blue</option>
            <option value="green">Green</option>
            <option value="yellow">Yellow</option>
            <option value="purple">Purple</option>
            <option value="orange">Orange</option>
          </select>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={labelStyle}>Card Color</div>
          <select value={card} onChange={e => setCard(e.target.value)} style={selectStyle}>
            <option value="red">Red Gem</option>
            <option value="blue">Blue Gem</option>
            <option value="green">Green Gem</option>
            <option value="yellow">Yellow Gem</option>
            <option value="purple">Purple Gem</option>
            <option value="orange">Orange Gem</option>
            <option value="idol">Idol</option>
            <option value="skeleton">Skeleton</option>
          </select>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={labelStyle}>Card Number</div>
          <select value={num} onChange={e => setNum(e.target.value)} style={selectStyle}>
            {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={String(n)}>{n}</option>)}
          </select>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={labelStyle}>Mine Slot</div>
          <select value={slot} onChange={e => setSlot(e.target.value)} style={selectStyle}>
            {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={String(n)}>{n}</option>)}
          </select>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button className="demo-btn" onClick={calcScore}>Calculate Score</button>
      </div>
      {result && (
        <div className="demo-result">
          <span style={{ color: result.color, fontSize: '20px', fontWeight: 700 }}>
            {result.pts} point{result.pts !== 1 ? 's' : ''}
          </span>
          <br />
          {result.reason}
        </div>
      )}
    </div>
  );
}
