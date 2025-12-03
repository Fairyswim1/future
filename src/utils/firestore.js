// Firestore 데이터베이스 유틸리티
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  where,
  getDoc
} from 'firebase/firestore'
import { ref, uploadString, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../config/firebase'

const COLLECTIONS = {
  GAMES: 'games',
  SIMULATIONS: 'simulations',
  WEBTOONS: 'webtoons',
  TOOLS: 'tools',
  COMMENTS: 'comments',
  LIKES: 'likes'
}

// OG 이미지 추출 함수 (링크에서 메타 태그 추출)
export const extractOGImage = async (url) => {
  try {
    console.log('OG 이미지 추출 시작:', url)

    // CORS 프록시를 통해 HTML 가져오기
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    const response = await fetch(proxyUrl, { timeout: 10000 })

    if (!response.ok) {
      console.log('페이지 가져오기 실패:', response.status)
      return null
    }

    const html = await response.text()

    // DOMParser로 HTML 파싱
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // OG 이미지 찾기 (우선순위: og:image > twitter:image > 첫 번째 큰 이미지)
    let imageUrl = null

    // 1. og:image 메타 태그
    const ogImage = doc.querySelector('meta[property="og:image"]')
    if (ogImage) {
      imageUrl = ogImage.getAttribute('content')
    }

    // 2. twitter:image 메타 태그
    if (!imageUrl) {
      const twitterImage = doc.querySelector('meta[name="twitter:image"]')
      if (twitterImage) {
        imageUrl = twitterImage.getAttribute('content')
      }
    }

    // 3. 상대 경로를 절대 경로로 변환
    if (imageUrl && !imageUrl.startsWith('http')) {
      const urlObj = new URL(url)
      if (imageUrl.startsWith('//')) {
        imageUrl = urlObj.protocol + imageUrl
      } else if (imageUrl.startsWith('/')) {
        imageUrl = urlObj.origin + imageUrl
      } else {
        imageUrl = urlObj.origin + '/' + imageUrl
      }
    }

    if (imageUrl) {
      console.log('OG 이미지 발견:', imageUrl)

      // 이미지를 fetch하여 Firebase Storage에 업로드
      try {
        const imageResponse = await fetch(imageUrl)
        if (!imageResponse.ok) {
          console.log('이미지 다운로드 실패:', imageResponse.status)
          return null
        }

        const blob = await imageResponse.blob()

        // Firebase Storage에 업로드
        const thumbnailRef = ref(storage, `thumbnails/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${blob.type.split('/')[1] || 'png'}`)
        await uploadBytes(thumbnailRef, blob)
        const thumbnailUrl = await getDownloadURL(thumbnailRef)

        console.log('OG 이미지 업로드 완료:', thumbnailUrl)
        return thumbnailUrl
      } catch (uploadError) {
        console.error('이미지 업로드 실패:', uploadError)
        return null
      }
    }

    console.log('OG 이미지를 찾을 수 없음')
    return null
  } catch (error) {
    console.error('OG 이미지 추출 오류:', error)
    return null
  }
}

// 썸네일 생성 함수 (클라이언트 사이드에서 HTML 렌더링 후 캡쳐)
// htmlContentOrUrl: HTML 문자열 또는 외부 URL
export const generateThumbnail = async (htmlContentOrUrl, isUrl = false) => {
  let iframe = null

  try {
    console.log('썸네일 생성 시작', isUrl ? `URL: ${htmlContentOrUrl}` : `HTML 길이: ${htmlContentOrUrl?.length}`)

    // html2canvas 동적 import
    const html2canvas = (await import('html2canvas')).default

    // 숨겨진 iframe 생성
    iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.top = '-9999px'
    iframe.style.left = '-9999px'
    iframe.style.width = '1280px'
    iframe.style.height = '720px'
    iframe.style.border = 'none'
    iframe.style.backgroundColor = 'white'
    document.body.appendChild(iframe)

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.log('썸네일 생성 타임아웃')
        if (iframe && iframe.parentNode) {
          document.body.removeChild(iframe)
        }
        resolve(null)
      }, 10000) // 10초 타임아웃

      // HTML 콘텐츠를 iframe에 로드
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document

      // iframe 로드 완료 이벤트
      iframe.onload = async () => {
        try {
          console.log('iframe 로드 완료, 렌더링 대기 중...')

          // 렌더링 완료 대기 (더 긴 시간)
          await new Promise(resolve => setTimeout(resolve, 2000))

          const iframeWindow = iframe.contentWindow
          const iframeDocument = iframe.contentDocument || iframeWindow.document
          const targetElement = iframeDocument.documentElement || iframeDocument.body

          if (!targetElement) {
            console.error('iframe 렌더링 대상이 없음')
            clearTimeout(timeout)
            if (iframe && iframe.parentNode) {
              document.body.removeChild(iframe)
            }
            resolve(null)
            return
          }

          console.log('html2canvas로 캡처 시작...')

          // html2canvas로 스크린샷 촬영
          const canvas = await html2canvas(targetElement, {
            width: 1280,
            height: 720,
            scale: 1,
            useCORS: true,
            allowTaint: true,
            logging: false,
            windowWidth: 1280,
            windowHeight: 720,
            backgroundColor: '#ffffff'
          })

          console.log('캡처 완료, 이미지 변환 중...')

          // Canvas를 Blob으로 변환
          canvas.toBlob(async (blob) => {
            clearTimeout(timeout)

            if (iframe && iframe.parentNode) {
              document.body.removeChild(iframe)
            }

            if (!blob) {
              console.error('Blob 변환 실패')
              resolve(null)
              return
            }

            try {
              console.log('Firebase Storage에 업로드 중...')
              // Firebase Storage에 업로드
              const thumbnailRef = ref(storage, `thumbnails/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`)
              await uploadBytes(thumbnailRef, blob)
              const thumbnailUrl = await getDownloadURL(thumbnailRef)
              console.log('썸네일 업로드 완료:', thumbnailUrl)
              resolve(thumbnailUrl)
            } catch (uploadError) {
              console.error('Firebase Storage 업로드 실패:', uploadError)
              resolve(null)
            }
          }, 'image/png', 0.9) // 품질 90%
        } catch (error) {
          console.error('썸네일 캡처 오류:', error)
          clearTimeout(timeout)
          if (iframe && iframe.parentNode) {
            document.body.removeChild(iframe)
          }
          resolve(null)
        }
      }

      iframe.onerror = (error) => {
        console.error('iframe 로드 오류:', error)
        clearTimeout(timeout)
        if (iframe && iframe.parentNode) {
          document.body.removeChild(iframe)
        }
        resolve(null)
      }

      // HTML 콘텐츠 작성 또는 URL 로드
      try {
        if (isUrl) {
          // 외부 URL 로드
          iframe.src = htmlContentOrUrl
        } else {
          // HTML 콘텐츠 직접 작성
          iframeDoc.open()
          iframeDoc.write(htmlContentOrUrl)
          iframeDoc.close()
        }
      } catch (error) {
        console.error('iframe에 콘텐츠 로드 실패:', error)
        clearTimeout(timeout)
        if (iframe && iframe.parentNode) {
          document.body.removeChild(iframe)
        }
        resolve(null)
      }
    })
  } catch (error) {
    console.error('썸네일 생성 오류:', error)
    if (iframe && iframe.parentNode) {
      document.body.removeChild(iframe)
    }
    return null
  }
}

