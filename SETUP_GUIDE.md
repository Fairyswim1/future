# 설정 가이드

## 1단계: Firebase 프로젝트 설정

### 1.1 Firebase 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: "math-education-platform")
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

### 1.2 Authentication 설정
1. Firebase Console에서 생성한 프로젝트 선택
2. 왼쪽 메뉴에서 **Authentication** 클릭
3. **Sign-in method** 탭 클릭
4. **Google** 제공업체 클릭
5. **사용 설정** 토글을 켜기
6. 프로젝트 지원 이메일 선택 (기본값 사용 가능)
7. **저장** 클릭

### 1.3 웹 앱 등록
1. Firebase Console 프로젝트 개요 페이지로 이동
2. **</>** (웹 앱 추가) 아이콘 클릭
3. 앱 닉네임 입력 (예: "Math Education Platform")
4. **Firebase Hosting 설정**은 체크하지 않아도 됨
5. **앱 등록** 클릭
6. **Firebase SDK 설정** 화면에서 다음 정보를 복사:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

## 2단계: 환경 변수 파일 생성

### 2.1 .env 파일 생성
프로젝트 루트 디렉토리(`C:\coding\future2`)에 `.env` 파일을 생성하세요.

### 2.2 Firebase 정보 입력
1단계에서 복사한 Firebase 설정 정보를 다음과 같이 입력:

```env
# Firebase 설정 (1단계에서 복사한 정보)
VITE_FIREBASE_API_KEY=AIzaSy...여기에_실제_apiKey_입력
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# API 엔드포인트 (백엔드 서버 주소)
VITE_API_BASE_URL=http://localhost:3000/api
```

**중요**: 
- `your-project`, `your-project-id` 등의 부분을 실제 값으로 교체하세요
- 따옴표 없이 값만 입력하세요
- 예: `VITE_FIREBASE_API_KEY=AIzaSyAbc123...`

## 3단계: API 엔드포인트 설정

### 옵션 A: 백엔드 서버가 있는 경우
`.env` 파일의 `VITE_API_BASE_URL`을 실제 백엔드 서버 주소로 변경:
```env
VITE_API_BASE_URL=https://your-backend-server.com/api
```

### 옵션 B: 백엔드 서버가 없는 경우 (테스트용)
현재는 API 호출이 실패하지만, 로그인 기능은 작동합니다.
나중에 백엔드를 구축하면 `VITE_API_BASE_URL`만 변경하면 됩니다.

## 4단계: 개발 서버 재시작

환경 변수 파일을 생성/수정한 후에는 개발 서버를 재시작해야 합니다:

```bash
# 서버 중지 (Ctrl+C)
# 그 다음 다시 시작
npm run dev
```

## 확인 사항 체크리스트

- [ ] Firebase 프로젝트 생성 완료
- [ ] Google 로그인 활성화 완료
- [ ] 웹 앱 등록 완료
- [ ] Firebase 설정 정보 복사 완료
- [ ] `.env` 파일 생성 완료
- [ ] `.env` 파일에 Firebase 정보 입력 완료
- [ ] `VITE_API_BASE_URL` 설정 완료
- [ ] 개발 서버 재시작 완료

## 테스트 방법

1. 브라우저에서 `http://localhost:5174` 접속
2. "✨ 만들기" 버튼 클릭
3. 로그인 모달이 나타나면 성공!
4. "Google로 로그인" 버튼 클릭
5. Google 계정 선택 및 로그인
6. 로그인 후 만들기 모달이 열리면 완료!

## 문제 해결

### 로그인이 안 될 때
- Firebase Console에서 Google 로그인이 활성화되어 있는지 확인
- `.env` 파일의 값이 정확한지 확인 (따옴표 없이)
- 브라우저 콘솔(F12)에서 에러 메시지 확인

### API 호출이 실패할 때
- 백엔드 서버가 실행 중인지 확인
- `VITE_API_BASE_URL`이 올바른지 확인
- CORS 설정이 되어 있는지 확인 (백엔드)

## 제공해야 할 정보 (나에게 알려줄 것)

현재는 **아무것도 알려줄 필요 없습니다!**

다만, 다음 중 하나라도 해당되면 알려주세요:

1. **백엔드 서버 주소가 이미 있는 경우**
   - 예: `https://api.example.com`
   - 그러면 `.env` 파일의 `VITE_API_BASE_URL`을 알려주시면 됩니다

2. **Firebase 설정 중 문제가 발생한 경우**
   - 어떤 단계에서 막혔는지
   - 에러 메시지가 있다면

3. **추가로 필요한 기능이 있는 경우**
   - 예: 다른 로그인 방법 추가, 특정 기능 수정 등

