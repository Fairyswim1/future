// API 엔드포인트 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const API_ENDPOINTS = {
  generate: `${API_BASE_URL}/generate`,
  upload: `${API_BASE_URL}/upload`,
  thumbnail: `${API_BASE_URL}/thumbnail`,
  webtoon: {
    generate: `${API_BASE_URL}/webtoon/generate`,
    upload: `${API_BASE_URL}/webtoon/upload`
  }
}

export default API_BASE_URL

