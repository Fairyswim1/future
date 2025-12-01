import React, { useState, useEffect } from 'react'
import './EditModal.css'

const EditModal = ({ isOpen, onClose, item, onSave, type }) => {
  const [title, setTitle] = useState('')
  const [grade, setGrade] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (item) {
      setTitle(item.title || '')
      setGrade(item.grade || '')
      setCategory(item.category || '')
      setDescription(item.description || '')
    }
  }, [item])

  if (!isOpen || !item) return null

  const handleSave = () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    onSave({
      ...item,
      title: title.trim(),
      grade: grade.trim(),
      category: category.trim(),
      description: description.trim()
    })
    onClose()
  }

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h2>{type === 'game' ? '게임' : '시뮬레이션'} 수정</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="edit-modal-content">
          <div className="form-section">
            <label className="form-label">제목 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              placeholder="제목을 입력하세요"
            />
          </div>

          <div className="form-section">
            <label className="form-label">학년</label>
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="form-input"
              placeholder="예: 초3, 중1 등"
            />
          </div>

          <div className="form-section">
            <label className="form-label">카테고리</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-input"
              placeholder="예: 수와 연산, 기하 등"
            />
          </div>

          <div className="form-section">
            <label className="form-label">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              rows="4"
              placeholder="설명을 입력하세요"
            />
          </div>

          <div className="edit-modal-actions">
            <button className="cancel-btn" onClick={onClose}>
              취소
            </button>
            <button className="save-btn" onClick={handleSave}>
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditModal

