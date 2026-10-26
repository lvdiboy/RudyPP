import type { ReactNode } from 'react';
import styles from './Card.module.css';

export type CardAccent = 'highlight' | 'pink' | 'teal';

type CardProps = {
  /** Color of the band along the card's top edge. */
  accent?: CardAccent;
  /** Element to render, so the card can be an <article>, <li>, etc. */
  as?: 'div' | 'article' | 'li';
  children: ReactNode;
};

export default function Card({ accent = 'highlight', as: Element = 'div', children }: CardProps) {
  return <Element className={`${styles.card} ${styles[accent]}`}>{children}</Element>;
}
