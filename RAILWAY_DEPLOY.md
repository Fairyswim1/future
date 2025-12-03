# Railway 배포 가이드 (Render 대안)

Railway는 Render보다 설정이 간단하고 자동으로 감지합니다.

## 단계별 가이드

### 1. Railway 계정 생성
1. https://railway.app 접속
2. "Start a New Project" 클릭
3. GitHub 계정으로 로그인

### 2. 프로젝트 배포
1. "Deploy from GitHub repo" 선택
2. "future" 저장소 선택
3. "Deploy Now" 클릭
4. 자동으로 Node.js 감지 및 배포 시작

### 3. 환경 변수 설정
배포가 시작되면:

1. 프로젝트 클릭
2. 배포된 서비스 클릭
3. **Variables** 탭 클릭
4. 다음 변수 추가:

**OPENAI_API_KEY**
```
your-openai-api-key-here
```

**PORT** (이미 자동 설정되어 있을 수 있음)
```
10000
```

### 4. 도메인 생성
1. **Settings** 탭 클릭
2. **Networking** 섹션
3. "Generate Domain" 클릭
4. 생성된 URL 복사 (예: `https://future-production-xxxx.up.railway.app`)

### 5. 프론트엔드 연결
로컬 `.env` 파일 수정:

```env
VITE_API_BASE_URL=https://your-railway-url.up.railway.app/api
```

그리고 다시 배포:
```bash
npm run deploy
```

## Railway 장점

✅ 자동으로 Node.js 감지
✅ 자동으로 npm install 실행
✅ 자동으로 npm start 실행
✅ 빠른 배포 (1~2분)
✅ 더 나은 로그 인터페이스
✅ $5 무료 크레딧 제공

## 비용

- 무료 크레딧: $5/월
- 이후: 사용량 기반 (보통 $5~10/월)
- Render보다 안정적

## 문제 해결

배포 실패 시:
1. Deployments 탭에서 로그 확인
2. Variables 탭에서 환경 변수 확인
3. Settings → Restart 시도
