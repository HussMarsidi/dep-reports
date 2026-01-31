import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const FIXTURES_DIR = join(__dirname, '..', 'fixtures');

function validateFixture(fixtureName: string): boolean {
  const fixturePath = join(FIXTURES_DIR, fixtureName);
  const reportsDir = join(fixturePath, '.dep-report', 'reports');

  console.log(`\n🔍 Validating ${fixtureName}...`);

  // Check reports directory exists
  if (!existsSync(reportsDir)) {
    console.error('  ❌ Reports directory not found');
    return false;
  }

  // Get latest reports
  const files = readdirSync(reportsDir);
  const htmlFiles = files.filter(f => f.endsWith('.html'));
  const jsonFiles = files.filter(f => f.endsWith('.json'));

  if (htmlFiles.length === 0) {
    console.error('  ❌ No HTML reports found');
    return false;
  }

  if (jsonFiles.length === 0) {
    console.error('  ❌ No JSON reports found');
    return false;
  }

  // Validate HTML content
  const latestHtml = htmlFiles.sort().reverse()[0];
  const htmlContent = readFileSync(join(reportsDir, latestHtml), 'utf-8');

  const expectedPackages = [
    'lodash', 'express', 'axios', 'commander', 'chalk',
    '@types/node', 'typescript', 'prettier', 'eslint', 'vitest'
  ];

  let missingPackages = 0;
  for (const pkg of expectedPackages) {
    if (!htmlContent.includes(pkg)) {
      console.error(`  ❌ Package not found: ${pkg}`);
      missingPackages++;
    }
  }

  if (missingPackages > 0) {
    return false;
  }

  // Check for age information
  if (!/\d+[ymd]/.test(htmlContent)) {
    console.error('  ❌ Age information not found');
    return false;
  }

  // Check for risk indicators
  if (!htmlContent.includes('Major') && !htmlContent.includes('Minor')) {
    console.error('  ❌ Risk indicators not found');
    return false;
  }

  console.log('  ✅ Validation passed');
  return true;
}

async function main() {
  console.log('🔍 Validating sandbox reports...');

  const fixtures = readdirSync(FIXTURES_DIR).filter(name => {
    const path = join(FIXTURES_DIR, name);
    return !name.startsWith('_') && existsSync(join(path, 'package.json'));
  });

  let allPassed = true;
  for (const fixture of fixtures) {
    if (!validateFixture(fixture)) {
      allPassed = false;
    }
  }

  console.log('\n' + '━'.repeat(50));
  
  if (allPassed) {
    console.log('\n✅ All validations passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some validations failed');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
