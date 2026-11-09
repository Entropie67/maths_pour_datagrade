import { fileURLToPath } from 'node:url'
import upstream from './mathalea/vite.config.ts'

// En développement, l'amont proxifie /alea/static vers CoopMaths même si
// les fichiers existent localement. Ce profil utilise les fichiers public/.
const proxy = { ...(upstream.server?.proxy ?? {}) }
delete proxy['/alea/static']
export default {
  ...upstream,
  root: fileURLToPath(new URL('./mathalea/', import.meta.url)),
  server: {
    ...upstream.server,
    proxy,
    watch: { ignored: ['**/public/static/**', '**/public/assets/crpe/**'] },
  },
}
