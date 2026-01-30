import type { EnrichedPackage } from '../types/index.js';
import type { NotesData } from './loader.js';

/**
 * Merges notes from notes.json into enriched packages
 */
export function mergeNotes(
  packages: EnrichedPackage[],
  notes: NotesData
): EnrichedPackage[] {
  return packages.map(pkg => {
    const note = notes[pkg.name];
    if (note) {
      return {
        ...pkg,
        note,
      };
    }
    return pkg;
  });
}
