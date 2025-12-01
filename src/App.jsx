import React from 'react'
import { AuthProvider } from './contexts/AuthContext'
import MainPage from './components/MainPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <MainPage />
      </div>
    </AuthProvider>
  )
}

export default App

