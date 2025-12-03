import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { isAdmin } from '../config/admin'
import CommentModal from './CommentModal'
import EditModal from './EditModal'
import { 
  toggleGameLike, 
  toggleSimulationLike,
  toggleToolLike,
  subscribeGameComments,
  subscribeSimulationComments,
  subscribeToolComments
} from '../utils/firestore'
import './ContentCard.css'

const ContentCard = ({ item, type, onDelete, onUpdate }) => {
  const { user } = useAuth()
  const [likes, setLikes] = useState(item.likes || 0)
  const [isLiked, setIsLiked] = useState(false)
  const [commentCount, setCommentCount] = useState(item.comments || 0)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  // 업로드한 사람인지 확인 (userId로만 확인 - 가장 정확함)
  const isOwner = user && item.userId && item.userId === user.uid

  // 기본 게임/시뮬레이션인지 확인 (id가 숫자인 경우)
  const isDefaultItem = typeof item.id === 'number'

  // 수정/삭제 버튼 표시 여부 (소유자이거나 관리자)
  // 기본 게임의 경우 관리자만 수정/삭제 가능
  const canEdit = isOwner || (isDefaultItem && isAdmin(user))

  // 기본 게임/시뮬레이션은 Firestore에 없으므로 좋아요/댓글 기능 비활성화
  const canInteract = !isDefaultItem

  // 좋아요 상태 초기화 (Firestore에서 가져온 likedBy 배열 확인)
  useEffect(() => {
    if (user && user.uid) {
      // likedBy가 배열인지 확인
      if (item.likedBy && Array.isArray(item.likedBy)) {
        setIsLiked(item.likedBy.includes(user.uid))
      } else {
        setIsLiked(false)
      }
    } else {
      setIsLiked(false)
    }
    setLikes(item.likes || 0)
    setCommentCount(item.comments || 0)
  }, [item.likes, item.comments, item.likedBy, user])

  const handleLike = async (e) => {
    e.stopPropagation()

    // 기본 게임/시뮬레이션은 좋아요 불가
    if (!canInteract) {
      alert('기본 게임/시뮬레이션은 좋아요를 누를 수 없습니다.')
      return
    }

    if (!user) {
      alert('좋아요를 누르려면 로그인이 필요합니다.')
      return
    }

    try {
      // item.id를 문자열로 변환 (Firebase는 문자열 ID를 요구함)
      const itemId = String(item.id)

      if (type === 'game') {
        const result = await toggleGameLike(itemId, user.uid)
        setLikes(result.likes)
        setIsLiked(result.liked)
      } else if (type === 'simulation') {
        const result = await toggleSimulationLike(itemId, user.uid)
        setLikes(result.likes)
        setIsLiked(result.liked)
      } else if (type === 'tool') {
        const result = await toggleToolLike(itemId, user.uid)
        setLikes(result.likes)
        setIsLiked(result.liked)
      }
    } catch (error) {
      console.error('좋아요 실패:', error)
      alert('좋아요 처리 중 오류가 발생했습니다.')
    }
  }

  const handleComment = (e) => {
    e.stopPropagation()

    // 기본 게임/시뮬레이션은 댓글 불가
    if (!canInteract) {
      alert('기본 게임/시뮬레이션은 댓글을 작성할 수 없습니다.')
      return
    }

    setShowCommentModal(true)
  }

  const handleAddComment = (itemId, comment) => {
    // 댓글이 추가되면 Firestore에서 자동으로 업데이트되므로
    // 여기서는 카운트만 증가 (실제 업데이트는 CommentModal에서 처리)
    setCommentCount(prev => prev + 1)
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
      if (!htmlContent || htmlContent.trim().length === 0) {
        alert('게임 콘텐츠가 비어있습니다.')
        return
      }
      
      // 새 창 열기 (빈 창)
      const newWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        alert('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.')
        return
      }
      
      // 새 창의 document에 HTML 직접 작성 (다운로드 방지)
      try {
        newWindow.document.open()
        newWindow.document.write(htmlContent)
        newWindow.document.close()
      } catch (error) {
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
      return item.htmlContent
    }
    
    // 2순위: 로컬 스토리지에서 찾기
    if (item.id) {
      try {
        const localGames = JSON.parse(localStorage.getItem('math_platform_games') || '[]')
        const localSims = JSON.parse(localStorage.getItem('math_platform_simulations') || '[]')
        const allItems = [...localGames, ...localSims]
        
        const found = allItems.find(g => g.id === item.id)
        if (found && found.htmlContent) {
          return found.htmlContent
        }
      } catch (e) {
        console.error('로컬 스토리지 읽기 실패:', e)
      }
    }
    
    return null
  }

  const handleStartClick = (e) => {
    e.stopPropagation()
    
    // 1순위: 로컬 스토리지에서 htmlContent 가져오기
    const htmlContent = getHtmlContentFromStorage()
    
    if (htmlContent) {
      openGameInNewWindow(htmlContent, item.title)
      return
    }
    
    // 2순위: htmlUrl이 있으면 새 창에서 열기
    if (item.htmlUrl) {
      // Firebase Storage URL은 CORS 문제가 있을 수 있으므로 직접 열기
      if (item.htmlUrl.includes('firebasestorage.googleapis.com')) {
        const newWindow = window.open(item.htmlUrl, '_blank')
        if (!newWindow) {
          alert('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.')
        }
      } else {
        // 다른 URL은 fetch 시도
        fetch(item.htmlUrl)
          .then(response => {
            if (!response.ok) throw new Error('HTTP error!')
            return response.text()
          })
          .then(html => {
            console.log('fetch 성공, HTML 길이:', html.length, '새 창 열기')
            openGameInNewWindow(html, item.title)
          })
          .catch(error => {
            console.error('HTML 로드 실패:', error)
            // fetch 실패 시 직접 URL로 열기
            const newWindow = window.open(item.htmlUrl, '_blank')
            if (!newWindow) {
              alert('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.')
            }
          })
      }
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
    <div className="content-card">
      <div className="card-thumbnail">
        {item.thumbnail && item.thumbnail !== 'null' && item.thumbnail !== '/thumbnails/default.png' ? (
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
        <div className="thumbnail-placeholder" style={{
          display: (item.thumbnail && item.thumbnail !== 'null' && item.thumbnail !== '/thumbnails/default.png') ? 'none' : 'flex'
        }}>
          <span className="game-icon">
            {type === 'game' ? '🎮' : type === 'simulation' ? '🔬' : type === 'tool' ? '🛠️' : '📚'}
          </span>
        </div>
        {item.grade && (
          <div className="card-badge">{item.grade}</div>
        )}
      </div>
      <div className="card-content">
        <div className="card-header-row">
          <h3 className="card-title">{item.title}</h3>
          {canEdit && (
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
            className={`action-btn like-btn ${isLiked ? 'liked' : ''} ${!canInteract ? 'disabled' : ''}`}
            onClick={handleLike}
            title={canInteract ? "좋아요" : "기본 게임/시뮬레이션은 좋아요를 누를 수 없습니다"}
            disabled={!canInteract}
          >
            ♥ {likes}
          </button>
          <button
            className={`action-btn comment-btn ${!canInteract ? 'disabled' : ''}`}
            onClick={handleComment}
            title={canInteract ? "댓글" : "기본 게임/시뮬레이션은 댓글을 작성할 수 없습니다"}
            disabled={!canInteract}
          >
            💬 {commentCount}
          </button>
          <button
            className="action-btn share-btn"
            onClick={handleShare}
            title="공유"
          >
            🔗 공유
          </button>
        </div>
      </div>
      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        item={item}
        type={type}
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

