// Firebase 설정 디버깅 유틸리티

export const checkFirebaseConfig = () => {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  }

  console.log('=== Firebase 설정 확인 ===')
  console.log('API Key:', config.apiKey ? '✓ 설정됨' : '✗ 없음')
  console.log('Auth Domain:', config.authDomain ? '✓ 설정됨' : '✗ 없음')
  console.log('Project ID:', config.projectId ? '✓ 설정됨' : '✗ 없음')
  console.log('Storage Bucket:', config.storageBucket ? '✓ 설정됨' : '✗ 없음')
  console.log('Messaging Sender ID:', config.messagingSenderId ? '✓ 설정됨' : '✗ 없음')
  console.log('App ID:', config.appId ? '✓ 설정됨' : '✗ 없음')
  
  const missing = Object.entries(config).filter(([key, value]) => !value || value.includes('your-') || value.includes('여기에'))
  
  if (missing.length > 0) {
    console.error('⚠️ 다음 설정이 누락되었거나 예시 값입니다:')
    missing.forEach(([key]) => console.error(`  - ${key}`))
    console.error('\n.env 파일을 확인하고 Firebase 설정 정보를 입력해주세요.')
    console.error('💡 .env 파일 수정 후 개발 서버를 재시작해야 합니다!')
    return false
  }
  
  // API 키 형식 확인
  if (config.apiKey && (config.apiKey.length < 30 || !config.apiKey.startsWith('AIza'))) {
    console.error('⚠️ API Key 형식이 올바르지 않습니다.')
    console.error('   Firebase Console에서 올바른 API Key를 복사했는지 확인하세요.')
    console.error('   API Key는 보통 "AIzaSy..."로 시작합니다.')
    return false
  }
  
  console.log('✓ 모든 Firebase 설정이 완료되었습니다.')
  console.log('💡 만약 로그인이 안 된다면:')
  console.log('   1. Firebase Console > Authentication > Sign-in method > Google 활성화 확인')
  console.log('   2. .env 파일의 API Key가 올바른지 확인')
  console.log('   3. 개발 서버 재시작 확인')
  return true
}

