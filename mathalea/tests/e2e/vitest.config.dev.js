import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: {
        testBrowser: resolve(__dirname, 'e2e'),
      },
    },
    test: {
      include: ['./tests/dev/*.test.{js,ts}'], // Si quelqu'un arrive à trouver comment faire pour que le hookTimeout tienne lorsqu'on lance vitest FILTRE --root tests/e2e on pourra supprimer ce fichier et le dossier dev
      exclude: ['./tests/dev/mathLive.moule.test.ts'],
      // on veut laisser le navigateur ouvert sur un plantage (10min)
      hookTimeout: 600_000,
      testTimeout: 7_200_000,

      // describe.sequential() ne fonctionne que dans un describe.concurrent()
      // cf https://vitest.dev/api/#describe-sequential
      // pour lancer tous les tests en séquentiel, il faut préciser singleThread ou singleFork
      // https://vitest.dev/config/#pooloptions-threads-singlethread
      // https://vitest.dev/config/#pooloptions-forks-singlefork
      // mais l'un comme l'autre font planter le lancement des tests dans webstorm avec
      // CACError: Unknown option `--threads`
      // (une erreur lancée par vite quand il est wrappé par webstorm)
      // Cette option est indispensable pour s'arrêter sur le premier test qui plante
      // (sinon vitest lance plusieurs playwright donc plusieurs fenêtres de navigateur,
      // et si un test s'arrête dans l'une les autres continuent de tourner rendant impossible
      // l'inspection du pb)
      // on le laisse et tant pis pour le wrap des tests dans webstorm
      pool: 'threads',
      maxWorkers: 1,
      isolate: false,
    },
  }),
)
