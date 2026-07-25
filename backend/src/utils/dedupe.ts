// backend/src/utils/dedupe.ts
import * as crypto from 'crypto';

export function generateDedupeKey(domain: string, roleTitle: string, sourceUrl: string): string {
  const normalized = `${domain.toLowerCase()}|${roleTitle.toLowerCase().trim()}|${sourceUrl}`;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}