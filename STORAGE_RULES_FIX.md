# Firebase Storage 권한 오류 수정

## 문제
```
FirebaseError: Firebase Storage: User does not have permission to access 'thumbnails/1764749177030_1uj3p0e9x.png'. (storage/unauthorized)
```

썸네일을 Firebase Storage에 업로드할 때 403 오류가 발생했습니다.

## 원인
Firebase Storage 규칙이 설정되어 있지 않아 기본적으로 모든 접근이 차단되었습니다.

## 해결 방법

### 1. storage.rules 파일 생성
Firebase Storage의 접근 권한을 정의하는 규칙 파일을 생성했습니다.

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // 게임 HTML 파일
    match /games/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // 시뮬레이션 HTML 파일
    match /simulations/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // 웹툰 HTML 파일
    match /webtoons/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // 수업 도구 HTML 파일
    match /tools/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // 썸네일 이미지 - 핵심!
    match /thumbnails/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

### 2. firebase.json 업데이트
storage 설정을 추가했습니다:

```json
{
  "hosting": { ... },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### 3. 규칙 배포
```bash
firebase deploy --only storage
```

## 규칙 설명

### 썸네일 경로 (`/thumbnails/{fileName}`)
- **읽기 (read)**: 모든 사용자 허용
  - 썸네일은 공개적으로 표시되어야 하므로
- **쓰기 (write)**: 인증된 사용자만 허용
  - 로그인한 사용자만 썸네일 업로드 가능
- **삭제 (delete)**: 인증된 사용자만 허용

### 콘텐츠 HTML 경로 (`/games/{userId}/{fileName}` 등)
- **읽기 (read)**: 모든 사용자 허용
  - 게임/시뮬레이션을 모두가 볼 수 있도록
- **쓰기 (write)**: 소유자만 허용
  - `request.auth.uid == userId` 조건으로 본인만 업로드 가능

## 보안 고려사항

### 현재 설정의 보안성
✅ **장점**:
- 인증된 사용자만 업로드 가능
- 각 사용자는 자신의 폴더에만 쓰기 가능
- 모든 사용자가 콘텐츠를 읽을 수 있음 (공개 플랫폼)

⚠️ **제한사항**:
- 파일 크기 제한 없음
- 파일 타입 검증 없음
- 업로드 횟수 제한 없음

### 향후 개선 사항

1. **파일 크기 제한**
```javascript
match /thumbnails/{fileName} {
  allow write: if request.auth != null
    && request.resource.size < 5 * 1024 * 1024; // 5MB
}
```

2. **파일 타입 검증**
```javascript
match /thumbnails/{fileName} {
  allow write: if request.auth != null
    && request.resource.contentType.matches('image/.*');
}
```

3. **업로드 횟수 제한**
```javascript
// Firestore와 연동하여 사용자별 업로드 카운트 확인
```

## 테스트

1. https://future-73593.web.app 접속
2. 로그인
3. HTML 파일 업로드
4. 콘솔에서 확인:
   ```
   썸네일 생성 시작, HTML 길이: ...
   Firebase Storage에 업로드 중...
   썸네일 업로드 완료: https://firebasestorage.googleapis.com/...
   ```

## 트러블슈팅

### 여전히 403 오류가 발생하는 경우

1. **브라우저 캐시 삭제**
   ```
   Ctrl + Shift + Delete
   ```

2. **Firebase 콘솔에서 규칙 확인**
   - https://console.firebase.google.com/project/future-73593/storage/rules
   - 규칙이 올바르게 배포되었는지 확인

3. **인증 상태 확인**
   - 사용자가 올바르게 로그인되었는지 확인
   - `request.auth.uid`가 존재하는지 확인

4. **규칙 재배포**
   ```bash
   firebase deploy --only storage
   ```

## 관련 파일
- `storage.rules` - Storage 접근 규칙
- `firebase.json` - Firebase 설정
- `src/utils/firestore.js` - 썸네일 업로드 로직
