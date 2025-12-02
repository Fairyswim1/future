import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import ContentCarousel from './ContentCarousel'
import WebtoonSection from './WebtoonSection'
import CreateModal from './CreateModal'
import LoginModal from './LoginModal'
import LoadingModal from './LoadingModal'
import { API_ENDPOINTS } from '../config/api'
import { saveGame, getGames, saveSimulation, getSimulations, createBlobURL, deleteGame, updateGame, deleteSimulation, updateSimulation } from '../utils/storage'
import { 
  saveGameToFirestore, 
  subscribeGames, 
  updateGameInFirestore, 
  deleteGameFromFirestore,
  saveSimulationToFirestore,
  subscribeSimulations,
  updateSimulationInFirestore,
  deleteSimulationFromFirestore
} from '../utils/firestore'
import './MainPage.css'

const MainPage = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showLoadingModal, setShowLoadingModal] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  
  // 기본 수학 게임 데이터
  const defaultGames = [
    {
      id: 1,
      title: '수식양궁',
      thumbnail: '/thumbnails/game1-yang.png',
      url: 'https://yang-fbb84.web.app/',
      grade: '초4',
      category: '수와 연산',
      description: '수식을 맞춰 양궁을 쏘는 게임',
      likes: 0,
      comments: 0,
      shares: 0
    },
    {
      id: 2,
      title: '멀린게임',
      thumbnail: '/thumbnails/game2-merlin.png',
      url: 'https://shrek7979.github.io/merlin_game/',
      grade: '초3',
      category: '수와 연산',
      description: '마법사 멀린과 함께하는 수학 게임',
      likes: 0,
      comments: 0,
      shares: 0
    },
    {
      id: 3,
      title: '구구단게임',
      thumbnail: '/thumbnails/game3-gugudan.png',
      url: 'https://gugudan-376f6.web.app/',
      grade: '초3',
      category: '수와 연산',
      description: '구구단을 재미있게 배우는 게임',
      likes: 0,
      comments: 0,
      shares: 0
    },
    {
      id: 5,
      title: '증명순서 맞추기',
      thumbnail: '/thumbnails/game5-proof.png',
      url: 'https://proof-c1a40.web.app/',
      grade: '중등',
      category: '기하',
      description: '수학 증명의 순서를 맞추는 게임 (교사용)',
      likes: 0,
      comments: 0,
      shares: 0
    }
  ]

  // 기본 수학 시뮬레이션 데이터
  const defaultSimulations = [
    {
      id: 4,
      title: '확률실험기',
      thumbnail: '/thumbnails/sim1-probability.png',
      url: 'https://shrek7979.github.io/e_Tester/',
      grade: '초3',
      category: '자료와 가능성',
      description: '확률을 시각적으로 실험해보는 도구',
      likes: 0,
      comments: 0,
      shares: 0
    }
  ]

  // 로컬 스토리지에서 업로드된 게임/시뮬레이션 불러오기
  const [mathGames, setMathGames] = useState(defaultGames)
  const [mathSimulations, setMathSimulations] = useState(defaultSimulations)

  useEffect(() => {
    // Firestore에서 게임 목록 실시간 구독
    const unsubscribeGames = subscribeGames((games) => {
      // Firestore에서 가져온 게임들
      const firestoreGames = games.map(game => ({
        ...game,
        url: game.htmlUrl || game.url, // Firestore의 htmlUrl 사용
        htmlUrl: game.htmlUrl, // htmlUrl도 유지
        createdAt: game.createdAt?.toDate?.() || new Date(game.createdAt)
      }))
      setMathGames([...defaultGames, ...firestoreGames])
    })

    // Firestore에서 시뮬레이션 목록 실시간 구독
    const unsubscribeSimulations = subscribeSimulations((simulations) => {
      const firestoreSimulations = simulations.map(sim => ({
        ...sim,
        url: sim.htmlUrl || sim.url,
        htmlUrl: sim.htmlUrl, // htmlUrl도 유지
        createdAt: sim.createdAt?.toDate?.() || new Date(sim.createdAt)
      }))
      setMathSimulations([...defaultSimulations, ...firestoreSimulations])
    })

    // 로컬 스토리지에서 저장된 게임도 불러오기 (백업용)
    const savedGames = getGames()
    if (savedGames.length > 0) {
      // Firestore에 없는 로컬 게임만 추가
      // htmlContent가 있는 게임은 그대로 유지
      setMathGames(prev => {
        const localOnly = savedGames.filter(local => 
          !prev.some(firestore => firestore.id === local.id)
        )
        return [...prev, ...localOnly]
      })
    }

    // 정리 함수
    return () => {
      unsubscribeGames()
      unsubscribeSimulations()
    }
  }, [])

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    setShowCreateModal(true)
  }

  const handleLogout = async () => {
    try {
      await logout()
      alert('로그아웃되었습니다.')
    } catch (error) {
      console.error('Logout error:', error)
      alert('로그아웃 중 오류가 발생했습니다.')
    }
  }

  const handleUpload = async (data) => {
    try {
      // 파일명에서 제목 추출 (확장자 제거)
      const title = data.title || data.filename.replace(/\.html$/i, '')
      
      // 게임/시뮬레이션 정보 생성
      // htmlContent를 직접 저장 (Blob URL 사용 안 함)
      const newItem = {
        title: title,
        url: '', // 업로드된 파일은 url 없이 htmlContent만 사용
        thumbnail: '/thumbnails/default.png', // 기본 썸네일
        grade: data.grade || '사용자',
        category: data.category || (data.type === 'game' ? '게임' : '시뮬레이션'),
        description: `${title} - 업로드된 ${data.type === 'game' ? '게임' : '시뮬레이션'}`,
        likes: 0,
        comments: 0,
        shares: 0,
        uploadedBy: user?.displayName || '사용자',
        userId: user?.uid || '',
        htmlContent: data.file // HTML 콘텐츠 직접 저장
      }

      // Firestore에 저장 (다른 사람들도 볼 수 있음)
      try {
        if (data.type === 'game') {
          await saveGameToFirestore(newItem, user.uid)
          alert('게임이 업로드되었습니다! 다른 사람들도 볼 수 있습니다.')
        } else {
          await saveSimulationToFirestore(newItem, user.uid)
          alert('시뮬레이션이 업로드되었습니다! 다른 사람들도 볼 수 있습니다.')
        }
      } catch (error) {
        console.error('Firestore 저장 실패:', error)
        // Firestore 저장 실패 시 로컬 스토리지에 백업 저장
        if (data.type === 'game') {
          const savedGame = saveGame(newItem)
          setMathGames([...mathGames, savedGame])
          alert('게임이 로컬에 저장되었습니다. (인터넷 연결을 확인해주세요)')
        } else {
          const savedSimulation = saveSimulation(newItem)
          setMathSimulations([...mathSimulations, savedSimulation])
          alert('시뮬레이션이 로컬에 저장되었습니다. (인터넷 연결을 확인해주세요)')
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('업로드 중 오류가 발생했습니다.')
    }
  }

  const handleLinkInsert = async (data) => {
    try {
      const newItem = {
        title: data.title,
        url: data.url, // 외부 링크 URL
        thumbnail: '/thumbnails/default.png',
        grade: data.grade || '사용자',
        category: data.category || (data.type === 'game' ? '게임' : '시뮬레이션'),
        description: data.description || `${data.title} - 외부 링크`,
        likes: 0,
        comments: 0,
        shares: 0,
        uploadedBy: user?.displayName || '사용자',
        userId: user?.uid || ''
        // htmlContent 없음 - 외부 링크이므로
      }

      // Firestore에 저장
      try {
        if (data.type === 'game') {
          await saveGameToFirestore(newItem, user.uid)
          alert('게임 링크가 추가되었습니다!')
        } else {
          await saveSimulationToFirestore(newItem, user.uid)
          alert('시뮬레이션 링크가 추가되었습니다!')
        }
      } catch (error) {
        console.error('Firestore 저장 실패:', error)
        // Firestore 저장 실패 시 로컬 스토리지에 백업 저장
        if (data.type === 'game') {
          const savedGame = saveGame(newItem)
          setMathGames([...mathGames, savedGame])
          alert('게임 링크가 로컬에 저장되었습니다. (인터넷 연결을 확인해주세요)')
        } else {
          const savedSimulation = saveSimulation(newItem)
          setMathSimulations([...mathSimulations, savedSimulation])
          alert('시뮬레이션 링크가 로컬에 저장되었습니다. (인터넷 연결을 확인해주세요)')
        }
      }
    } catch (error) {
      console.error('Link insert error:', error)
      alert('링크 추가 중 오류가 발생했습니다.')
    }
  }

  const handleGenerate = async (data) => {
    setShowLoadingModal(true)
    setLoadingProgress(0)

    // 진행률 시뮬레이션 (실제 진행률은 알 수 없으므로)
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 500)

    try {
      const response = await fetch(API_ENDPOINTS.generate, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: data.type,
          metadata: data.metadata
        })
      })

      clearInterval(progressInterval)
      setLoadingProgress(95)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '생성 실패')
      }

      const result = await response.json()

      if (!result.success || !result.html) {
        throw new Error('생성된 HTML이 없습니다.')
      }

      setLoadingProgress(100)
      console.log('AI 생성 완료, HTML 길이:', result.html.length)

      // 생성된 게임/시뮬레이션 정보 생성
      const newItem = {
        title: result.title || `${data.metadata.unit} - ${data.metadata.gameType}`,
        url: '',
        thumbnail: '/thumbnails/default.png',
        grade: data.metadata.grade || '사용자',
        category: data.metadata.category || data.metadata.gameType,
        description: `AI로 생성된 ${data.type === 'game' ? '게임' : '시뮬레이션'} - ${data.metadata.unit}`,
        likes: 0,
        comments: 0,
        shares: 0,
        uploadedBy: user?.displayName || '사용자',
        userId: user?.uid || '',
        htmlContent: result.html // 생성된 HTML
      }

      // Firestore에 저장
      try {
        if (data.type === 'game') {
          await saveGameToFirestore(newItem, user?.uid || 'anonymous')
          alert('✅ AI 게임 생성 완료! 게임이 업로드되었습니다.')
        } else {
          await saveSimulationToFirestore(newItem, user?.uid || 'anonymous')
          alert('✅ AI 시뮬레이션 생성 완료! 시뮬레이션이 업로드되었습니다.')
        }
      } catch (firestoreError) {
        console.error('Firestore 저장 실패, 로컬에만 저장:', firestoreError)

        // Firestore 실패 시 로컬 스토리지에만 저장
        const storageKey = data.type === 'game' ? STORAGE_KEYS.GAMES : STORAGE_KEYS.SIMULATIONS
        const existingItems = JSON.parse(localStorage.getItem(storageKey) || '[]')
        const newItemWithId = {
          ...newItem,
          id: Date.now().toString()
        }
        existingItems.push(newItemWithId)
        localStorage.setItem(storageKey, JSON.stringify(existingItems))

        alert('✅ AI 생성 완료! (로컬에만 저장됨)')
        window.location.reload()
      }

    } catch (error) {
      console.error('AI 생성 오류:', error)
      setShowLoadingModal(false)
      setLoadingProgress(0)
      alert('❌ AI 생성 실패: ' + error.message)
    } finally {
      setTimeout(() => {
        setShowLoadingModal(false)
        setLoadingProgress(0)
      }, 1000)
    }
  }

  const handleWebtoonUpload = async (data) => {
    try {
      const formData = new FormData()
      const blob = new Blob([data.file], { type: 'text/html' })
      formData.append('file', blob, data.filename)
      formData.append('userId', user.uid)

      const response = await fetch(API_ENDPOINTS.webtoon.upload, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      })

      if (response.ok) {
        alert('웹툰이 업로드되었습니다!')
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`업로드 실패: ${error.message || '알 수 없는 오류'}`)
      }
    } catch (error) {
      console.error('Webtoon upload error:', error)
      alert('업로드 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteGame = async (gameId) => {
    try {
      // Firestore에서 삭제 시도
      await deleteGameFromFirestore(gameId)
      alert('게임이 삭제되었습니다.')
    } catch (error) {
      console.error('Firestore 삭제 실패:', error)
      // Firestore 삭제 실패 시 로컬에서 삭제
      deleteGame(gameId)
      setMathGames(mathGames.filter(game => game.id !== gameId))
      alert('게임이 로컬에서 삭제되었습니다.')
    }
  }

  const handleUpdateGame = async (updatedGame) => {
    try {
      // Firestore에서 수정 시도
      const { id, ...updates } = updatedGame
      await updateGameInFirestore(id, updates)
      alert('게임이 수정되었습니다.')
    } catch (error) {
      console.error('Firestore 수정 실패:', error)
      // Firestore 수정 실패 시 로컬에서 수정
      updateGame(updatedGame.id, updatedGame)
      setMathGames(mathGames.map(game => 
        game.id === updatedGame.id ? updatedGame : game
      ))
      alert('게임이 로컬에서 수정되었습니다.')
    }
  }

  const handleDeleteSimulation = async (simulationId) => {
    try {
      await deleteSimulationFromFirestore(simulationId)
      alert('시뮬레이션이 삭제되었습니다.')
    } catch (error) {
      console.error('Firestore 삭제 실패:', error)
      deleteSimulation(simulationId)
      setMathSimulations(mathSimulations.filter(sim => sim.id !== simulationId))
      alert('시뮬레이션이 로컬에서 삭제되었습니다.')
    }
  }

  const handleUpdateSimulation = async (updatedSimulation) => {
    try {
      const { id, ...updates } = updatedSimulation
      await updateSimulationInFirestore(id, updates)
      alert('시뮬레이션이 수정되었습니다.')
    } catch (error) {
      console.error('Firestore 수정 실패:', error)
      updateSimulation(updatedSimulation.id, updatedSimulation)
      setMathSimulations(mathSimulations.map(sim => 
        sim.id === updatedSimulation.id ? updatedSimulation : sim
      ))
      alert('시뮬레이션이 로컬에서 수정되었습니다.')
    }
  }

  const handleWebtoonGenerate = async (data) => {
    try {
      const response = await fetch(API_ENDPOINTS.webtoon.generate, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          prompt: data.prompt,
          metadata: data.metadata,
          userId: user.uid
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        alert('웹툰이 생성되었습니다!')
        window.location.reload()
      } else {
        const error = await response.json()
        alert(`생성 실패: ${error.message || '알 수 없는 오류'}`)
      }
    } catch (error) {
      console.error('Webtoon generation error:', error)
      alert('생성 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="main-page">
      <div className="create-button-container">
        {user && (
          <div className="user-info">
            <img src={user.photoURL || '/default-avatar.png'} alt="avatar" className="user-avatar" />
            <span className="user-name">{user.displayName || '사용자'}</span>
            <button className="logout-button" onClick={handleLogout} title="로그아웃">
              로그아웃
            </button>
          </div>
        )}
        <button className="create-button" onClick={handleCreateClick}>
          ✨ 만들기
        </button>
      </div>

      <section className="content-section">
        <div className="section-header">
          <h2>수학 게임</h2>
          <p>재미있게 수학을 배워보세요!</p>
        </div>
        <ContentCarousel 
          items={mathGames} 
          type="game"
          onDelete={handleDeleteGame}
          onUpdate={handleUpdateGame}
        />
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>수학 시뮬레이션</h2>
          <p>직접 실험하며 수학을 이해하세요!</p>
        </div>
        <ContentCarousel 
          items={mathSimulations} 
          type="simulation"
          onDelete={handleDeleteSimulation}
          onUpdate={handleUpdateSimulation}
        />
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>수학 웹툰</h2>
          <p>웹툰으로 만나는 수학 이야기</p>
        </div>
        <WebtoonSection />
      </section>

      <CreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUpload={handleUpload}
        onLinkInsert={handleLinkInsert}
        onGenerate={handleGenerate}
        onWebtoonUpload={handleWebtoonUpload}
        onWebtoonGenerate={handleWebtoonGenerate}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setShowCreateModal(true)}
      />
      <LoadingModal
        isOpen={showLoadingModal}
        message="AI가 게임을 생성 중입니다..."
        progress={Math.floor(loadingProgress)}
      />
    </div>
  )
}

export default MainPage

