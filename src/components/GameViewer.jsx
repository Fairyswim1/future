import React, { useEffect, useRef, useState } from 'react'
import './GameViewer.css'

const GameViewer = ({ isOpen, onClose, item }) => {
  const iframeRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // 모달이 열릴 때마다 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      setError(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && iframeRef.current && item) {
      const iframe = iframeRef.current
      setIsLoading(true)
      setError(null)
      
      // 1순위: htmlContent가 직접 있는 경우 (로컬 스토리지) - 직접 삽입
      if (item.htmlContent) {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
          iframeDoc.open()
          iframeDoc.write(item.htmlContent)
          iframeDoc.close()
          setIsLoading(false)
          return
        } catch (error) {
          console.error('iframe에 HTML 삽입 실패:', error)
          // 실패 시 로컬 스토리지에서 다시 시도
          if (item.id) {
            try {
              const localGames = JSON.parse(localStorage.getItem('math_platform_games') || '[]')
              const localSims = JSON.parse(localStorage.getItem('math_platform_simulations') || '[]')
              const found = [...localGames, ...localSims].find(g => g.id === item.id)
              if (found && found.htmlContent) {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
                iframeDoc.open()
                iframeDoc.write(found.htmlContent)
                iframeDoc.close()
                setIsLoading(false)
                return
              }
            } catch (e) {
              console.error('로컬 스토리지에서 HTML 가져오기 실패:', e)
            }
          }
          setError('게임을 불러오는데 실패했습니다.')
          setIsLoading(false)
        }
      } 
      
      // 2순위: htmlUrl이 있는 경우 (Firestore에서 가져온 경우)
      // Firebase Storage URL은 CORS 문제를 피하기 위해 iframe src에 직접 설정
      if (item.htmlUrl) {
        // Firebase Storage URL인 경우 iframe src에 직접 설정 (CORS 우회)
        if (item.htmlUrl.includes('firebasestorage.googleapis.com')) {
          iframe.onload = () => {
            setIsLoading(false)
          }
          iframe.onerror = () => {
            setError('게임을 불러오는데 실패했습니다.')
            setIsLoading(false)
          }
          iframe.src = item.htmlUrl
        } else {
          // 다른 URL인 경우 fetch 시도
          fetch(item.htmlUrl)
            .then(response => {
              if (!response.ok) throw new Error('HTTP error!')
              return response.text()
            })
            .then(html => {
              const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
              iframeDoc.open()
              iframeDoc.write(html)
              iframeDoc.close()
              setIsLoading(false)
            })
            .catch(error => {
              console.error('HTML 로드 실패:', error)
              // fetch 실패 시 iframe src로 폴백
              iframe.onload = () => setIsLoading(false)
              iframe.onerror = () => {
                setError('게임을 불러오는데 실패했습니다.')
                setIsLoading(false)
              }
              iframe.src = item.htmlUrl
            })
        }
        return
      }
      
      // 3순위: Blob URL인 경우 - fetch로 가져와서 삽입 (다운로드 방지)
      if (item.url && item.url.startsWith('blob:')) {
        fetch(item.url)
          .then(response => response.text())
          .then(html => {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
            iframeDoc.open()
            iframeDoc.write(html)
            iframeDoc.close()
          })
          .catch(error => {
            console.error('Blob URL에서 HTML 가져오기 실패:', error)
            // 로컬 스토리지에서 htmlContent 가져오기 시도
            if (item.id) {
              const localGames = JSON.parse(localStorage.getItem('math_platform_games') || '[]')
              const localSims = JSON.parse(localStorage.getItem('math_platform_simulations') || '[]')
              const found = [...localGames, ...localSims].find(g => g.id === item.id)
              if (found && found.htmlContent) {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
                iframeDoc.open()
                iframeDoc.write(found.htmlContent)
                iframeDoc.close()
                return
              }
            }
            alert('게임을 불러오는데 실패했습니다.')
          })
        return
      }
      
      // 4순위: 일반 URL인 경우 (외부 링크 삽입한 경우) - iframe에 직접 로드
      if (item.url && (item.url.startsWith('http://') || item.url.startsWith('https://'))) {
        iframe.onload = () => setIsLoading(false)
        iframe.onerror = () => {
          setError('게임을 불러오는데 실패했습니다.')
          setIsLoading(false)
        }
        iframe.src = item.url
      } else {
        setIsLoading(false)
      }
    }
  }, [isOpen, item])

  if (!isOpen || !item) return null

  return (
    <div className="game-viewer-overlay" onClick={onClose}>
      <div className="game-viewer-container" onClick={(e) => e.stopPropagation()}>
        <div className="game-viewer-header">
          <h2>{item.title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="game-viewer-content">
          {isLoading && (
            <div className="game-viewer-loading">
              <div className="loading-spinner"></div>
              <p>게임을 불러오는 중...</p>
            </div>
          )}
          {error && (
            <div className="game-viewer-error">
              <p>❌ {error}</p>
              <button onClick={onClose}>닫기</button>
            </div>
          )}
          <iframe
            ref={iframeRef}
            className="game-iframe"
            title={item.title}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation-by-user-activation"
            style={{ display: isLoading || error ? 'none' : 'block' }}
          />
        </div>
      </div>
    </div>
  )
}

export default GameViewer

