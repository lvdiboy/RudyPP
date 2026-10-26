import ButtonLink from '../../../components/ui/Button/ButtonLink.tsx';
import Card from '../../../components/ui/Card/Card.tsx';
import { useI18n } from '../../../i18n/useI18n.ts';
import styles from './LearningPage.module.css';
import TokenPlayground from './TokenPlayground.tsx';
import { learningTopics, sampleJournalEntries } from './learningContent.ts';

const STACK = ['Java 25', 'Spring Boot 3.5', 'Spring Security', 'MySQL', 'Redis', 'React'];

/** The front-end learning module: topics, sample journal, project and the token playground. */
export default function LearningPage() {
  const { t, locale } = useI18n();
  const d = t.learning;
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' });

  return (
    // Keeps the original lab look inside the workspace (its own tokens, not the workspace theme)
    <div className={styles.lab}>
      <title>{d.title}</title>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <h1 id="hero-title" className={styles.heroTitle}>
              {d.heading}
            </h1>
            <p className={styles.lead}>{d.lead}</p>
            <div className={styles.actions}>
              <ButtonLink href="#journal">{d.readJournal}</ButtonLink>
              <ButtonLink href="#playground" variant="secondary">
                {d.tryPlayground}
              </ButtonLink>
            </div>
          </div>

          <div className={styles.board}>
            {/* Decorative stickers pinned around the note; hidden from screen readers */}
            <span className={`${styles.sticker} ${styles.stickerTsx}`} aria-hidden>
              {'<TSX />'}
            </span>
            <span className={`${styles.sticker} ${styles.stickerState}`} aria-hidden>
              useState()
            </span>
            <span className={`${styles.sticker} ${styles.stickerToken}`} aria-hidden>
              --tokens
            </span>
            <span className={`${styles.sticker} ${styles.stickerJwt}`} aria-hidden>
              JWT ✓
            </span>

            <aside className={styles.note} aria-labelledby="now-building">
              <h2 id="now-building" className={styles.noteTitle}>
                {d.nowBuilding}
              </h2>
              <p className={styles.noteMilestone}>{d.milestone}</p>
              <ul className={styles.checklist}>
                <li>
                  <span className={styles.status}>{d.statusDone}</span> {d.checklist.routing}
                </li>
                <li>
                  <span className={styles.status}>{d.statusDone}</span> {d.checklist.login}
                </li>
                <li>
                  <span className={`${styles.status} ${styles.statusNext}`}>{d.statusNext}</span>{' '}
                  {d.checklist.signUp}
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      <section id="topics" className={styles.section} aria-labelledby="topics-title">
        <h2 id="topics-title" className={styles.sectionTitle}>
          {d.topicsHeading}
        </h2>
        <ul className={styles.topicGrid}>
          {learningTopics.map((topic) => (
            <Card key={topic.id} as="li" accent={topic.accent}>
              <h3 className={styles.cardTitle}>{d.topics[topic.id].title}</h3>
              <p>{d.topics[topic.id].summary}</p>
            </Card>
          ))}
        </ul>
      </section>

      <section id="journal" className={styles.section} aria-labelledby="journal-title">
        <h2 id="journal-title" className={styles.sectionTitle}>
          {d.journalHeading}
        </h2>
        <p className={styles.sectionIntro}>{d.journalIntro}</p>
        <ol className={styles.journal}>
          {sampleJournalEntries.map((entry) => (
            <li key={entry.id}>
              <article className={styles.entry}>
                <div className={styles.entryMeta}>
                  <time dateTime={entry.date}>{dateFormat.format(new Date(entry.date))}</time>
                  <span className={styles.sampleTag}>{d.sampleTag}</span>
                </div>
                <h3 className={styles.entryTitle}>{d.entries[entry.id].title}</h3>
                <p className={styles.entryExcerpt}>{d.entries[entry.id].excerpt}</p>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section id="project" className={styles.section} aria-labelledby="project-title">
        <h2 id="project-title" className={styles.sectionTitle}>
          {d.projectHeading}
        </h2>
        <article className={styles.project}>
          <h3 className={styles.projectName}>RudyPP</h3>
          <p className={styles.projectSummary}>{d.projectSummary}</p>
          <ul className={styles.stack} aria-label={d.stackLabel}>
            {STACK.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        </article>
      </section>

      <section id="playground" className={styles.section} aria-labelledby="playground-title">
        <h2 id="playground-title" className={styles.sectionTitle}>
          {d.playgroundHeading}
        </h2>
        <p className={styles.sectionIntro}>{d.playgroundIntro}</p>
        <TokenPlayground />
      </section>
    </div>
  );
}
