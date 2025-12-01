import React, { useState } from 'react'
import './CommentModal.css'

const CommentModal = ({ isOpen, onClose, item, onAddComment }) => {
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState([])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        text: newComment,
        author: '익명',
        date: new Date().toLocaleDateString('ko-KR')
      }
      setComments([...comments, comment])
      setNewComment('')
      if (onAddComment) {
        onAddComment(item.id, comment)
      }
    }
  }

  return (
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
                <div className="comment-author">{comment.author}</div>
                <div className="comment-text">{comment.text}</div>
                <div className="comment-date">{comment.date}</div>
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
          <button type="submit">댓글 작성</button>
        </form>
      </div>
    </div>
  )
}

export default CommentModal

