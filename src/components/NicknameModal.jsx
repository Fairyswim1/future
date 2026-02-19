import React, { useState, useEffect } from 'react'
import './NicknameModal.css'

const NicknameModal = ({ isOpen, onClose, currentNickname, onUpdate }) => {
  const [nickname, setNickname] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setNickname(currentNickname || '')
    }
  }, [isOpen, currentNickname])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요.')
      return
    }

    if (nickname.trim().length > 20) {
      alert('닉네임은 20자 이하로 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      await onUpdate(nickname.trim())
      alert('✅ 닉네임이 변경되었습니다!')
      onClose()
    } catch (error) {
      console.error('닉네임 업데이트 실패:', error)
      alert('닉네임 변경 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="nickname-modal-overlay" onClick={onClose}>
      <div className="nickname-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="nickname-modal-header">
          <h2>닉네임 변경</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="nickname-modal-content">
          <p className="nickname-description">
            업로드한 콘텐츠에 표시될 닉네임을 설정하세요. 실명 대신 닉네임이 표시됩니다.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">닉네임</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 입력하세요 (최대 20자)"
                className="form-input"
                maxLength={20}
                disabled={isSubmitting}
                autoFocus
              />
              <p className="form-hint">
                현재 닉네임: {currentNickname || '설정되지 않음'}
              </p>
            </div>

            <div className="nickname-modal-footer">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                취소
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting || !nickname.trim()}
              >
                {isSubmitting ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NicknameModal








