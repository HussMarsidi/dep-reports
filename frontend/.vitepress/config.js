import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'dep-report',
  description: 'Zero-config CLI tool that generates version-controlled snapshots of dependency risk',
  base: '/dep-reports/',
  
  head: [
    ['meta', { name: 'keywords', content: 'dependencies, audit, outdated, npm, pnpm, bun, dependency management, technical debt' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: 'https://hussmarsidi.github.io/dep-reports/' }],
    ['meta', { property: 'og:site_name', content: 'dep-report' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['link', { rel: 'icon', href: '/dep-reports/favicon.ico' }]
  ],
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Why?', link: '/why' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/cli' },
      { text: 'GitHub', link: 'https://github.com/hussmarsidi/dep-reports' }
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: 'Learn',
          items: [
            { text: 'Quick Start', link: '/guide/getting-started' },
            { text: 'Reading Reports', link: '/guide/understanding-reports' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Usage', link: '/guide/usage' },
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Examples', link: '/guide/examples' },
            { text: 'Edge Cases', link: '/guide/edge-cases' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'CLI Commands', link: '/api/cli' },
            { text: 'Configuration Schema', link: '/api/config-schema' }
          ]
        }
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/hussmarsidi/dep-reports' }
    ],
    
    search: {
      provider: 'local'
    },
    
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026'
    },
    
    editLink: {
      pattern: 'https://github.com/hussmarsidi/dep-reports/edit/main/frontend/:path',
      text: 'Edit this page on GitHub'
    }
  },
  
  markdown: {
    lineNumbers: true,
    config: (md) => {
      // Enable code block features
    }
  }
})
