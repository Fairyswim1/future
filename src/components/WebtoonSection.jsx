import React from 'react'
import './WebtoonSection.css'

const WebtoonSection = () => {
  const webtoons = [
    {
      id: 1,
      title: '수학 웹툰 준비 중',
      thumbnail: '',
      description: '곧 만나요!'
    }
  ]

  return (
    <div className="webtoon-section">
      <div className="webtoon-grid">
        {webtoons.map((webtoon) => (
          <div key={webtoon.id} className="webtoon-card">
            <div className="webtoon-thumbnail">
              <span>📚</span>
            </div>
            <div className="webtoon-info">
              <h3>{webtoon.title}</h3>
              <p>{webtoon.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WebtoonSection

