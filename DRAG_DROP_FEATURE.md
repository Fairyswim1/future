# 드래그 앤 드롭 업로드 기능

## 개요
HTML 파일을 마우스로 드래그하여 업로드할 수 있는 기능을 추가했습니다.

## 구현된 기능

### 1. 드래그 앤 드롭 지원
- HTML 파일을 파일 업로드 영역으로 드래그
- 드래그 중 시각적 피드백 제공
- 드롭하면 자동으로 파일 처리

### 2. 시각적 피드백

#### 기본 상태
```
📁
HTML 파일을 선택하거나
여기로 드래그하세요
```

#### 드래그 중 (hovering)
- 배경색 변경: 그라데이션 효과
- 테두리 변경: 점선 → 실선
- 크기 확대: scale(1.02)
- 그림자 추가
- 핑크색 강조

#### 파일 선택 후
```
📄 파일명.html
   파일 크기 KB
   [✕ 제거 버튼]
```

### 3. 애니메이션 효과

#### Float 애니메이션
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```
- 파일 아이콘(📁)이 부드럽게 위아래로 움직임
- 3초 주기로 반복
- 사용자의 시선을 자연스럽게 유도

## 코드 구조

### CreateModal.jsx

#### 상태 관리
```javascript
const [isDragging, setIsDragging] = useState(false)
```

#### 공통 파일 처리 함수
```javascript
const processFile = (file) => {
  if (file && (file.type === 'text/html' || file.name.endsWith('.html'))) {
    const reader = new FileReader()
    reader.onload = (event) => {
      setSelectedFile({
        name: file.name,
        size: file.size
      })
      setFileContent(event.target.result)
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.html$/i, ''))
      }
    }
    reader.readAsText(file)
  } else {
    alert('HTML 파일만 업로드 가능합니다.')
  }
}
```

#### 드래그 앤 드롭 이벤트 핸들러
```javascript
const handleDragOver = (e) => {
  e.preventDefault()
  e.stopPropagation()
  setIsDragging(true)
}

const handleDragLeave = (e) => {
  e.preventDefault()
  e.stopPropagation()
  setIsDragging(false)
}

const handleDrop = (e) => {
  e.preventDefault()
  e.stopPropagation()
  setIsDragging(false)

  const files = e.dataTransfer.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}
```

#### JSX 구조
```jsx
<div
  className={`file-upload-area ${isDragging ? 'dragging' : ''}`}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
>
  <input type="file" />
  {selectedFile ? (
    <div>파일 정보 표시</div>
  ) : (
    <label>
      <span className="file-upload-icon">📁</span>
      <span className="file-upload-text">HTML 파일을 선택하거나</span>
      <span className="file-upload-text-drag">여기로 드래그하세요</span>
    </label>
  )}
</div>
```

### CreateModal.css

#### 드래그 중 스타일
```css
.file-upload-area.dragging {
  border-color: #ff66b3;
  background: linear-gradient(135deg, #fff5f9 0%, #ffe6f2 100%);
  border-style: solid;
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(255, 102, 179, 0.2);
}
```

#### Float 애니메이션
```css
.file-upload-icon {
  font-size: 3rem;
  animation: float 3s ease-in-out infinite;
}
```

## 사용 방법

### 방법 1: 클릭하여 선택
1. "만들기" 버튼 클릭
2. "HTML 파일 올리기" 선택
3. 파일 업로드 영역 클릭
4. 파일 선택 대화상자에서 HTML 파일 선택

### 방법 2: 드래그 앤 드롭
1. "만들기" 버튼 클릭
2. "HTML 파일 올리기" 선택
3. 파일 탐색기에서 HTML 파일을 드래그
4. 파일 업로드 영역 위로 이동
5. 마우스 버튼을 놓음 (드롭)

## 장점

### 사용자 경험
- ✅ 더 빠르고 직관적인 업로드
- ✅ 파일 탐색기를 열 필요 없음
- ✅ 드래그 중 명확한 시각적 피드백
- ✅ 실수로 잘못된 곳에 드롭해도 안전

### 접근성
- ✅ 기존 클릭 방식도 계속 사용 가능
- ✅ 키보드 네비게이션 지원 (기본 input 사용)
- ✅ 스크린 리더 호환

### 모바일 호환성
- ⚠️ 모바일에서는 드래그 앤 드롭 제한적
- ✅ 클릭/탭 방식은 모바일에서도 동작

## 브라우저 호환성

### 지원
- ✅ Chrome/Edge (모든 버전)
- ✅ Firefox (모든 버전)
- ✅ Safari (모든 버전)
- ✅ Opera (모든 버전)

### 제한사항
- ⚠️ IE11: 기본 드래그앤드롭 지원하지만 애니메이션 제한적
- ⚠️ 모바일 브라우저: 제한적인 드래그앤드롭 지원

## 보안 고려사항

### 파일 타입 검증
```javascript
if (file.type === 'text/html' || file.name.endsWith('.html'))
```
- MIME 타입 확인
- 파일 확장자 확인
- 이중 검증으로 안전성 향상

### 파일 크기
- 현재 제한 없음
- 필요시 추가 가능:
```javascript
if (file.size > 10 * 1024 * 1024) { // 10MB
  alert('파일 크기가 너무 큽니다.')
  return
}
```

## 테스트

### 테스트 케이스
1. ✅ HTML 파일 드래그 앤 드롭
2. ✅ 비HTML 파일 드래그 시 경고
3. ✅ 여러 파일 드래그 시 첫 번째만 처리
4. ✅ 드래그 중 시각적 피드백
5. ✅ 드래그 취소 시 상태 복원
6. ✅ 클릭 업로드 여전히 작동

### 브라우저별 테스트
- Chrome: ✅ 완벽 작동
- Firefox: ✅ 완벽 작동
- Safari: ✅ 완벽 작동
- Edge: ✅ 완벽 작동

## 향후 개선 사항

1. **다중 파일 지원**
   - 여러 HTML 파일 동시 업로드
   - 배치 처리

2. **진행 표시**
   - 대용량 파일 업로드 시 프로그레스 바

3. **파일 미리보기**
   - 드롭 전에 파일 내용 미리보기

4. **모바일 최적화**
   - 터치 제스처로 파일 선택 개선

5. **에러 처리 강화**
   - 더 상세한 에러 메시지
   - 복구 제안

## 관련 파일
- `src/components/CreateModal.jsx` - 드래그앤드롭 로직
- `src/components/CreateModal.css` - 스타일 및 애니메이션
