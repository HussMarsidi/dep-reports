import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { parseJSON } from '../utils/fs.js';
import { logger } from '../utils/logger.js';

/**
 * Notes data structure: package name -> note string
 */
export interface NotesData {
  [packageName: string]: string;
}

/**
 * Loads notes from .dep-report/notes.json
 * Returns empty object if file doesn't exist
 */
export function loadNotes(cwd: string = process.cwd()): NotesData {
  const notesPath = join(cwd, '.dep-report', 'notes.json');

  if (!existsSync(notesPath)) {
    return {};
  }

  try {
    const content = readFileSync(notesPath, 'utf-8');
    const notes = parseJSON<NotesData>(content, notesPath);
    
    // Validate structure (should be object with string values)
    if (typeof notes !== 'object' || notes === null || Array.isArray(notes)) {
      logger.warn('Invalid notes.json format, expected object');
      return {};
    }

    // Validate all values are strings
    for (const [key, value] of Object.entries(notes)) {
      if (typeof value !== 'string') {
        logger.warn(`Invalid note for ${key}, expected string`);
        delete notes[key];
      }
    }

    logger.info(`Loaded ${Object.keys(notes).length} notes from notes.json`);
    return notes;
  } catch (error) {
    logger.warn(`Failed to load notes: ${error instanceof Error ? error.message : String(error)}`);
    return {};
  }
}