// 게임 저장
export const saveGameToFirestore = async (game, userId) => {
  try {
    let htmlUrl = game.htmlUrl || null
    let thumbnailUrl = game.thumbnail || null

    // htmlContent가 있는 경우에만 Storage에 업로드 (링크 삽입의 경우 htmlContent 없음)
    if (game.htmlContent) {
      console.log('게임 HTML Storage에 업로드 중...')
      const storageRef = ref(storage, `games/${userId}/${Date.now()}.html`)
      // Content-Type을 text/html로 설정하여 업로드 (다운로드 방지)
      await uploadString(storageRef, game.htmlContent, 'raw', {
        contentType: 'text/html; charset=utf-8'
      })
      htmlUrl = await getDownloadURL(storageRef)
      console.log('게임 HTML 업로드 완료:', htmlUrl)

      // htmlContent가 있으면 썸네일 생성 시도 (동기적으로 처리)
      if (!thumbnailUrl) {
        console.log('게임 썸네일 생성 시도 중...')
        try {
          thumbnailUrl = await generateThumbnail(game.htmlContent, false)
          if (thumbnailUrl) {
            console.log('게임 썸네일 생성 완료:', thumbnailUrl)
          } else {
            console.log('게임 썸네일 생성 실패, 기본 썸네일 사용')
            thumbnailUrl = null
          }
        } catch (thumbnailError) {
          console.error('게임 썸네일 생성 오류:', thumbnailError)
          thumbnailUrl = null
        }
      }
    } else if (game.url && !thumbnailUrl) {
      // 링크 삽입의 경우 OG 이미지 추출 시도
      console.log('게임 링크 OG 이미지 추출 시도 중...')
      try {
        thumbnailUrl = await extractOGImage(game.url)
        if (thumbnailUrl) {
          console.log('게임 링크 OG 이미지 추출 완료:', thumbnailUrl)
        } else {
          console.log('게임 링크 OG 이미지 추출 실패, iframe 방식 시도 중...')
          // OG 이미지 실패 시 iframe 방식으로 시도
          thumbnailUrl = await generateThumbnail(game.url, true)
          if (thumbnailUrl) {
            console.log('게임 링크 썸네일 생성 완료:', thumbnailUrl)
          } else {
            console.log('게임 링크 썸네일 생성 실패')
            thumbnailUrl = null
          }
        }
      } catch (thumbnailError) {
        console.error('게임 링크 썸네일 생성 오류:', thumbnailError)
        thumbnailUrl = null
      }
    }

    const gameData = {
      ...game,
      htmlUrl: htmlUrl,
      thumbnail: thumbnailUrl,
      userId: userId,
      likes: game.likes || 0,
      comments: game.comments || 0,
      likedBy: game.likedBy || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    // htmlContent는 Firestore에 저장하지 않음 (Storage에만 저장)
    delete gameData.htmlContent

    console.log('게임 Firestore에 저장 중...')
    const docRef = await addDoc(collection(db, COLLECTIONS.GAMES), gameData)
    console.log('게임 저장 완료, ID:', docRef.id)

    return { id: docRef.id, ...gameData }
  } catch (error) {
    console.error('게임 저장 실패:', error)
    throw error
  }
}

// 게임 목록 가져오기 (실시간)
export const subscribeGames = (callback) => {
  try {
    const q = query(collection(db, COLLECTIONS.GAMES), orderBy('createdAt', 'desc'))
    
    return onSnapshot(q, (snapshot) => {
      try {
        const games = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback(games)
      } catch (error) {
        console.error('게임 데이터 변환 오류:', error)
        callback([])
      }
    }, (error) => {
      console.error('게임 목록 가져오기 실패:', error)
      // 권한 오류인 경우 빈 배열 반환
      callback([])
    })
  } catch (error) {
    console.error('게임 구독 설정 실패:', error)
    callback([])
    return () => {} // 빈 정리 함수
  }
}

// 게임 수정
export const updateGameInFirestore = async (gameId, updates) => {
  try {
    const gameRef = doc(db, COLLECTIONS.GAMES, gameId)
    await updateDoc(gameRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return true
  } catch (error) {
    console.error('게임 수정 실패:', error)
    throw error
  }
}

// 게임 삭제
export const deleteGameFromFirestore = async (gameId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.GAMES, gameId))
    return true
  } catch (error) {
    console.error('게임 삭제 실패:', error)
    throw error
  }
}

