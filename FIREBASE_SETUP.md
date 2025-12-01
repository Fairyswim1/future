# Firebase 설정 정보 찾는 방법

## 1단계: Firebase 설정 정보 찾기

### 방법 1: 프로젝트 설정에서 찾기 (가장 쉬움)

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 만든 프로젝트 클릭
3. 왼쪽 상단의 **⚙️ (톱니바퀴) 아이콘** 클릭
4. **프로젝트 설정** 클릭
5. 아래로 스크롤해서 **내 앱** 섹션 찾기
6. 웹 앱(</> 아이콘) 클릭
7. **구성** 섹션에서 다음 정보 확인:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "xxx.firebaseapp.com",
     projectId: "xxx",
     storageBucket: "xxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

### 방법 2: 웹 앱 추가 시 표시된 정보

만약 웹 앱을 방금 추가했다면, 그 화면에 표시된 설정 정보를 복사하면 됩니다.

## 2단계: .env 파일에 입력하기

프로젝트 루트(`C:\coding\future2`)에 `.env` 파일을 만들고:

```env
VITE_FIREBASE_API_KEY=AIzaSy...여기에_실제_값_입력
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

VITE_API_BASE_URL=http://localhost:3000/api
```

**중요**: 
- 따옴표(`"`) 없이 값만 입력
- 예: `VITE_FIREBASE_API_KEY=AIzaSyAbc123...` (따옴표 없음)

## 3단계: Firebase Hosting 연결하기

### 3.1 Firebase Hosting 설정

1. Firebase Console에서 프로젝트 선택
2. 왼쪽 메뉴에서 **Hosting** 클릭
3. **시작하기** 클릭 (아직 안 했다면)
4. **다음** 클릭하여 기본 설정 완료

### 3.2 로컬에서 빌드 및 배포

터미널에서 다음 명령어 실행:

```bash
# Firebase CLI 설치 (처음 한 번만)
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 프로젝트 초기화 (프로젝트 루트에서)
firebase init hosting

# 질문에 답변:
# - Use an existing project: Y
# - Select a default Firebase project: 만든 프로젝트 선택
# - What do you want to use as your public directory? dist
# - Configure as a single-page app: Y
# - Set up automatic builds and deploys with GitHub? N (또는 원하면 Y)
```

### 3.3 빌드 및 배포

```bash
# 프로젝트 빌드
npm run build

# Firebase Hosting에 배포
firebase deploy --only hosting
```

배포 후 Firebase Console의 Hosting 섹션에서 URL을 확인할 수 있습니다.

## 4단계: 호스팅 URL을 API 엔드포인트로 사용 (선택사항)

만약 백엔드 API도 Firebase Functions로 만들었다면:

```env
VITE_API_BASE_URL=https://your-project.cloudfunctions.net/api
```

또는 별도 백엔드 서버가 있다면 그 주소를 사용하세요.

