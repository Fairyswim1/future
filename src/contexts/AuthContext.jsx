import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'
import { getUserNickname, setUserNickname } from '../utils/firestore'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [nickname, setNickname] = useState(null)
  const [loading, setLoading] = useState(true)

  // 사용자 닉네임 가져오기
  const loadUserNickname = async (userId) => {
    if (!userId) {
      setNickname(null)
      return
    }
    try {
      const userNickname = await getUserNickname(userId)
      setNickname(userNickname)
    } catch (error) {
      console.error('닉네임 로드 실패:', error)
      setNickname(null)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        await loadUserNickname(user.uid)
      } else {
        setNickname(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      // 로그인 후 닉네임 로드
      if (result.user) {
        await loadUserNickname(result.user.uid)
      }
      return result.user
    } catch (error) {
      console.error('Google login error:', error)
      throw error
    }
  }

  const updateNickname = async (newNickname) => {
    if (!user) {
      throw new Error('로그인이 필요합니다.')
    }
    try {
      await setUserNickname(user.uid, newNickname, user.displayName)
      setNickname(newNickname)
      return newNickname
    } catch (error) {
      console.error('닉네임 업데이트 실패:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const value = {
    user,
    nickname,
    loading,
    loginWithGoogle,
    logout,
    updateNickname,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

