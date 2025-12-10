# 수업 도구 Firestore 규칙 수정 방법

## 🔴 문제
수업 도구 만들기가 "Missing or insufficient permissions" 오류로 실패하는 경우

## ✅ 해결 방법

### 1단계: Firebase Console 접속
1. 브라우저에서 https://console.firebase.google.com/ 접속
2. 로그인 (Google 계정)
3. **프로젝트 선택** (예: future-73593)

### 2단계: Firestore Database로 이동
1. 왼쪽 메뉴에서 **Firestore Database** 클릭
2. 상단 탭에서 **규칙** 클릭

### 3단계: 규칙에 수업 도구 컬렉션 추가

**현재 규칙에 다음을 추가하세요:**

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
      }
    }
    
    // 시뮬레이션 컬렉션
    match /simulations/{simulationId} {
      allow read: if true;
      allow write: if request.auth != null;
      match /comments/{commentId} {
        allow read: if true;
        allow create: if request.auth != null;
      }
    }
    
    // 웹툰 컬렉션
    match /webtoons/{webtoonId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // 수업 도구 컬렉션 (새로 추가!)
    match /tools/{toolId} {
      allow read: if true;
      allow write: if request.auth != null;
      match /comments/{commentId} {
        allow read: if true;
        allow create: if request.auth != null;
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

### 4단계: 규칙 게시
1. 규칙 입력 후 **게시** 버튼 클릭
2. 확인 메시지에서 **게시** 클릭
3. "규칙이 게시되었습니다" 메시지 확인

### 5단계: 페이지 새로고침
1. 사이트로 돌아가기
2. **F5** 또는 **Ctrl+R**로 새로고침
3. 수업 도구 만들기가 정상 작동하는지 확인

## ⚠️ 임시 해결책 (개발 중에만 사용)

만약 위 방법으로도 안 되면, **임시로** 모든 권한을 허용하는 규칙을 사용하세요:

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

**주의**: 이 규칙은 모든 사용자가 모든 데이터를 읽고 쓸 수 있습니다. 개발 중에만 사용하고, 나중에 위의 상세 규칙으로 변경하세요!





