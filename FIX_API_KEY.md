# API 키 오류 해결 방법

## 에러 메시지
```
auth/api-key-not-valid.-please-pass-a-valid-api-key
```

이 에러는 Firebase API 키가 잘못되었거나 없을 때 발생합니다.

## 해결 방법

### 1단계: Firebase Console에서 올바른 API 키 확인

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. **future-73593** 프로젝트 선택
3. 왼쪽 상단 **⚙️ (톱니바퀴) 아이콘** 클릭
4. **프로젝트 설정** 클릭
5. 아래로 스크롤해서 **내 앱** 섹션 찾기
6. 웹 앱(</> 아이콘) 클릭
7. **구성** 섹션에서 `apiKey` 값 복사
   - 예: `AIzaSyAbc123def456ghi789jkl012mno345pq`

### 2단계: .env 파일 확인 및 수정

1. 프로젝트 루트(`C:\coding\future2`)에서 `.env` 파일 열기
2. `VITE_FIREBASE_API_KEY` 줄 확인
3. 올바른 형식:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyAbc123def456ghi789jkl012mno345pq
   ```

**중요 체크리스트:**
- ✅ 따옴표(`"`) 없이 값만 입력
- ✅ 공백 없이 입력
- ✅ `=` 앞뒤로 공백 없음
- ✅ `여기에_xxx_입력` 같은 예시 텍스트 없음
- ✅ Firebase Console에서 복사한 실제 값

**잘못된 예시:**
```env
VITE_FIREBASE_API_KEY="AIzaSy..."  ❌ 따옴표 있음
VITE_FIREBASE_API_KEY = AIzaSy...  ❌ 공백 있음
VITE_FIREBASE_API_KEY=여기에_apiKey_입력  ❌ 예시 텍스트
```

**올바른 예시:**
```env
VITE_FIREBASE_API_KEY=AIzaSyAbc123def456ghi789jkl012mno345pq  ✅
```

### 3단계: .env 파일 전체 확인

`.env` 파일이 다음과 같은 형식인지 확인:

```env
VITE_FIREBASE_API_KEY=실제_API_키_값
VITE_FIREBASE_AUTH_DOMAIN=future-73593.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=future-73593
VITE_FIREBASE_STORAGE_BUCKET=future-73593.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=실제_값
VITE_FIREBASE_APP_ID=실제_값
VITE_API_BASE_URL=http://localhost:3000/api
```

### 4단계: 개발 서버 재시작 (필수!)

`.env` 파일을 수정한 후에는 **반드시** 개발 서버를 재시작해야 합니다:

```bash
# 1. 현재 실행 중인 서버 중지 (Ctrl+C)
# 2. 다시 시작
npm run dev
```

환경 변수는 서버 시작 시에만 로드되므로, 수정 후 재시작이 필수입니다!

### 5단계: 브라우저 캐시 클리어 (선택사항)

1. 브라우저에서 `Ctrl + Shift + Delete` 누르기
2. 캐시된 이미지 및 파일 삭제
3. 페이지 새로고침 (`Ctrl + F5`)

## 빠른 확인 방법

터미널에서 다음 명령어로 환경 변수가 로드되었는지 확인:

```bash
# Windows PowerShell
$env:VITE_FIREBASE_API_KEY

# 값이 출력되면 정상, 없으면 .env 파일 문제
```

## 여전히 안 되면?

1. Firebase Console에서 **새로운 웹 앱 추가**:
   - 프로젝트 설정 > 내 앱 > 웹 앱 추가
   - 새로운 API 키 생성
   - 새 API 키를 `.env`에 입력

2. `.env` 파일 위치 확인:
   - 반드시 프로젝트 루트(`C:\coding\future2`)에 있어야 함
   - `package.json`과 같은 폴더에 있어야 함

3. 파일 이름 확인:
   - 정확히 `.env` (점으로 시작, 확장자 없음)
   - `.env.txt` 또는 `env`가 아님!

