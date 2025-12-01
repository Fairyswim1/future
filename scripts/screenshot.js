import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public', 'thumbnails');

// 썸네일을 생성할 사이트 목록
const sites = [
  {
    id: 1,
    name: '수식양궁',
    url: 'https://yang-fbb84.web.app/',
    filename: 'game1-yang.png'
  },
  {
    id: 2,
    name: '멀린게임',
    url: 'https://shrek7979.github.io/merlin_game/',
    filename: 'game2-merlin.png'
  },
  {
    id: 3,
    name: '구구단게임',
    url: 'https://gugudan-376f6.web.app/',
    filename: 'game3-gugudan.png'
  },
  {
    id: 4,
    name: '확률실험기',
    url: 'https://shrek7979.github.io/e_Tester/',
    filename: 'sim1-probability.png'
  },
  {
    id: 5,
    name: '증명순서맞추기',
    url: 'https://proof-c1a40.web.app/',
    filename: 'game5-proof.png'
  }
];

async function takeScreenshot() {
  // public/thumbnails 디렉토리 생성
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  console.log('썸네일 생성 시작...\n');

  for (const site of sites) {
    try {
      console.log(`${site.name} 스크린샷 촬영 중... (${site.url})`);
      
      const page = await browser.newPage();
      
      // 뷰포트 설정 (썸네일 크기)
      await page.setViewport({
        width: 1280,
        height: 720,
        deviceScaleFactor: 1
      });

      // 페이지 로드 대기
      await page.goto(site.url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // 추가 로딩 대기 (일부 사이트는 동적 콘텐츠가 있을 수 있음)
      await page.waitForTimeout(2000);

      const filePath = join(publicDir, site.filename);
      await page.screenshot({
        path: filePath,
        fullPage: false,
        type: 'png'
      });

      await page.close();
      console.log(`✓ ${site.name} 완료: ${filePath}\n`);
    } catch (error) {
      console.error(`✗ ${site.name} 실패:`, error.message);
    }
  }

  await browser.close();
  console.log('모든 썸네일 생성 완료!');
}

takeScreenshot().catch(console.error);

