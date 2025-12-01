# Firestore 설정 가이드

## Firestore란?

Firestore는 Firebase의 클라우드 데이터베이스입니다. 다른 사람들이 만든 게임/시뮬레이션을 실시간으로 볼 수 있게 해줍니다.

## 설정 방법

### 1단계: Firestore 활성화

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. **future-73593** 프로젝트 선택
3. 왼쪽 메뉴에서 **Firestore Database** 클릭
4. **데이터베이스 만들기** 클릭
5. **프로덕션 모드에서 시작** 선택 (나중에 규칙 수정 가능)
6. 위치 선택: **asia-northeast3 (서울)** 또는 원하는 위치
7. **사용 설정** 클릭

### 2단계: 보안 규칙 설정

1. Firestore Database 페이지에서 **규칙** 탭 클릭
2. 다음 규칙으로 변경:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 게임 컬렉션
    match /games/{gameId} {
      // 읽기: 모든 사람 가능
      allow read: if true;
      // 쓰기: 로그인한 사용자만 가능
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // 시뮬레이션 컬렉션
    match /simulations/{simulationId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // 웹툰 컬렉션
    match /webtoons/{webtoonId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

3. **게시** 클릭

### 3단계: Storage 설정 (HTML 파일 저장용)

1. Firebase Console에서 **Storage** 클릭
2. **시작하기** 클릭
3. **프로덕션 모드에서 시작** 선택
4. 위치 선택 (Firestore와 동일하게)
5. **완료** 클릭

### 4단계: Storage 보안 규칙 설정

1. Storage 페이지에서 **규칙** 탭 클릭
2. 다음 규칙으로 변경:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 게임 파일
    match /games/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 시뮬레이션 파일
    match /simulations/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 웹툰 파일
    match /webtoons/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. **게시** 클릭

## 완료!

이제 다른 사람들이 만든 게임/시뮬레이션을 실시간으로 볼 수 있습니다!

## 작동 방식

1. **업로드**: 게임을 업로드하면 Firestore와 Storage에 저장됩니다
2. **실시간 동기화**: 다른 사용자가 업로드하면 자동으로 화면에 나타납니다
3. **권한 관리**: 본인이 만든 것만 수정/삭제할 수 있습니다

## 문제 해결

### "Permission denied" 에러가 나는 경우
- Firestore 규칙이 올바르게 설정되었는지 확인
- Storage 규칙이 올바르게 설정되었는지 확인

### 데이터가 안 보이는 경우
- Firestore가 활성화되었는지 확인
- 브라우저 콘솔에서 에러 메시지 확인

