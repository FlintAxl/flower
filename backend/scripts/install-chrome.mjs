import path from 'node:path';
import { install, Browser, detectBrowserPlatform } from '@puppeteer/browsers';

const buildId = process.env.PUPPETEER_BUILD_ID || 'stable';
const cacheDir =
  process.env.PUPPETEER_CACHE_DIR ||
  path.resolve(process.cwd(), '.puppeteer-cache');

async function main() {
  try {
    const platform = detectBrowserPlatform();
    if (!platform) {
      throw new Error('Unsupported platform. Cannot determine browser binary.');
    }

    console.log(
      `Installing Chrome (${buildId}) for platform ${platform} into ${cacheDir}`
    );

    const result = await install({
      browser: Browser.CHROME,
      buildId,
      cacheDir,
      platform,
      downloadProgressCallback: 'default',
    });

    console.log(`Chrome installed at ${result.path}`);
  } catch (error) {
    console.error('Failed to install Chrome for Puppeteer:', error);
    process.exit(1);
  }
}

main();

