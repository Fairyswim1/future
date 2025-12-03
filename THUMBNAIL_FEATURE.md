# 썸네일 기능 구현 문서

## 개요
HTML 콘텐츠(게임, 시뮬레이션, 웹툰, 수업 도구)를 업로드하거나 생성할 때 자동으로 썸네일을 생성하는 기능입니다.

## 기술 스택
- **html2canvas**: HTML 요소를 캔버스로 렌더링하여 이미지로 변환
- **Firebase Storage**: 생성된 썸네일 이미지를 저장
- **Firestore**: 썸네일 URL을 메타데이터로 저장

## 구현 방식

### 1. 썸네일 생성 (`src/utils/firestore.js`)

```javascript
export const generateThumbnail = async (htmlContent)
```

#### 작동 원리:
1. 숨겨진 iframe을 생성하여 HTML 콘텐츠를 렌더링
2. html2canvas를 사용하여 iframe의 내용을 캡처
3. 캡처된 이미지를 PNG Blob으로 변환
4. Firebase Storage에 업로드
5. 다운로드 URL을 반환

#### 주요 설정:
- **크기**: 1280x720px
- **품질**: 90% (PNG)
- **타임아웃**: 10초
- **렌더링 대기**: 2초 (동적 콘텐츠 로딩 완료 대기)

### 2. 저장 함수 통합

각 콘텐츠 타입의 저장 함수에서 썸네일 생성을 자동으로 수행합니다:

- `saveGameToFirestore()` - 게임
- `saveSimulationToFirestore()` - 시뮬레이션
- `saveWebtoonToFirestore()` - 웹툰
- `saveToolToFirestore()` - 수업 도구

#### 처리 순서:
1. HTML 콘텐츠를 Firebase Storage에 업로드
2. 썸네일 생성 시도 (동기적으로 처리)
3. 썸네일 생성 성공 시 URL을 Firestore에 저장
4. 썸네일 생성 실패 시 null 저장 (플레이스홀더 표시)

### 3. UI 표시 (`src/components/ContentCard.jsx`)

```jsx
{item.thumbnail && item.thumbnail !== 'null' && item.thumbnail !== '/thumbnails/default.png' ? (
  <img src={item.thumbnail} alt={item.title} className="thumbnail-image" />
) : null}
<div className="thumbnail-placeholder" style={{
  display: (item.thumbnail && item.thumbnail !== 'null' && item.thumbnail !== '/thumbnails/default.png') ? 'none' : 'flex'
}}>
  <span className="game-icon">
    {type === 'game' ? '🎮' : type === 'simulation' ? '🔬' : type === 'tool' ? '🛠️' : '📚'}
  </span>
</div>
```

#### 표시 로직:
- 썸네일이 있으면 이미지 표시
- 썸네일이 없으면 타입별 이모지 플레이스홀더 표시
- 이미지 로드 실패 시 자동으로 플레이스홀더로 전환

## 사용 예시

### HTML 파일 업로드 시
1. 사용자가 CreateModal에서 HTML 파일 선택
2. 업로드 버튼 클릭
3. `handleUpload()` 함수 실행
4. `saveGameToFirestore()` 호출
5. HTML Storage 업로드 → 썸네일 생성 → Firestore 저장
6. 사용자에게 업로드 완료 알림

### 바이브 코딩으로 생성 시
1. 사용자가 질문에 답변하고 생성 버튼 클릭
2. AI가 HTML 생성
3. 미리보기 모달에서 확인
4. 업로드 버튼 클릭
5. 썸네일 자동 생성 및 저장

## 로깅

콘솔에서 다음과 같은 로그를 확인할 수 있습니다:

```
썸네일 생성 시작, HTML 길이: 12345
iframe 로드 완료, 렌더링 대기 중...
html2canvas로 캡처 시작...
캡처 완료, 이미지 변환 중...
Firebase Storage에 업로드 중...
썸네일 업로드 완료: https://firebasestorage.googleapis.com/...
게임 저장 완료, ID: abc123
```

## 에러 처리

### 썸네일 생성 실패 시:
- 타임아웃 발생 → null 반환
- iframe 로드 실패 → null 반환
- html2canvas 오류 → null 반환
- Firebase Storage 업로드 실패 → null 반환

모든 경우에 콘텐츠 저장은 성공하며, 썸네일만 null로 저장됩니다.

## 성능 최적화

1. **비동기 처리**: 썸네일 생성은 콘텐츠 저장을 막지 않음
2. **타임아웃**: 10초 이상 걸리면 자동으로 중단
3. **에러 무시**: 썸네일 생성 실패가 전체 업로드를 막지 않음
4. **로컬 렌더링**: 서버 리소스를 사용하지 않음 (클라이언트 사이드)

## 향후 개선 사항

1. **사용자 직접 업로드**: 썸네일을 직접 선택할 수 있는 옵션 추가
2. **썸네일 재생성**: 기존 콘텐츠의 썸네일을 다시 생성하는 기능
3. **크기 최적화**: 썸네일 크기를 더 작게 조정하여 로딩 속도 개선
4. **캐싱**: 생성된 썸네일을 로컬에 캐싱하여 재로딩 방지
5. **서버 사이드 렌더링**: Puppeteer를 사용한 서버 사이드 썸네일 생성 (선택적)

## 관련 파일

- `src/utils/firestore.js` - 썸네일 생성 및 저장 로직
- `src/components/ContentCard.jsx` - 썸네일 표시 UI
- `src/components/ContentCard.css` - 썸네일 스타일
- `src/components/CreateModal.jsx` - 콘텐츠 생성 인터페이스
- `server.js` - 서버 사이드 썸네일 API (현재 미사용)
