# How to Create VPS_PRIVATE_KEY - Step by Step

## 📋 Overview

You need to:
1. Generate SSH key pair on your local machine
2. Add public key to VPS
3. Add private key to GitHub Secrets

**Time needed:** 5-10 minutes

---

## ✅ Step 1: Generate SSH Key (Windows/Linux/Mac)

### Windows (PowerShell)

Open **PowerShell** and run:

```powershell
# Generate SSH key
ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\github-deploy" -N ""

# Verify key was created
ls $env:USERPROFILE\.ssh\github-deploy*
```

**You should see:**
```
github-deploy      (private key - keep secret!)
github-deploy.pub  (public key - share with VPS)
```

### Linux / Mac

Open **Terminal** and run:

```bash
# Generate SSH key
ssh-keygen -t ed25519 -f ~/.ssh/github-deploy -N ""

# Verify key was created
ls -la ~/.ssh/github-deploy*
```

---

## ✅ Step 2: Get Your Private Key Content

This is what you'll add to GitHub Secrets.

### Windows (PowerShell)

```powershell
# Display the private key
Get-Content "$env:USERPROFILE\.ssh\github-deploy"

# Copy to clipboard (easier)
Get-Content "$env:USERPROFILE\.ssh\github-deploy" | Set-Clipboard
```

**Output looks like:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUtbm9uZS1ub25lAAAAAAAAAC1FDEURQzZV
...many more lines...
-----END OPENSSH PRIVATE KEY-----
```

### Linux / Mac

```bash
# Display the private key
cat ~/.ssh/github-deploy

# Copy to clipboard (Mac)
cat ~/.ssh/github-deploy | pbcopy

# Copy to clipboard (Linux)
cat ~/.ssh/github-deploy | xclip -selection clipboard
```

---

## ✅ Step 3: Add Public Key to VPS

Your VPS needs to know about your public key.

### Option A: Using SSH-Copy-ID (Easiest)

```powershell
# Windows PowerShell
ssh-copy-id -i "$env:USERPROFILE\.ssh\github-deploy.pub" root@YOUR_VPS_IP
```

Or on **Linux/Mac**:

```bash
ssh-copy-id -i ~/.ssh/github-deploy.pub root@YOUR_VPS_IP
```

**Replace `YOUR_VPS_IP`** with your actual VPS IP (e.g., `123.45.67.89`)

### Option B: Manual (If Option A doesn't work)

**Step 3a: SSH to VPS**
```bash
ssh root@YOUR_VPS_IP
# Enter your VPS password
```

**Step 3b: Add public key to VPS**
```bash
# Create .ssh directory if needed
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Display your public key (from local machine, copy it)
# On your local machine, show the public key:
# cat ~/.ssh/github-deploy.pub

# On VPS, add it:
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Exit VPS
exit
```

---

## ✅ Step 4: Test SSH Connection

Make sure the key works before adding to GitHub:

### Windows (PowerShell)

```powershell
ssh -i "$env:USERPROFILE\.ssh\github-deploy" root@YOUR_VPS_IP "echo OK"
```

### Linux / Mac

```bash
ssh -i ~/.ssh/github-deploy root@YOUR_VPS_IP "echo OK"
```

**Expected output:**
```
OK
```

If it works, continue to Step 5. If it doesn't work, go back to Step 3.

---

## ✅ Step 5: Add to GitHub Secrets

Now add the **private key** to GitHub.

### Step 5a: Go to GitHub Repository Settings

1. Open your GitHub repository: `https://github.com/YOUR-USERNAME/MIC`
2. Click on **Settings** (top right)
3. Click on **Secrets and variables** (left sidebar)
4. Click on **Actions**

### Step 5b: Create New Secret

1. Click **New repository secret** button (green button)
2. Fill in:
   - **Name:** `VPS_PRIVATE_KEY`
   - **Secret:** Paste your private key here

**Important:** 
- Use the PRIVATE key (not public)
- Copy the entire key including `-----BEGIN` and `-----END` lines
- Keep it secret! Never share this key

### Step 5c: Save

Click **Add secret** button

---

## 📋 Complete Example

Here's what your workflow looks like:

### Windows PowerShell Example

