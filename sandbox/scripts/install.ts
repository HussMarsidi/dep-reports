import { execSync } from 'child_process';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..');
const FIXTURES_DIR = join(ROOT, 'sandbox', 'fixtures');

function main() {
  if (!existsSync(FIXTURES_DIR)) {
    console.error('Fixtures directory not found:', FIXTURES_DIR);
    process.exit(1);
  }

  const fixtures = readdirSync(FIXTURES_DIR).filter(name => {
    const path = join(FIXTURES_DIR, name);
    return statSync(path).isDirectory() && !name.startsWith('_');
  });

  for (const fixture of fixtures) {
    const fixturePath = join(FIXTURES_DIR, fixture);
    const packageJsonPath = join(fixturePath, 'package.json');

    if (!existsSync(packageJsonPath)) {
      console.log(`Skipping ${fixture}: no package.json`);
      continue;
    }

    console.log(`📦 Installing dependencies in ${fixture}...`);
    execSync('npm install', { cwd: fixturePath, stdio: 'inherit' });
  }

  console.log('✅ npm install completed for all fixtures');
}

main();
