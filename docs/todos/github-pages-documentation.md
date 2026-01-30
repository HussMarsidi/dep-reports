# Feature Planning: GitHub Pages Documentation

## Scope & Size Estimation

**Size**: Medium
**Complexity**: Low-Medium  
**Dependencies**: None (standalone enhancement)  
**Risk Level**: Low (doesn't affect core CLI functionality)

---

## Overview

### The Goal
Create a professional documentation website hosted on GitHub Pages that provides:
- API/CLI reference documentation
- Configuration guides
- Integration examples
- Edge case documentation
- Interactive examples

### Why GitHub Pages?
- Free hosting for open-source projects
- Automatic deployment via GitHub Actions
- Custom domain support
- Built-in CDN and SSL
- Version control for documentation

### Current State
- README.md contains basic documentation (253 lines)
- docs/PROJECT.md has decision logs and architecture
- docs/summary.md has requirements
- No interactive/searchable documentation site

### Desired State
- Searchable documentation website at `https://<username>.github.io/dep-reports/`
- Markdown-based content (easy to maintain)
- Auto-deployment on push to main
- Version-aware documentation (can show docs for different releases)

---

## Solution Comparison

### Evaluation Criteria
1. **Zero Frontend Coding**: Must generate from Markdown
2. **GitHub Pages Compatibility**: Static site generation
3. **Maintenance Burden**: Setup complexity and ongoing updates
4. **Feature Set**: Search, versioning, themes, code highlighting
5. **Build Speed**: Generation time for CI/CD
6. **Community**: Support, plugins, longevity

---

### Option 1: VitePress ⭐ (RECOMMENDED)

**What It Is**: Modern SSG (Static Site Generator) built on Vite, designed specifically for documentation.

**Pros**:
- ✅ Built specifically for documentation
- ✅ Extremely fast (Vite-powered)
- ✅ Vue-based but requires zero Vue knowledge for basic usage
- ✅ Beautiful default theme (similar to Vue.js docs)
- ✅ Built-in search (client-side, no backend needed)
- ✅ Markdown extensions (code groups, containers, badges)
- ✅ Minimal configuration (opinionated defaults)
- ✅ Active development (Vue team maintains it)
- ✅ Excellent performance (fast builds, fast runtime)

**Cons**:
- ⚠️ Relatively new (but backed by Vue team)
- ⚠️ Smaller ecosystem than Docusaurus
- ⚠️ Node.js required for builds

**Setup Complexity**: 🟢 Low (10-15 files)

**Typical File Structure**:
```
docs/
├── .vitepress/
│   └── config.js          # Site config (20-30 lines)
├── index.md               # Home page
├── guide/
│   ├── getting-started.md
│   ├── configuration.md
│   └── examples.md
├── api/
│   └── cli-reference.md
└── package.json
```

**Deployment**:
```yaml
# .github/workflows/deploy-docs.yml (15-20 lines)
- run: npm install
- run: npm run docs:build
- uses: peaceiris/actions-gh-pages@v3
```

**Best For**: Technical documentation, CLI tools, libraries

---

### Option 2: Docusaurus

**What It Is**: Full-featured documentation framework by Meta (Facebook), React-based.

**Pros**:
- ✅ Feature-rich (blog, versioning, i18n, search)
- ✅ Large ecosystem and community
- ✅ MDX support (JSX in Markdown)
- ✅ Mature and stable
- ✅ Used by major projects (Jest, React Native, Redux)
- ✅ Built-in versioning for API docs
- ✅ Algolia DocSearch integration (free for open-source)

**Cons**:
- ⚠️ Heavier setup (scaffolds 50+ files on init)
- ⚠️ Slower builds than VitePress
- ⚠️ React knowledge helpful for customization
- ⚠️ More configuration options = more decisions
- ⚠️ Larger bundle size

**Setup Complexity**: 🟡 Medium (50+ files)

**Typical File Structure**:
```
website/
├── docusaurus.config.js   # Main config (100+ lines)
├── sidebars.js            # Navigation structure
├── docs/
│   ├── intro.md
│   └── api/
├── src/
│   ├── pages/
│   └── components/
├── static/
└── blog/                  # Optional
```

**Deployment**:
```yaml
# Similar to VitePress but with more steps
- run: npm install
- run: npm run build
- deploy: build/ folder
```

**Best For**: Large projects with blog, multiple doc versions, complex navigation

---

### Option 3: MkDocs (Material Theme)

**What It Is**: Python-based SSG with Material Design theme, popular for technical docs.

**Pros**:
- ✅ Pure Markdown (no JSX/Vue)
- ✅ Material theme is gorgeous and feature-rich
- ✅ Built-in search (client-side)
- ✅ Extensive plugin ecosystem
- ✅ Simple configuration (YAML)
- ✅ Fast builds
- ✅ Used by many developer tools (FastAPI, SQLModel, etc.)
- ✅ Code block annotations and tabs

**Cons**:
- ⚠️ Requires Python in build environment
- ⚠️ Less integration with JS ecosystem
- ⚠️ Theme customization requires Python/Jinja2
- ⚠️ Versioning requires manual setup

**Setup Complexity**: 🟢 Low (5-10 files)

**Typical File Structure**:
```
docs/
├── mkdocs.yml             # All config (30-50 lines)
├── index.md
├── guide/
│   ├── getting-started.md
│   └── configuration.md
└── api/
    └── cli-reference.md
```

**Deployment**:
```yaml
# .github/workflows/deploy-docs.yml
- run: pip install mkdocs-material
- run: mkdocs gh-deploy --force
```

**Best For**: Python developers, simple documentation, markdown purists

---

## Decision Matrix

| Criteria | VitePress | Docusaurus | MkDocs Material |
|----------|-----------|------------|-----------------|
| Setup Time | 🟢 30 min | 🟡 1-2 hours | 🟢 30 min |
| Build Speed | 🟢 Fast | 🟡 Medium | 🟢 Fast |
| Features | 🟡 Good | 🟢 Excellent | 🟢 Excellent |
| Maintenance | 🟢 Low | 🟡 Medium | 🟢 Low |
| GitHub Pages | 🟢 Native | 🟢 Native | 🟢 Native |
| Search | 🟢 Built-in | 🟢 Algolia | 🟢 Built-in |
| Ecosystem Match | 🟢 Node.js | 🟢 Node.js | 🟡 Python |
| Customization | 🟡 Vue | 🟢 React | 🟡 Python |

### Recommendation: **VitePress**

**Rationale**:
1. **Best fit for CLI tools**: Minimal, fast, focused on documentation
2. **Low maintenance**: Simple config, fewer moving parts
3. **Ecosystem alignment**: Node.js project documenting a Node.js tool
4. **Modern DX**: Fast HMR during development, great preview experience
5. **Future-proof**: Backed by Vue core team, active development

---

## Features to Build

### Phase 1: Basic Setup
**Goal**: Get documentation site live on GitHub Pages

#### Features:
1. **VitePress Installation**
   - Add VitePress as dev dependency
   - Create `.vitepress/config.js` with basic settings
   - Configure site metadata (title, description, base URL)

2. **Content Migration**
   - Convert README.md → docs/index.md (home page)
   - Convert README.md sections → separate guide pages
   - Migrate docs/PROJECT.md → Advanced section
   - Migrate docs/summary.md → Reference section

3. **Navigation Structure**
   ```
   Home (/)
   ├── Guide
   │   ├── Getting Started
   │   ├── Installation
   │   ├── Configuration
   │   └── Examples
   ├── API Reference
   │   ├── CLI Commands
   │   └── Configuration Schema
   └── Advanced
       ├── Architecture
       ├── Decision Logs
       └── Edge Cases
   ```

4. **GitHub Actions Deployment**
   - Create `.github/workflows/deploy-docs.yml`
   - Auto-deploy on push to main
   - Configure GitHub Pages settings

**Deliverables**:
- Live documentation site
- Automated deployment
- Basic navigation

---

### Phase 2: Enhanced Content
**Goal**: Improve documentation quality and discoverability

#### Features:
1. **CLI Reference Page**
   - All commands with examples
   - All flags with descriptions
   - Exit codes documentation

2. **Configuration Reference**
   - Complete schema documentation
   - Type definitions for each option
   - Default values
   - Examples for common scenarios

3. **Examples Gallery**
   - CI/CD integration examples (GitHub Actions, GitLab CI)
   - Monorepo usage patterns
   - Private registry configuration
   - Custom ignore patterns

4. **Code Syntax Highlighting**
   - Configure Shiki for code blocks
   - Add line highlighting for examples
   - Enable copy button for code blocks

**Deliverables**:
- Complete API reference
- Configuration schema docs
- Real-world examples

---

### Phase 3: Interactive Features
**Goal**: Make docs more engaging and useful

#### Features:
1. **Search Integration**
   - Enable built-in VitePress search
   - Configure search indexing
   - Add search keyboard shortcuts

2. **Code Groups & Tabs**
   - Package manager tabs (npm/pnpm/bun)
   - OS-specific examples (macOS/Linux/Windows)
   - Code comparison examples

3. **Custom Components** (optional)
   - Config generator (interactive form → JSON output)
   - Risk calculator demo
   - Age threshold calculator

4. **Dark Mode**
   - Configure theme colors
   - Test all code examples in dark mode

**Deliverables**:
- Working search
- Interactive code examples
- Dark mode support

---

### Phase 4: Polish & SEO
**Goal**: Production-ready documentation

#### Features:
1. **SEO Optimization**
   - Meta descriptions for all pages
   - OpenGraph tags
   - Sitemap generation
   - robots.txt

2. **Social Proof**
   - GitHub stars badge
   - npm downloads badge
   - Version badge
   - Build status badge

3. **Quick Links**
   - "Edit this page on GitHub" links
   - Issue reporting links
   - Previous/Next navigation

4. **Performance**
   - Image optimization
   - Preload critical resources
   - Lazy load images

**Deliverables**:
- SEO-optimized site
- Fast load times
- Professional appearance

---

## Edge Cases & Mitigations

### Build & Deployment

| Edge Case | Impact | Mitigation |
|-----------|--------|------------|
| **Build fails in CI** | Docs not updated | Add comprehensive build tests locally; cache node_modules in CI |
| **GitHub Pages 404** | Site inaccessible | Verify `base` config matches repo name; check gh-pages branch exists |
| **Broken links after migration** | Poor UX | Use VitePress link checker plugin; manual audit after migration |
| **Large assets slow builds** | CI timeout | Optimize images before commit; use external CDN for large files |
| **Node version mismatch** | Build errors | Pin Node version in `.nvmrc` and CI config |

### Content Management

| Edge Case | Impact | Mitigation |
|-----------|--------|------------|
| **Outdated examples** | Confusion | Add version badges to examples; automated testing of code samples |
| **README.md vs docs divergence** | Inconsistency | Single source of truth (docs/); auto-generate README sections |
| **Breaking changes in VitePress** | Site breaks | Pin VitePress version; test upgrades in branch before merging |
| **Missing code highlighting** | Poor readability | Configure Shiki with all needed languages (typescript, bash, json, yaml) |

### User Experience

| Edge Case | Impact | Mitigation |
|-----------|--------|------------|
| **Mobile layout broken** | Bad mobile UX | Test on mobile during development; VitePress has good defaults |
| **Search doesn't find content** | Frustration | Verify search index includes all pages; add keywords to frontmatter |
| **External links break** | Dead links | Use link checker in CI; prefer permalink URLs over version-specific |
| **No offline access** | Can't read offline | PWA support (VitePress plugin) - Phase 5 enhancement |

### Performance

| Edge Case | Impact | Mitigation |
|-----------|--------|------------|
| **Slow initial page load** | Bounce rate | Lazy load images; minimize custom CSS; use VitePress defaults |
| **Build time exceeds 5 min** | Slow CI | VitePress is fast (<30s typical); only concern if 100+ pages |
| **Large bundle size** | Slow load on poor connection | Code splitting (automatic in VitePress); minimize custom JS |

---

## Content Migration Strategy

### Existing Documentation Map

**Source** → **Destination**

```
README.md
├── Lines 1-40   → docs/index.md (Hero section + Quick Start)
├── Lines 41-62  → docs/guide/usage.md
├── Lines 63-133 → docs/guide/configuration.md
├── Lines 134-178 → docs/guide/examples.md
└── Lines 179-253 → docs/guide/edge-cases.md

docs/PROJECT.md
├── Overview     → docs/advanced/overview.md
├── ADRs         → docs/advanced/decisions.md
└── Changelog    → docs/advanced/changelog.md

docs/summary.md
├── Edge Cases   → docs/reference/edge-cases.md
├── Directory    → docs/reference/structure.md
└── Features     → docs/reference/features.md
```

### New Content to Create

1. **docs/guide/installation.md**
   - npm/pnpm/bun install commands
   - npx usage
   - System requirements
   - Troubleshooting installation

2. **docs/api/cli.md**
   - `dep-report` (default command)
   - `dep-report init`
   - `dep-report --refresh`
   - All flags with types and defaults
   - Exit codes

3. **docs/api/config-schema.md**
   - JSON schema documentation
   - Type definitions
   - Validation rules
   - Examples for each option

4. **docs/guide/ci-cd.md**
   - GitHub Actions example
   - GitLab CI example
   - Azure Pipelines example
   - Jenkins example

---

## Configuration Files Needed

### 1. `.vitepress/config.js`
**Purpose**: Site configuration and navigation  
**Size**: ~80-100 lines  
**Key sections**:
- Site metadata (title, description, base)
- Theme config (nav, sidebar)
- Markdown config (code highlighting, line numbers)
- Head tags (favicon, meta)

### 2. `.github/workflows/deploy-docs.yml`
**Purpose**: Auto-deploy to GitHub Pages  
**Size**: ~30-40 lines  
**Key steps**:
- Checkout code
- Setup Node.js
- Install dependencies
- Build docs
- Deploy to gh-pages branch

### 3. `docs/package.json`
**Purpose**: VitePress dependencies  
**Size**: ~15 lines  
**Scripts**:
```json
{
  "scripts": {
    "docs:dev": "vitepress dev",
    "docs:build": "vitepress build",
    "docs:preview": "vitepress preview"
  }
}
```

### 4. `docs/.vitepress/theme/custom.css` (optional)
**Purpose**: Brand colors and minor tweaks  
**Size**: ~20-30 lines  
**Customizations**:
- Primary color (brand color)
- Code block styling
- Custom fonts (if needed)

---

## Success Criteria

### Must Have (MVP)
- ✅ Live site at `https://hussmarsidi.github.io/dep-reports/`
- ✅ All existing README content migrated
- ✅ Working navigation and search
- ✅ Auto-deployment on git push
- ✅ Mobile responsive
- ✅ Dark mode support

### Should Have (Polish)
- ✅ Complete API reference
- ✅ CI/CD integration examples
- ✅ Code syntax highlighting with copy button
- ✅ SEO optimization (meta tags, sitemap)
- ✅ GitHub edit links
- ✅ Version badge and social proof

### Nice to Have (Future)
<!-- - ⏳ Interactive config generator -->
- ⏳ Versioned docs (docs for v1.x, v2.x)
<!-- - ⏳ Algolia search (instead of built-in) -->

---

## Implementation Checklist

### Pre-work
- [ ] Review all existing documentation for content gaps
- [ ] Identify reusable code examples
- [ ] Collect common user questions (future FAQ section)
- [ ] Decide on repository structure (docs/ subfolder vs separate repo)

### Phase 1: Setup
- [ ] Install VitePress in project
- [ ] Create basic config with site metadata
- [ ] Migrate README → docs/index.md
- [ ] Create initial navigation structure
- [ ] Setup GitHub Actions workflow
- [ ] Configure GitHub Pages settings
- [ ] Verify deployment works
- [ ] Add custom domain (if applicable)

### Phase 2: Content
- [ ] Create CLI reference page
- [ ] Document all configuration options
- [ ] Add usage examples for common scenarios
- [ ] Migrate PROJECT.md content
- [ ] Migrate summary.md content
- [ ] Add code syntax highlighting
- [ ] Review all internal links

### Phase 3: Enhancement
- [ ] Configure search indexing
- [ ] Add code group tabs for package managers
- [ ] Create CI/CD integration examples
- [ ] Add copy buttons to code blocks
- [ ] Test dark mode appearance
- [ ] Add keyboard shortcuts documentation

### Phase 4: Polish 
- [ ] Add meta descriptions to all pages
- [ ] Configure OpenGraph tags
- [ ] Add badges (npm, GitHub stars, build status)
- [ ] Add "Edit this page" links
- [ ] Optimize images
- [ ] Generate sitemap
- [ ] Test on mobile devices
- [ ] Audit for broken links
- [ ] Spellcheck all content

---

## Open Questions

1. **Repository Structure**
   - Keep docs in same repo (easier maintenance) ✅ RECOMMENDED
   - OR separate docs repo (cleaner but more overhead)

2. **URL Structure**
   - `username.github.io/dep-reports/` (repo-based)
   - OR custom domain `docs.dep-report.dev` (if domain purchased)

3. **Versioned Docs**
   - Start with version-less docs (simpler) ✅ RECOMMENDED for V1
   - Add versioning when breaking changes occur (V2+)

4. **Analytics**
   - Add Google Analytics to track usage?
   - Or privacy-focused alternative (Plausible, Fathom)?
   - Or no analytics initially?

5. **Feedback Mechanism**
   - "Was this page helpful?" widget?
   - Direct GitHub issue links?
   - Community forum (Discussions tab)?

---

## Related Tools & Resources

### VitePress
- [Official Docs](https://vitepress.dev/)
- [GitHub Repo](https://github.com/vuejs/vitepress)
- [Examples Gallery](https://vitepress.dev/showcase)

### Deployment
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)

### Inspiration (Well-documented CLI tools)
- [Vite Documentation](https://vitejs.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Turbo Documentation](https://turbo.build/)
- [tsup Documentation](https://tsup.egoist.dev/)

---

*Planning Document Created: 2026-01-30*  
*Status: Ready for Implementation*
