# DNS & Domain Setup Guide

Configure your domain `xfinai.cloud` to point to your VPS for the MIC application.

## Overview

You need to create DNS records so your domains point to your VPS:
- `admin.mic.xfinai.cloud` → Admin Panel (Frontend)
- `api.mic.xfinai.cloud` → Backend API

## Find Your VPS IP

First, get your VPS public IP address:

```bash
# From your local machine
ssh root@YOUR_VPS_IP "hostname -I | awk '{print $1}'"

# Or check in your VPS provider's dashboard
# Example: 123.45.67.89
```

## DNS Records to Add

Add these records to your `xfinai.cloud` domain registrar (GoDaddy, Namecheap, etc.):

### Option A: Using A Records (Direct IP)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | admin.mic | YOUR_VPS_IP (e.g., 123.45.67.89) | 3600 |
| A | api.mic | YOUR_VPS_IP (e.g., 123.45.67.89) | 3600 |

### Option B: Using CNAME Records (Recommended)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | admin.mic | xfinai.cloud | 3600 |
| CNAME | api.mic | xfinai.cloud | 3600 |

Then point the main domain:
| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ (or xfinai.cloud) | YOUR_VPS_IP | 3600 |

## Step-by-Step Setup (Common Registrars)

### GoDaddy

1. Go to **My Products** → Select your domain
2. Click **DNS** tab
3. In the DNS Records section, click **Add**
4. For each subdomain (admin.mic, api.mic):
   - Type: **A**
   - Name: **admin.mic** (or **api.mic**)
   - Value: **YOUR_VPS_IP**
   - TTL: **3600**
   - Click **Save**

### Namecheap

1. Go to **Dashboard** → Select your domain
2. Click **Manage** → **Advanced DNS** tab
3. Click **Add New Record**
4. For each subdomain:
   - Type: **A Record**
   - Host: **admin.mic** (or **api.mic**)
   - Value: **YOUR_VPS_IP**
   - TTL: **3600**
   - Click **Save**

### Cloudflare

1. Go to your domain dashboard
2. Click **DNS** tab
3. Click **+ Add record**
4. For each subdomain:
   - Type: **A**
   - Name: **admin.mic** (or **api.mic**)
   - IPv4 address: **YOUR_VPS_IP**
   - TTL: **Auto** or **3600**
   - Proxy status: **DNS only** (⚠️ Not proxied - important for SSL)
   - Click **Save**

## Verify DNS Propagation

Check if DNS records are propagated globally:

```bash
# Check A records
dig admin.mic.xfinai.cloud
dig api.mic.xfinai.cloud

# Should show your VPS IP
# Example output:
# admin.mic.xfinai.cloud. 3600 IN A 123.45.67.89

# Quick test
nslookup admin.mic.xfinai.cloud
nslookup api.mic.xfinai.cloud

# Online DNS checker
# https://www.whatsmydns.net/
```

## SSL Certificates

Once DNS is configured and pointing to your VPS:

1. SSH into your VPS
2. Run the certificate creation manually:

```bash
# For admin panel
sudo certbot certonly --webroot -w /var/www/certbot -d admin.mic.xfinai.cloud

# For API
sudo certbot certonly --webroot -w /var/www/certbot -d api.mic.xfinai.cloud

# Accept terms when prompted
# Enter email when asked (e.g., admin@xfinai.cloud)
```

3. Verify certificates were created:

```bash
sudo ls -la /etc/letsencrypt/live/admin.mic.xfinai.cloud/
sudo ls -la /etc/letsencrypt/live/api.mic.xfinai.cloud/
```

4. Reload Nginx:

```bash
sudo systemctl reload nginx
```

## Test Your Setup

After DNS propagation and SSL setup, test your domains:

```bash
# Test frontend (should return HTML)
curl -I https://admin.mic.xfinai.cloud

# Test API (should work)
curl https://api.mic.xfinai.cloud/health

# Check SSL certificate
openssl s_client -connect admin.mic.xfinai.cloud:443
openssl s_client -connect api.mic.xfinai.cloud:443
```

## Troubleshooting

### DNS not resolving

```bash
# Check name servers
whois xfinai.cloud | grep -i nameserver

# Wait for TTL to expire (up to 48 hours)
# 
# Or flush local DNS cache:
# Windows: ipconfig /flushdns
# macOS: sudo dscacheutil -flushcache
# Linux: sudo systemctl restart systemd-resolved
```

### SSL certificate errors

```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Verify Nginx configuration
sudo nginx -t

# Check if ports 80 and 443 are open
sudo ufw allow 80
sudo ufw allow 443

# Reload Nginx
sudo systemctl reload nginx
```

### Certificate not auto-renewing

```bash
# Setup auto-renewal with cron
sudo certbot renew --dry-run

# Enable auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## DNS Records Summary

For reference, your final setup should have:

```
admin.mic.xfinai.cloud  → Your VPS IP (123.45.67.89)
                           ↓
                          Nginx (port 443)
                           ↓
                           Static files (/var/www/mic-frontend)
                           Admin Panel (React app)

api.mic.xfinai.cloud    → Your VPS IP (123.45.67.89)
                           ↓
                          Nginx (port 443)
                           ↓
                          Proxy to localhost:5000
                           ↓
                          Node.js Backend
```

## Next Steps

1. Add DNS records to your registrar (see steps above)
2. Wait for DNS propagation (usually 5 minutes to 2 hours)
3. Verify DNS is working: `nslookup admin.mic.xfinai.cloud`
4. SSH to VPS and run: `sudo certbot certonly --webroot -w /var/www/certbot -d admin.mic.xfinai.cloud -d api.mic.xfinai.cloud`
5. Reload Nginx: `sudo systemctl reload nginx`
6. Test endpoints: `curl https://admin.mic.xfinai.cloud` and `curl https://api.mic.xfinai.cloud`

---

**For help:**
- [Let's Encrypt Docs](https://letsencrypt.org)
- [Certbot Docs](https://certbot.eff.org)
- [DNS Checker](https://www.whatsmydns.net)
