import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import CommentModal from './CommentModal'
import EditModal from './EditModal'
import './ContentCard.css'

const ContentCard = ({ item, type, onDelete, onUpdate }) => {
  const { user } = useAuth()
  const [likes, setLikes] = useState(item.likes || 0)
  const [isLiked, setIsLiked] = useState(false)
  const [commentCount, setCommentCount] = useState(item.comments || 0)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  // 업로드한 사람인지 확인 (로컬 스토리지에 저장된 항목만)
  const isOwner = item.uploadedBy && user && (
    item.uploadedBy === user.displayName || 
    item.uploadedBy === user.email ||
    item.userId === user.uid
  )

  const handleLike = (e) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)
  }

  const handleComment = (e) => {
    e.stopPropagation()
    setShowCommentModal(true)
  }

  const handleAddComment = (itemId, comment) => {
    setCommentCount(commentCount + 1)
  }

  const handleShare = (e) => {
    e.stopPropagation()
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: item.url
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(item.url)
      alert('링크가 클립보드에 복사되었습니다!')
    }
  }

  // HTML 콘텐츠를 새 창에서 열기
  const openGameInNewWindow = async (htmlContent, title) => {
    try {
      console.log('openGameInNewWindow 호출, htmlContent 길이:', htmlContent?.length)
      
      if (!htmlContent || htmlContent.trim().length === 0) {
        console.error('htmlContent가 비어있습니다.')
        alert('게임 콘텐츠가 비어있습니다.')
        return
      }
      
      // 새 창 열기 (빈 창)
      const newWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        console.error('팝업이 차단되었습니다.')
        alert('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.')
        return
      }
      
      console.log('새 창 열기 성공, HTML 작성 중...')
      
      // 새 창의 document에 HTML 직접 작성 (다운로드 방지)
      try {
        newWindow.document.open()
        newWindow.document.write(htmlContent)
        newWindow.document.close()
        console.log('HTML 작성 완료')
      } catch (error) {
        console.error('HTML 작성 실패:', error)
        // 실패 시 data URL로 시도
        const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent)
        newWindow.location.href = dataUrl
      }
    } catch (error) {
      console.error('게임 열기 실패:', error)
      alert('게임을 열 수 없습니다: ' + error.message)
    }
  }

  // 로컬 스토리지에서 htmlContent 가져오기
  const getHtmlContentFromStorage = () => {
    // 1순위: item에 직접 htmlContent가 있는 경우
    if (item.htmlContent) {
      console.log('item.htmlContent 직접 사용')
      return item.htmlContent
    }
    
    // 2순위: 로컬 스토리지에서 찾기
    if (item.id) {
      try {
        const localGames = JSON.parse(localStorage.getItem('math_platform_games') || '[]')
        const localSims = JSON.parse(localStorage.getItem('math_platform_simulations') || '[]')
        const allItems = [...localGames, ...localSims]
        console.log('로컬 스토리지 검색:', { itemId: item.id, totalItems: allItems.length })
        
        const found = allItems.find(g => g.id === item.id)
        if (found) {
          console.log('로컬 스토리지에서 찾음:', { 
            hasHtmlContent: !!found.htmlContent,
            hasHtmlUrl: !!found.htmlUrl,
            hasUrl: !!found.url
          })
          if (found.htmlContent) {
            return found.htmlContent
          }
        } else {
          console.log('로컬 스토리지에서 찾지 못함')
        }
      } catch (e) {
        console.error('로컬 스토리지 읽기 실패:', e)
      }
    }
    
    return null
  }

  const handleCardClick = (e) => {
    // 버튼이나 메뉴 클릭은 무시
    if (e.target.closest('button') || e.target.closest('.card-menu-container')) {
      return
    }
    
    if (!showMenu) {
      // 1순위: 로컬 스토리지에서 htmlContent 가져오기
      const htmlContent = getHtmlContentFromStorage()
      if (htmlContent) {
        openGameInNewWindow(htmlContent, item.title)
        return
      }
      
      // 2순위: htmlUrl이 있으면 새 창에서 열기
      if (item.htmlUrl) {
        // Firebase Storage URL은 직접 열기 (CORS 문제 방지)
        if (item.htmlUrl.includes('firebasestorage.googleapis.com')) {
          window.open(item.htmlUrl, '_blank')
        } else {
          // 다른 URL은 fetch 시도
          fetch(item.htmlUrl)
            .then(response => {
              if (!response.ok) throw new Error('HTTP error!')
              return response.text()
            })
            .then(html => {
              openGameInNewWindow(html, item.title)
            })
            .catch(error => {
              console.error('HTML 로드 실패:', error)
              // fetch 실패 시 직접 URL로 열기 (CORS 문제일 수 있음)
              window.open(item.htmlUrl, '_blank')
            })
        }
        return
      }
      
      // 3순위: 외부 URL인 경우 새 창으로 열기 (링크 삽입한 경우)
      if (item.url && (item.url.startsWith('http://') || item.url.startsWith('https://'))) {
        window.open(item.url, '_blank')
      }
    }
  }

  const handleStartClick = (e) => {
    e.stopPropagation()
    
    console.log('시작하기 클릭:', item.title, {
      htmlContent: !!item.htmlContent,
      htmlUrl: item.htmlUrl,
      url: item.url,
      id: item.id
    })
    
    // 1순위: 로컬 스토리지에서 htmlContent 가져오기
    const htmlContent = getHtmlContentFromStorage()
    console.log('htmlContent 찾기 결과:', !!htmlContent)
    
    if (htmlContent) {
      console.log('htmlContent로 새 창 열기')
      openGameInNewWindow(htmlContent, item.title)
      return
    }
    
    // 2순위: htmlUrl이 있으면 fetch해서 새 창에서 열기
    if (item.htmlUrl) {
      console.log('htmlUrl로 새 창 열기:', item.htmlUrl)
      
      // 모든 URL을 fetch해서 가져온 후 새 창에 작성 (다운로드 방지)
      fetch(item.htmlUrl)
        .then(response => {
          if (!response.ok) throw new Error('HTTP error!')
          return response.text()
        })
        .then(html => {
          console.log('fetch 성공, 새 창 열기')
          openGameInNewWindow(html, item.title)
        })
        .catch(error => {
          console.error('HTML 로드 실패:', error)
          // fetch 실패 시 (CORS 문제) 직접 URL로 열기 (다운로드 가능성 있음)
          alert('게임을 불러오는데 실패했습니다. 새 창에서 열어보겠습니다.')
          const newWindow = window.open(item.htmlUrl, '_blank')
          if (!newWindow) {
            alert('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.')
          }
        })
      return
    }
    
    // 3순위: 외부 URL인 경우 새 창으로 열기 (링크 삽입한 경우)
    if (item.url && (item.url.startsWith('http://') || item.url.startsWith('https://'))) {
      console.log('외부 URL로 새 창 열기:', item.url)
      const newWindow = window.open(item.url, '_blank')
      if (!newWindow) {
        alert('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.')
      }
      return
    }
    
    console.error('게임을 불러올 수 없습니다. 콘텐츠가 없습니다.')
    alert('게임을 불러올 수 없습니다. 콘텐츠가 없습니다.')
  }

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMenu && !e.target.closest('.card-menu-container')) {
        setShowMenu(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showMenu])

  const handleDelete = (e) => {
    e.stopPropagation()
    if (window.confirm('정말 삭제하시겠습니까?')) {
      if (onDelete) {
        onDelete(item.id)
      }
    }
    setShowMenu(false)
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    setShowEditModal(true)
    setShowMenu(false)
  }

  const handleUpdate = (updatedItem) => {
    if (onUpdate) {
      onUpdate(updatedItem)
    }
  }

  return (
    <div className="content-card" onClick={handleCardClick}>
      <div className="card-number">{String(item.id).padStart(2, '0')}</div>
      <div className="card-thumbnail">
        {item.thumbnail ? (
          <img 
            src={item.thumbnail} 
            alt={item.title}
            className="thumbnail-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="thumbnail-placeholder" style={{ display: item.thumbnail ? 'none' : 'flex' }}>
          <span className="game-icon">🎮</span>
        </div>
        {item.grade && (
          <div className="card-badge">{item.grade}</div>
        )}
        <div className="card-game-icon">🎮</div>
      </div>
      <div className="card-content">
        <div className="card-header-row">
          <h3 className="card-title">{item.title}</h3>
          {isOwner && (
            <div className="card-menu-container">
              <button 
                className="card-menu-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
                title="메뉴"
              >
                ⋮
              </button>
              {showMenu && (
                <div className="card-menu-dropdown">
                  <button onClick={handleEdit}>✏️ 수정</button>
                  <button onClick={handleDelete}>🗑️ 삭제</button>
                </div>
              )}
            </div>
          )}
        </div>
        {item.uploadedBy && (
          <p className="card-uploader">만든이: {item.uploadedBy}</p>
        )}
        <p className="card-category">{item.category}</p>
        <p className="card-description">{item.description}</p>
        <button className="card-start-btn" onClick={handleStartClick}>시작하기</button>
      </div>
      <div className="card-footer">
        <div className="card-info">
          <span className="card-grade-category">{item.grade} {item.category}</span>
        </div>
        <div className="card-actions">
          <button 
            className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
            title="좋아요"
          >
            ♥ {likes}
          </button>
          <button 
            className="action-btn comment-btn"
            onClick={handleComment}
            title="댓글"
          >
            💬 {commentCount}
          </button>
          <button 
            className="action-btn share-btn"
            onClick={handleShare}
            title="공유"
          >
            📤
          </button>
        </div>
      </div>
      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        item={item}
        onAddComment={handleAddComment}
      />
      <EditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        item={item}
        onSave={handleUpdate}
        type={type}
      />
    </div>
  )
}

export default ContentCard

