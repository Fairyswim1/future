import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'
import puppeteer from 'puppeteer'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Gemini AI 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY)

// 미들웨어
const allowedOrigins = [
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'https://future-73593.web.app',
  'https://future-73593.firebaseapp.com'
]

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(null, true) // 개발 중에는 모든 origin 허용
    }
    return callback(null, true)
  },
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
// 썸네일 API용 텍스트 파서 (Content-Type: text/html)
app.use('/api/thumbnail', express.text({ limit: '10mb' }))

// 게임 생성 프롬프트 템플릿
function createGamePrompt(metadata) {
  const { grade, unit, gameType, difficulty, description } = metadata

  let prompt = `당신은 초·중·고 수학 교육 전문가이자 웹 개발자입니다.
학생들이 재미있게 배울 수 있는 인터랙티브 수학 게임을 HTML, CSS, JavaScript로 만들어주세요.

[게임 요구사항]
- 학년: ${grade}
- 단원/핵심개념: ${unit}
- 게임 형식: ${gameType}
- 난이도: ${difficulty}`

  if (description && description.trim()) {
    prompt += `
- 추가 요청사항: ${description}`
  }

  prompt += `

[기술 요구사항]
1. 완전한 단일 HTML 파일로 작성 (외부 파일 참조 없이)
2. HTML, CSS, JavaScript를 모두 하나의 파일에 포함
3. 반응형 디자인 적용 (모바일에서도 작동)
4. 즉시 실행 가능한 완성된 게임
5. 한글로 작성 (설명, 문제, UI 모두)
6. 외부 라이브러리 사용 금지 (순수 JavaScript만 사용)
7. 이미지는 emoji나 CSS로 구현 (외부 이미지 URL 사용 금지)

[게임 구성요소]
1. 제목과 게임 설명
2. 시작 버튼
3. 게임 진행 화면 (문제/미션 등)
4. 점수/진행도 표시
5. 피드백 시스템 (정답/오답 알림)
6. 완료 화면 (결과, 재시작 버튼)

[디자인 가이드]
- 밝고 친근한 색상 사용
- 가독성 좋은 폰트 크기 (최소 16px)
- 명확한 버튼과 인터랙션
- 애니메이션/효과로 재미 요소 추가
- 모바일 친화적인 UI (터치 가능한 버튼 크기)

[중요 제약사항]
- DOCTYPE 선언으로 시작하는 완전한 HTML 문서
- 외부 파일, 외부 라이브러리, 외부 이미지 절대 사용 금지
- 모든 스타일은 <style> 태그 안에
- 모든 스크립트는 <script> 태그 안에

응답은 반드시 완전한 HTML 코드만 작성하고, 설명이나 마크다운 코드 블록(백틱)은 사용하지 마세요.
<!DOCTYPE html>로 시작하는 순수 HTML 코드만 반환하세요.`

  return prompt
}

// 시뮬레이션 생성 프롬프트 템플릿
function createSimulationPrompt(metadata) {
  const { grade, unit, gameType, difficulty, description } = metadata

  let prompt = `당신은 초·중·고 수학 교육 전문가이자 웹 개발자입니다.
학생들이 수학 개념을 시각적으로 이해할 수 있는 인터랙티브 시뮬레이션을 HTML, CSS, JavaScript로 만들어주세요.

[시뮬레이션 요구사항]
- 학년: ${grade}
- 단원/핵심개념: ${unit}
- 형식: ${gameType}
- 난이도: ${difficulty}`

  if (description && description.trim()) {
    prompt += `
- 추가 요청사항: ${description}`
  }

  prompt += `

[기술 요구사항]
1. 완전한 단일 HTML 파일로 작성 (외부 파일 참조 없이)
2. HTML, CSS, JavaScript를 모두 하나의 파일에 포함
3. 반응형 디자인 적용 (모바일에서도 작동)
4. 즉시 실행 가능한 완성된 시뮬레이션
5. 한글로 작성 (설명, UI 모두)
6. 외부 라이브러리 사용 금지 (순수 JavaScript와 Canvas/SVG 사용)
7. 이미지는 emoji나 CSS/Canvas로 구현 (외부 이미지 URL 사용 금지)

[시뮬레이션 구성요소]
1. 제목과 시뮬레이션 설명
2. 인터랙티브 시각화 영역 (Canvas 또는 HTML/CSS)
3. 조작 패널 (슬라이더, 버튼, 입력 필드 등)
4. 실시간 값 표시
5. 초기화/재설정 버튼
6. 도움말/설명 섹션

[디자인 가이드]
- 명확한 시각화
- 직관적인 컨트롤
- 실시간 피드백
- 깔끔하고 교육적인 디자인

[중요 제약사항]
- DOCTYPE 선언으로 시작하는 완전한 HTML 문서
- 외부 파일, 외부 라이브러리, 외부 이미지 절대 사용 금지
- 모든 스타일은 <style> 태그 안에
- 모든 스크립트는 <script> 태그 안에

응답은 반드시 완전한 HTML 코드만 작성하고, 설명이나 마크다운 코드 블록(백틱)은 사용하지 마세요.
<!DOCTYPE html>로 시작하는 순수 HTML 코드만 반환하세요.`

  return prompt
}

