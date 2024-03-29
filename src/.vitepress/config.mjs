import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  /**
   * Needed since we host the docs on GitHub pages
   */
  base: '',
  title: "hyper",
  description: "Tame technical debt with The hyper Service Framework",
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    [
      'link',
      { rel: 'preconnect', href: '/SpaceGrotesk.ttf' }
    ],
  ],
  themeConfig: {
    logo: '/logo.svg',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: 'Docs',
        link: '/docs/index',
      },
      {
        text: 'API Reference',
        link: '/docs/api-reference/index',
      },
      {
        text: 'hyper',
        link: 'https://hyper.io',
      },
    ],

    sidebar: [
      {
        text: '🤓 Concepts',
        items: [
          {
            text: '⚡️ Why hyper',
            link: '/docs/concepts/why',
          },
          {
            text: '🧼 Clean Cloud Architecture',
            link: '/docs/concepts/clean-cloud-architecture',
          },
          {
            text: '🟨 hyper Response Shape',
            link: '/docs/concepts/hyper-shape',
          },
          {
            text: '📚 Glossary',
            link: '/docs/concepts/glossary',
          },
        ],
      },
      {
        text: '🛠 Build',
        link: '/docs/build/index',
        items: [
          {
            text: '🔌 hyper connect',
            link: '/docs/build/hyper-connect'
          },
          {
            text: '🍷 hyper {nano}',
            link: '/docs/build/hyper-nano'
          },
          {
            text: '🔐 Securing hyper',
            link: '/docs/build/securing-hyper'
          },
          {
            text: '⨠ Middleware',
            link: '/docs/build/middleware',
          },
          {
            text: '🪗 Custom Adapters',
            link: '/docs/build/custom-adapter',
          }
        ],
      },
      {
        text: '🚢 Host',
        link: '/docs/host/index',
        items: [
          {
            text: '👾 The hyper Config',
            link: '/docs/host/hyper-config',
          },
        ],
      },
      {
        text: '📚 API Reference',
        link: '/docs/api-reference/index',
        items: [
          {
            text: '🛌 HTTP API',
            link: '/docs/api-reference/rest/index',
            items: [
              {
                text: '💾 Data Service',
                link: '/docs/api-reference/rest/data',
              },
              {
                text: '🏎️ Cache Service',
                link: '/docs/api-reference/rest/cache',
              },
              {
                text: '🗄️ Storage Service',
                link: '/docs/api-reference/rest/storage',
              },
              {
                text: '🤓 Queue Service',
                link: '/docs/api-reference/rest/queue',
              },
              {
                text: '🔍 Search Service',
                link: '/docs/api-reference/rest/search',
              },
            ],
          }
        ]
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/hyper63/hyper' }
    ]
  }
})
