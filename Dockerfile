# Build stage
FROM node:20-alpine AS builder

# 추가: GitHub Actions에서 넘겨줄 변수 정의
ARG VITE_KAKAO_MAP_KEY
# 추가: 정의된 ARG를 빌드 환경 변수로 설정
ENV VITE_KAKAO_MAP_KEY=$VITE_KAKAO_MAP_KEY

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80