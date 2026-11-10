import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig /*, splitVendorChunkPlugin */ } from 'vite'

// tant qu'on a de gros soucis de RAM consommée on vire le plugin legacy
// cf https://github.com/vitejs/vite/tree/main/packages/plugin-legacy
// le 2023-03-09 on a toujours un build qui passe avec 4Go de RAM (--max-old-space-size=4000), mais plus si on active ce plugin
// import legacy from '@vitejs/plugin-legacy' // il faut aussi installer terser

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// pour la gestion du statique, on laisse pas mal de trucs dans docroot/, que l'on ne veut pas voir supprimés
// la pratique usuelle est de mettre ça dans un dossier {root}/public/, dont vite copie le contenu à chaque build dans {root}/docroot/
// (cf https://vitejs.dev/config/build-options.html#build-copypublicdir)
// mais le dossier annexes est >60Mo, pas très utile de recopier tout ça, on précise donc emptyOutDir: false
// cf https://vitejs.dev/guide/assets.html

const srcDir = resolve(__dirname, 'src')
// const aliasEntries = [
//   { find: 'dev', replacement: resolve(srcDir, 'dev') },
//   { find: 'editGraphe', replacement: resolve(srcDir, 'editGraphe') },
//   { find: 'legacy', replacement: resolve(srcDir, 'legacy') },
//   { find: 'lib', replacement: resolve(srcDir, 'lib') },
//   { find: 'vendors', replacement: resolve(srcDir, 'vendors') },
//   // Les extension jquery (jstree par ex) font leur propre import jquery qu'elles augmentent sans l'exporter.
//   // Il faut donc un alias pour obliger tous les imports à prendre le même module js de jQuery
//   // Car les plugins pourraient avoir la leur qui ne serait pas node_modules/jquery
//   // (mais son propre node_modules/extensionJquery/node_modules/jquery)
//   // { find: 'jquery', replacement: resolve(__dirname, 'node_modules/jquery') },
//   { find: '@basthon/kernel-sql', replacement: resolve(srcDir, 'lib', 'outils', 'basthon', 'emptyModule.js') }
// ]

