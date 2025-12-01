import React, { useState } from 'react'
import ContentCard from './ContentCard'
import './ContentCarousel.css'

const ContentCarousel = ({ items, type, onDelete, onUpdate }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerPage = 4

  const totalPages = Math.ceil(items.length / itemsPerPage)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1))
  }

  // 한 페이지씩 이동하도록 계산 (4개씩)
  // 실제 보이는 영역을 기준으로 계산 (wrapper padding 50px 제외)
  const itemWidth = 280
  const itemGap = 30
  const visibleWidth = itemWidth * itemsPerPage + itemGap * (itemsPerPage - 1)
  const translateX = currentIndex * visibleWidth

  return (
    <div className="carousel-container">
      {items.length > itemsPerPage && (
        <button className="carousel-arrow carousel-arrow-left" onClick={goToPrevious}>
          ‹
        </button>
      )}
      <div className="carousel-wrapper">
        <div 
          className="carousel-content"
          style={{
            transform: `translateX(-${translateX}px)`
          }}
        >
          {items.map((item) => (
            <ContentCard 
              key={item.id} 
              item={item} 
              type={type}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </div>
      {items.length > itemsPerPage && (
        <button className="carousel-arrow carousel-arrow-right" onClick={goToNext}>
          ›
        </button>
      )}
    </div>
  )
}

export default ContentCarousel

