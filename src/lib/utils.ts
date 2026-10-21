import { clsx, type ClassValue } from 'clsx';

// shadcn's `cn`, without tailwind-merge: it would add ~10 kB gzip to every
// island, and these components never pass conflicting utilities.
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
