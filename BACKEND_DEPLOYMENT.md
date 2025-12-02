# 백엔드 서버 배포 가이드

AI 게임 생성 기능을 사용하려면 백엔드 서버를 클라우드에 배포해야 합니다.

## 방법 1: Render.com 배포 (추천 - 무료)

### 1. GitHub에 코드 푸시

```bash
git add .
git commit -m "Add backend server for AI generation"
git push origin master
```

### 2. Render 계정 생성
1. https://render.com 접속
2. GitHub 계정으로 로그인

### 3. 새 Web Service 생성
1. Dashboard → "New +" → "Web Service" 클릭
2. GitHub 저장소 연결
3. `future2` 저장소 선택

### 4. 설정
- **Name**: `math-education-api` (원하는 이름)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### 5. 환경 변수 설정
"Environment" 탭에서 추가:
- **Key**: `OPENAI_API_KEY`
- **Value**: `여기에 실제 OpenAI API 키를 입력하세요 (sk-proj-로 시작)`

### 6. 배포
"Create Web Service" 클릭하면 자동으로 배포됩니다.

배포 완료 후 URL이 생성됩니다 (예: `https://math-education-api.onrender.com`)

### 7. 프론트엔드 연결
`.env` 파일 수정:
```env
VITE_API_BASE_URL=https://math-education-api.onrender.com/api
```

그 후 다시 배포:
```bash
npm run deploy
```

---

## 방법 2: Railway 배포 (간단, 무료 크레딧 제공)

### 1. Railway 계정 생성
https://railway.app

### 2. 새 프로젝트 생성
1. "New Project" → "Deploy from GitHub repo"
2. 저장소 선택
3. 자동으로 Node.js 감지

### 3. 환경 변수 설정
- Settings → Variables 탭
- `OPENAI_API_KEY` 추가

### 4. 도메인 확인
- Settings → Domains에서 생성된 URL 확인
- `.env` 파일의 `VITE_API_BASE_URL` 업데이트

---

## 방법 3: Vercel (프론트엔드와 함께)

### 1. API Routes로 변환 필요
Vercel은 Serverless Functions를 사용하므로 Express 서버를 API Routes로 변환해야 합니다.

`/api` 폴더 생성 후 함수 분리 필요 (복잡함)

---

## 방법 4: Heroku (유료)

과거에는 무료였지만 현재는 유료입니다.

---

## 추천 순서

1. **Render** (무료, 가장 쉬움, 초기 로딩 느림)
2. **Railway** (무료 크레딧, 빠름, 크레딧 소진 후 유료)
3. **자체 서버** (VPS - DigitalOcean, AWS 등)

---

## 로컬 테스트

배포 전 로컬에서 테스트:

터미널 1:
```bash
npm run server
```

터미널 2:
```bash
npm run dev
```

http://localhost:5176 에서 "바이브 코딩" 테스트

---

## 주의사항

- **API 키 보안**: `.env` 파일을 절대 GitHub에 올리지 마세요
- **Render 무료 플랜**: 15분 동안 요청이 없으면 슬립 모드로 전환됨 (첫 요청 시 30초 정도 소요)
- **비용**: OpenAI API 사용량에 따라 과금됨

---

## 문제 해결

### CORS 오류
서버에서 프론트엔드 도메인 허용:

`server.js` 수정:
```javascript
app.use(cors({
  origin: ['http://localhost:5176', 'https://future-73593.web.app']
}))
```

### API 키 오류
Render/Railway 환경 변수가 정확히 설정되었는지 확인

### 연결 실패
`.env`의 `VITE_API_BASE_URL`이 배포된 서버 URL과 일치하는지 확인
