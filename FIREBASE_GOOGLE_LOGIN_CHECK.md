# Firebase Console에서 Google 로그인 활성화 확인 방법

## 단계별 가이드

### 1단계: Firebase Console 접속
1. 브라우저에서 [Firebase Console](https://console.firebase.google.com/) 접속
2. Google 계정으로 로그인

### 2단계: 프로젝트 선택
1. 화면 상단 또는 왼쪽에서 **프로젝트 선택**
2. **future** 또는 **future-73593** 프로젝트 클릭

### 3단계: Authentication 메뉴로 이동
1. 왼쪽 사이드바(메뉴)에서 **Authentication** 클릭
   - 🔥 아이콘이 있는 메뉴입니다
   - 또는 "빌드" 섹션 아래에 있습니다

### 4단계: Sign-in method 확인
1. Authentication 페이지가 열리면
2. 상단에 여러 탭이 있습니다:
   - **사용자** 탭
   - **Sign-in method** 탭 ← 이걸 클릭!
3. **Sign-in method** 탭 클릭

### 5단계: Google 로그인 상태 확인
1. Sign-in method 페이지에서 여러 로그인 방법 목록이 보입니다:
   - 이메일/비밀번호
   - **Google** ← 이 항목 확인!
   - 전화번호
   - 기타 등등

2. **Google** 항목을 찾아서:
   - **상태** 열을 확인
   - **사용** 또는 **사용 안 함**으로 표시됩니다

### 6단계: Google 로그인 활성화 (사용 안 함인 경우)
1. **Google** 항목을 클릭
2. 상단에 토글이 있습니다:
   - **사용** / **사용 안 함** 토글
3. **사용**으로 변경
4. 프로젝트 지원 이메일 선택 (기본값 사용 가능)
5. **저장** 버튼 클릭

## 확인 포인트

✅ **정상인 경우:**
- Google 항목의 상태가 **"사용"**으로 표시됨
- 초록색 체크 표시 또는 "Enabled" 표시

❌ **문제인 경우:**
- Google 항목의 상태가 **"사용 안 함"** 또는 **"Disabled"**로 표시됨
- 이 경우 위의 6단계를 따라 활성화해야 함

## 스크린샷으로 확인하는 위치

```
Firebase Console
├── 프로젝트 선택 (상단)
├── 왼쪽 메뉴
│   ├── 개요
│   ├── 빌드
│   │   ├── Authentication ← 여기!
│   │   │   ├── 사용자 탭
│   │   │   └── Sign-in method 탭 ← 여기 클릭!
│   │   │       └── Google 항목 ← 여기 확인!
```

## 빠른 확인 방법

1. Firebase Console 접속
2. 왼쪽 메뉴에서 **Authentication** 클릭
3. **Sign-in method** 탭 클릭
4. **Google** 항목 찾기
5. 상태가 **"사용"**인지 확인

## 문제 해결

만약 Google이 **"사용 안 함"**으로 되어 있다면:

1. **Google** 항목 클릭
2. **사용** 토글 켜기
3. **저장** 클릭
4. 완료!

## 추가 확인 사항

Google 로그인이 활성화되어 있어도 안 될 수 있는 경우:

1. **승인된 도메인** 확인:
   - Authentication > Settings > 승인된 도메인
   - `localhost`가 목록에 있어야 함

2. **프로젝트 ID 확인**:
   - `.env` 파일의 `VITE_FIREBASE_PROJECT_ID`가 올바른지 확인
   - `future-73593`이어야 함

