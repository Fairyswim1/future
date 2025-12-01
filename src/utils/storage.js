// 로컬 스토리지 유틸리티

const STORAGE_KEYS = {
  GAMES: 'math_platform_games',
  SIMULATIONS: 'math_platform_simulations',
  WEBTOONS: 'math_platform_webtoons'
}

export const saveGame = (game) => {
  const games = getGames()
  const newGame = {
    ...game,
    id: Date.now(), // 고유 ID 생성
    createdAt: new Date().toISOString()
  }
  games.push(newGame)
  localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games))
  return newGame
}

export const getGames = () => {
  try {
    const games = localStorage.getItem(STORAGE_KEYS.GAMES)
    return games ? JSON.parse(games) : []
  } catch (error) {
    console.error('Failed to load games from storage:', error)
    return []
  }
}

export const saveSimulation = (simulation) => {
  const simulations = getSimulations()
  const newSimulation = {
    ...simulation,
    id: Date.now(),
    createdAt: new Date().toISOString()
  }
  simulations.push(newSimulation)
  localStorage.setItem(STORAGE_KEYS.SIMULATIONS, JSON.stringify(simulations))
  return newSimulation
}

export const getSimulations = () => {
  try {
    const simulations = localStorage.getItem(STORAGE_KEYS.SIMULATIONS)
    return simulations ? JSON.parse(simulations) : []
  } catch (error) {
    console.error('Failed to load simulations from storage:', error)
    return []
  }
}

export const saveWebtoon = (webtoon) => {
  const webtoons = getWebtoons()
  const newWebtoon = {
    ...webtoon,
    id: Date.now(),
    createdAt: new Date().toISOString()
  }
  webtoons.push(newWebtoon)
  localStorage.setItem(STORAGE_KEYS.WEBTOONS, JSON.stringify(webtoons))
  return newWebtoon
}

export const getWebtoons = () => {
  try {
    const webtoons = localStorage.getItem(STORAGE_KEYS.WEBTOONS)
    return webtoons ? JSON.parse(webtoons) : []
  } catch (error) {
    console.error('Failed to load webtoons from storage:', error)
    return []
  }
}

// HTML 파일을 Blob URL로 변환
export const createBlobURL = (htmlContent, filename) => {
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  return url
}

// 게임 삭제
export const deleteGame = (gameId) => {
  const games = getGames()
  const filtered = games.filter(game => game.id !== gameId)
  localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(filtered))
  return filtered
}

// 게임 수정
export const updateGame = (gameId, updates) => {
  const games = getGames()
  const updated = games.map(game => 
    game.id === gameId ? { ...game, ...updates } : game
  )
  localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(updated))
  return updated.find(game => game.id === gameId)
}

// 시뮬레이션 삭제
export const deleteSimulation = (simulationId) => {
  const simulations = getSimulations()
  const filtered = simulations.filter(sim => sim.id !== simulationId)
  localStorage.setItem(STORAGE_KEYS.SIMULATIONS, JSON.stringify(filtered))
  return filtered
}

// 시뮬레이션 수정
export const updateSimulation = (simulationId, updates) => {
  const simulations = getSimulations()
  const updated = simulations.map(sim => 
    sim.id === simulationId ? { ...sim, ...updates } : sim
  )
  localStorage.setItem(STORAGE_KEYS.SIMULATIONS, JSON.stringify(updated))
  return updated.find(sim => sim.id === simulationId)
}

