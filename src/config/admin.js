// 관리자 설정
// 여기에 관리자 이메일 또는 UID를 추가하세요

export const ADMIN_IDS = ['lhj3534@gmail.com']

// 관리자 확인 함수
export const isAdmin = (user) => {
  if (!user) return false
  return ADMIN_IDS.includes(user.uid) || ADMIN_IDS.includes(user.email)
}



