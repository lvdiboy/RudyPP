import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useI18n } from '../../i18n/useI18n.ts';
import styles from './OceanHome.module.css';

type OceanHomeProps = {
  /** A Vite-imported asset (see HomePage), so the built file name and path are always right. */
  photoUrl: string;
  name?: string;
  /** Top-right corner of the header: the language switch and the Log in button / user menu. */
  headerActions?: ReactNode;
};

// Structure only; each chapter's text is in the i18n dictionaries under home.chapters
const chapters = [
  { id: 'build', number: '01', color: 'blue' },
  { id: 'keep', number: '02', color: 'sand' },
  { id: 'see', number: '03', color: 'green' },
] as const;

type ChapterId = (typeof chapters)[number]['id'];

// Lucide icons, the project's icon set; sizes per placement are set in the CSS module
function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  const Icon = diagonal ? ArrowUpRight : ArrowRight;
  return <Icon className={styles.arrow} size={22} strokeWidth={1.5} aria-hidden />;
}

export default function OceanHome({ photoUrl, name = 'Rudy', headerActions }: OceanHomeProps) {
  const { t } = useI18n();
  const h = t.home;
  const heroRef = useRef<HTMLElement>(null);
  const [motionPaused, setMotionPaused] = useState(false);
  const [openChapter, setOpenChapter] = useState<ChapterId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const selected = openChapter ? h.chapters[openChapter] : null;

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || motionPaused) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(pointer: fine)');
    let frame = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      hero.style.setProperty('--look-x', '0px');
      hero.style.setProperty('--look-y', '0px');
      // At rest the photo is shown whole, unzoomed
      hero.style.setProperty('--look-zoom', '1');
    };
    const move = (event: PointerEvent) => {
      if (query.matches || !finePointer.matches) return;
      const bounds = hero.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        hero.style.setProperty('--look-x', `${x * 12}px`);
        hero.style.setProperty('--look-y', `${y * 8}px`);
        // Zoom in just enough to hide the edges while the photo shifts by at most ±6px / ±4px
        hero.style.setProperty('--look-zoom', '1.012');
      });
    };
    hero.addEventListener('pointermove', move);
    hero.addEventListener('pointerleave', reset);
    query.addEventListener('change', reset);
    return () => {
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', reset);
      query.removeEventListener('change', reset);
      reset();
    };
  }, [motionPaused]);

  useEffect(() => {
    if (!openChapter) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenChapter(null);
      // The close button is the only focusable element in this small dialog.
      if (event.key === 'Tab') {
        event.preventDefault();
        closeRef.current?.focus();
      }
    };
    document.addEventListener('keydown', keyboard);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', keyboard);
      openerRef.current?.focus();
    };
  }, [openChapter]);

  return (
    <div className={`${styles.page} ${motionPaused ? styles.paused : ''}`}>
      <a href="#main" className={styles.skip}>
        {t.common.skipToContent}
      </a>
      <header className={styles.header}>
        <a className={styles.brand} href="#main" aria-label={h.brandLabel(name)}>
          {name}
          <span>®</span>
        </a>
        <span className={styles.headerNote}>{h.headerNote}</span>
        <button
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-controls="ocean-nav"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? h.menuClose : h.menuOpen}
          <span>{menuOpen ? '−' : '+'}</span>
        </button>
        <nav
          id="ocean-nav"
          aria-label={h.navLabel}
          className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}
        >
          <a href="#explore" onClick={() => setMenuOpen(false)}>
            {h.navExplore} <span>01</span>
          </a>
          <a href="#about" onClick={() => setMenuOpen(false)}>
            {h.navAbout} <span>02</span>
          </a>
          <a className={styles.navCta} href="#explore" onClick={() => setMenuOpen(false)}>
            {h.navCta} <Arrow diagonal />
          </a>
        </nav>
        {headerActions && <div className={styles.headerActions}>{headerActions}</div>}
      </header>

      <main id="main" tabIndex={-1}>
        <section ref={heroRef} className={styles.hero} aria-labelledby="ocean-title">
          <img
            className={styles.heroPhoto}
            src={photoUrl}
            alt={h.photoAlt}
            fetchPriority="high"
            decoding="async"
          />
          <div className={styles.photoShade} />
          <div className={styles.heroTop}>
            <span>
              <i /> {h.heroTag(name)}
            </span>
            <span>{h.heroMotto}</span>
          </div>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{h.greeting(name)}</p>
            <h1 id="ocean-title">
              {h.titleLine1}
              <br />
              {h.titleLead}
              <span className={styles.further}>
                {h.titleEmphasis}
                <svg viewBox="0 0 420 35" fill="none" aria-hidden="true">
                  <path d="M6 24C102 3 278 2 411 14M55 31c96-13 244-14 329-9" />
                </svg>
              </span>
              <span className={styles.period}>{h.titleEnd}</span>
            </h1>
            <p className={styles.heroIntro}>
              {h.introLine1}
              <br />
              {h.introLine2}
            </p>
            <a href="#explore" className={styles.exploreButton}>
              {h.exploreCta} <Arrow />
            </a>
          </div>
          <div className={styles.photoCaption}>
            <span className={styles.captionLine} />
            <p>
              {h.captionLine1}
              <br />
              {h.captionLine2}
            </p>
          </div>
          <div className={styles.heroBottom}>
            <a href="#explore" className={styles.scrollHint}>
              <span className={styles.scrollLine} />
              {h.scrollHint} {h.scrollHintSub && <span>{h.scrollHintSub}</span>}
            </a>
            <button
              className={styles.motionButton}
              aria-pressed={motionPaused}
              onClick={() => setMotionPaused(!motionPaused)}
            >
              <span aria-hidden="true">{motionPaused ? '▷' : 'Ⅱ'}</span>
              {motionPaused ? h.playMotion : h.pauseMotion}
            </button>
          </div>
        </section>

        <section id="explore" className={styles.explore} aria-labelledby="explore-title">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>{h.exploreEyebrow}</p>
            <div>
              <h2 id="explore-title">{h.exploreTitle}</h2>
              <p>{h.exploreText}</p>
            </div>
            <span className={styles.sectionMark}>↘</span>
          </div>
          <div className={styles.chapters}>
            {chapters.map((chapter) => {
              const text = h.chapters[chapter.id];
              return (
                <button
                  key={chapter.id}
                  className={`${styles.chapter} ${styles[chapter.color]}`}
                  aria-haspopup="dialog"
                  onClick={(event) => {
                    openerRef.current = event.currentTarget;
                    setOpenChapter(chapter.id);
                  }}
                >
                  <div className={styles.chapterTop}>
                    <span>
                      {chapter.number} / {text.tag}
                    </span>
                    <Arrow diagonal />
                  </div>
                  <h3>
                    {text.title}
                    <span>{h.chapterEnd}</span>
                  </h3>
                  <p>{text.text}</p>
                  <div className={styles.chapterFoot}>
                    {text.detail}
                    <span>{h.viewIdea}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section id="about" className={styles.about} aria-labelledby="about-title">
          <span className={styles.aboutSymbol} aria-hidden="true">
            ✳
          </span>
          <div>
            <p className={styles.eyebrow}>{h.aboutEyebrow}</p>
            <h2 id="about-title">
              {h.aboutTitleLine1(name)}
              <br />
              {h.aboutTitleLine2}
            </h2>
            <p>
              {h.aboutTextLine1}
              <br className={styles.desktopBreak} />
              {h.aboutTextLine2}
            </p>
          </div>
          <a href="#main" className={styles.backTop} aria-label={h.backToTop}>
            ↑
          </a>
        </section>
      </main>
      <footer className={styles.footer}>
        <span>{h.footerTag(name)}</span>
        <span>{h.footerMotto}</span>
        <a href="#main">{h.footerBackToTop}</a>
      </footer>
      {selected && (
        <div
          className={styles.dialogBackdrop}
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpenChapter(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="chapter-dialog-title"
            aria-describedby="chapter-dialog-description"
            className={styles.dialog}
          >
            <p className={styles.eyebrow}>
              {selected.tag} / {selected.detail}
            </p>
            <h2 id="chapter-dialog-title">{h.dialogTitle(selected.title)}</h2>
            <p id="chapter-dialog-description">{h.dialogText(selected.detail)}</p>
            <button ref={closeRef} onClick={() => setOpenChapter(null)}>
              {h.dialogClose} <Arrow />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
