import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import generateFile from 'vite-plugin-generate-file'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/alea/',
  // Les référentiels sont lus intégralement via leur export par défaut.
  // JSON.parse évite de créer et d'analyser des milliers d'exports nommés.
  json: {
    stringify: true,
    namedExports: false,
  },
  optimizeDeps: {
    include: [
      '@scratch2latex/scratch-core/ScratchSimulator',
      'blockly/blocks',
      'blockly/core',
      'blockly/javascript',
      'blockly/msg/en',
      'scratch-blocks',
    ],
  },
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    sourcemap: false,
    // Évite de calculer la taille gzip de chaque chunk (coûteux, purement cosmétique)
    reportCompressedSize: false,
    // À partir du 16/11/24 le build est devenu impossible sans options de chunking
    rollupOptions: {
      onwarn(warning, warn) {
        // eval dans jspreadsheet-ce (dépendance tierce, non modifiable)
        if (warning.code === 'EVAL' && warning.id?.includes('jspreadsheet-ce')) return
        // eval dans 6I1D.ts : nécessaire pour que le code Blockly accède à la closure locale
        if (warning.code === 'EVAL' && warning.id?.includes('6I1D')) return
        // sourcemaps non générées par @tailwindcss/vite (bug connu du plugin)
        if (warning.code === 'SOURCEMAP_BROKEN' && warning.plugin === '@tailwindcss/vite:generate:build') return
        if (warning.code === 'EMPTY_BUNDLE' && warning.names?.includes('vendors/javascript-natural-sort')) return
        warn(warning)
      },
      output: {
        manualChunks: (id) => {
          // Pour les dépendances pnpm
          if (id.includes('.pnpm')) {
            // Regrouper three.js et troika-three-text (toujours chargés ensemble)
            if (id.includes('/three@') || id.includes('/troika-')) {
              return 'vendors/three-3d'
            }

            // Extraire le vrai nom du package
            const regex = /\.pnpm\/@?(.*?)(?=@)/
            const match = id.match(regex)
            // const match = id.match(/.pnpm\/(.*?)@/) // MGu : @cortex-js/compute-engine non géré ici!!!
            if (match && match[1]) {
              // Nettoyer le nom du package
              const pkgName = match[1].replace(/@/g, '').replace(/\//g, '-')
              return `vendors/${pkgName}`
            }
          }

          // // Pour les dépendances normales
          // if (id.includes('node_modules')) {
          //   const module = id.split('node_modules/')[1].split('/')[0]
          //   return `vendors/${module.replace(/[@\/]/g, '-')}`
          // }

          // Pour les JSON
          if (id.endsWith('.json')) {
            const jsonName = id.split('/').pop().replace('.json', '')
            return `json/${jsonName}`
          }
        },
      },
    },
  },
  server: process.env.CI
    ? { port: 80, watch: null }
    : {
        port: 5173,
        proxy: {
          // Sert les images des exercices statiques (annales scannées) en
          // développement : coopmaths.fr n'envoie pas d'en-têtes CORS, un
          // fetch direct depuis localhost échouerait sinon (vue Typst).
          '/alea/static': {
            target: 'https://coopmaths.fr',
            changeOrigin: true,
          },
          // Vitrine de l'association sur la page d'accueil : le fragment est
          // publié par le projet www (coopmaths.fr/www). Pour travailler sur
          // les deux projets en même temps, pointer sur le serveur de dev
          // d'Astro : WWW_PROXY_TARGET=http://localhost:4321 pnpm dev
          '/www': {
            target: process.env.WWW_PROXY_TARGET ?? 'https://coopmaths.fr',
            changeOrigin: true,
          },
        },
      },
  // Le worker OMR importe pdf.js, qui est découpé en chunks : le format `iife`
  // par défaut de Vite interdit ce code-splitting, il faut passer en modules ES.
  worker: {
    format: 'es',
  },
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
    // Injecte dans le bundle final
    __REACT_DEVTOOLS_GLOBAL_HOOK__: JSON.stringify({ isDisabled: true }),
  },
  plugins: [
    // Exclut les fichiers de test du bundle de production
    // (évite que vitest et ses dépendances se retrouvent dans le build)
    {
      name: 'exclude-test-files',
      apply: 'build',
      enforce: 'pre',
      resolveId(id: string) {
        if (/\.test\.(ts|js|svelte)$/.test(id)) {
          return '\0empty-test-module'
        }
      },
      load(id: string) {
        if (id === '\0empty-test-module') {
          return ''
        }
      },
    },
    tailwindcss(),
    svelte({
      compilerOptions: {
        dev: process.env.NODE_ENV !== 'production',
      },
    }),
    process.env.ANALYZE_BUILD === '1' &&
      visualizer({
        emitFile: true,
        filename: 'stats.html',
      }),
    generateFile([
      {
        type: 'json',
        output: './version.txt',
        data: {
          version: '3.0.20230508.' + Date.now(),
        },
      },
    ]),
  ],
})
