'use client';

import type { GuideMeta, RenderedSection, DbGlossaryEntry, GlossaryEntry } from '@/lib/types';
import { ContentBlockRenderer } from './mobile/ContentBlockRenderer';
import { QuickReference } from './QuickReference';
import { Footer } from './Footer';
import Link from 'next/link';

interface DesktopGuideProps {
  guide: GuideMeta;
  sections: RenderedSection[];
  glossary: DbGlossaryEntry[];
}

function dbGlossaryToEntries(dbEntries: DbGlossaryEntry[]): GlossaryEntry[] {
  return dbEntries.map((e, i) => ({
    term: e.term,
    definition: e.definition,
    step: `Section ${i + 1}`,
    searchTerms: e.searchTerms || '',
    group: e.groupName || undefined,
  }));
}

function DesktopSection({ section, index }: { section: RenderedSection; index: number }) {
  const hasNotes = section.notes.length > 0;

  return (
    <div className={`row${hasNotes ? '' : ' full-width'}`} id={`section-${section.sortOrder}`}>
      <div className="main">
        {section.title && (
          <>
            {index < 20 && <div className="step-tag">Step {index + 1}</div>}
            <h2>{section.title}</h2>
          </>
        )}
        {section.blocks.map((block, i) => (
          <ContentBlockRenderer key={i} block={block} />
        ))}
      </div>
      {hasNotes && (
        <div className="side">
          {section.notes.map((note, i) => (
            <div key={i} className="side-card">
              <span className={`side-card-label ${note.color}`}>{note.label}</span>
              <div dangerouslySetInnerHTML={{ __html: note.html }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DesktopGuide({ guide, sections, glossary }: DesktopGuideProps) {
  const glossaryEntries = dbGlossaryToEntries(glossary);

  return (
    <>
      {/* Hero */}
      <div className="hero">
        {guide.heroImage && (
          <div
            className="hero-bg"
            style={{ '--hero-bg-url': `url(${guide.heroImage})` } as React.CSSProperties}
          />
        )}
        <Link href="/" className="hero-badge">Learn to Play</Link>
        <h1>Learn to Play <em>{guide.title}</em></h1>
        <p className="hero-sub">{guide.subtitle}</p>
        <div className="hero-meta">
          <span>{guide.players} Players</span>
          <span>{guide.time}</span>
          <span>Ages {guide.age}</span>
        </div>
      </div>
      <div className="hero-fade" />

      {/* Custom CSS */}
      {guide.customCss && (
        <style dangerouslySetInnerHTML={{ __html: guide.customCss }} />
      )}

      {/* Sections */}
      <div className="page-wrap">
        {sections.map((section, i) => (
          <DesktopSection key={section.id} section={section} index={i} />
        ))}
      </div>

      {/* Glossary */}
      {glossaryEntries.length > 0 && (
        <QuickReference entries={glossaryEntries} />
      )}

      {/* Footer */}
      <Footer
        title={guide.title}
        year={guide.year}
        designer={guide.designer}
        artist={guide.artist || undefined}
        publisher={guide.publisher}
        publisherUrl={guide.publisherUrl || undefined}
        bggUrl={guide.bggUrl || undefined}
      />
    </>
  );
}
