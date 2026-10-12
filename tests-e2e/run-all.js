const runTier1Tests = require('./tier1-feature-tests');
const runTier2Tests = require('./tier2-boundary-tests');
const runTier3Tests = require('./tier3-flow-tests');
const runTier4Tests = require('./tier4-workload-tests');
const runTier5Tests = require('./tier5-enhancement-tests');
const runTier6Tests = require('./tier6-inquiry-tests');

async function runAll() {
  console.log('====================================================');
  console.log('🚀 MYPROFILE PLATFORM: COMPREHENSIVE E2E TEST SUITE');
  console.log('====================================================');

  const start = Date.now();
  const t1 = await runTier1Tests();
  const t2 = await runTier2Tests();
  const t3 = await runTier3Tests();
  const t4 = await runTier4Tests();
  const t5 = await runTier5Tests();
  const t6 = await runTier6Tests();

  const totalPassed = t1.passed + t2.passed + t3.passed + t4.passed + t5.passed + t6.passed;
  const totalFailed = t1.failed + t2.failed + t3.failed + t4.failed + t5.failed + t6.failed;
  const duration = ((Date.now() - start) / 1000).toFixed(2);

  console.log('====================================================');
  console.log('📊 FINAL TEST RESULTS REPORT');
  console.log('====================================================');
  console.log(`Total Test Cases Executed: ${totalPassed + totalFailed}`);
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`⏱️ Duration: ${duration}s`);

  if (totalFailed === 0) {
    console.log('\n🎉 ALL 100% OF E2E TEST SUITES PASSED CLEANLY!\n');
    process.exit(0);
  } else {
    console.error(`\n⚠️ ${totalFailed} tests failed. Please inspect failures above.\n`);
    process.exit(1);
  }
}

runAll();
