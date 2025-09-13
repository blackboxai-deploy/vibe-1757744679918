# 🚀 Deployment Guide - AI Video Generator VEO-3

## Deploy ke Vercel (Gratis)

### 1. Persiapan
```bash
# Clone atau download semua file project ini
# Pastikan semua file ada di folder project Anda
```

### 2. Setup Vercel Account
1. Buka [vercel.com](https://vercel.com)
2. Sign up dengan GitHub/Google
3. Connect GitHub repository (jika pakai GitHub)

### 3. Deploy via Vercel Dashboard
1. **Import Project**
   - Klik "New Project" di Vercel dashboard
   - Import dari GitHub repo atau upload folder
   
2. **Framework Detection**
   - Vercel akan auto-detect Next.js
   - Build Command: `pnpm run build` atau `npm run build`
   - Output Directory: `.next`
   
3. **Environment Variables (Optional)**
   ```
   NODE_ENV=production
   ```

4. **Deploy**
   - Klik "Deploy"
   - Tunggu 3-5 menit
   - Dapatkan URL: `https://your-project.vercel.app`

### 4. Custom Domain (Optional)
1. **Beli Domain** (dari Namecheap, GoDaddy, dll)
2. **Add Domain** di Vercel dashboard
3. **Update DNS** sesuai instruksi Vercel
4. **SSL Certificate** otomatis dari Vercel

## Deploy ke Netlify (Alternatif)

### 1. Build Settings
```
Build Command: npm run build
Publish Directory: out
```

### 2. Next.js Config untuk Static Export
Tambahkan di `next.config.ts`:
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

## Deploy ke VPS/Server (Advanced)

### 1. Server Requirements
- Node.js 18+
- PM2 untuk process management
- Nginx untuk reverse proxy
- SSL certificate

### 2. Installation
```bash
# Upload files ke server
scp -r project-folder user@server:/var/www/

# Install dependencies
npm install --production

# Build project
npm run build

# Start with PM2
pm2 start ecosystem.config.js
```

### 3. Nginx Config
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database untuk Production

### Current: localStorage (Development Only)
```javascript
// src/lib/storage.ts - Replace with real database
localStorage.setItem('currentUser', JSON.stringify(user))
```

### Recommended: Database Integration
1. **Supabase** (PostgreSQL)
2. **PlanetScale** (MySQL)
3. **MongoDB Atlas**
4. **Firebase Firestore**

### Example Supabase Integration
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Replace localStorage with Supabase
export const saveUser = async (user) => {
  const { data, error } = await supabase
    .from('users')
    .insert([user])
  
  return { data, error }
}
```

## Environment Variables untuk Production

```bash
# .env.local
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

## Security untuk Production

### 1. API Key Encryption
```typescript
// Encrypt API keys before storing
import CryptoJS from 'crypto-js'

const encryptApiKey = (apiKey: string) => {
  return CryptoJS.AES.encrypt(apiKey, process.env.ENCRYPTION_KEY).toString()
}
```

### 2. Rate Limiting
```typescript
// Add rate limiting to API routes
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
})
```

### 3. HTTPS Only
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ]
  }
}
```

## Monitoring untuk Production

### 1. Error Tracking
- **Sentry**: Error monitoring
- **LogRocket**: Session replay
- **Vercel Analytics**: Performance

### 2. Uptime Monitoring
- **UptimeRobot**: Free uptime monitoring
- **Pingdom**: Advanced monitoring
- **StatusPage**: Status page untuk users

## Backup Strategy

### 1. Database Backup
```bash
# Daily automated backup
pg_dump database_name > backup_$(date +%Y%m%d).sql
```

### 2. File Backup
```bash
# Sync to cloud storage
rsync -av /var/www/project/ s3://your-bucket/backup/
```

## Cost Estimation

### Free Tier Options:
- **Vercel**: 100GB bandwidth/month
- **Netlify**: 100GB bandwidth/month
- **Supabase**: 500MB database
- **Total**: $0/month untuk start

### Paid Plans:
- **Vercel Pro**: $20/month
- **Supabase Pro**: $25/month  
- **Custom Domain**: $10-15/year
- **Total**: ~$50/month untuk production

## Support & Maintenance

### 1. Updates
```bash
# Regular updates
npm update
npm audit fix
```

### 2. Monitoring
- Setup alerts untuk errors
- Monitor performance metrics  
- Track user behavior

### 3. Scaling
- Add CDN untuk global performance
- Implement caching strategy
- Database read replicas untuk high traffic