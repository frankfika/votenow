import { chromium } from "playwright";
import { setTimeout as sleep } from "timers/promises";

const BASE_URL = process.env.SITE_URL || "http://localhost:3000";

const screenshots = [
  { path: "dashboard.png", url: "/", name: "仪表盘" },
  { path: "proposal.png", url: "/", name: "提案详情" },
  { path: "vote.png", url: "/", name: "投票面板" },
  { path: "leaderboard.png", url: "/", name: "排行榜" },
  { path: "rewards.png", url: "/", name: "奖励商城" },
];

async function captureScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  console.log(`Starting screenshot capture for ${BASE_URL}`);

  for (const screenshot of screenshots) {
    try {
      console.log(`Capturing ${screenshot.name} (${screenshot.url})...`);
      await page.goto(`${BASE_URL}${screenshot.url}`, {
        waitUntil: "networkidle",
        timeout: 30000,
      });
      await sleep(2000);

      await page.screenshot({
        path: `docs/assets/${screenshot.path}`,
        fullPage: false,
      });
      console.log(`  ✓ Saved ${screenshot.path}`);
    } catch (error) {
      console.error(`  ✗ Failed to capture ${screenshot.name}:`, error.message);
    }
  }

  await browser.close();
  console.log("Screenshot capture complete!");
}

captureScreenshots().catch(console.error);