// 시뮬레이션 저장
export const saveSimulationToFirestore = async (simulation, userId) => {
  try {
    let htmlUrl = simulation.htmlUrl || null
    let thumbnailUrl = simulation.thumbnail || null

    // htmlContent가 있는 경우에만 Storage에 업로드 (링크 삽입의 경우 htmlContent 없음)
    if (simulation.htmlContent) {
      console.log('시뮬레이션 HTML Storage에 업로드 중...')
      const storageRef = ref(storage, `simulations/${userId}/${Date.now()}.html`)
      // Content-Type을 text/html로 설정하여 업로드 (다운로드 방지)
      await uploadString(storageRef, simulation.htmlContent, 'raw', {
        contentType: 'text/html; charset=utf-8'
      })
      htmlUrl = await getDownloadURL(storageRef)
      console.log('시뮬레이션 HTML 업로드 완료:', htmlUrl)

      // htmlContent가 있으면 썸네일 생성 시도 (동기적으로 처리)
      if (!thumbnailUrl) {
        console.log('시뮬레이션 썸네일 생성 시도 중...')
        try {
          thumbnailUrl = await generateThumbnail(simulation.htmlContent, false)
          if (thumbnailUrl) {
            console.log('시뮬레이션 썸네일 생성 완료:', thumbnailUrl)
          } else {
            console.log('시뮬레이션 썸네일 생성 실패, 기본 썸네일 사용')
            thumbnailUrl = null
          }
        } catch (thumbnailError) {
          console.error('시뮬레이션 썸네일 생성 오류:', thumbnailError)
          thumbnailUrl = null
        }
      }
    } else if (simulation.url && !thumbnailUrl) {
      // 링크 삽입의 경우 OG 이미지 추출 시도
      console.log('시뮬레이션 링크 OG 이미지 추출 시도 중...')
      try {
        thumbnailUrl = await extractOGImage(simulation.url)
        if (thumbnailUrl) {
          console.log('시뮬레이션 링크 OG 이미지 추출 완료:', thumbnailUrl)
        } else {
          console.log('시뮬레이션 링크 OG 이미지 추출 실패, iframe 방식 시도 중...')
          // OG 이미지 실패 시 iframe 방식으로 시도
          thumbnailUrl = await generateThumbnail(simulation.url, true)
          if (thumbnailUrl) {
            console.log('시뮬레이션 링크 썸네일 생성 완료:', thumbnailUrl)
          } else {
            console.log('시뮬레이션 링크 썸네일 생성 실패')
            thumbnailUrl = null
          }
        }
      } catch (thumbnailError) {
        console.error('시뮬레이션 링크 썸네일 생성 오류:', thumbnailError)
        thumbnailUrl = null
      }
    }

    const simData = {
      ...simulation,
      htmlUrl: htmlUrl,
      thumbnail: thumbnailUrl,
      userId: userId,
      likes: simulation.likes || 0,
      comments: simulation.comments || 0,
      likedBy: simulation.likedBy || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    delete simData.htmlContent

    console.log('시뮬레이션 Firestore에 저장 중...')
    const docRef = await addDoc(collection(db, COLLECTIONS.SIMULATIONS), simData)
    console.log('시뮬레이션 저장 완료, ID:', docRef.id)

    return { id: docRef.id, ...simData }
  } catch (error) {
    console.error('시뮬레이션 저장 실패:', error)
    throw error
  }
}

// 시뮬레이션 목록 가져오기 (실시간)
export const subscribeSimulations = (callback) => {
  try {
    const q = query(collection(db, COLLECTIONS.SIMULATIONS), orderBy('createdAt', 'desc'))
    
    return onSnapshot(q, (snapshot) => {
      try {
        const simulations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        callback(simulations)
      } catch (error) {
        console.error('시뮬레이션 데이터 변환 오류:', error)
        callback([])
      }
    }, (error) => {
      console.error('시뮬레이션 목록 가져오기 실패:', error)
      // 권한 오류인 경우 빈 배열 반환
      callback([])
    })
  } catch (error) {
    console.error('시뮬레이션 구독 설정 실패:', error)
    callback([])
    return () => {} // 빈 정리 함수
  }
}

// 시뮬레이션 수정
export const updateSimulationInFirestore = async (simulationId, updates) => {
  try {
    const simRef = doc(db, COLLECTIONS.SIMULATIONS, simulationId)
    await updateDoc(simRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return true
  } catch (error) {
    console.error('시뮬레이션 수정 실패:', error)
    throw error
  }
}

// 시뮬레이션 삭제
export const deleteSimulationFromFirestore = async (simulationId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.SIMULATIONS, simulationId))
    return true
  } catch (error) {
    console.error('시뮬레이션 삭제 실패:', error)
    throw error
  }
}

