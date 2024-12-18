# Cloudflare Workers API

## API 端点

### 认证
- GET /login?username=mjm
  - 返回 JWT token

### 任务管理
所有 API 请求需要在 Header 中包含 Bearer Token：
