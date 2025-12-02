import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

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

// API 엔드포인트: 게임/시뮬레이션 생성
app.post('/api/generate', async (req, res) => {
  try {
    const { type, metadata } = req.body

    if (!metadata || !metadata.grade || !metadata.unit || !metadata.gameType || !metadata.difficulty) {
      return res.status(400).json({
        error: '필수 항목을 모두 입력해주세요. (학년, 단원, 형식, 난이도)'
      })
    }

    console.log('AI 생성 요청:', { type, metadata })

    // 프롬프트 생성
    const prompt = type === 'simulation'
      ? createSimulationPrompt(metadata)
      : createGamePrompt(metadata)

    console.log('프롬프트 생성 완료')

    // Gemini API 호출
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

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

    res.json({
      success: true,
      html: htmlContent,
      title: `${metadata.unit} - ${metadata.gameType}`,
      metadata: {
        grade: metadata.grade,
        unit: metadata.unit,
        category: metadata.gameType,
        difficulty: metadata.difficulty
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
