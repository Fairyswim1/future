import React from 'react'
import './LoadingModal.css'

const LoadingModal = ({ isOpen, message, progress }) => {
  if (!isOpen) return null

  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal-container">
        <div className="loading-spinner-large"></div>
        <h2>{message || 'AI가 게임을 생성 중입니다...'}</h2>
        <p className="loading-description">
          30초~1분 정도 소요됩니다. 잠시만 기다려주세요.
        </p>
        {progress && (
          <div className="loading-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="progress-text">{progress}%</p>
          </div>
        )}
        <div className="loading-dots">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    </div>
  )
}

export default LoadingModal
