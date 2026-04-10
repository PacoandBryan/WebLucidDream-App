const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8000');

  console.log('Starting Diagnostic...');

  // Answer 30 questions
  for (let i = 0; i < 30; i++) {
    const questionText = await page.innerText('#q-text');
    const domainText = await page.innerText('#q-domain');
    console.log(`Question ${i + 1}: ${questionText} (${domainText})`);
    
    const options = await page.$$('#q-options button');
    if (options.length > 0) {
      await options[0].click();
    } else {
      console.log('No options found!');
      break;
    }
    await page.waitForTimeout(100); // Small delay for UI transition
  }

  // Check if we are in PREVIEW phase
  await page.waitForSelector('#phase-preview.active');
  console.log('Entered Plan Preview phase.');

  const successRate = await page.innerText('#preview-success-rate');
  console.log(`Estimated Success Rate: ${successRate}`);

  const profileItems = await page.$$('#profile-breakdown > div');
  console.log(`Deep Profile Analysis: ${profileItems.length} categories found.`);

  const habitItems = await page.$$('#habit-preview-list > div');
  console.log(`Habit Preview: ${habitItems.length} habits found.`);

  await page.screenshot({ path: 'verification/preview_phase.png' });

  // Proceed to Paywall
  await page.click('button:has-text("[ PROCEED TO DEPLOYMENT ]")');
  await page.waitForSelector('#phase-paywall.active');
  console.log('Entered Paywall phase.');

  await page.screenshot({ path: 'verification/paywall_phase_v11.png' });

  // Unlock Dashboard
  await page.click('button:has-text("Start Your 90-Day Plan")');
  await page.waitForSelector('#phase-dashboard.active', { timeout: 10000 });
  console.log('Entered Dashboard phase.');

  await page.screenshot({ path: 'verification/dashboard_phase_v11.png' });

  await browser.close();
})();
