import React from 'react'
import './WebtoonSection.css'

const WebtoonSection = ({ webtoons = [] }) => {
  const handleWebtoonClick = (webtoon) => {
    if (webtoon.htmlUrl) {
      window.open(webtoon.htmlUrl, '_blank')
    } else if (webtoon.url) {
      window.open(webtoon.url, '_blank')
    }
  }

  if (webtoons.length === 0) {
    return (
      <div className="webtoon-section">
        <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
          아직 웹툰이 없습니다. 첫 웹툰을 만들어보세요! 📚
        </p>
      </div>
    )
  }

  return (
    <div className="webtoon-section">
      <div className="webtoon-grid">
        {webtoons.map((webtoon) => (
          <div 
            key={webtoon.id} 
            className="webtoon-card"
            onClick={() => handleWebtoonClick(webtoon)}
            style={{ cursor: 'pointer' }}
          >
            <div className="webtoon-thumbnail">
              {webtoon.thumbnail && webtoon.thumbnail !== '/thumbnails/default.png' ? (
                <img src={webtoon.thumbnail} alt={webtoon.title} />
              ) : (
                <span>📚</span>
              )}
            </div>
            <div className="webtoon-info">
              <h3>{webtoon.title}</h3>
              <p>{webtoon.description || '수학 웹툰'}</p>
              {webtoon.uploadedBy && (
                <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '8px' }}>
                  만든이: {webtoon.uploadedBy}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WebtoonSection

