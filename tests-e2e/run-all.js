const http = require('http');
const path = require('path');
const runTier1Tests = require('./tier1-feature-tests');
const runTier2Tests = require('./tier2-boundary-tests');
const runTier3Tests = require('./tier3-flow-tests');
const runTier4Tests = require('./tier4-workload-tests');
const runTier5Tests = require('./tier5-enhancement-tests');
const runTier6Tests = require('./tier6-inquiry-tests');
const runTier7SocialTests = require('./tier7-social-and-feed-tests');
const runTier7ExpandedTests = require('./tier7-expanded-api-tests');
const runTier8CreatorTests = require('./tier8-creator-expansion-tests');
const { runTier8Tests: runTier8MobileTests } = require('./tier8-mobile-feature-expansion.test');
const runTier9Tests = require('./tier9-universal-business-category-tests');

async function checkServerRunning() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000/health', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function runAll() {
  console.log('====================================================');
  console.log('🚀 MYPROFILE PLATFORM: COMPREHENSIVE E2E TEST SUITE');
  console.log('====================================================');

  let startedServer = null;
  let startedDbDisconnect = null;

  try {
    const isRunning = await checkServerRunning();
    if (!isRunning) {
      console.log('⚡ Backend not running on http://localhost:5000. Launching embedded test server...');
      const app = require(path.resolve(__dirname, '../backend/src/app'));
      const { connectDB, disconnectDB } = require(path.resolve(__dirname, '../backend/src/config/db'));
      await connectDB();
      startedDbDisconnect = disconnectDB;
      await new Promise((resolve) => {
        startedServer = app.listen(5000, () => {
          console.log('✅ Embedded test server listening on http://localhost:5000\n');
          resolve();
        });
      });
    }

    const start = Date.now();
    const t1 = await runTier1Tests();
    const t2 = await runTier2Tests();
    const t3 = await runTier3Tests();
    const t4 = await runTier4Tests();
    const t5 = await runTier5Tests();
    const t6 = await runTier6Tests();
    const t7s = await runTier7SocialTests();
    const t7e = await runTier7ExpandedTests();
    const t8c = await runTier8CreatorTests();
    const t8m = await runTier8MobileTests();
    const t9 = await runTier9Tests();

    const totalPassed =
      t1.passed +
      t2.passed +
      t3.passed +
      t4.passed +
      t5.passed +
      t6.passed +
      t7s.passed +
      t7e.passed +
      t8c.passed +
      t8m.passed +
      t9.passed;

    const totalFailed =
      t1.failed +
      t2.failed +
      t3.failed +
      t4.failed +
      t5.failed +
      t6.failed +
      t7s.failed +
      t7e.failed +
      t8c.failed +
      t8m.failed +
      t9.failed;

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
      if (startedServer) {
        startedServer.close();
      }
      if (startedDbDisconnect) {
        await startedDbDisconnect();
      }
      process.exit(0);
    } else {
      console.error(`\n⚠️ ${totalFailed} tests failed. Please inspect failures above.\n`);
      if (startedServer) {
        startedServer.close();
      }
      if (startedDbDisconnect) {
        await startedDbDisconnect();
      }
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal test runner exception:', error);
    if (startedServer) {
      startedServer.close();
    }
    if (startedDbDisconnect) {
      await startedDbDisconnect();
    }
    process.exit(1);
  }
}

runAll();