// 좋아요 토글 (게임)
export const toggleGameLike = async (gameId, userId) => {
  try {
    if (!userId) {
      throw new Error('사용자 ID가 필요합니다.')
    }

    const gameRef = doc(db, COLLECTIONS.GAMES, gameId)
    const gameDoc = await getDoc(gameRef)
    
    if (!gameDoc.exists()) {
      throw new Error('게임을 찾을 수 없습니다.')
    }

    const gameData = gameDoc.data()
    // likedBy가 배열인지 확인하고, 아니면 빈 배열로 초기화
    let likedBy = gameData.likedBy
    if (!Array.isArray(likedBy)) {
      likedBy = []
    } else {
      // 배열이지만 null이나 undefined가 포함되어 있을 수 있으므로 필터링
      likedBy = likedBy.filter(id => id != null && typeof id === 'string')
    }
    
    const isLiked = likedBy.includes(userId)
    const currentLikes = gameData.likes || 0

    if (isLiked) {
      // 좋아요 취소 - 배열에서 직접 제거
      const newLikedBy = likedBy.filter(id => id !== userId)
      await updateDoc(gameRef, {
        likes: Math.max(0, currentLikes - 1),
        likedBy: newLikedBy
      })
      return { liked: false, likes: Math.max(0, currentLikes - 1) }
    } else {
      // 좋아요 추가 - 배열에 직접 추가
      const newLikedBy = [...likedBy, userId]
      await updateDoc(gameRef, {
        likes: currentLikes + 1,
        likedBy: newLikedBy
      })
      return { liked: true, likes: currentLikes + 1 }
    }
  } catch (error) {
    console.error('좋아요 토글 실패:', error)
    throw error
  }
}

