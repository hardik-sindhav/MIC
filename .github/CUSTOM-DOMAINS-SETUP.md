# Custom Domain Deployment Complete ✅

Your deployment is now configured for your custom domains:
- **Admin Panel:** https://admin.mic.xfinai.cloud
- **Backend API:** https://api.mic.xfinai.cloud

## Quick Setup Flow

### 1️⃣ Configure DNS Records (First)

Go to your domain registrar (GoDaddy, Namecheap, etc.) and add:

```
Type    Name              Value
────────────────────────────────────────
A       admin.mic         YOUR_VPS_IP
A       api.mic           YOUR_VPS_IP
```

Replace `YOUR_VPS_IP` with your VPS IP address (e.g., `123.45.67.89`)

**Detailed guide:** See [DNS-SETUP.md](DNS-SETUP.md)

### 2️⃣ Setup VPS (Second)

SSH into your VPS and run the automated setup:

```bash
sudo bash setup-vps.sh https://github.com/YOUR-USERNAME/MIC.git api.mic.xfinai.cloud admin.mic.xfinai.cloud
```

Or manually:
```bash
# From your repo directory
sudo bash setup-vps.sh https://github.com/YOUR-USERNAME/MIC.git
```

The script will:
- ✅ Install Node.js, Nginx, Certbot
- ✅ Clone your repository
- ✅ Setup backend service
- ✅ Configure Nginx for both domains
- ✅ Request SSL certificates automatically

### 3️⃣ Add GitHub Secrets (Third)

Repository → Settings → Secrets and variables → Actions

Add these 5 secrets:

```
VPS_PRIVATE_KEY     = Content of ~/.ssh/github-deploy
VPS_HOST            = Your VPS IP (e.g., 123.45.67.89)
VPS_USER            = root
VPS_APP_PATH        = /var/www/mic-backend
VPS_FRONTEND_PATH   = /var/www/mic-frontend
```

### 4️⃣ Generate SSH Key (Local Machine)

```bash
# Generate key
ssh-keygen -t ed25519 -f ~/.ssh/github-deploy -N ""

# Add public key to VPS
ssh-copy-id -i ~/.ssh/github-deploy.pub root@YOUR_VPS_IP

# Test connection (should work without password)
ssh -i ~/.ssh/github-deploy root@YOUR_VPS_IP "echo OK"
```

### 5️⃣ Test Deployment

Make a test commit and merge to main:

```bash
# Local changes
git checkout -b feature/test
echo "# Test" >> README.md
git add README.md
git commit -m "test: trigger deployment"
git push origin feature/test

# Create PR on GitHub → Merge to main
# Watch GitHub Actions tab for deployment
```

### 6️⃣ Access Your App

After deployment completes:

```
Admin Panel: https://admin.mic.xfinai.cloud
Backend API: https://api.mic.xfinai.cloud
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    xfinai.cloud                          │
└──────────┬──────────────────────────┬────────────────────┘
           │                          │
    admin.mic.xfinai.cloud    api.mic.xfinai.cloud
           │                          │
           ▼                          ▼
      ┌─────────────────────────────────┐
      │       Your VPS (Single Server)   │
      │                                   │
      │  ┌─────────────────────────────┐ │
      │  │      Nginx (Ports 80/443)    │ │
      │  ├─────────────────────────────┤ │
      │  │ Frontend (React + Vite)      │ │
      │  │ /var/www/mic-frontend        │ │
      │  └─────────────────────────────┘ │
      │                                   │
      │  ┌─────────────────────────────┐ │
      │  │  Node.js Backend (Port 5000) │ │
      │  │ /var/www/mic-backend         │ │
      │  └─────────────────────────────┘ │
      │                                   │
      │  ┌─────────────────────────────┐ │
      │  │      MongoDB (or Cloud)      │ │
      │  │ (as configured in .env)      │ │
      │  └─────────────────────────────┘ │
      │                                   │
      └─────────────────────────────────┘
```

## What Happens on Each Merge to Main

```
1. Developer merges PR to main on GitHub
                    ↓
2. GitHub Actions workflow triggered
                    ↓
3. Frontend built with Vite
                    ↓
4. Frontend deployed to GitHub Pages (backup)
                    ↓
5. SSH to VPS
                    ↓
6. Frontend files uploaded to /var/www/mic-frontend
                    ↓
7. Backend code pulled via Git
                    ↓
8. Dependencies reinstalled (npm ci)
                    ↓
9. Backend service restarted
                    ↓
10. Both frontend and backend updated live ✅
                    ↓
11. Access updated app at your domains
```

## Environment Variables

### Frontend (.env during build)
```
VITE_API_URL=https://api.mic.xfinai.cloud
```

### Backend (.env on VPS)
```
NODE_ENV=production
DATABASE_URL=mongodb+srv://...
JWT_SECRET=your-secret
PORT=5000
CORS_ORIGIN=https://admin.mic.xfinai.cloud
```

## Monitoring Your Deployment

```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Check backend is running
sudo systemctl status mic-backend

# View backend logs
sudo journalctl -u mic-backend -f

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check SSL certificates
sudo certbot certificates

# Test your endpoints
curl https://api.mic.xfinai.cloud/health
curl -I https://admin.mic.xfinai.cloud
```

## SSL Certificate Auto-Renewal

Certificates auto-renew via Certbot (already configured). Check:

```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

## Troubleshooting

**DNS not resolving?**
- Wait up to 48 hours for global propagation
- Check: `nslookup admin.mic.xfinai.cloud`

**SSL certificate errors?**
- Verify DNS is pointing to VPS: `dig admin.mic.xfinai.cloud`
- Manually request: `sudo certbot certonly --webroot -w /var/www/certbot -d admin.mic.xfinai.cloud`
- Reload Nginx: `sudo systemctl reload nginx`

**Frontend not updating?**
- Check file permissions: `ls -la /var/www/mic-frontend`
- Force Nginx cache clear: `sudo systemctl reload nginx`
- View Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

**Backend not responding?**
- Check service: `sudo systemctl status mic-backend`
- Check logs: `sudo journalctl -u mic-backend -n 50`
- Manually restart: `sudo systemctl restart mic-backend`

## Next Steps

1. ✅ Configure DNS records (see step 1 above)
2. ✅ Wait for DNS propagation (5 min - 2 hours)
3. ✅ Run VPS setup script
4. ✅ Add GitHub Secrets
5. ✅ Generate SSH keys
6. ✅ Test deployment with PR merge
7. ✅ Access your app at custom domains

## Files Reference

- [`.github/DNS-SETUP.md`](DNS-SETUP.md) — DNS configuration guide
- [`.github/VPS-SETUP.md`](VPS-SETUP.md) — Detailed VPS setup
- [`.github/VPS-DEPLOYMENT-CHECKLIST.md`](VPS-DEPLOYMENT-CHECKLIST.md) — Quick checklist
- [`.github/workflows/deploy.yml`](workflows/deploy.yml) — Deployment workflow
- [`setup-vps.sh`](../setup-vps.sh) — Automated VPS setup script

---

**Your domains are now ready for auto-deployment on every merge! 🚀**
