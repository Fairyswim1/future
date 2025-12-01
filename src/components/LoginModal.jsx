import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './LoginModal.css'

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  const { loginWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await loginWithGoogle()
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (error) {
      console.error('Login error:', error)
      
      // 더 자세한 에러 메시지 표시
      let errorMessage = '로그인에 실패했습니다.'
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = '로그인 창이 닫혔습니다. 다시 시도해주세요.'
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = '팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.'
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = '이 도메인은 허용되지 않았습니다. Firebase Console에서 도메인을 추가해주세요.'
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google 로그인이 활성화되지 않았습니다. Firebase Console에서 확인해주세요.'
      } else if (error.message) {
        errorMessage = `로그인 실패: ${error.message}`
      }
      
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="login-modal-header">
          <h2>로그인 필요</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="login-modal-content">
          <p>콘텐츠를 만들려면 로그인이 필요합니다.</p>
          <button 
            className="google-login-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? (
              '로그인 중...'
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 로그인
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginModal

