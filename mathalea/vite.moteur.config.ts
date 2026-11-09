// Build du moteur embarquable (src/moteur/index.ts) : un module ES et ses
// morceaux, à charger par une application hôte (voir documentation/
// developpement/maintenance-moteur/moteur-embarquable.md). Les noms de
// fichiers dépendent de leur contenu : une mise à jour quotidienne ne fait
// retélécharger que les morceaux modifiés.
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  cpSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { join, relative } from 'node:path'
import { defineConfig } from 'vite'

const commit = (() => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'inconnu'
  }
})()
// MOTEUR_VERSION : fixée par l'hôte qui construit le moteur (date, commit, empreinte de ses fichiers)
const version =
  process.env.MOTEUR_VERSION ??
  `${new Date().toISOString().slice(0, 10)}+${commit}`
const API_MOTEUR = 1
const sortie = 'dist-moteur'

function* fichiers(dossier: string): Generator<string> {
  for (const nom of readdirSync(dossier)) {
    const chemin = join(dossier, nom)
    if (statSync(chemin).isDirectory()) yield* fichiers(chemin)
    else yield chemin
  }
}

/**
 * Après le build : polices copiées et référencées en relatif, puis manifeste
 * listant chaque fichier avec son empreinte. L'hôte compare deux manifestes
 * pour ne télécharger que ce qui a changé.
 */
const finaliserMoteur = {
  name: 'finaliser-moteur',
  apply: 'build' as const,
  closeBundle() {
    cpSync('public/fonts', join(sortie, 'fonts'), { recursive: true })
    const css = join(sortie, 'moteur.css')
    writeFileSync(
      css,
      readFileSync(css, 'utf8').replace(
        /url\((['"]?)\/fonts\//g,
        'url($1fonts/',
      ),
    )
    const liste: Record<string, { sha256: string; taille: number }> = {}
    for (const chemin of fichiers(sortie)) {
      const octets = readFileSync(chemin)
      liste[relative(sortie, chemin)] = {
        sha256: createHash('sha256').update(octets).digest('hex'),
        taille: octets.length,
      }
    }
    writeFileSync(
      join(sortie, 'manifest.json'),
      JSON.stringify({
        version,
        api: API_MOTEUR,
        entree: 'moteur.js',
        css: 'moteur.css',
        fichiers: liste,
      }),
    )
  },
}

export default defineConfig({
  // Chemins relatifs : le moteur est servi depuis un dossier quelconque de l'hôte
  base: './',
  publicDir: false,
  json: { stringify: true, namedExports: false },
  define: {
    __MOTEUR_VERSION__: JSON.stringify(version),
    'import.meta.env.VITE_MOTEUR_EMBARQUE': JSON.stringify('1'),
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
    __REACT_DEVTOOLS_GLOBAL_HOOK__: JSON.stringify({ isDisabled: true }),
  },
  worker: { format: 'es' },
  build: {
    outDir: sortie,
    emptyOutDir: true,
    target: ['es2020', 'safari15'],
    sourcemap: false,
    reportCompressedSize: false,
    cssCodeSplit: false,
    lib: {
      entry: 'src/moteur/index.ts',
      formats: ['es'],
      fileName: () => 'moteur.js',
    },
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'EVAL') return
        if (warning.code === 'SOURCEMAP_BROKEN') return
        warn(warning)
      },
      output: {
        chunkFileNames: 'morceaux/[name]-[hash].js',
        assetFileNames: (info) =>
          info.names?.some((n) => n.endsWith('.css'))
            ? 'moteur.css'
            : 'ressources/[name]-[hash][extname]',
      },
    },
  },
  plugins: [
    {
      name: 'exclude-test-files',
      apply: 'build',
      enforce: 'pre',
      resolveId(id: string) {
        if (/\.test\.(ts|js|svelte)$/.test(id)) return '\0empty-test-module'
      },
      load(id: string) {
        if (id === '\0empty-test-module') return ''
      },
    },
    tailwindcss(),
    svelte(),
    finaliserMoteur,
  ],
})