export default defineConfig({
  root: __dirname,
  // ça c'est important, le mettre en relatif (./) va permettre de copier le dossier docroot n'importe où, mais ne permettra pas l'usage en cross-domain
  // pour charger un js en cross-domain, il faut préciser ici le chemin absolu où seront déployés les js (https://xxx)
  base: './', // https://vitejs.dev/config/shared-options.html#base
  build: {
    outDir: 'docroot', // https://vitejs.dev/config/build-options.html#build-outdir
    emptyOutDir: false, // https://vitejs.dev/config/build-options.html#build-emptyoutdir
    assetsDir: 'build', // relatif au précédent, cf https://vitejs.dev/config/build-options.html#build-assetsdir
    reportCompressedSize: false, // pas besoin que vite nous donne la taille du résultat gzippé, ça prend du temps pour une info annexe, https://vitejs.dev/config/build-options.html#build-reportcompressedsize

    // pour avoir un js dont le nom ne change pas, que l'on peut charger en cross-domain, il faut passer par le library mode
    // cf https://vitejs.dev/guide/build.html#library-mode et https://vitejs.dev/config/build-options.html#build-lib
    /* depuis le passage à vite v4, ajouter ça déclenche la génération des js dans docroot/ et plus docroot/build/ !!! * /
    lib: {
      formats: ['es'], // inutile de build umd ou iife
      entry: {
        loader: resolve(srcDir, 'loader.js')
      },
      // fileName: (format, entryAlias) => format === 'es' ? entryAlias : `${entryAlias}.${format}`
      fileName: 'loader'
    }, /* */

    // cf https://github.aiurs.co/vitejs/vite/issues/2433#issuecomment-1422718248
    // pour limiter la conso de RAM
    rollupOptions: {
      // l'externalisation de jquery via la config marche pas, ça déclenche du
      // Failed to resolve module specifier "jquery". Relative references must start with either "/", "./", or "../".
      // sur tous les imports dynamiques de jquery, et y'en a dans nos dépendances (@sesatheque-plugins/arbre)
      // external: ['jquery'],
      // https://vitejs.dev/guide/build.html#customizing-the-build
      output: {
        // https://rollupjs.org/configuration-options/#output-globals
        // globals: {
        //   jquery: 'jQuery'
        // }
        // par défaut tous les js de node_modules se retrouvent dans un seul chunk __kernel__.xxx.js
        // cf https://rollupjs.org/configuration-options/#output-manualchunks
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // on essaie de découper un peu, mais pas trop (la ligne suivante génère des empty chunks, explose la ram consommée et génère trop de petits chunks)
            // return id.replace(/.*node_modules\/([^/]+)(\/.*)/, 'vendor-$1')
            // celle-ci serait pas mal, mais ça consomme encore trop de RAM
            // for (const name of ['jquery-ui', 'jquery', 'ace-builds', 'blockly', 'basthon', 'jsplumb', 'jstree', 'redux', 'scratch', 'skulpt']) {
            // c'est surtout basthon qu'il faut mettre à part (18M)
            // IMPORTANT, il faut mettre jquery-ui à part, sinon ça plante dès le chargement de son chunk avec `jQuery is not defined`
            if (/\/jquery(\/|$)/.test(id)) return 'vendor-jquery' // faut pas choper jquery-ui ni jquery.terminal
            for (const name of ['jquery-ui', 'basthon', 'blockly', 'skulpt']) {
              if (id.includes(name)) return `vendor-${name}`
            }
            // si on met ceux-là ensemble, ça plante avec un pb dans immer, requis par redux
            // if (['jsplumb', 'jstree', 'redux'].some(name => id.includes(name))) {
            //   return 'vendor-for-editgraphe'
            // }
            return 'vendor'
          }
        },
        sourcemap: true,
      },
      maxParallelFileOps: 2,
    }, // rollupOptions
    sourcemap: true, // https://vitejs.dev/config/build-options.html#build-sourcemap
    // inutile de le préciser avec le plugin legacy
    target: 'modules', // https://vitejs.dev/config/build-options.html#build-target
  }, // build
  // Finalement ça ne change rien au pb de jQuery is undefined au chargement du chunk qui contient jquery-ui
  // optimizeDeps: {
  //   exclude: ['jquery', 'jquery-ui']
  // },
  plugins: [
    svelte(),
    // splitVendorChunkPlugin ne semble pas servir à grand chose, on a toujours tous les node_modules dans le même chunk, même sans rollupOptions.manualChunks
    // avec on passe de 1486 fichiers à 1513, mais les gros restent énormes
    // splitVendorChunkPlugin() // https://vitejs.dev/guide/build.html#chunking-strategy
    // avec le plugin legacy, pourtant indispensable pour permettre l'accès des vieux navigateurs,
    // ça plante avec `JavaScript heap out of memory` tant qu'on lui file pas 8Go de RAM
    // cf https://github.com/vitejs/vite/issues/2433
    // ok avec `env NODE_OPTIONS="--max-old-space-size=8000" vite build` mais ça fait bcp de RAM… on en a pas assez en préprod.
    // Il y a un essai en listant les polyfill utilisés dans le commit 32d9992c, mais ça change pas grand chose,
    // On revient à la conf par défaut, c'est plus sûr (de modifier la liste d'après le code)
    // legacy({ targets: ['defaults'] }) // c'est le defaults de browserlist
  ],
  // on a besoin de ça pour que le pnpm start serve les fichiers statiques qui sont déjà dans docroot
  // (les mettre dans un dossier public pour que chaque build les recopie dans docroot est assez idiot)
  // mais pour le build ça n'a pas de sens (il recopie chaque fichier sur lui-même) et ça plante si certains
  // sont en lecture seule, ce qui est le cas pour le symlink docroot/replication_calculatice
  // publicDir: 'docroot', // https://vitejs.dev/config/shared-options.html#publicdir
  resolve: {
    // il faut redéclarer nos alias ici (en plus de tsconfig.json)
    // on a essayé avec le plugin vite-tsconfig-paths mais ça plante, avec par ex
    // Failed to resolve import "legacy/core/functions" from "src/legacy/sections/jeux/section501.js".
    // Attention, avec l'import dynamique par défaut de vite, ça ne marche pas pour les imports dynamiques depuis un js
    // (depuis un ts c'est ok), qui doivent tous être en relatif
    // avec le plugin https://github.com/vite-plugin/vite-plugin-dynamic-import ça doit fonctionner
    alias: {
      // cf https://vitejs.dev/config/shared-options.html#resolve-alias
      src: srcDir,
      // alias jquery remplacé par le dedupe plus bas
      // jquery: resolve(__dirname, 'node_modules/jquery'),
      // 'jquery-ui': resolve(__dirname, 'node_modules/jquery-ui'),
      // @basthon/kernel-loader charge @basthon/kernel-sql qui charge sql.js qui veut crypto, path et du wasm, on le désactive ici via un alias
      '@basthon/kernel-sql': resolve(
        srcDir,
        'lib',
        'outils',
        'basthon',
        'emptyModule.js',
      ),
      // lui est aussi très gros et on s'en sert pas, en le virant le chunk vendor-basthon passe de 18M à 43K
      '@basthon/kernel-ocaml': resolve(
        srcDir,
        'lib',
        'outils',
        'basthon',
        'emptyModule.js',
      ),
    },
    // Les extension jquery (jstree par ex) font leur propre import jquery qu'elles augmentent sans l'exporter.
    // Il faut donc obliger tous les imports à prendre le même module js de jQuery, on passait par un alias et
    // on utilise désormais dedupe.
    // Car les plugins pourraient avoir la leur qui ne serait pas node_modules/jquery
    // (mais son propre node_modules/extensionJquery/node_modules/jquery)
    // https://vitejs.dev/config/shared-options.html#resolve-dedupe
    dedupe: [
      'jquery',
      'jquery-ui',
      // il reste un pb avec cm2exN4_65 et son import de 'jquery-ui/ui/widgets/sortable' qui ne trouve pas jQuery en global…
      // mais remplacer dedupe par l'alias ne change rien
    ],
    // il faudrait voir si cette options permet de régler les pbs d'alias qu'on a eu précédemment
    // https://vitejs.dev/config/shared-options.html#resolve-preservesymlinks
    // , preserveSymlinks: true
  },
  server: {
    open: true,
    port: 8081,
    // on préfère planter si le 8081 est déjà occupé (car on doit déjà tourner à coté)
    // cf https://vitejs.dev/config/server-options.html#server-strictport
    strictPort: true,
  },
})