// 웹툰 생성 프롬프트 템플릿
function createWebtoonPrompt(metadata) {
  const { grade, unit, gameType, description } = metadata

  let prompt = `당신은 초·중·고 수학 교육 전문가이자 웹툰 작가입니다.
학생들이 수학 개념을 재미있고 이해하기 쉽게 배울 수 있는 인터랙티브 수학 웹툰을 HTML, CSS, JavaScript로 만들어주세요.

[웹툰 요구사항]
- 학년: ${grade}
- 단원/핵심개념: ${unit}
- 스타일: ${gameType || '일반'}`

  if (description && description.trim()) {
    prompt += `
- 추가 요청사항: ${description}`
  }

  prompt += `

[기술 요구사항]
1. 완전한 단일 HTML 파일로 작성 (외부 파일 참조 없이)
2. HTML, CSS, JavaScript를 모두 하나의 파일에 포함
3. 반응형 디자인 적용 (모바일에서도 작동)
4. 즉시 실행 가능한 완성된 웹툰
5. 한글로 작성 (대화, 설명, UI 모두)
6. 외부 라이브러리 사용 금지 (순수 JavaScript만 사용)
7. 이미지는 emoji, CSS, Canvas로 구현 (외부 이미지 URL 사용 금지)

[웹툰 구성요소]
1. 제목과 웹툰 소개
2. 스토리 진행 (캐릭터, 대화, 상황)
3. 수학 개념 설명 (자연스럽게 스토리에 통합)
4. 인터랙티브 요소 (클릭, 스크롤, 애니메이션 등)
5. 다음/이전 버튼 또는 자동 진행
6. 수학 문제/퀴즈 (선택사항)
7. 마무리 메시지

[웹툰 스타일 가이드]
- ${gameType === '만화 스타일' ? '만화처럼 말풍선과 캐릭터를 사용' : gameType === '일러스트 스타일' ? '일러스트 중심의 아름다운 그림' : gameType === '애니메이션 스타일' ? '부드러운 애니메이션 효과' : '일반적인 스토리텔링'}
- 캐릭터는 emoji나 CSS로 표현 (예: 👨‍🎓, 👩‍🏫, 🐰, 🐻 등)
- 말풍선 스타일의 대화창
- 단계별 스토리 진행
- 수학 개념을 자연스럽게 설명

[디자인 가이드]
- 밝고 친근한 색상 사용
- 가독성 좋은 폰트 크기 (최소 16px)
- 명확한 레이아웃과 여백
- 부드러운 전환 애니메이션
- 모바일 친화적인 UI

[중요 제약사항]
- DOCTYPE 선언으로 시작하는 완전한 HTML 문서
- 외부 파일, 외부 라이브러리, 외부 이미지 절대 사용 금지
- 모든 스타일은 <style> 태그 안에
- 모든 스크립트는 <script> 태그 안에
- 스토리는 최소 3-5개의 장면으로 구성

응답은 반드시 완전한 HTML 코드만 작성하고, 설명이나 마크다운 코드 블록(백틱)은 사용하지 마세요.
<!DOCTYPE html>로 시작하는 순수 HTML 코드만 반환하세요.`

  return prompt
}

