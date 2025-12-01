import React, { useState } from 'react'
import './CreateModal.css'

const CreateModal = ({ isOpen, onClose, onUpload, onLinkInsert, onGenerate, onWebtoonUpload, onWebtoonGenerate }) => {
  const [contentType, setContentType] = useState('game') // 'game', 'simulation', or 'webtoon'
  const [createMethod, setCreateMethod] = useState('upload') // 'upload', 'link', or 'vibe'
  
  // 파일 업로드 정보
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadGrade, setUploadGrade] = useState('')
  const [uploadCategory, setUploadCategory] = useState('')
  
  // 링크 삽입 정보
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [linkGrade, setLinkGrade] = useState('')
  const [linkCategory, setLinkCategory] = useState('')
  const [linkDescription, setLinkDescription] = useState('')
  
  // 바이브 코딩 질문들
  const [vibeQuestions, setVibeQuestions] = useState({
    grade: '',
    unit: '',
    gameType: '',
    difficulty: '',
    description: ''
  })

  if (!isOpen) return null

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file && (file.type === 'text/html' || file.name.endsWith('.html'))) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const title = uploadTitle || file.name.replace(/\.html$/i, '')
        
        if (contentType === 'webtoon') {
          if (onWebtoonUpload) {
            onWebtoonUpload({
              file: event.target.result,
              filename: file.name,
              title: title
            })
          }
        } else {
          if (onUpload) {
            onUpload({
              type: contentType,
              file: event.target.result,
              filename: file.name,
              title: title,
              grade: uploadGrade,
              category: uploadCategory
            })
          }
        }
        // 입력 필드 초기화
        setUploadTitle('')
        setUploadGrade('')
        setUploadCategory('')
        onClose()
      }
      reader.readAsText(file)
    } else {
      alert('HTML 파일만 업로드 가능합니다.')
    }
  }

  const handleLinkInsert = () => {
    if (!linkUrl || !linkTitle) {
      alert('링크 URL과 제목을 입력해주세요.')
      return
    }
    
    // URL 유효성 검사
    if (!linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
      alert('올바른 URL을 입력해주세요. (http:// 또는 https://로 시작)')
      return
    }
    
    if (contentType === 'webtoon') {
      if (onWebtoonUpload) {
        onWebtoonUpload({
          type: 'link',
          url: linkUrl,
          title: linkTitle,
          grade: linkGrade,
          category: linkCategory,
          description: linkDescription
        })
      }
    } else {
      if (onLinkInsert) {
        onLinkInsert({
          type: contentType,
          url: linkUrl,
          title: linkTitle,
          grade: linkGrade,
          category: linkCategory,
          description: linkDescription
        })
      }
    }
    
    // 입력 필드 초기화
    setLinkUrl('')
    setLinkTitle('')
    setLinkGrade('')
    setLinkCategory('')
    setLinkDescription('')
    onClose()
  }

  const handleVibeGenerate = () => {
    if (contentType === 'webtoon') {
      // 웹툰의 경우 다른 질문들
      if (!vibeQuestions.grade || !vibeQuestions.unit || !vibeQuestions.description) {
        alert('필수 항목을 모두 입력해주세요.')
        return
      }

      const prompt = `수학 웹툰을 만들어주세요.

학년: ${vibeQuestions.grade}
단원: ${vibeQuestions.unit}
스타일: ${vibeQuestions.gameType || '일반'}
설명: ${vibeQuestions.description}

위 조건에 맞는 수학 웹툰을 HTML, CSS, JavaScript로 완전한 웹 페이지로 만들어주세요.`

      if (onWebtoonGenerate) {
        onWebtoonGenerate({
          prompt: prompt,
          metadata: vibeQuestions
        })
      }
    } else {
      // 게임/시뮬레이션의 경우
      if (!vibeQuestions.grade || !vibeQuestions.unit || !vibeQuestions.gameType || !vibeQuestions.difficulty || !vibeQuestions.description) {
        alert('모든 질문에 답변해주세요.')
        return
      }

      const prompt = `${contentType === 'game' ? '수학 게임' : '수학 시뮬레이션'}을 만들어주세요.

학년: ${vibeQuestions.grade}
단원: ${vibeQuestions.unit}
게임 형식: ${vibeQuestions.gameType}
난이도: ${vibeQuestions.difficulty}
설명: ${vibeQuestions.description}

위 조건에 맞는 ${contentType === 'game' ? '게임' : '시뮬레이션'}을 HTML, CSS, JavaScript로 완전한 웹 페이지로 만들어주세요.`

      if (onGenerate) {
        onGenerate({
          type: contentType,
          prompt: prompt,
          metadata: vibeQuestions
        })
      }
    }
    onClose()
  }

  const gameTypes = [
    '퀴즈/문제 풀이',
    '퍼즐/퍼즐 맞추기',
    '액션/실시간 반응',
    '롤플레잉(RPG)',
    '보드 게임',
    '카드 게임',
    '기타'
  ]

  const simulationTypes = [
    '시각화 도구',
    '실험 시뮬레이터',
    '그래프/차트',
    '인터랙티브 도형',
    '계산기',
    '기타'
  ]

  const webtoonStyles = [
    '일반',
    '만화 스타일',
    '일러스트 스타일',
    '애니메이션 스타일',
    '기타'
  ]

  return (
    <div className="create-modal-overlay" onClick={onClose}>
      <div className="create-modal" onClick={(e) => e.stopPropagation()}>
        <div className="create-modal-header">
          <h2>콘텐츠 만들기</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="create-modal-content">
          {/* 콘텐츠 타입 선택 */}
          <div className="form-section">
            <label className="form-label">콘텐츠 유형</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  value="game"
                  checked={contentType === 'game'}
                  onChange={(e) => setContentType(e.target.value)}
                />
                <span>수학 게임</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="simulation"
                  checked={contentType === 'simulation'}
                  onChange={(e) => setContentType(e.target.value)}
                />
                <span>수학 시뮬레이션</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="webtoon"
                  checked={contentType === 'webtoon'}
                  onChange={(e) => setContentType(e.target.value)}
                />
                <span>수학 웹툰</span>
              </label>
            </div>
          </div>

          {/* 만들기 방법 선택 */}
          <div className="form-section">
            <label className="form-label">만들기 방법</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  value="upload"
                  checked={createMethod === 'upload'}
                  onChange={(e) => setCreateMethod(e.target.value)}
                />
                <span>1. HTML 파일 올리기</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="link"
                  checked={createMethod === 'link'}
                  onChange={(e) => setCreateMethod(e.target.value)}
                />
                <span>2. 링크 삽입하기</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="vibe"
                  checked={createMethod === 'vibe'}
                  onChange={(e) => setCreateMethod(e.target.value)}
                />
                <span>3. 바이브 코딩으로 만들어보기</span>
              </label>
            </div>
          </div>

          {/* 링크 삽입 */}
          {createMethod === 'link' && (
            <div className="form-section">
              <div className="form-section">
                <label className="form-label">링크 URL <span style={{color: 'red'}}>*</span></label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/game.html"
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-section">
                <label className="form-label">제목 <span style={{color: 'red'}}>*</span></label>
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="게임/시뮬레이션 제목"
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-section">
                <label className="form-label">학년 (선택사항)</label>
                <input
                  type="text"
                  value={linkGrade}
                  onChange={(e) => setLinkGrade(e.target.value)}
                  placeholder="예: 초3, 중1 등"
                  className="form-input"
                />
              </div>
              
              <div className="form-section">
                <label className="form-label">카테고리 (선택사항)</label>
                <input
                  type="text"
                  value={linkCategory}
                  onChange={(e) => setLinkCategory(e.target.value)}
                  placeholder="예: 수와 연산, 기하 등"
                  className="form-input"
                />
              </div>
              
              <div className="form-section">
                <label className="form-label">설명 (선택사항)</label>
                <textarea
                  value={linkDescription}
                  onChange={(e) => setLinkDescription(e.target.value)}
                  placeholder="게임/시뮬레이션에 대한 설명을 입력하세요..."
                  className="form-textarea"
                  rows="3"
                />
              </div>
              
              <button className="generate-btn" onClick={handleLinkInsert}>
                링크 추가하기
              </button>
            </div>
          )}

          {/* HTML 파일 업로드 */}
          {createMethod === 'upload' && (
            <div className="form-section">
              <div className="form-section">
                <label className="form-label">제목 (선택사항)</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="파일명이 제목으로 사용됩니다"
                  className="form-input"
                />
              </div>
              
              <div className="form-section">
                <label className="form-label">학년 (선택사항)</label>
                <input
                  type="text"
                  value={uploadGrade}
                  onChange={(e) => setUploadGrade(e.target.value)}
                  placeholder="예: 초3, 중1 등"
                  className="form-input"
                />
              </div>
              
              <div className="form-section">
                <label className="form-label">카테고리 (선택사항)</label>
                <input
                  type="text"
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  placeholder="예: 수와 연산, 기하 등"
                  className="form-input"
                />
              </div>
              
              <div className="form-section">
                <label className="form-label">HTML 파일 선택</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    accept=".html"
                    onChange={handleFileUpload}
                    id="html-upload"
                    className="file-input"
                  />
                  <label htmlFor="html-upload" className="file-upload-label">
                    <span>📁</span>
                    <span>HTML 파일을 선택하세요</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 바이브 코딩 질문들 */}
          {createMethod === 'vibe' && (
            <div className="vibe-questions">
              <div className="form-section">
                <label className="form-label">학년 선택</label>
                <select
                  value={vibeQuestions.grade}
                  onChange={(e) => setVibeQuestions({...vibeQuestions, grade: e.target.value})}
                  className="form-select"
                >
                  <option value="">선택하세요</option>
                  <option value="초1">초등학교 1학년</option>
                  <option value="초2">초등학교 2학년</option>
                  <option value="초3">초등학교 3학년</option>
                  <option value="초4">초등학교 4학년</option>
                  <option value="초5">초등학교 5학년</option>
                  <option value="초6">초등학교 6학년</option>
                  <option value="중1">중학교 1학년</option>
                  <option value="중2">중학교 2학년</option>
                  <option value="중3">중학교 3학년</option>
                  <option value="고1">고등학교 1학년</option>
                  <option value="고2">고등학교 2학년</option>
                  <option value="고3">고등학교 3학년</option>
                </select>
              </div>

              <div className="form-section">
                <label className="form-label">단원 선택</label>
                <input
                  type="text"
                  value={vibeQuestions.unit}
                  onChange={(e) => setVibeQuestions({...vibeQuestions, unit: e.target.value})}
                  placeholder="예: 덧셈과 뺄셈, 분수, 도형 등"
                  className="form-input"
                />
              </div>

              <div className="form-section">
                <label className="form-label">
                  {contentType === 'game' ? '게임 형식' : contentType === 'simulation' ? '시뮬레이션 형식' : '웹툰 스타일'}
                </label>
                <select
                  value={vibeQuestions.gameType}
                  onChange={(e) => setVibeQuestions({...vibeQuestions, gameType: e.target.value})}
                  className="form-select"
                >
                  <option value="">선택하세요</option>
                  {(contentType === 'game' ? gameTypes : contentType === 'simulation' ? simulationTypes : webtoonStyles).map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {contentType !== 'webtoon' && (
                <div className="form-section">
                  <label className="form-label">난이도</label>
                  <select
                    value={vibeQuestions.difficulty}
                    onChange={(e) => setVibeQuestions({...vibeQuestions, difficulty: e.target.value})}
                    className="form-select"
                  >
                    <option value="">선택하세요</option>
                    <option value="초급">초급</option>
                    <option value="중급">중급</option>
                    <option value="고급">고급</option>
                  </select>
                </div>
              )}

              <div className="form-section">
                <label className="form-label">추가 설명 (선택사항)</label>
                <textarea
                  value={vibeQuestions.description}
                  onChange={(e) => setVibeQuestions({...vibeQuestions, description: e.target.value})}
                  placeholder="원하는 기능이나 특징을 자유롭게 설명해주세요..."
                  className="form-textarea"
                  rows="4"
                />
              </div>

              <button className="generate-btn" onClick={handleVibeGenerate}>
                생성하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateModal

