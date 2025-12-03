# Google Cloud Run 배포 가이드

Firebase와 같은 Google 생태계에서 백엔드 서버를 배포하는 방법입니다.

## 왜 Cloud Run?

✅ Firebase와 같은 프로젝트 사용
✅ 자동 스케일링 (0에서 자동 시작)
✅ 무료 티어: 월 200만 요청, 360,000 GB-초 무료
✅ 사용한 만큼만 과금
✅ HTTPS 자동 설정

## 사전 준비

### 1. Google Cloud SDK 설치
https://cloud.google.com/sdk/docs/install 에서 설치

설치 확인:
```bash
gcloud --version
```

### 2. Firebase 프로젝트 연결
```bash
gcloud config set project future-73593
```

## 배포 방법

### 방법 1: gcloud CLI 사용 (명령줄)

#### 1단계: 로그인
```bash
gcloud auth login
```

#### 2단계: Cloud Run API 활성화
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

#### 3단계: 배포
```bash
gcloud run deploy math-education-api \
  --source . \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --set-env-vars OPENAI_API_KEY=여기에_실제_API_키_입력
```

#### 4단계: URL 확인
배포 완료 후 URL이 표시됩니다:
```
Service URL: https://math-education-api-xxxxx-an.a.run.app
```

### 방법 2: Firebase CLI 사용 (더 쉬움)

Firebase Hosting과 Cloud Run을 함께 사용할 수 있습니다.

#### 1단계: Firebase Functions 초기화
```bash
firebase init functions
```

#### 2단계: Cloud Run 배포
```bash
firebase deploy --only functions
```

### 방법 3: Google Cloud Console (웹 UI)

#### 1. Cloud Run 콘솔 열기
https://console.cloud.google.com/run

#### 2. "CREATE SERVICE" 클릭

#### 3. 설정
- **Container image URL**:
  - "Source Repository" 선택
  - GitHub 연결 후 저장소 선택

- **Service name**: `math-education-api`

- **Region**: `asia-northeast3` (서울)

- **Authentication**: Allow unauthenticated invocations

- **Container port**: `8080`

#### 4. 환경 변수 설정
"Container" → "Variables & Secrets" → "ADD VARIABLE"

- Name: `OPENAI_API_KEY`
- Value: `여기에_실제_API_키_입력`

#### 5. CREATE 클릭

배포 완료 후 URL 복사

## 프론트엔드 연결

`.env` 파일 수정:
```env
VITE_API_BASE_URL=https://math-education-api-xxxxx-an.a.run.app/api
```

Firebase 재배포:
```bash
npm run deploy
```

## 비용

**무료 티어 (매월):**
- 200만 요청
- 360,000 GB-초 컴퓨팅 시간
- 180,000 vCPU-초

**예상 비용:**
- 소규모 사용: $0/월 (무료 티어 내)
- 중규모 사용: $1~5/월

## 장점 vs 단점

### Cloud Run 장점
✅ Firebase와 같은 프로젝트
✅ 안정적 (Google 인프라)
✅ 자동 스케일링
✅ HTTPS 자동
✅ 한국 리전 사용 가능 (빠름)

### Cloud Run 단점
❌ 초기 설정이 복잡 (gcloud 설치 필요)
❌ Cold start (첫 요청 느릴 수 있음)

### Render/Railway와 비교
| 항목 | Cloud Run | Render | Railway |
|------|-----------|--------|---------|
| 설정 난이도 | 중간 | 쉬움 | 매우 쉬움 |
| 무료 티어 | 넉넉함 | 제한적 | $5 크레딧 |
| 안정성 | 최고 | 보통 | 좋음 |
| Cold Start | 있음 | 있음 | 없음(유료) |
| Firebase 통합 | 최고 | 없음 | 없음 |

## 추천 순서

1. **처음 배포**: Railway (가장 쉬움)
2. **안정적 운영**: Cloud Run (Google 생태계)
3. **빠른 테스트**: Render (무료, 간단)

## 문제 해결

### 배포 실패 시
```bash
# 로그 확인
gcloud run services logs read math-education-api --region=asia-northeast3

# 서비스 상태 확인
gcloud run services describe math-education-api --region=asia-northeast3
```

### 환경 변수 업데이트
```bash
gcloud run services update math-education-api \
  --region=asia-northeast3 \
  --set-env-vars OPENAI_API_KEY=새로운_키
```

### 서비스 삭제
```bash
gcloud run services delete math-education-api --region=asia-northeast3
```

## 다음 단계

배포 후:
1. Cloud Run URL 확인
2. `.env` 파일의 `VITE_API_BASE_URL` 업데이트
3. `npm run deploy`로 Firebase 재배포
4. 테스트!
