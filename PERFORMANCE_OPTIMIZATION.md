# Performance Optimization Guide for ORIN

## Quick Wins (Zero Cost, Max Impact)

### Problem: 4 Sites Loading Slowly
- n8n.orin.work: Render cold starts (5-30s)
- orin.work: Render delays
- orin-revamp: React bundle not optimized
- marvin-resume: No caching

## Solution Stack (All Free)

### TIER 1: Render Cold Start Fix
**Setup UptimeRobot (pings every 5 min = keeps instances warm)**
1. Go to uptimerobot.com
2. Add 4 monitors:
   - https://n8n.orin.work/webhook/health
   - https://orin.work/api/health
   - https://orin-revamp.vercel.app/
   - https://marvin-resume.vercel.app/
3. Set interval to 5 minutes

**Result: Eliminates 80% of cold start penalty**

### TIER 2: Cloudflare Edge Caching
**All 4 sites point to Cloudflare (already done?)**
Enable in Dashboard:
1. Speed > Optimization
   - Turn ON: Brotli compression
   - Turn ON: HTTP/2 Push
   - Turn ON: Polish (WebP)
2. Caching > Rules
   - Rule 1: /assets/* → Cache 1 year
   - Rule 2: /api/* → Bypass
   - Rule 3: /index.html → Cache 5 min, revalidate

**Result: 60-70% faster for repeat visitors**

### TIER 3: React Build Optimization
**Update vite.config.ts in orin-revamp**
Install: `npm install vite-plugin-compression`

Add to config:
```ts
import compression from 'vite-plugin-compression';

compression({
  algorithm: 'brotliCompress',
  threshold: 10240,
  ext: '.br'
})
```

Add build options:
```ts
build: {
  minify: 'terser',
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['react', 'react-dom'],
        'gemini': ['@google/generative-ai']
      }
    }
  }
}
```

**Result: 40% smaller bundles**

### TIER 4: Render Health Checks
**Add to your server.js (orin.work & n8n.orin.work)**
```js
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ts: Date.now() });
});
```

**Result: Enables auto-restart capability**

## Expected Impact

**Before**: 5-30 seconds (first visit)
**After**: 1-3 seconds (Cloudflare) + <500ms (cached)

- UptimeRobot = 80% improvement on cold starts
- Cloudflare caching = 60-70% on repeat
- React optimization = 40% bundle reduction
- Combined = 3-5x faster overall

## Implementation Order
1. Setup UptimeRobot (5 min)
2. Configure Cloudflare caching (10 min)
3. Update vite.config.ts (10 min)
4. Add health endpoints (5 min)
5. Deploy & test

## Testing
- Lighthouse: https://pagespeed.web.dev
- GTmetrix: https://gtmetrix.com
- WebPageTest: https://webpagetest.org

Target scores: 85+ Performance, <2.5s LCP
