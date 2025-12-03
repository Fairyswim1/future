# Node.js 20 이미지 사용
FROM node:20-slim

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 프로덕션 의존성만 설치
RUN npm ci --only=production

# 소스 코드 복사
COPY server.js ./

# 환경 변수 기본값 설정
ENV PORT=8080
ENV NODE_ENV=production

# 포트 노출
EXPOSE 8080

# 서버 실행
CMD ["node", "server.js"]
