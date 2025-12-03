# Firebase 규칙 빠른 수정 가이드

## 빈 화면 문제 해결

만약 사이트가 빈 화면으로 나온다면, Firebase 규칙이 너무 엄격하게 설정되었을 수 있습니다.

### 임시 해결책 (개발용)

Firebase Console → Firestore Database → 규칙 탭에서 다음 규칙을 사용하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **주의**: 이 규칙은 모든 읽기/쓰기를 허용합니다. 개발 중에만 사용하세요!

### 프로덕션용 규칙 (권장)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 게임 컬렉션
    match /games/{gameId} {
      allow read: if true;
      allow write: if request.auth != null;
      match /comments/{commentId} {
        allow read: if true;
        allow create: if request.auth != null;
        allow update, delete: if request.auth != null && 
          request.resource.data.userId == request.auth.uid;
      }
    }
    
    // 시뮬레이션 컬렉션
    match /simulations/{simulationId} {
      allow read: if true;
      allow write: if request.auth != null;
      match /comments/{commentId} {
        allow read: if true;
        allow create: if request.auth != null;
        allow update, delete: if request.auth != null && 
          request.resource.data.userId == request.auth.uid;
      }
    }
    
    // 웹툰 컬렉션
    match /webtoons/{webtoonId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // 수업 도구 컬렉션
    match /tools/{toolId} {
      allow read: if true;
      allow write: if request.auth != null;
      match /comments/{commentId} {
        allow read: if true;
        allow create: if request.auth != null;
        allow update, delete: if request.auth != null && 
          request.resource.data.userId == request.auth.uid;
      }
    }
    
    // 사용자 프로필 컬렉션
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 적용 방법

1. Firebase Console 접속: https://console.firebase.google.com/
2. 프로젝트 선택
3. Firestore Database → 규칙 탭
4. 위 규칙 중 하나를 복사하여 붙여넣기
5. **게시** 버튼 클릭
6. 페이지 새로고침


