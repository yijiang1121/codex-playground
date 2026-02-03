import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const DEFAULT_URLS = ["https://www.apple.com/"];
const VIEWPORT = { width: 1440, height: 900 };
const OUTPUT_DIR = "screenshots";

const pad = (value: number) => value.toString().padStart(2, "0");

const formatTimestamp = (date: Date) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
};

const sanitizePathname = (pathname: string) => {
  const trimmed = pathname.replace(/\/+$/, "");
  if (trimmed === "" || trimmed === "/") {
    return "";
  }
  return trimmed
    .replace(/^\/+/, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const buildFilename = (url: URL, timestamp: string) => {
  const host = url.hostname;
  const pathPart = sanitizePathname(url.pathname);
  const suffix = pathPart ? `_${pathPart}` : "";
  return `${host}${suffix}_${timestamp}.png`;
};

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const run = async () => {
  const inputUrls = process.argv.slice(2);
  const urls = inputUrls.length > 0 ? inputUrls : DEFAULT_URLS;
  const timestamp = formatTimestamp(new Date());
  const headlessEnv = process.env.HEADLESS;
  const headless = headlessEnv ? headlessEnv.toLowerCase() !== "false" : true;

  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({ viewport: VIEWPORT });
  let failures = 0;

  try {
    for (const rawUrl of urls) {
      let url: URL;
      try {
        url = new URL(rawUrl);
      } catch {
        console.error(`Invalid URL: ${rawUrl}`);
        failures += 1;
        continue;
      }

      const page = await context.newPage();
      try {
        await page.goto(url.toString(), {
          waitUntil: "networkidle",
          timeout: 60000
        });
        const filename = buildFilename(url, timestamp);
        const outputPath = path.join(OUTPUT_DIR, filename);
        await page.screenshot({ path: outputPath, fullPage: true });
        console.log(`Saved ${outputPath}`);
      } catch (error) {
        console.error(
          `Failed to capture ${url.toString()}: ${errorMessage(error)}`
        );
        failures += 1;
      } finally {
        await page.close();
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  if (failures > 0) {
    process.exitCode = 1;
  }
};

run().catch((error) => {
  console.error(`Fatal error: ${errorMessage(error)}`);
  process.exitCode = 1;
});