// 좋아요 토글 (시뮬레이션)
export const toggleSimulationLike = async (simulationId, userId) => {
  try {
    if (!userId) {
      throw new Error('사용자 ID가 필요합니다.')
    }

    const simRef = doc(db, COLLECTIONS.SIMULATIONS, simulationId)
    const simDoc = await getDoc(simRef)
    
    if (!simDoc.exists()) {
      throw new Error('시뮬레이션을 찾을 수 없습니다.')
    }

    const simData = simDoc.data()
    // likedBy가 배열인지 확인하고, 아니면 빈 배열로 초기화
    let likedBy = simData.likedBy
    if (!Array.isArray(likedBy)) {
      likedBy = []
    } else {
      // 배열이지만 null이나 undefined가 포함되어 있을 수 있으므로 필터링
      likedBy = likedBy.filter(id => id != null && typeof id === 'string')
    }
    
    const isLiked = likedBy.includes(userId)
    const currentLikes = simData.likes || 0

    if (isLiked) {
      // 좋아요 취소 - 배열에서 직접 제거
      const newLikedBy = likedBy.filter(id => id !== userId)
      await updateDoc(simRef, {
        likes: Math.max(0, currentLikes - 1),
        likedBy: newLikedBy
      })
      return { liked: false, likes: Math.max(0, currentLikes - 1) }
    } else {
      // 좋아요 추가 - 배열에 직접 추가
      const newLikedBy = [...likedBy, userId]
      await updateDoc(simRef, {
        likes: currentLikes + 1,
        likedBy: newLikedBy
      })
      return { liked: true, likes: currentLikes + 1 }
    }
  } catch (error) {
    console.error('좋아요 토글 실패:', error)
    throw error
  }
}

// 댓글 추가 (게임)
export const addGameComment = async (gameId, comment, userId, userName) => {
  try {
    const commentsRef = collection(db, COLLECTIONS.GAMES, gameId, COLLECTIONS.COMMENTS)
    const commentData = {
      text: comment,
      author: userName || '익명',
      userId: userId || null,
      createdAt: serverTimestamp()
    }
    
    const commentDoc = await addDoc(commentsRef, commentData)
    
    // 게임 문서의 댓글 개수 업데이트
    const gameRef = doc(db, COLLECTIONS.GAMES, gameId)
    await updateDoc(gameRef, {
      comments: increment(1)
    })

    return { id: commentDoc.id, ...commentData }
  } catch (error) {
    console.error('댓글 추가 실패:', error)
    throw error
  }
}

// 댓글 추가 (시뮬레이션)
export const addSimulationComment = async (simulationId, comment, userId, userName) => {
  try {
    const commentsRef = collection(db, COLLECTIONS.SIMULATIONS, simulationId, COLLECTIONS.COMMENTS)
    const commentData = {
      text: comment,
      author: userName || '익명',
      userId: userId || null,
      createdAt: serverTimestamp()
    }
    
    const commentDoc = await addDoc(commentsRef, commentData)
    
    // 시뮬레이션 문서의 댓글 개수 업데이트
    const simRef = doc(db, COLLECTIONS.SIMULATIONS, simulationId)
    await updateDoc(simRef, {
      comments: increment(1)
    })

    return { id: commentDoc.id, ...commentData }
  } catch (error) {
    console.error('댓글 추가 실패:', error)
    throw error
  }
}

