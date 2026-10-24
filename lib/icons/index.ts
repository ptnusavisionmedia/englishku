import { ICON_IMAGES } from '@/lib/icons/icon-images';

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const pick = (name: string) => (ICON_IMAGES[name] ? name : 'question');

export const hasIcon = (name: string) => !!ICON_IMAGES[name];

/** Illustration for a vocabulary word, e.g. "Teddy bear" -> word-teddy-bear. */
export const wordIcon = (word: string) => pick(`word-${slug(word)}`);

/** Illustration for a theme, e.g. "Body Parts" -> cat-body-parts. */
export const categoryIcon = (name: string) => pick(`cat-${slug(name)}`);

/** Icon for an achievement badge, e.g. "3-Day Learner" -> badge-3-day-learner. */
export const badgeIcon = (name: string) => pick(`badge-${slug(name)}`);

export const avatarIcon = (key: string | null | undefined) => pick(`avatar-${key ?? 'bear'}`);

export { ICON_IMAGES };
