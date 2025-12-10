import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import ContentCarousel from './ContentCarousel'
import CreateModal from './CreateModal'
import LoginModal from './LoginModal'
import LoadingModal from './LoadingModal'
import PreviewModal from './PreviewModal'
import NicknameModal from './NicknameModal'
import ListView from './ListView'
import { API_ENDPOINTS } from '../config/api'
import { isAdmin } from '../config/admin'
import { saveGame, getGames, saveSimulation, getSimulations, createBlobURL, deleteGame, updateGame, deleteSimulation, updateSimulation } from '../utils/storage'
import {
  saveGameToFirestore,
  subscribeGames,
  updateGameInFirestore,
  deleteGameFromFirestore,
  saveSimulationToFirestore,
  subscribeSimulations,
  updateSimulationInFirestore,
  deleteSimulationFromFirestore,
  saveToolToFirestore,
  subscribeTools,
  updateToolInFirestore,
  deleteToolFromFirestore
} from '../utils/firestore'
import './MainPage.css'

const MainPage = () => {
  const { user, isAuthenticated, logout, nickname, updateNickname } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard') // 'dashboard', 'games', 'simulations', 'tools'
  const [navScrolled, setNavScrolled] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showLoadingModal, setShowLoadingModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showNicknameModal, setShowNicknameModal] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [generatedContent, setGeneratedContent] = useState(null)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [currentGenerationData, setCurrentGenerationData] = useState(null)
  
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

  // 로컬 스토리지에서 삭제된 기본 게임/시뮬레이션 ID 불러오기
  const getDeletedDefaultIds = (type) => {
    try {
      const deleted = localStorage.getItem(`deletedDefault${type}`)
      return deleted ? JSON.parse(deleted) : []
    } catch {
      return []
    }
  }

  const saveDeletedDefaultId = (type, id) => {
    try {
      const deleted = getDeletedDefaultIds(type)
      if (!deleted.includes(id)) {
        deleted.push(id)
        localStorage.setItem(`deletedDefault${type}`, JSON.stringify(deleted))
      }
    } catch (error) {
      console.error('삭제된 기본 게임 저장 실패:', error)
    }
  }

  // 삭제된 기본 게임을 제외한 기본 게임 목록
  const getFilteredDefaultGames = () => {
    const deletedIds = getDeletedDefaultIds('Games')
    return defaultGames.filter(game => !deletedIds.includes(game.id))
  }

  const getFilteredDefaultSimulations = () => {
    const deletedIds = getDeletedDefaultIds('Simulations')
    return defaultSimulations.filter(sim => !deletedIds.includes(sim.id))
  }

  // 로컬 스토리지에서 업로드된 게임/시뮬레이션 불러오기
  const [mathGames, setMathGames] = useState(getFilteredDefaultGames())
  const [mathSimulations, setMathSimulations] = useState(getFilteredDefaultSimulations())
  const [tools, setTools] = useState([])

  useEffect(() => {
    let unsubscribeGames = () => {}
    let unsubscribeSimulations = () => {}
    let unsubscribeTools = () => {}

    try {
      // Firestore에서 게임 목록 실시간 구독
      unsubscribeGames = subscribeGames((games) => {
        try {
          // Firestore에서 가져온 게임들
          const firestoreGames = games.map(game => ({
            ...game,
            url: game.htmlUrl || game.url, // Firestore의 htmlUrl 사용
            htmlUrl: game.htmlUrl, // htmlUrl도 유지
            createdAt: game.createdAt?.toDate?.() || new Date(game.createdAt)
          }))
          // 삭제된 기본 게임을 제외한 기본 게임 목록과 Firestore 게임 합치기
          const filteredDefaults = getFilteredDefaultGames()
          setMathGames([...filteredDefaults, ...firestoreGames])
        } catch (error) {
          console.error('게임 목록 처리 오류:', error)
          setMathGames(getFilteredDefaultGames())
        }
      })

      // Firestore에서 시뮬레이션 목록 실시간 구독
      unsubscribeSimulations = subscribeSimulations((simulations) => {
        try {
          const firestoreSimulations = simulations.map(sim => ({
            ...sim,
            url: sim.htmlUrl || sim.url,
            htmlUrl: sim.htmlUrl, // htmlUrl도 유지
            createdAt: sim.createdAt?.toDate?.() || new Date(sim.createdAt)
          }))
          // 삭제된 기본 시뮬레이션을 제외한 기본 시뮬레이션 목록과 Firestore 시뮬레이션 합치기
          const filteredDefaults = getFilteredDefaultSimulations()
          setMathSimulations([...filteredDefaults, ...firestoreSimulations])
        } catch (error) {
          console.error('시뮬레이션 목록 처리 오류:', error)
          setMathSimulations(getFilteredDefaultSimulations())
        }
      })

      // Firestore에서 수업 도구 목록 실시간 구독
      unsubscribeTools = subscribeTools((toolsList) => {
        try {
          const firestoreTools = toolsList.map(tool => ({
            ...tool,
            url: tool.htmlUrl || tool.url,
            htmlUrl: tool.htmlUrl,
            createdAt: tool.createdAt?.toDate?.() || new Date(tool.createdAt)
          }))
          setTools(firestoreTools)
        } catch (error) {
          console.error('수업 도구 목록 처리 오류:', error)
          setTools([])
        }
      })
    } catch (error) {
      console.error('Firestore 구독 설정 오류:', error)
      // 오류가 있어도 기본 데이터는 표시 (삭제된 항목 제외)
      setMathGames(getFilteredDefaultGames())
      setMathSimulations(getFilteredDefaultSimulations())
      setTools([])
    }

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
      unsubscribeTools()
    }
  }, [])

  // 스크롤 시 네비게이션 바 스타일 변경
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setNavScrolled(true)
      } else {
        setNavScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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

      // 로딩 모달 표시
      setShowLoadingModal(true)
      setLoadingProgress(50)

      // 게임/시뮬레이션 정보 생성
      // htmlContent를 직접 저장 (Blob URL 사용 안 함)
      const newItem = {
        title: title,
        url: '', // 업로드된 파일은 url 없이 htmlContent만 사용
        // thumbnail을 설정하지 않으면 firestore.js에서 자동 생성
        grade: data.grade || '사용자',
        category: data.category || (data.type === 'game' ? '게임' : '시뮬레이션'),
        description: `${title} - 업로드된 ${data.type === 'game' ? '게임' : '시뮬레이션'}`,
        likes: 0,
        comments: 0,
        shares: 0,
        uploadedBy: nickname || user?.displayName || '사용자',
        userId: user?.uid || '',
        htmlContent: data.file // HTML 콘텐츠 직접 저장
      }

      // Firestore에 저장 (다른 사람들도 볼 수 있음)
      try {
        setLoadingProgress(60)
        if (data.type === 'game') {
          await saveGameToFirestore(newItem, user.uid)
          setShowLoadingModal(false)
          alert('게임이 업로드되었습니다! 썸네일이 자동으로 생성되었습니다.')
        } else {
          await saveSimulationToFirestore(newItem, user.uid)
          setShowLoadingModal(false)
          alert('시뮬레이션이 업로드되었습니다! 썸네일이 자동으로 생성되었습니다.')
        }
      } catch (error) {
        console.error('Firestore 저장 실패:', error)
        setShowLoadingModal(false)
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
      setShowLoadingModal(false)
      alert('업로드 중 오류가 발생했습니다.')
    }
  }

  const handleLinkInsert = async (data) => {
    try {
      const newItem = {
        title: data.title,
        url: data.url, // 외부 링크 URL
        // thumbnail을 설정하지 않으면 firestore.js에서 자동 생성
        grade: data.grade || '사용자',
        category: data.category || (data.type === 'game' ? '게임' : '시뮬레이션'),
        description: data.description || `${data.title} - 외부 링크`,
        likes: 0,
        comments: 0,
        shares: 0,
        uploadedBy: nickname || user?.displayName || '사용자',
        userId: user?.uid || ''
        // htmlContent 없음 - 외부 링크이므로
      }

      // Firestore에 저장
      try {
        if (data.type === 'game') {
          await saveGameToFirestore(newItem, user.uid)
          alert('게임 링크가 추가되었습니다! 썸네일이 자동으로 생성되었습니다.')
        } else {
          await saveSimulationToFirestore(newItem, user.uid)
          alert('시뮬레이션 링크가 추가되었습니다! 썸네일이 자동으로 생성되었습니다.')
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
      console.log('AI 생성 요청 시작:', API_ENDPOINTS.generate)

      // 타임아웃 설정 (2분)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000)

      const response = await fetch(API_ENDPOINTS.generate, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: data.type,
          metadata: data.metadata
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      clearInterval(progressInterval)
      setLoadingProgress(95)

      console.log('응답 상태:', response.status)

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

      // 생성된 콘텐츠 정보 저장 (아직 업로드하지 않음)
      const newItem = {
        title: result.title || `${data.metadata.unit} - ${data.metadata.gameType}`,
        url: '',
        // thumbnail을 설정하지 않으면 firestore.js에서 자동 생성
        grade: data.metadata.grade || '사용자',
        category: data.metadata.category || data.metadata.gameType,
        description: `AI로 생성된 ${data.type === 'game' ? '게임' : '시뮬레이션'} - ${data.metadata.unit}`,
        likes: 0,
        comments: 0,
        shares: 0,
        uploadedBy: nickname || user?.displayName || '사용자',
        userId: user?.uid || '',
        htmlContent: result.html, // 생성된 HTML
        type: data.type // 게임/시뮬레이션 타입 저장
      }

      // 생성 데이터 저장 (재생성 시 사용)
      setCurrentGenerationData(data)
      
      // 미리보기 모달 표시
      setGeneratedContent(newItem)
      setShowPreviewModal(true)

    } catch (error) {
      console.error('AI 생성 오류:', error)
      clearInterval(progressInterval)
      setShowLoadingModal(false)
      setLoadingProgress(0)

      if (error.name === 'AbortError') {
        alert('❌ 요청 시간 초과: 서버 응답이 너무 오래 걸립니다. Render 서버가 슬립 모드에서 깨어나는 중일 수 있습니다. 잠시 후 다시 시도해주세요.')
      } else {
        alert('❌ AI 생성 실패: ' + error.message)
      }
    } finally {
      setTimeout(() => {
        setShowLoadingModal(false)
        setLoadingProgress(0)
      }, 1000)
    }
  }

  // 재생성 핸들러
  const handleRegenerate = async (modificationRequest) => {
    if (!currentGenerationData) return

    setIsRegenerating(true)
    setShowLoadingModal(true)
    setLoadingProgress(0)
    setShowPreviewModal(false)

    // 진행률 시뮬레이션
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 500)

    try {
      // 수정 요청사항을 메타데이터에 추가
      const updatedMetadata = {
        ...currentGenerationData.metadata,
        description: currentGenerationData.metadata.description 
          ? `${currentGenerationData.metadata.description}\n\n[수정 요청사항]\n${modificationRequest}`
          : `[수정 요청사항]\n${modificationRequest}`
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000)

      const response = await fetch(API_ENDPOINTS.generate, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: currentGenerationData.type,
          metadata: updatedMetadata
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      clearInterval(progressInterval)
      setLoadingProgress(95)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '재생성 실패')
      }

      const result = await response.json()

      if (!result.success || !result.html) {
        throw new Error('생성된 HTML이 없습니다.')
      }

      setLoadingProgress(100)
      console.log('재생성 완료, HTML 길이:', result.html.length)

      // 재생성된 콘텐츠로 업데이트
      const updatedItem = {
        ...generatedContent,
        htmlContent: result.html,
        title: result.title || generatedContent.title
      }

      setGeneratedContent(updatedItem)
      setShowPreviewModal(true)

    } catch (error) {
      console.error('재생성 오류:', error)
      clearInterval(progressInterval)
      setShowLoadingModal(false)
      setLoadingProgress(0)

      if (error.name === 'AbortError') {
        alert('❌ 요청 시간 초과: 서버 응답이 너무 오래 걸립니다.')
      } else {
        alert('❌ 재생성 실패: ' + error.message)
      }
      
      // 실패 시 미리보기 모달 다시 표시
      setShowPreviewModal(true)
    } finally {
      setIsRegenerating(false)
      setTimeout(() => {
        setShowLoadingModal(false)
        setLoadingProgress(0)
      }, 1000)
    }
  }

  // 최종 업로드 핸들러
  const handleFinalUpload = async () => {
    if (!generatedContent) return

    try {
      setShowPreviewModal(false)

      // 로딩 모달 표시
      setShowLoadingModal(true)
      setLoadingProgress(50)

      // Firestore에 저장
      setLoadingProgress(60)
      if (generatedContent.type === 'game') {
        await saveGameToFirestore(generatedContent, user?.uid || 'anonymous')
        setShowLoadingModal(false)
        alert('✅ AI 게임 생성 완료! 게임이 업로드되고 썸네일이 자동으로 생성되었습니다.')
      } else if (generatedContent.type === 'webtoon') {
        await saveWebtoonToFirestore(generatedContent, user?.uid || 'anonymous')
        setShowLoadingModal(false)
        alert('✅ AI 웹툰 생성 완료! 웹툰이 업로드되고 썸네일이 자동으로 생성되었습니다.')
      } else {
        await saveSimulationToFirestore(generatedContent, user?.uid || 'anonymous')
        setShowLoadingModal(false)
        alert('✅ AI 시뮬레이션 생성 완료! 시뮬레이션이 업로드되고 썸네일이 자동으로 생성되었습니다.')
      }

      // 상태 초기화
      setGeneratedContent(null)
      setCurrentGenerationData(null)
      setShowCreateModal(false)

    } catch (firestoreError) {
      console.error('Firestore 저장 실패:', firestoreError)
      setShowLoadingModal(false)
      alert('업로드 중 오류가 발생했습니다. 다시 시도해주세요.')
      setShowPreviewModal(true)
    }
  }

  const handleToolUpload = async (data) => {
    try {
      const title = data.title || data.filename.replace(/\.html$/i, '')

      // 로딩 모달 표시
      setShowLoadingModal(true)
      setLoadingProgress(50)

      const toolData = {
        title: title,
        url: '',
        // thumbnail을 설정하지 않으면 firestore.js에서 자동 생성
        grade: data.grade || '사용자',
        category: data.category || '수업 도구',
        description: `${title} - 업로드된 수업 도구`,
        likes: 0,
        comments: 0,
        shares: 0,
        uploadedBy: nickname || user?.displayName || '사용자',
        userId: user?.uid || '',
        htmlContent: data.file
      }

      setLoadingProgress(60)
      await saveToolToFirestore(toolData, user.uid)
      setShowLoadingModal(false)
      alert('✅ 수업 도구가 업로드되었습니다! 썸네일이 자동으로 생성되었습니다.')
      setShowCreateModal(false)
    } catch (error) {
      console.error('수업 도구 업로드 실패:', error)
      setShowLoadingModal(false)
      alert('수업 도구 업로드 중 오류가 발생했습니다.')
    }
  }

  const handleToolLinkInsert = async (data) => {
    try {
      const toolData = {
        title: data.title,
        url: data.url,
        // thumbnail을 설정하지 않으면 firestore.js에서 자동 생성
        grade: data.grade || '사용자',
        category: data.category || '수업 도구',
        description: data.description || `${data.title} - 외부 링크`,
        likes: 0,
        comments: 0,
        shares: 0,
        uploadedBy: nickname || user?.displayName || '사용자',
        userId: user?.uid || ''
      }

      await saveToolToFirestore(toolData, user.uid)
      alert('✅ 수업 도구 링크가 추가되었습니다! 썸네일이 자동으로 생성되었습니다.')
      setShowCreateModal(false)
    } catch (error) {
      console.error('수업 도구 링크 추가 실패:', error)
      alert('수업 도구 링크 추가 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteGame = async (gameId) => {
    try {
      // 기본 게임(id가 숫자인 경우)인지 확인
      const gameToDelete = mathGames.find(g => g.id === gameId)
      const isDefaultGame = gameToDelete && typeof gameId === 'number'
      
      if (isDefaultGame) {
        // 기본 게임은 관리자만 삭제 가능
        if (!isAdmin(user)) {
          alert('기본 게임은 관리자만 삭제할 수 있습니다.')
          return
        }
        // 삭제된 기본 게임 ID를 로컬 스토리지에 저장
        saveDeletedDefaultId('Games', gameId)
        // 기본 게임은 로컬에서만 삭제
        setMathGames(mathGames.filter(game => game.id !== gameId))
        alert('게임이 삭제되었습니다.')
      } else {
        // Firestore에서 삭제 시도
        await deleteGameFromFirestore(gameId)
        alert('게임이 삭제되었습니다.')
      }
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
      // 기본 시뮬레이션(id가 숫자인 경우)인지 확인
      const simToDelete = mathSimulations.find(s => s.id === simulationId)
      const isDefaultSim = simToDelete && typeof simulationId === 'number'
      
      if (isDefaultSim) {
        // 기본 시뮬레이션은 관리자만 삭제 가능
        if (!isAdmin(user)) {
          alert('기본 시뮬레이션은 관리자만 삭제할 수 있습니다.')
          return
        }
        // 삭제된 기본 시뮬레이션 ID를 로컬 스토리지에 저장
        saveDeletedDefaultId('Simulations', simulationId)
        // 기본 시뮬레이션은 로컬에서만 삭제
        setMathSimulations(mathSimulations.filter(sim => sim.id !== simulationId))
        alert('시뮬레이션이 삭제되었습니다.')
      } else {
        await deleteSimulationFromFirestore(simulationId)
        alert('시뮬레이션이 삭제되었습니다.')
      }
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

  const handleDeleteTool = async (toolId) => {
    try {
      await deleteToolFromFirestore(toolId)
      alert('수업 도구가 삭제되었습니다.')
    } catch (error) {
      console.error('수업 도구 삭제 실패:', error)
      alert('수업 도구 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleUpdateTool = async (updatedTool) => {
    try {
      const { id, ...updates } = updatedTool
      await updateToolInFirestore(id, updates)
      alert('수업 도구가 수정되었습니다.')
    } catch (error) {
      console.error('수업 도구 수정 실패:', error)
      alert('수업 도구 수정 중 오류가 발생했습니다.')
    }
  }

  // ListView 표시 여부 확인
  if (currentView !== 'dashboard') {
    const viewConfig = {
      games: { items: mathGames, type: 'game', title: '수학 게임 전체보기', onDelete: handleDeleteGame, onUpdate: handleUpdateGame },
      simulations: { items: mathSimulations, type: 'simulation', title: '수학 시뮬레이션 전체보기', onDelete: handleDeleteSimulation, onUpdate: handleUpdateSimulation },
      tools: { items: tools, type: 'tool', title: '수학 수업 도구 전체보기', onDelete: handleDeleteTool, onUpdate: handleUpdateTool }
    }

    const config = viewConfig[currentView]
    if (config) {
      return (
        <ListView
          items={config.items}
          type={config.type}
          title={config.title}
          onDelete={config.onDelete}
          onUpdate={config.onUpdate}
          onBack={() => setCurrentView('dashboard')}
        />
      )
    }
  }

  return (
    <div className="main-page">
      {/* 상단 네비게이션 바 */}
      <nav className={`top-navigation ${navScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo">
            <h1>Math Genie</h1>
          </div>
          <ul className="nav-menu">
            <li>
              <button 
                className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentView('dashboard')}
              >
                대시보드
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${currentView === 'games' ? 'active' : ''}`}
                onClick={() => setCurrentView('games')}
              >
                게임
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${currentView === 'simulations' ? 'active' : ''}`}
                onClick={() => setCurrentView('simulations')}
              >
                시뮬레이션
              </button>
            </li>
            <li>
              <button 
                className={`nav-item ${currentView === 'tools' ? 'active' : ''}`}
                onClick={() => setCurrentView('tools')}
              >
                수업 도구
              </button>
            </li>
          </ul>
          <div className="nav-actions">
            {user ? (
              <div className="user-info">
                <img src={user.photoURL || '/default-avatar.png'} alt="avatar" className="user-avatar" />
                <span
                  className="user-name"
                  onClick={() => setShowNicknameModal(true)}
                  title="닉네임 변경"
                >
                  {nickname || user.displayName || '사용자'}
                </span>
                <button className="logout-button" onClick={handleLogout} title="로그아웃">
                  로그아웃
                </button>
              </div>
            ) : (
              <button className="login-button" onClick={() => setShowLoginModal(true)}>
                로그인
              </button>
            )}
            <button className="create-button" onClick={handleCreateClick}>
              ✨ 만들기
            </button>
          </div>
        </div>
      </nav>

      {/* 대시보드 콘텐츠 */}
      {currentView === 'dashboard' && (
        <div className="dashboard-content">
      <section className="content-section">
        <div className="section-header">
          <div className="section-title-row">
            <div>
              <h2>수학 게임</h2>
              <p>재미있게 수학을 배워보세요!</p>
            </div>
            <button
              className="view-all-btn"
              onClick={() => setCurrentView('games')}
            >
              전체보기 →
            </button>
          </div>
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
          <div className="section-title-row">
            <div>
              <h2>수학 시뮬레이션</h2>
              <p>직접 실험하며 수학을 이해하세요!</p>
            </div>
            <button
              className="view-all-btn"
              onClick={() => setCurrentView('simulations')}
            >
              전체보기 →
            </button>
          </div>
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
          <div className="section-title-row">
            <div>
              <h2>수학 수업 도구</h2>
              <p>수업에 활용할 수 있는 다양한 도구들</p>
            </div>
            <button
              className="view-all-btn"
              onClick={() => setCurrentView('tools')}
            >
              전체보기 →
            </button>
          </div>
        </div>
        <ContentCarousel
          items={tools}
          type="tool"
          onDelete={handleDeleteTool}
          onUpdate={handleUpdateTool}
        />
      </section>
        </div>
      )}

      <CreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUpload={handleUpload}
        onLinkInsert={handleLinkInsert}
        onGenerate={handleGenerate}
        onToolUpload={handleToolUpload}
        onToolLinkInsert={handleToolLinkInsert}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setShowCreateModal(true)}
      />
      <LoadingModal
        isOpen={showLoadingModal}
        message={loadingProgress < 60 ? "콘텐츠를 업로드 중입니다..." : "썸네일을 생성 중입니다..."}
        progress={Math.floor(loadingProgress)}
      />

      <PreviewModal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false)
          setGeneratedContent(null)
          setCurrentGenerationData(null)
        }}
        htmlContent={generatedContent?.htmlContent || ''}
        title={generatedContent?.title || ''}
        onRegenerate={handleRegenerate}
        onUpload={handleFinalUpload}
        isRegenerating={isRegenerating}
      />

      <NicknameModal
        isOpen={showNicknameModal}
        onClose={() => setShowNicknameModal(false)}
        currentNickname={nickname}
        onUpdate={updateNickname}
      />
    </div>
  )
}

export default MainPage