// 댓글 목록 가져오기 (게임)
export const subscribeGameComments = (gameId, callback) => {
  const commentsRef = collection(db, COLLECTIONS.GAMES, gameId, COLLECTIONS.COMMENTS)
  const q = query(commentsRef, orderBy('createdAt', 'desc'))
  
  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }))
    callback(comments)
  }, (error) => {
    console.error('댓글 목록 가져오기 실패:', error)
    callback([])
  })
}

// 댓글 목록 가져오기 (시뮬레이션)
export const subscribeSimulationComments = (simulationId, callback) => {
  const commentsRef = collection(db, COLLECTIONS.SIMULATIONS, simulationId, COLLECTIONS.COMMENTS)
  const q = query(commentsRef, orderBy('createdAt', 'desc'))
  
  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }))
    callback(comments)
  }, (error) => {
    console.error('댓글 목록 가져오기 실패:', error)
    callback([])
  })
}

// 좋아요 토글 (수업 도구)
export const toggleToolLike = async (toolId, userId) => {
  try {
    if (!userId) {
      throw new Error('사용자 ID가 필요합니다.')
    }

    const toolRef = doc(db, COLLECTIONS.TOOLS, toolId)
    const toolDoc = await getDoc(toolRef)
    
    if (!toolDoc.exists()) {
      throw new Error('수업 도구를 찾을 수 없습니다.')
    }

    const toolData = toolDoc.data()
    let likedBy = toolData.likedBy
    if (!Array.isArray(likedBy)) {
      likedBy = []
    } else {
      likedBy = likedBy.filter(id => id != null && typeof id === 'string')
    }
    
    const isLiked = likedBy.includes(userId)
    const currentLikes = toolData.likes || 0

    if (isLiked) {
      const newLikedBy = likedBy.filter(id => id !== userId)
      await updateDoc(toolRef, {
        likes: Math.max(0, currentLikes - 1),
        likedBy: newLikedBy
      })
      return { liked: false, likes: Math.max(0, currentLikes - 1) }
    } else {
      const newLikedBy = [...likedBy, userId]
      await updateDoc(toolRef, {
        likes: currentLikes + 1,
        likedBy: newLikedBy
      })
      return { liked: true, likes: currentLikes + 1 }
    }
  } catch (error) {
    console.error('좋아요 토글 실패:', error)
    throw error
  }
}

// 댓글 추가 (수업 도구)
export const addToolComment = async (toolId, comment, userId, userName) => {
  try {
    const commentsRef = collection(db, COLLECTIONS.TOOLS, toolId, COLLECTIONS.COMMENTS)
    const commentData = {
      text: comment,
      author: userName || '익명',
      userId: userId || null,
      createdAt: serverTimestamp()
    }
    
    const commentDoc = await addDoc(commentsRef, commentData)
    
    // 수업 도구 문서의 댓글 개수 업데이트
    const toolRef = doc(db, COLLECTIONS.TOOLS, toolId)
    await updateDoc(toolRef, {
      comments: increment(1)
    })

    return { id: commentDoc.id, ...commentData }
  } catch (error) {
    console.error('댓글 추가 실패:', error)
    throw error
  }
}

// 댓글 목록 가져오기 (수업 도구)
export const subscribeToolComments = (toolId, callback) => {
  const commentsRef = collection(db, COLLECTIONS.TOOLS, toolId, COLLECTIONS.COMMENTS)
  const q = query(commentsRef, orderBy('createdAt', 'desc'))
  
  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }))
    callback(comments)
  }, (error) => {
    console.error('댓글 목록 가져오기 실패:', error)
    callback([])
  })
}

