/**
 * ANSI color codes for terminal output
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Spinner frames for loading indicators
 */
const spinnerFrames = ['-', '\\', '|', '/'];
let spinnerInterval: NodeJS.Timeout | null = null;
let spinnerMessage = '';

/**
 * Simple logger for CLI output with enhanced UX
 */
export const logger = {
  info: (message: string) => {
    console.log(`${colors.cyan}[INFO]${colors.reset} ${message}`);
  },
  success: (message: string) => {
    console.log(`${colors.green}${colors.bright}[OK]${colors.reset} ${colors.green}${message}${colors.reset}`);
  },
  warn: (message: string) => {
    console.warn(`${colors.yellow}[WARN]${colors.reset} ${message}`);
  },
  error: (message: string) => {
    console.error(`${colors.red}${colors.bright}[ERR]${colors.reset} ${colors.red}${message}${colors.reset}`);
  },
  progress: (current: number, total: number, message: string) => {
    const percentage = Math.round((current / total) * 100);
    process.stdout.write(`\r${colors.cyan}${message}${colors.reset} ${colors.dim}(${current}/${total}, ${percentage}%)${colors.reset}`);
    if (current === total) {
      process.stdout.write('\n');
    }
  },
  startSpinner: (message: string) => {
    spinnerMessage = message;
    let frameIndex = 0;
    spinnerInterval = setInterval(() => {
      process.stdout.write(`\r${colors.cyan}${spinnerFrames[frameIndex]}${colors.reset} ${spinnerMessage}`);
      frameIndex = (frameIndex + 1) % spinnerFrames.length;
    }, 100);
  },
  stopSpinner: () => {
    if (spinnerInterval) {
      clearInterval(spinnerInterval);
      spinnerInterval = null;
      process.stdout.write('\r' + ' '.repeat(process.stdout.columns || 80) + '\r');
    }
  },
};
