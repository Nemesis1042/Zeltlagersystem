# Frontend Migration: FastAPI → PHP

## 🔄 Changes Made

### 1. API Client Configuration
- **New File**: `src/utils/api.js`
  - Centralized axios instance
  - Automatic JWT token injection
  - 401 error handling (redirect to login)
  - Environment variable support

### 2. Environment Setup
- **New File**: `.env.example`
  - `VITE_API_URL` - Backend API base URL
  - Development: `http://localhost:8000/api`
  - Production: `https://api.lagerbank.info/api`

### 3. Updated Components

#### Authentication Pages
- `LoginPage.jsx` - Uses new `api.post('/auth/login')`
- `RegisterPage.jsx` - Uses new `api.post('/auth/register')`
- Response format: `{ token, user }`

#### Admin Dashboard
- `AdminDashboard.jsx` - Uses new `api.get('/auth/me')`
- Automatic token injection via interceptor

### 4. API Response Format Changes

#### Before (FastAPI)
```json
{
  "access_token": "token_here",
  "token_type": "bearer"
}
```

#### After (PHP)
```json
{
  "token": "token_here",
  "user": {
    "id": 1,
    "email": "user@email.com",
    "vorname": "Max",
    "nachname": "Mustermann",
    "role": "admin"
  }
}
```

## 🚀 Setup for Development

### 1. Create `.env` file
```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:8000/api
```

### 2. Start Frontend
```bash
npm run dev
```

### 3. Start PHP Backend
```bash
# Option A: PHP Built-in Server
cd ../backend-php/public
php -S localhost:8000

# Option B: Docker
docker run -p 8000:80 -v $(pwd)/../backend-php:/var/www/html php:8.1-apache
```

### 4. Test Login
- URL: http://localhost:5173/login
- Email: admin@lagerbank.info
- Password: (from DB setup)

## 📝 API Endpoints to Implement

These endpoints are called but not yet implemented in PHP backend:

```
GET    /participants/?camp_id=1
GET    /participants/{id}
POST   /check-in/
GET    /check-in/status/1
GET    /tents/?camp_id=1
POST   /tents/
POST   /activities/
GET    /activities/?camp_id=1
POST   /activities/{id}/generate-groups
GET    /activities/{id}/groups
POST   /photos/
GET    /photos/?camp_id=1
PATCH  /photos/{id}
DELETE /photos/{id}
... (more in the roadmap)
```

## 🔗 Migration Checklist

- [x] Create API client with axios
- [x] Add environment configuration
- [x] Update LoginPage
- [x] Update RegisterPage
- [x] Update AdminDashboard
- [ ] Implement Participant endpoints
- [ ] Implement Check-In endpoints
- [ ] Implement Tent endpoints
- [ ] Implement Activity endpoints
- [ ] Implement Photo endpoints
- [ ] Update all other React pages
- [ ] Test on All-Inkl production

## 📚 Files Modified
- `src/utils/api.js` (new)
- `src/pages/LoginPage.jsx`
- `src/pages/RegisterPage.jsx`
- `src/pages/AdminDashboard.jsx`
- `.env.example` (new)

## 🧪 Testing

### Login Flow
1. Start backend
2. Start frontend
3. Navigate to `/login`
4. Enter credentials (admin@lagerbank.info)
5. Should redirect to `/admin`
6. Dashboard should load current user

### Error Handling
- Invalid credentials → error message displayed
- Network error → error message displayed
- Expired token → auto-redirect to `/login`

## 🚀 Deployment

### Development
```bash
VITE_API_URL=http://localhost:8000/api npm run dev
```

### Production on All-Inkl
```bash
VITE_API_URL=https://api.lagerbank.info/api npm run build
# Upload dist/ to All-Inkl
```

## 📞 Troubleshooting

**CORS Error: "Access to XMLHttpRequest blocked"**
- Backend `.htaccess` has CORS headers
- Check `public/.htaccess` in backend-php

**401 Unauthorized**
- Token not being sent
- Check `src/utils/api.js` interceptor
- Check localStorage has token

**API returns 404**
- Endpoint not implemented yet
- Check `backend-php/public/index.php` for routes
- Implement in `backend-php/src/api/`

**"Cannot find module 'api'"**
- Run `npm install`
- Check `src/utils/api.js` exists
- Clear node_modules cache: `rm -rf node_modules && npm install`