// 웹툰 저장
export const saveWebtoonToFirestore = async (webtoon, userId) => {
  try {
    let htmlUrl = webtoon.htmlUrl || null
    let thumbnailUrl = webtoon.thumbnail || null

    // htmlContent가 있는 경우에만 Storage에 업로드
    if (webtoon.htmlContent) {
      console.log('웹툰 HTML Storage에 업로드 중...')
      const storageRef = ref(storage, `webtoons/${userId}/${Date.now()}.html`)
      await uploadString(storageRef, webtoon.htmlContent, 'raw', {
        contentType: 'text/html; charset=utf-8'
      })
      htmlUrl = await getDownloadURL(storageRef)
      console.log('웹툰 HTML 업로드 완료:', htmlUrl)

      // htmlContent가 있으면 썸네일 생성 시도 (동기적으로 처리)
      if (!thumbnailUrl) {
        console.log('웹툰 썸네일 생성 시도 중...')
        try {
          thumbnailUrl = await generateThumbnail(webtoon.htmlContent)
          if (thumbnailUrl) {
            console.log('웹툰 썸네일 생성 완료:', thumbnailUrl)
          } else {
            console.log('웹툰 썸네일 생성 실패, 기본 썸네일 사용')
            thumbnailUrl = null
          }
        } catch (thumbnailError) {
          console.error('웹툰 썸네일 생성 오류:', thumbnailError)
          thumbnailUrl = null
        }
      }
    }

    const webtoonData = {
      ...webtoon,
      htmlUrl: htmlUrl,
      thumbnail: thumbnailUrl,
      userId: userId,
      likes: webtoon.likes || 0,
      comments: webtoon.comments || 0,
      likedBy: webtoon.likedBy || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    delete webtoonData.htmlContent

    console.log('웹툰 Firestore에 저장 중...')
    const docRef = await addDoc(collection(db, COLLECTIONS.WEBTOONS), webtoonData)
    console.log('웹툰 저장 완료, ID:', docRef.id)

    return { id: docRef.id, ...webtoonData }
  } catch (error) {
    console.error('웹툰 저장 실패:', error)
    throw error
  }
}

// 웹툰 목록 가져오기 (실시간)
export const subscribeWebtoons = (callback) => {
  try {
    const q = query(collection(db, COLLECTIONS.WEBTOONS), orderBy('createdAt', 'desc'))
    
    return onSnapshot(q, (snapshot) => {
      try {
        const webtoonsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }))
        callback(webtoonsList)
      } catch (error) {
        console.error('웹툰 데이터 변환 오류:', error)
        callback([])
      }
    }, (error) => {
      console.error('웹툰 목록 가져오기 실패:', error)
      // 권한 오류인 경우 빈 배열 반환
      callback([])
    })
  } catch (error) {
    console.error('웹툰 구독 설정 실패:', error)
    // 구독 실패 시 빈 배열 반환하는 더미 함수 반환
    callback([])
    return () => {} // 빈 정리 함수
  }
}

// 웹툰 수정
export const updateWebtoonInFirestore = async (webtoonId, updates) => {
  try {
    const webtoonRef = doc(db, COLLECTIONS.WEBTOONS, webtoonId)
    await updateDoc(webtoonRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return true
  } catch (error) {
    console.error('웹툰 수정 실패:', error)
    throw error
  }
}

// 웹툰 삭제
export const deleteWebtoonFromFirestore = async (webtoonId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.WEBTOONS, webtoonId))
    return true
  } catch (error) {
    console.error('웹툰 삭제 실패:', error)
    throw error
  }
}

// 사용자 닉네임 가져오기
export const getUserNickname = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      return userDoc.data().nickname || null
    }
    return null
  } catch (error) {
    console.error('닉네임 가져오기 실패:', error)
    return null
  }
}

