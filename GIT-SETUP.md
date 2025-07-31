# Git Setup Guide for AI-Powered Form Generator

This guide will help you set up Git for your project and ensure sensitive files are properly protected.

## 🚀 Initial Git Setup

### 1. Initialize Git Repository
```bash
cd project
git init
```

### 2. Add Files to Git
```bash
# Add all files (except those in .gitignore)
git add .

# Check what will be committed
git status
```

### 3. Make Initial Commit
```bash
git commit -m "Initial commit: AI-Powered Form Generator"
```

## 🔒 Security Checklist

### ✅ Files That Should NEVER Be Committed:
- **`.env.local`** - Contains your API keys
- **`node_modules/`** - Dependencies (too large)
- **`dist/`** - Build output
- **Any files with API keys or secrets**

### ✅ Files That SHOULD Be Committed:
- **`env.example`** - Template for environment variables
- **`welcome.html`** - Welcome page
- **`index.html`** - Main application
- **`src/`** - Source code
- **`google-apps-script.gs`** - Backend script
- **`package.json`** - Dependencies list
- **`vite.config.js`** - Build configuration
- **`.gitignore`** - Git ignore rules
- **`README.md`** - Project documentation

## 📋 Pre-Push Checklist

Before pushing to your repository, ensure:

1. **Environment Variables**: `.env.local` is not tracked
2. **API Keys**: No hardcoded keys in source code
3. **Dependencies**: `node_modules/` is ignored
4. **Build Files**: `dist/` directory is ignored
5. **Personal Files**: No personal configuration files

## 🔍 Verify Git Status

```bash
# Check what files are tracked
git status

# Check what files are ignored
git status --ignored

# See what will be committed
git diff --cached
```

## 🚫 Common Mistakes to Avoid

### ❌ Never Do This:
```bash
# Don't commit environment files
git add .env.local

# Don't commit node_modules
git add node_modules/

# Don't commit build files
git add dist/

# Don't commit API keys in code
# (Make sure keys are in .env.local only)
```

### ✅ Always Do This:
```bash
# Check status before committing
git status

# Use meaningful commit messages
git commit -m "Add AI question generation feature"

# Test before pushing
npm run build
```

## 🔧 Git Configuration

### Set Up Your Identity
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Set Up Remote Repository
```bash
# Add your GitHub/GitLab repository
git remote add origin https://github.com/yourusername/ai-form-generator.git

# Verify remote
git remote -v
```

## 📤 Pushing to Repository

### First Time Setup
```bash
# Set the main branch
git branch -M main

# Push to remote repository
git push -u origin main
```

### Regular Updates
```bash
# Add changes
git add .

# Commit with message
git commit -m "Description of changes"

# Push to repository
git push
```

## 🛡️ Security Best Practices

### 1. Environment Variables
- Always use `.env.local` for API keys
- Never commit `.env.local` to Git
- Use `env.example` as a template

### 2. API Keys
- Store keys in environment variables only
- Use fallback values in code for development
- Never hardcode keys in source files

### 3. Regular Audits
```bash
# Check for any tracked sensitive files
git log --all --full-history -- "*api*" "*key*" "*secret*"

# Check for large files
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | sed -n 's/^blob //p' | sort -nr -k 2 | head -10
```

## 🔄 Workflow Example

```bash
# 1. Make changes to your code
# 2. Check status
git status

# 3. Add changes
git add .

# 4. Check what will be committed
git diff --cached

# 5. Commit with message
git commit -m "Add new feature: question shuffling"

# 6. Push to repository
git push
```

## 🆘 Troubleshooting

### If You Accidentally Committed Sensitive Files:
```bash
# Remove from Git history (BE CAREFUL!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (WARNING: This rewrites history!)
git push origin --force
```

### If .gitignore Isn't Working:
```bash
# Remove cached files
git rm -r --cached .
git add .
git commit -m "Update .gitignore"
```

## 📚 Additional Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Security Best Practices](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure)
- [Environment Variables Best Practices](https://12factor.net/config)

---

**Remember**: Security first! Always check what you're committing before pushing to your repository. 🔒 