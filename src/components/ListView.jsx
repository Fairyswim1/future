import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { isAdmin } from '../config/admin'
import ContentCard from './ContentCard'
import './ListView.css'

const ListView = ({ items, type, title, onDelete, onUpdate, onBack }) => {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortedItems, setSortedItems] = useState([])

  // 정렬 로직: 관리자 콘텐츠 -> 좋아요 많은 순 -> 최신순
  useEffect(() => {
    const sorted = [...items].sort((a, b) => {
      // 1. 관리자가 올린 것 우선
      const aIsAdmin = isAdmin({ uid: a.userId })
      const bIsAdmin = isAdmin({ uid: b.userId })

      if (aIsAdmin && !bIsAdmin) return -1
      if (!aIsAdmin && bIsAdmin) return 1

      // 2. 좋아요 개수 많은 순
      const likeDiff = (b.likes || 0) - (a.likes || 0)
      if (likeDiff !== 0) return likeDiff

      // 3. 최신순 (나중에 생성된 것이 뒤로)
      const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt || 0)
      const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt || 0)
      return aTime - bTime
    })

    setSortedItems(sorted)
  }, [items])

  // 검색 필터링
  const filteredItems = sortedItems.filter(item => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.grade?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      item.uploadedBy?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="list-view">
      <div className="list-view-header">
        <button className="back-btn" onClick={onBack}>
          ← 뒤로가기
        </button>
        <h1 className="list-view-title">{title}</h1>
        <div className="list-view-stats">
          총 {filteredItems.length}개
        </div>
      </div>

      <div className="list-view-search">
        <input
          type="text"
          placeholder="제목, 설명, 학년, 카테고리, 제작자로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button
            className="search-clear-btn"
            onClick={() => setSearchQuery('')}
          >
            ✕
          </button>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <div className="list-view-empty">
          {searchQuery ? (
            <>
              <p>검색 결과가 없습니다.</p>
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                검색어 지우기
              </button>
            </>
          ) : (
            <p>아직 콘텐츠가 없습니다.</p>
          )}
        </div>
      ) : (
        <div className="list-view-grid">
          {filteredItems.map(item => (
            <ContentCard
              key={item.id}
              item={item}
              type={type}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ListView
