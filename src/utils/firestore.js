// Firestore 데이터베이스 유틸리티
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import { ref, uploadString, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../config/firebase'

const COLLECTIONS = {
  GAMES: 'games',
  SIMULATIONS: 'simulations',
  WEBTOONS: 'webtoons'
}

// 게임 저장
export const saveGameToFirestore = async (game, userId) => {
  try {
    let htmlUrl = game.htmlUrl || null
    
    // htmlContent가 있는 경우에만 Storage에 업로드 (링크 삽입의 경우 htmlContent 없음)
    if (game.htmlContent) {
      const storageRef = ref(storage, `games/${userId}/${Date.now()}.html`)
      await uploadString(storageRef, game.htmlContent, 'raw')
      htmlUrl = await getDownloadURL(storageRef)
    }

    const gameData = {
      ...game,
      htmlUrl: htmlUrl,
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    // htmlContent는 Firestore에 저장하지 않음 (Storage에만 저장)
    delete gameData.htmlContent

    const docRef = await addDoc(collection(db, COLLECTIONS.GAMES), gameData)
    return { id: docRef.id, ...gameData }
  } catch (error) {
    console.error('게임 저장 실패:', error)
    throw error
  }
}

// 게임 목록 가져오기 (실시간)
export const subscribeGames = (callback) => {
  const q = query(collection(db, COLLECTIONS.GAMES), orderBy('createdAt', 'desc'))
  
  return onSnapshot(q, (snapshot) => {
    const games = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(games)
  }, (error) => {
    console.error('게임 목록 가져오기 실패:', error)
    callback([])
  })
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
    
    // htmlContent가 있는 경우에만 Storage에 업로드 (링크 삽입의 경우 htmlContent 없음)
    if (simulation.htmlContent) {
      const storageRef = ref(storage, `simulations/${userId}/${Date.now()}.html`)
      await uploadString(storageRef, simulation.htmlContent, 'raw')
      htmlUrl = await getDownloadURL(storageRef)
    }

    const simData = {
      ...simulation,
      htmlUrl: htmlUrl,
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    delete simData.htmlContent

    const docRef = await addDoc(collection(db, COLLECTIONS.SIMULATIONS), simData)
    return { id: docRef.id, ...simData }
  } catch (error) {
    console.error('시뮬레이션 저장 실패:', error)
    throw error
  }
}

// 시뮬레이션 목록 가져오기 (실시간)
export const subscribeSimulations = (callback) => {
  const q = query(collection(db, COLLECTIONS.SIMULATIONS), orderBy('createdAt', 'desc'))
  
  return onSnapshot(q, (snapshot) => {
    const simulations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(simulations)
  }, (error) => {
    console.error('시뮬레이션 목록 가져오기 실패:', error)
    callback([])
  })
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

