import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  addGameComment, 
  addSimulationComment,
  addToolComment,
  subscribeGameComments,
  subscribeSimulationComments,
  subscribeToolComments,
  deleteGameComment,
  deleteSimulationComment,
  deleteToolComment
} from '../utils/firestore'
import './CommentModal.css'

const CommentModal = ({ isOpen, onClose, item, type, onAddComment }) => {
  const { user, nickname } = useAuth()
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 댓글 목록 구독
  useEffect(() => {
    if (!isOpen || !item.id) return

    // item.id를 문자열로 변환 (Firebase는 문자열 ID를 요구함)
    const itemId = String(item.id)

    let unsubscribe
    if (type === 'game') {
      unsubscribe = subscribeGameComments(itemId, (comments) => {
        setComments(comments)
      })
    } else if (type === 'simulation') {
      unsubscribe = subscribeSimulationComments(itemId, (comments) => {
        setComments(comments)
      })
    } else if (type === 'tool') {
      unsubscribe = subscribeToolComments(itemId, (comments) => {
        setComments(comments)
      })
    }

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [isOpen, item.id, type])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    if (!user) {
      alert('댓글을 작성하려면 로그인이 필요합니다.')
      return
    }

    setIsSubmitting(true)
    try {
      // 닉네임 우선 사용, 없으면 displayName, 없으면 email, 없으면 익명
      const userName = nickname || user.displayName || user.email || '익명'
      // item.id를 문자열로 변환 (Firebase는 문자열 ID를 요구함)
      const itemId = String(item.id)

      if (type === 'game') {
        await addGameComment(itemId, newComment.trim(), user.uid, userName)
      } else if (type === 'simulation') {
        await addSimulationComment(itemId, newComment.trim(), user.uid, userName)
      } else if (type === 'tool') {
        await addToolComment(itemId, newComment.trim(), user.uid, userName)
      }

      setNewComment('')
      if (onAddComment) {
        onAddComment(itemId, { text: newComment.trim(), author: userName })
      }
      // 댓글 작성 성공 후 모달 닫기
      onClose()
    } catch (error) {
      console.error('댓글 작성 실패:', error)
      alert('댓글 작성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!user) return
    
    if (!confirm('댓글을 삭제하시겠습니까?')) return

    try {
      const itemId = String(item.id)
      
      if (type === 'game') {
        await deleteGameComment(itemId, commentId)
      } else if (type === 'simulation') {
        await deleteSimulationComment(itemId, commentId)
      } else if (type === 'tool') {
        await deleteToolComment(itemId, commentId)
      }
    } catch (error) {
      console.error('댓글 삭제 실패:', error)
      alert('댓글 삭제 중 오류가 발생했습니다.')
    }
  }

  if (!isOpen) return null

  const modalContent = (
    <div className="comment-modal-overlay" onClick={onClose}>
      <div className="comment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comment-modal-header">
          <h3>{item.title} - 댓글</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="comment-list">
          {comments.length === 0 ? (
            <p className="no-comments">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <div className="comment-author">{comment.author}</div>
                  {user && comment.userId === user.uid && (
                    <button 
                      className="comment-delete-btn"
                      onClick={() => handleDeleteComment(comment.id)}
                      title="댓글 삭제"
                    >
                      삭제
                    </button>
                  )}
                </div>
                <div className="comment-text">{comment.text}</div>
                <div className="comment-date">
                  {comment.createdAt 
                    ? new Date(comment.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '날짜 없음'}
                </div>
              </div>
            ))
          )}
        </div>
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
            rows="3"
          />
          <button type="submit" disabled={isSubmitting || !user}>
            {isSubmitting ? '작성 중...' : user ? '댓글 작성' : '로그인 필요'}
          </button>
        </form>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default CommentModal

