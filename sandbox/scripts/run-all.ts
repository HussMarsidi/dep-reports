import { execSync } from 'child_process';
import { readdirSync, existsSync, statSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..');
const CLI_PATH = join(ROOT, 'dist', 'cli.js');
const FIXTURES_DIR = join(ROOT, 'sandbox', 'fixtures');
const CACHE_DIR = join(ROOT, '.sandbox-cache');
const CACHE_EXPIRY_DAYS = 7;

async function main() {
  console.log('🔨 Building CLI...');
  execSync('bun run build', { cwd: ROOT, stdio: 'inherit' });

  if (!existsSync(CLI_PATH)) {
    console.error('❌ CLI not found at', CLI_PATH);
    process.exit(1);
  }

  // Check cache age
  if (existsSync(CACHE_DIR)) {
    const timestampFile = join(CACHE_DIR, 'timestamp');
    if (existsSync(timestampFile)) {
      const cacheTime = parseInt(readFileSync(timestampFile, 'utf-8'));
      const ageInDays = (Date.now() - cacheTime) / (1000 * 60 * 60 * 24);
      
      if (ageInDays > CACHE_EXPIRY_DAYS) {
        console.log(`⚠️  Cache is ${Math.floor(ageInDays)} days old, clearing...`);
        rmSync(CACHE_DIR, { recursive: true, force: true });
      }
    }
  }

  console.log('\n🧪 Running sandbox tests...\n');

  const fixtures = readdirSync(FIXTURES_DIR).filter(name => {
    const path = join(FIXTURES_DIR, name);
    return statSync(path).isDirectory() && !name.startsWith('_');
  });

  let passed = 0;
  let failed = 0;

  for (const fixture of fixtures) {
    const fixturePath = join(FIXTURES_DIR, fixture);
    console.log(`📦 Testing: ${fixture}`);

    try {
      // Clean previous runs
      const depReportDir = join(fixturePath, '.dep-report');
      if (existsSync(depReportDir)) {
        rmSync(depReportDir, { recursive: true, force: true });
      }

      // Run init
      execSync(`node "${CLI_PATH}" init`, { 
        cwd: fixturePath,
        stdio: 'pipe'
      });

      // Run audit
      execSync(`node "${CLI_PATH}" audit`, { 
        cwd: fixturePath,
        stdio: 'pipe'
      });

      console.log(`  ✅ ${fixture} completed`);
      passed++;
    } catch (error: any) {
      console.error(`  ❌ ${fixture} failed:`, error.message);
      failed++;
    }

    console.log('');
  }

  console.log('━'.repeat(50));
  console.log(`\n✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n💡 Check logs above for details');
    process.exit(1);
  } else {
    console.log('\n🎉 All sandbox tests passed!');
    console.log('\n📋 Manual validation:');
    console.log('   Open HTML reports and verify:');
    console.log('   - All packages visible');
    console.log('   - Ages display correctly');
    console.log('   - Risk colors visible');
    console.log('   - Layout looks good\n');
  }

  // Save cache timestamp
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(join(CACHE_DIR, 'timestamp'), Date.now().toString());
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
