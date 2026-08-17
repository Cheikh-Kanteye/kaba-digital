import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto("https://3000-ispld7latzn4kjvcu3biz-1f570846.us2.manus.computer/dashboard", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const result = await page.evaluate(() => {
  const selectors = [".dashboard-shell", ".dashboard-sidebar", ".dashboard-main", ".dashboard-header", ".dashboard-content", ".dashboard-welcome"];
  return Object.fromEntries(selectors.map((selector) => {
    const element = document.querySelector(selector);
    if (!element) return [selector, null];
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return [selector, { top: rect.top, left: rect.left, width: rect.width, height: rect.height, display: style.display, position: style.position, marginTop: style.marginTop, paddingTop: style.paddingTop }];
  }));
});
console.log(JSON.stringify(result, null, 2));
await browser.close();
