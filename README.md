# 수학교육 플랫폼

AI 시대의 새로운 수학교육 패러다임을 여는 수학교육 플랫폼입니다.

## 기능

- **수학 게임**: 재미있게 수학을 배울 수 있는 게임 모음
- **수학 시뮬레이션**: 직접 실험하며 수학을 이해하는 시뮬레이션
- **수학 웹툰**: 웹툰으로 만나는 수학 이야기
- **소셜 기능**: 좋아요, 댓글, 공유 기능
- **콘텐츠 제작**: HTML 파일 업로드 또는 AI로 게임/시뮬레이션/웹툰 생성
- **구글 로그인**: Firebase Authentication을 통한 구글 로그인

## 설치 및 실행

```bash
npm install
npm run dev
```

## 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Firebase 설정
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id

# API 엔드포인트
VITE_API_BASE_URL=http://localhost:3000/api
```

### Firebase 설정 방법

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. Authentication > Sign-in method에서 Google 로그인 활성화
4. 프로젝트 설정 > 일반에서 웹 앱 추가
5. Firebase 설정 정보를 `.env` 파일에 입력

## 빌드

```bash
npm run build
```

## API 엔드포인트

백엔드 서버에서 다음 엔드포인트를 구현해야 합니다:

- `POST /api/generate` - 게임/시뮬레이션 생성
- `POST /api/upload` - 게임/시뮬레이션 파일 업로드
- `POST /api/webtoon/generate` - 웹툰 생성
- `POST /api/webtoon/upload` - 웹툰 파일 업로드

모든 엔드포인트는 Firebase Auth 토큰을 Authorization 헤더로 받습니다.

