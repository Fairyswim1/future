# Firestore 보안 규칙 설정 가이드

## 문제
댓글 기능이 "Missing or insufficient permissions" 오류로 실패하는 경우, Firestore 보안 규칙을 수정해야 합니다.

## 해결 방법

### 1. Firebase Console 접속
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **Firestore Database** 클릭
4. **규칙** 탭 클릭

### 2. 보안 규칙 추가

다음 규칙을 추가하세요:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 게임 컬렉션
    match /games/{gameId} {
      // 게임 문서 읽기/쓰기
      allow read: if true;  // 모든 사용자가 읽기 가능
      allow write: if request.auth != null;  // 로그인한 사용자만 쓰기 가능
      
      // 댓글 서브컬렉션
      match /comments/{commentId} {
        allow read: if true;  // 모든 사용자가 댓글 읽기 가능
        allow create: if request.auth != null;  // 로그인한 사용자만 댓글 작성 가능
        allow update, delete: if request.auth != null && 
          request.resource.data.userId == request.auth.uid;  // 본인 댓글만 수정/삭제 가능
      }
    }
    
    // 시뮬레이션 컬렉션
    match /simulations/{simulationId} {
      allow read: if true;
      allow write: if request.auth != null;
      
      // 댓글 서브컬렉션
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
    
    // 사용자 프로필 컬렉션 (닉네임 저장)
    match /users/{userId} {
      allow read: if true;  // 모든 사용자가 읽기 가능
      allow write: if request.auth != null && request.auth.uid == userId;  // 본인만 수정 가능
    }
  }
}
```

### 3. 규칙 저장
1. 규칙을 입력한 후 **게시** 버튼 클릭
2. 확인 메시지에서 **게시** 클릭

### 4. 테스트
1. 페이지 새로고침
2. 댓글 작성 시도
3. 오류가 해결되었는지 확인

## 참고사항
- 규칙 변경 후 즉시 적용됩니다
- 개발 중에는 모든 읽기/쓰기를 허용하는 규칙을 사용할 수 있지만, 프로덕션에서는 더 엄격한 규칙을 권장합니다

