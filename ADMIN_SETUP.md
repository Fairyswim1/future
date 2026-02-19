# 관리자 설정 가이드

## 관리자 권한 설정 방법

기본 게임(수식양궁, 멀린게임, 구구단게임 등)을 삭제하려면 관리자 권한이 필요합니다.

### 1. 관리자 ID 설정

`src/components/MainPage.jsx`와 `src/components/ContentCard.jsx` 파일에서 `ADMIN_IDS` 배열을 수정하세요:

```javascript
const ADMIN_IDS = [
  'your-email@gmail.com',  // 관리자 이메일
  'user1234567890',        // 또는 Firebase UID
]
```

### 2. 관리자 확인 방법

관리자는 다음 조건 중 하나를 만족해야 합니다:
- `ADMIN_IDS` 배열에 포함된 이메일로 로그인
- `ADMIN_IDS` 배열에 포함된 UID를 가진 사용자

### 3. 기본 게임 삭제

관리자로 로그인하면:
- 기본 게임(수식양궁, 멀린게임, 구구단게임 등)의 수정/삭제 버튼이 표시됩니다
- 삭제 버튼을 클릭하면 기본 게임을 삭제할 수 있습니다

### 4. 현재 사용자 정보 확인

브라우저 콘솔에서 다음 명령어로 현재 사용자 정보를 확인할 수 있습니다:

```javascript
// Firebase Auth에서 현재 사용자 정보 확인
firebase.auth().currentUser
```

UID나 이메일을 복사하여 `ADMIN_IDS` 배열에 추가하세요.







