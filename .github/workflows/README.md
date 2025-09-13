# GitHub Pages Deployment Workflows

This repository includes two comprehensive GitHub Actions workflows for deploying to GitHub Pages with robust features and extensive framework support.

## 🚀 Workflows Overview

### 1. Basic Deployment (`deploy-pages.yml`)
A streamlined workflow that automatically detects your project type and deploys to GitHub Pages.

**Features:**
- ✅ Automatic project type detection (Node.js, Python, Jekyll, Hugo)
- ✅ Smart build directory detection
- ✅ Multiple package manager support (npm, yarn, pnpm)
- ✅ Framework-agnostic build process
- ✅ Post-deployment verification
- ✅ Proper permissions and security

**Triggers:**
- Push to `main` or `master` branch
- Manual workflow dispatch

### 2. Advanced Deployment (`deploy-pages-advanced.yml`)
A feature-rich workflow with advanced deployment scenarios, caching, and comprehensive checks.

**Features:**
- 🎯 Enhanced framework detection (Next.js, Nuxt.js, Vue, React, Angular, Svelte)
- 🚀 Build caching for faster deployments
- 🌍 Multiple environment support (production, staging, preview)
- 🔍 Pre-flight change detection
- ⚡ Performance monitoring
- 💬 PR deployment comments
- 🛡️ Retry logic and error handling
- 📊 Build optimization and info tracking

**Triggers:**
- Push to `main`, `master`, or `develop` branches
- Pull requests (for preview)
- Manual workflow dispatch with environment selection

## 📋 Setup Instructions

### Prerequisites
1. **Enable GitHub Pages** in your repository settings
2. **Set Pages source** to "GitHub Actions" (Settings → Pages → Source)
3. **Configure branch protection** (optional but recommended)

### Basic Setup
The workflows are ready to use out-of-the-box! They will:
1. Automatically detect your project type
2. Install appropriate dependencies
3. Build your project (if needed)
4. Deploy to GitHub Pages

### Advanced Configuration

#### Environment Variables
You can customize the workflows by setting these environment variables in your repository settings:

```yaml
# In your workflow or repository settings
NODE_VERSION: '18'        # Node.js version
PYTHON_VERSION: '3.11'    # Python version
RUBY_VERSION: '3.1'       # Ruby version (for Jekyll)
```

#### Custom Build Commands
The workflows automatically detect common build scripts, but you can customize them:

```json
// package.json
{
  "scripts": {
    "build": "your-build-command",
    "dist": "alternative-build-command"
  }
}
```

#### Build Directory Detection
The workflows automatically detect these build directories in order:
1. `./dist`
2. `./build`
3. `./out` (Next.js)
4. `./_site` (Jekyll)
5. `./public` (Hugo)
6. `./` (root directory)

## 🛠️ Supported Technologies

### Frontend Frameworks
- ✅ **React** - Automatic detection and build
- ✅ **Vue.js** - Full support with Vite/Webpack
- ✅ **Angular** - Production builds with proper base-href
- ✅ **Svelte** - Modern Svelte/SvelteKit support
- ✅ **Next.js** - Static export support
- ✅ **Nuxt.js** - Generate/build support

### Build Tools
- ✅ **Vite** - Lightning fast builds
- ✅ **Webpack** - Traditional bundling
- ✅ **Rollup** - Optimized bundling
- ✅ **Parcel** - Zero-config bundling

### Package Managers
- ✅ **npm** - Standard Node.js package manager
- ✅ **Yarn** - Fast and reliable
- ✅ **pnpm** - Efficient disk space usage

### Static Site Generators
- ✅ **Jekyll** - Ruby-based SSG
- ✅ **Hugo** - Fast Go-based SSG
- ✅ **Gatsby** - React-based SSG
- ✅ **Eleventy** - Simple and flexible

### Languages
- ✅ **JavaScript/TypeScript** - Full ES6+ support
- ✅ **Python** - Web frameworks and static generators
- ✅ **Ruby** - Jekyll and other gems

## 🔧 Customization Examples

### Custom Build Steps
```yaml
# Add this step in the build job
- name: Custom build step
  run: |
    # Your custom build commands
    npm run custom-build
    python generate-assets.py
```

### Environment-Specific Builds
```yaml
# Use different build commands per environment
- name: Environment-specific build
  run: |
    if [ "${{ needs.preflight.outputs.deploy_env }}" == "production" ]; then
      npm run build:prod
    else
      npm run build:dev
    fi
```

### Custom Deployment Path
```yaml
# Deploy to a subdirectory
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: ./dist/subdirectory
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Fails
- Check that your build script is defined in `package.json`
- Ensure all dependencies are listed in `package.json` or `requirements.txt`
- Verify Node.js/Python version compatibility

#### 2. Deploy Succeeds but Site is Broken
- Check if you need a `.nojekyll` file (automatically added)
- Verify relative paths in your HTML/CSS/JS files
- Check browser console for errors

#### 3. Permissions Error
- Ensure `GITHUB_TOKEN` has Pages write permissions
- Check repository settings for Pages configuration

#### 4. Large File Issues
- Use Git LFS for large assets
- Consider build optimization to reduce bundle size
- Check GitHub Pages file size limits

### Debug Mode
Enable debug logging by setting these secrets in your repository:
```
ACTIONS_STEP_DEBUG: true
ACTIONS_RUNNER_DEBUG: true
```

## 🔒 Security Features

- ✅ **Minimal permissions** - Only necessary permissions granted
- ✅ **Token security** - Uses built-in `GITHUB_TOKEN`
- ✅ **Dependency verification** - Lock files and cache validation
- ✅ **Environment protection** - Branch-based deployment rules
- ✅ **Concurrency control** - Prevents conflicting deployments

## 📊 Monitoring and Analytics

The advanced workflow includes:
- 📈 **Build performance tracking**
- 🔍 **Health checks and verification**
- 📱 **Deployment status in PR comments**
- 📋 **Build information injection**
- ⚡ **Response time monitoring**

## 🔄 Workflow Status

Monitor your deployments in the Actions tab of your repository. The workflows provide:
- ✅ Clear success/failure indicators
- 📝 Detailed logs for debugging
- 🔗 Direct links to deployed sites
- 📊 Performance metrics

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Deployment Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments)

---

**Note:** These workflows are designed to be robust and handle most common deployment scenarios. For specific needs, you can modify the workflow files to match your project requirements.