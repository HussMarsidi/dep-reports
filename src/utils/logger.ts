/**
 * Simple logger for CLI output
 */
export const logger = {
  info: (message: string) => {
    console.log(`ℹ️  ${message}`);
  },
  success: (message: string) => {
    console.log(`✅ ${message}`);
  },
  warn: (message: string) => {
    console.warn(`⚠️  ${message}`);
  },
  error: (message: string) => {
    console.error(`❌ ${message}`);
  },
  progress: (current: number, total: number, message: string) => {
    process.stdout.write(`\r⏳ ${message} (${current}/${total})`);
    if (current === total) {
      process.stdout.write('\n');
    }
  },
};
