/**
 * Simple logger for CLI output
 */
export const logger = {
  info: (message: string) => {
    console.log(`[INFO] ${message}`);
  },
  success: (message: string) => {
    console.log(`[OK] ${message}`);
  },
  warn: (message: string) => {
    console.warn(`[WARN] ${message}`);
  },
  error: (message: string) => {
    console.error(`[ERROR] ${message}`);
  },
  progress: (current: number, total: number, message: string) => {
    process.stdout.write(`\r${message} (${current}/${total})`);
    if (current === total) {
      process.stdout.write('\n');
    }
  },
};
