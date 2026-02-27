'use client';

import { useState, useCallback } from 'react';
import type { ContentBlock } from '@/lib/types';
import { QuizCard } from './QuizCard';
import { DiceRoller } from '../DiceRoller';
import { SequenceSort } from '../SequenceSort';
import { SpotTheError } from '../SpotTheError';
import { ScenarioChallenge } from '../ScenarioChallenge';
import { MatchUp } from '../MatchUp';
import { Lightbox } from './Lightbox';

interface ContentBlockRendererProps {
  block: ContentBlock;
}

export function ContentBlockRenderer({ block }: ContentBlockRendererProps) {
  const [lightboxHtml, setLightboxHtml] = useState<string | null>(null);

  // Handle clicks on images inside rendered HTML (event delegation)
  const handleHtmlClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Check if user clicked an <img> or an element inside an SVG
    if (target.tagName === 'IMG') {
      e.preventDefault();
      setLightboxHtml(`<img src="${(target as HTMLImageElement).src}" alt="${(target as HTMLImageElement).alt || ''}" />`);
    }
  }, []);

  const openLightbox = useCallback((html: string) => {
    setLightboxHtml(html);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxHtml(null);
  }, []);

  return (
    <>
      {lightboxHtml && <Lightbox html={lightboxHtml} onClose={closeLightbox} />}
      <ContentBlockInner
        block={block}
        onHtmlClick={handleHtmlClick}
        onOpenLightbox={openLightbox}
      />
    </>
  );
}

interface ContentBlockInnerProps {
  block: ContentBlock;
  onHtmlClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onOpenLightbox: (html: string) => void;
}

function ContentBlockInner({ block, onHtmlClick, onOpenLightbox }: ContentBlockInnerProps) {
  switch (block.type) {
    case 'html':
      return <div className="cb-html" dangerouslySetInnerHTML={{ __html: block.html }} onClick={onHtmlClick} />;

    case 'callout':
      return (
        <div className={`cb-callout cb-callout-${block.style}`}>
          <div dangerouslySetInnerHTML={{ __html: block.html }} onClick={onHtmlClick} />
        </div>
      );

    case 'table':
      return (
        <div className="cb-table-wrap">
          <table className="cb-table">
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i} dangerouslySetInnerHTML={{ __html: h }} />
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} dangerouslySetInnerHTML={{ __html: cell }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'quiz':
      return <QuizCard questions={block.questions} />;

    case 'flow':
      return (
        <div className="cb-flow">
          {block.items.map((item, i) => (
            <span key={i}>
              {i > 0 && <span className="cb-flow-arrow">→</span>}
              <span className="cb-flow-item">{item}</span>
            </span>
          ))}
        </div>
      );

    case 'diagram':
      return (
        <div
          className="cb-diagram"
          dangerouslySetInnerHTML={{ __html: block.svg }}
          onClick={() => onOpenLightbox(block.svg)}
        />
      );

    case 'strip':
      return (
        <div className="cb-strip">
          {block.items.map((item, i) => (
            <div key={i} className="cb-strip-item">
              <span className="cb-strip-num">{item.num}</span>
              <span className="cb-strip-label">{item.label}</span>
            </div>
          ))}
        </div>
      );

    case 'styled-html':
      return <div className="cb-styled" dangerouslySetInnerHTML={{ __html: block.html }} onClick={onHtmlClick} />;

    case 'dice-roller':
      return <DiceRoller />;

    case 'sequence-sort':
      return <SequenceSort items={block.items} title={block.title} description={block.description} explanation={block.explanation} />;

    case 'spot-the-error':
      return <SpotTheError scenario={block.scenario} statements={block.statements} title={block.title} />;

    case 'scenario-challenge':
      return <ScenarioChallenge scenario={block.scenario} choices={block.choices} title={block.title} />;

    case 'match-up':
      return <MatchUp pairs={block.pairs} title={block.title} description={block.description} explanation={block.explanation} />;

    case 'grid-visual':
      return (
        <div
          className="cb-grid-visual"
          dangerouslySetInnerHTML={{ __html: block.html }}
          onClick={() => onOpenLightbox(block.html)}
        />
      );

    default:
      return null;
  }
}