// 사용자 닉네임 설정/업데이트
export const setUserNickname = async (userId, nickname, displayName) => {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      nickname: nickname,
      displayName: displayName || nickname,
      updatedAt: serverTimestamp()
    }).catch(async () => {
      // 문서가 없으면 생성
      await setDoc(userRef, {
        nickname: nickname,
        displayName: displayName || nickname,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    })
    return nickname
  } catch (error) {
    // 문서가 없으면 생성
    try {
      const userRef = doc(db, 'users', userId)
      await setDoc(userRef, {
        nickname: nickname,
        displayName: displayName || nickname,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return nickname
    } catch (createError) {
      console.error('닉네임 설정 실패:', createError)
      throw createError
    }
  }
}

// 수업 도구 저장
export const saveToolToFirestore = async (tool, userId) => {
  try {
    let htmlUrl = tool.htmlUrl || null
    let thumbnailUrl = tool.thumbnail || null

    console.log('saveToolToFirestore 호출됨:', {
      hasHtmlContent: !!tool.htmlContent,
      hasUrl: !!tool.url,
      hasThumbnail: !!thumbnailUrl,
      url: tool.url
    })

    // htmlContent가 있는 경우에만 Storage에 업로드
    if (tool.htmlContent) {
      console.log('수업 도구 HTML Storage에 업로드 중...')
      const storageRef = ref(storage, `tools/${userId}/${Date.now()}.html`)
      await uploadString(storageRef, tool.htmlContent, 'raw', {
        contentType: 'text/html; charset=utf-8'
      })
      htmlUrl = await getDownloadURL(storageRef)
      console.log('수업 도구 HTML 업로드 완료:', htmlUrl)

      // htmlContent가 있으면 썸네일 생성 시도 (동기적으로 처리)
      if (!thumbnailUrl) {
        console.log('수업 도구 썸네일 생성 시도 중...')
        try {
          thumbnailUrl = await generateThumbnail(tool.htmlContent, false)
          if (thumbnailUrl) {
            console.log('수업 도구 썸네일 생성 완료:', thumbnailUrl)
          } else {
            console.log('수업 도구 썸네일 생성 실패, 기본 썸네일 사용')
            thumbnailUrl = null
          }
        } catch (thumbnailError) {
          console.error('수업 도구 썸네일 생성 오류:', thumbnailError)
          thumbnailUrl = null
        }
      }
    } else if (tool.url && !thumbnailUrl) {
      // 링크 삽입의 경우 OG 이미지 추출 시도
      console.log('수업 도구 링크 OG 이미지 추출 시도 중...')
      try {
        thumbnailUrl = await extractOGImage(tool.url)
        if (thumbnailUrl) {
          console.log('수업 도구 링크 OG 이미지 추출 완료:', thumbnailUrl)
        } else {
          console.log('수업 도구 링크 OG 이미지 추출 실패, iframe 방식 시도 중...')
          // OG 이미지 실패 시 iframe 방식으로 시도
          thumbnailUrl = await generateThumbnail(tool.url, true)
          if (thumbnailUrl) {
            console.log('수업 도구 링크 썸네일 생성 완료:', thumbnailUrl)
          } else {
            console.log('수업 도구 링크 썸네일 생성 실패')
            thumbnailUrl = null
          }
        }
      } catch (thumbnailError) {
        console.error('수업 도구 링크 썸네일 생성 오류:', thumbnailError)
        thumbnailUrl = null
      }
    }

    const toolData = {
      ...tool,
      htmlUrl: htmlUrl,
      thumbnail: thumbnailUrl,
      userId: userId,
      likes: tool.likes || 0,
      comments: tool.comments || 0,
      likedBy: tool.likedBy || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    delete toolData.htmlContent

    console.log('수업 도구 Firestore에 저장 중...')
    const docRef = await addDoc(collection(db, COLLECTIONS.TOOLS), toolData)
    console.log('수업 도구 저장 완료, ID:', docRef.id)

    return { id: docRef.id, ...toolData }
  } catch (error) {
    console.error('수업 도구 저장 실패:', error)
    throw error
  }
}

// 수업 도구 목록 가져오기 (실시간)
export const subscribeTools = (callback) => {
  try {
    const q = query(collection(db, COLLECTIONS.TOOLS), orderBy('createdAt', 'desc'))
    
    return onSnapshot(q, (snapshot) => {
      try {
        const tools = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }))
        callback(tools)
      } catch (error) {
        console.error('수업 도구 데이터 변환 오류:', error)
        callback([])
      }
    }, (error) => {
      console.error('수업 도구 목록 가져오기 실패:', error)
      callback([])
    })
  } catch (error) {
    console.error('수업 도구 구독 설정 실패:', error)
    callback([])
    return () => {}
  }
}

// 수업 도구 수정
export const updateToolInFirestore = async (toolId, updates) => {
  try {
    const toolRef = doc(db, COLLECTIONS.TOOLS, toolId)
    await updateDoc(toolRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return true
  } catch (error) {
    console.error('수업 도구 수정 실패:', error)
    throw error
  }
}

// 수업 도구 삭제
export const deleteToolFromFirestore = async (toolId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.TOOLS, toolId))
    return true
  } catch (error) {
    console.error('수업 도구 삭제 실패:', error)
    throw error
  }
}