```powershell
# 1. Generate key
ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\github-deploy" -N ""

# 2. Copy private key
Get-Content "$env:USERPROFILE\.ssh\github-deploy" | Set-Clipboard

# 3. Add public key to VPS
ssh-copy-id -i "$env:USERPROFILE\.ssh\github-deploy.pub" root@123.45.67.89

# 4. Test connection
ssh -i "$env:USERPROFILE\.ssh\github-deploy" root@123.45.67.89 "echo OK"

# 5. Paste into GitHub Secrets (see Step 5)
```

### Linux/Mac Example

```bash
# 1. Generate key
ssh-keygen -t ed25519 -f ~/.ssh/github-deploy -N ""

# 2. Copy private key
cat ~/.ssh/github-deploy | pbcopy  # Mac
cat ~/.ssh/github-deploy | xclip -selection clipboard  # Linux

# 3. Add public key to VPS
ssh-copy-id -i ~/.ssh/github-deploy.pub root@123.45.67.89

# 4. Test connection
ssh -i ~/.ssh/github-deploy root@123.45.67.89 "echo OK"

# 5. Paste into GitHub Secrets (see Step 5)
```

---

## ✅ Verify It's Added

After adding the secret to GitHub:

1. Go to Repository → Settings → Secrets and variables → Actions
2. You should see `VPS_PRIVATE_KEY` in the list
3. Click the ⚫ icon to verify (shows last 4 characters)

---

## ✅ Test Deployment

Once the secret is added:

1. Make a test commit
2. Push to main
3. Watch the Actions tab in GitHub
4. Backend should deploy to VPS automatically

---

## 🔑 File Locations

After Step 1, you'll have two files:

| File | Location | Purpose |
|------|----------|---------|
| `github-deploy` | `~/.ssh/github-deploy` | **PRIVATE** - Add to GitHub Secrets |
| `github-deploy.pub` | `~/.ssh/github-deploy.pub` | PUBLIC - Add to VPS |

**Windows:**
- `C:\Users\YourUsername\.ssh\github-deploy`
- `C:\Users\YourUsername\.ssh\github-deploy.pub`

**Linux/Mac:**
- `~/.ssh/github-deploy`
- `~/.ssh/github-deploy.pub`

---

## 🚨 Security Tips

✅ **DO:**
- Keep the private key secret
- Use SSH key instead of passwords
- Regenerate keys if they're compromised
- Limit SSH access on VPS

❌ **DON'T:**
- Share your private key in Slack, email, etc.
- Commit the private key to Git
- Use the same key for multiple purposes
- Post it in GitHub issues

---

## ❓ Troubleshooting

### "Permission denied (publickey)"
```bash
# Check if file exists
ls ~/.ssh/github-deploy

# Check if public key is on VPS
ssh root@YOUR_VPS_IP "cat ~/.ssh/authorized_keys"

# Re-add public key
ssh-copy-id -i ~/.ssh/github-deploy.pub root@YOUR_VPS_IP
```

### "ssh-keygen: No such file or directory"
- Make sure `.ssh` directory exists
- Create it: `mkdir -p ~/.ssh`
- Try again

### "Could not open a connection to your authentication agent"
- Windows PowerShell: Make sure you're using the right path
- Linux/Mac: Start SSH agent: `eval "$(ssh-agent -s)"`

### Private key permissions wrong
```bash
# Fix permissions (Linux/Mac)
chmod 600 ~/.ssh/github-deploy
chmod 700 ~/.ssh
```

---

## Summary

1. ✅ Generate SSH key with `ssh-keygen`
2. ✅ Add public key to VPS with `ssh-copy-id`
3. ✅ Test connection with SSH
4. ✅ Copy private key to GitHub Secrets
5. ✅ Push code to trigger deployment

**Done!** Your deployments will now work automatically. 🎉

---

## Next Steps

After adding `VPS_PRIVATE_KEY`, add these other 4 secrets:

```
VPS_HOST           = Your VPS IP (123.45.67.89)
VPS_USER           = root
VPS_APP_PATH       = /var/www/mic-backend
VPS_FRONTEND_PATH  = /var/www/mic-frontend
```

See [CUSTOM-DOMAINS-SETUP.md](CUSTOM-DOMAINS-SETUP.md) for adding other secrets.
