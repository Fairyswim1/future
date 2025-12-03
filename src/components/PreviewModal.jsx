import React, { useState } from 'react'
import './PreviewModal.css'

const PreviewModal = ({ 
  isOpen, 
  onClose, 
  htmlContent, 
  title, 
  onRegenerate, 
  onUpload,
  isRegenerating = false
}) => {
  const [modificationRequest, setModificationRequest] = useState('')

  if (!isOpen) return null

  const handlePreview = () => {
    // HTML을 새 창에서 열기
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
    const blobUrl = URL.createObjectURL(blob)
    const newWindow = window.open(blobUrl, '_blank', 'width=1200,height=800')
    
    if (!newWindow) {
      alert('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.')
      URL.revokeObjectURL(blobUrl)
      return
    }

    // 창이 닫히면 Blob URL 해제
    const checkClosed = setInterval(() => {
      if (newWindow.closed) {
        URL.revokeObjectURL(blobUrl)
        clearInterval(checkClosed)
      }
    }, 1000)

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl)
    }, 10000)
  }

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate(modificationRequest)
      setModificationRequest('')
    }
  }

  const handleUpload = () => {
    if (onUpload) {
      onUpload()
    }
  }

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div className="preview-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="preview-modal-header">
          <h2>생성 완료! 미리보기</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="preview-modal-content">
          <div className="preview-section">
            <h3>{title}</h3>
            <p className="preview-description">
              생성된 콘텐츠를 미리보기로 확인해보세요. 수정이 필요하면 아래에 입력해주세요.
            </p>
            <button className="preview-btn" onClick={handlePreview}>
              🔍 미리보기 (새 창에서 열기)
            </button>
          </div>

          <div className="modification-section">
            <h3>수정 요청사항</h3>
            <p className="modification-description">
              수정하고 싶은 내용을 입력해주세요. (예: "색상을 더 밝게", "버튼 크기를 키워주세요", "텍스트를 더 크게" 등)
            </p>
            <textarea
              className="modification-input"
              value={modificationRequest}
              onChange={(e) => setModificationRequest(e.target.value)}
              placeholder="수정하고 싶은 내용을 입력하세요..."
              rows="4"
            />
            <button 
              className="regenerate-btn" 
              onClick={handleRegenerate}
              disabled={isRegenerating}
            >
              {isRegenerating ? '재생성 중...' : '🔄 수정 사항 반영하여 재생성'}
            </button>
          </div>
        </div>

        <div className="preview-modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            취소
          </button>
          <button className="upload-btn" onClick={handleUpload}>
            ✅ 업로드하기
          </button>
        </div>
      </div>
    </div>
  )
}

export default PreviewModal




