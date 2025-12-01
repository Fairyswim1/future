# 구글 로그인 문제 해결 가이드

## 1단계: 브라우저 콘솔 확인

1. 브라우저에서 `F12` 키를 눌러 개발자 도구 열기
2. **Console** 탭 클릭
3. 페이지 새로고침
4. 빨간색 에러 메시지 확인

## 2단계: Firebase 설정 확인

브라우저 콘솔에서 다음 메시지를 확인하세요:
- `=== Firebase 설정 확인 ===`
- 각 설정이 `✓ 설정됨`인지 `✗ 없음`인지 확인

### 문제: 설정이 `✗ 없음`으로 표시되는 경우

**해결 방법:**
1. 프로젝트 루트에 `.env` 파일이 있는지 확인
2. `.env` 파일 내용 확인:
   ```env
   VITE_FIREBASE_API_KEY=실제값
   VITE_FIREBASE_AUTH_DOMAIN=실제값
   VITE_FIREBASE_PROJECT_ID=실제값
   VITE_FIREBASE_STORAGE_BUCKET=실제값
   VITE_FIREBASE_MESSAGING_SENDER_ID=실제값
   VITE_FIREBASE_APP_ID=실제값
   ```
3. **중요**: `여기에_xxx_입력` 같은 예시 텍스트가 있으면 안 됩니다!
4. `.env` 파일 수정 후 **개발 서버 재시작** 필수!

## 3단계: Firebase Console 확인

### Google 로그인 활성화 확인

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택
3. 왼쪽 메뉴 **Authentication** 클릭
4. **Sign-in method** 탭 클릭
5. **Google** 항목 확인:
   - 상태가 **사용**으로 되어 있어야 함
   - 만약 **사용 안 함**이면 클릭해서 활성화

### 승인된 도메인 확인

1. Firebase Console > Authentication > Settings
2. **승인된 도메인** 섹션 확인
3. 다음 도메인이 있어야 함:
   - `localhost` (개발용)
   - 배포한 도메인 (예: `your-project.web.app`)

## 4단계: 일반적인 에러 해결

### 에러: "auth/operation-not-allowed"
**원인**: Firebase Console에서 Google 로그인이 활성화되지 않음
**해결**: Firebase Console > Authentication > Sign-in method > Google 활성화

### 에러: "auth/unauthorized-domain"
**원인**: 현재 도메인이 승인된 도메인 목록에 없음
**해결**: Firebase Console > Authentication > Settings > 승인된 도메인에 추가

### 에러: "auth/popup-blocked"
**원인**: 브라우저가 팝업을 차단함
**해결**: 브라우저 설정에서 팝업 허용

### 에러: "auth/popup-closed-by-user"
**원인**: 사용자가 로그인 창을 닫음
**해결**: 다시 시도

### 에러: "Firebase: Error (auth/invalid-api-key)"
**원인**: `.env` 파일의 API Key가 잘못됨
**해결**: Firebase Console에서 올바른 API Key 복사 후 `.env` 파일 수정

## 5단계: .env 파일 예시

올바른 `.env` 파일 예시:

```env
VITE_FIREBASE_API_KEY=AIzaSyAbc123def456ghi789jkl012mno345pq
VITE_FIREBASE_AUTH_DOMAIN=future-73593.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=future-73593
VITE_FIREBASE_STORAGE_BUCKET=future-73593.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
VITE_API_BASE_URL=http://localhost:3000/api
```

**주의사항:**
- 따옴표(`"`) 없이 값만 입력
- 공백 없이 입력
- `=` 앞뒤로 공백 없음

## 6단계: 개발 서버 재시작

`.env` 파일을 수정한 후에는 **반드시** 개발 서버를 재시작해야 합니다:

```bash
# 서버 중지 (Ctrl+C)
# 다시 시작
npm run dev
```

## 여전히 안 되면?

1. 브라우저 콘솔의 **정확한 에러 메시지** 복사
2. `.env` 파일 내용 확인 (민감한 정보는 제외하고 구조만)
3. Firebase Console에서 Google 로그인 활성화 여부 확인
4. 위 정보를 알려주시면 더 정확히 도와드릴 수 있습니다!