// API 엔드포인트: 게임/시뮬레이션/웹툰 생성
app.post('/api/generate', async (req, res) => {
  try {
    const { type, metadata } = req.body

    console.log('AI 생성 요청 받음:', { type, metadata })

    // 타입 확인 및 검증
    console.log('=== AI 생성 요청 ===')
    console.log('받은 type:', type, 'typeof:', typeof type)
    console.log('받은 req.body:', JSON.stringify(req.body, null, 2))
    
    // 타입 정규화 (공백 제거, 소문자 변환)
    const normalizedType = String(type || '').trim().toLowerCase()
    console.log('normalizedType:', normalizedType)
    console.log('normalizedType === "webtoon":', normalizedType === 'webtoon')
    
    // 웹툰의 경우 난이도가 필수가 아님
    // 타입 체크를 더 명확하게
    const isWebtoon = normalizedType === 'webtoon' || normalizedType === '웹툰'
    
    if (isWebtoon) {
      console.log('>>> 웹툰 타입으로 인식됨')
      // 웹툰은 grade와 unit만 필수
      if (!metadata || !metadata.grade || !metadata.unit) {
        console.log('웹툰 검증 실패:', { grade: metadata?.grade, unit: metadata?.unit })
        return res.status(400).json({
          error: '필수 항목을 모두 입력해주세요. (학년, 단원)'
        })
      }
      console.log('웹툰 검증 통과 - grade:', metadata.grade, 'unit:', metadata.unit)
    } else {
      console.log('>>> 게임/시뮬레이션 타입으로 인식됨 (type:', type, 'normalizedType:', normalizedType, ')')
      // 게임/시뮬레이션은 grade, unit, gameType, difficulty 모두 필수
      // difficulty가 빈 문자열이어도 오류 처리
      const hasDifficulty = metadata?.difficulty && metadata.difficulty.trim() !== ''
      if (!metadata || !metadata.grade || !metadata.unit || !metadata.gameType || !hasDifficulty) {
        console.log('게임/시뮬레이션 검증 실패:', { 
          grade: metadata?.grade, 
          unit: metadata?.unit, 
          gameType: metadata?.gameType, 
          difficulty: metadata?.difficulty,
          hasDifficulty: hasDifficulty
        })
        return res.status(400).json({
          error: '필수 항목을 모두 입력해주세요. (학년, 단원, 형식, 난이도)'
        })
      }
      console.log('게임/시뮬레이션 검증 통과')
    }

    console.log('AI 생성 요청:', { type, metadata })

    // 프롬프트 생성
    let prompt
    if (type === 'webtoon') {
      prompt = createWebtoonPrompt(metadata)
    } else if (type === 'simulation') {
      prompt = createSimulationPrompt(metadata)
    } else {
      prompt = createGamePrompt(metadata)
    }

    console.log('프롬프트 생성 완료')

    // Gemini API 호출
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    })

    const fullPrompt = `당신은 교육용 웹 콘텐츠를 만드는 전문가입니다. HTML, CSS, JavaScript를 사용하여 완전한 단일 파일 웹 애플리케이션을 만듭니다.

${prompt}`

    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    let htmlContent = response.text().trim()

    // 마크다운 코드 블록 제거 (혹시 포함되어 있을 경우)
    if (htmlContent.startsWith('```html')) {
      htmlContent = htmlContent.replace(/^```html\n/, '').replace(/\n```$/, '')
    } else if (htmlContent.startsWith('```')) {
      htmlContent = htmlContent.replace(/^```\n/, '').replace(/\n```$/, '')
    }

    // DOCTYPE이 없으면 추가
    if (!htmlContent.toLowerCase().includes('<!doctype html>')) {
      htmlContent = '<!DOCTYPE html>\n' + htmlContent
    }

    console.log('AI 생성 완료, HTML 길이:', htmlContent.length)

    // 제목 생성
    let title
    if (type === 'webtoon') {
      title = `${metadata.unit} - 수학 웹툰`
    } else {
      title = `${metadata.unit} - ${metadata.gameType}`
    }

    res.json({
      success: true,
      html: htmlContent,
      title: title,
      metadata: {
        grade: metadata.grade,
        unit: metadata.unit,
        category: type === 'webtoon' ? (metadata.gameType || '웹툰') : metadata.gameType,
        difficulty: metadata.difficulty || null
      }
    })

  } catch (error) {
    console.error('AI 생성 오류:', error)

    if (error.code === 'insufficient_quota') {
      return res.status(402).json({
        error: 'OpenAI API 할당량이 부족합니다. API 키를 확인하거나 크레딧을 충전해주세요.'
      })
    }

    res.status(500).json({
      error: 'AI 생성 중 오류가 발생했습니다: ' + error.message
    })
  }
})

// 썸네일 생성 API
app.post('/api/thumbnail', async (req, res) => {
  let browser = null
  try {
    const htmlContent = req.body

    if (!htmlContent || typeof htmlContent !== 'string') {
      return res.status(400).json({
        error: 'HTML 콘텐츠가 필요합니다.'
      })
    }

    console.log('썸네일 생성 요청, HTML 길이:', htmlContent.length)

    // Puppeteer 브라우저 실행
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    })

    const page = await browser.newPage()

    // 뷰포트 설정 (썸네일 크기)
    await page.setViewport({
      width: 1280,
      height: 720,
      deviceScaleFactor: 1
    })

    // HTML 콘텐츠를 data URL로 변환하여 로드
    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`
    await page.goto(dataUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000
    })

    // 추가 로딩 대기 (동적 콘텐츠가 있을 수 있음)
    await page.waitForTimeout(2000)

    // 스크린샷 촬영 (base64로 반환)
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
      encoding: 'base64'
    })

    await page.close()
    await browser.close()
    browser = null

    console.log('썸네일 생성 완료')

    res.json({
      success: true,
      thumbnail: `data:image/png;base64,${screenshot}`
    })

  } catch (error) {
    console.error('썸네일 생성 오류:', error)
    if (browser) {
      await browser.close()
    }
    res.status(500).json({
      error: '썸네일 생성 중 오류가 발생했습니다: ' + error.message
    })
  }
})

// 헬스체크 엔드포인트
app.get('/api/health', (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY
  res.json({
    status: 'ok',
    aiConfigured: !!apiKey && !apiKey.includes('your-'),
    aiProvider: process.env.GEMINI_API_KEY ? 'Gemini' : 'OpenAI'
  })
})

app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`)
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY
  const provider = process.env.GEMINI_API_KEY ? 'Gemini' : 'OpenAI'
  console.log(`AI API 설정: ${apiKey ? '✓ ' + provider : '✗ 미설정'}`)
})
