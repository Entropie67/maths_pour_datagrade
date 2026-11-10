import { logError } from './log'

export function logDiffContext(a: string, b: string, context = 10) {
  const len = Math.min(a.length, b.length)

  let diffIndex = -1

  // Trouver la première différence
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) {
      diffIndex = i
      break
    }
  }

  // Si pas de différence mais longueurs différentes
  if (diffIndex === -1 && a.length !== b.length) {
    diffIndex = len
  }

  // Identiques
  if (diffIndex === -1) {
    // console.log('Aucune différence')
    return
  }

  // Définir les zones à afficher
  const start = Math.max(0, diffIndex - context)
  const endA = Math.min(a.length, diffIndex + context + 1)
  const endB = Math.min(b.length, diffIndex + context + 1)

  // Extraire
  const beforeA = a.slice(start, diffIndex)
  const beforeB = b.slice(start, diffIndex)

  const afterA = a.slice(diffIndex + 1, endA)
  const afterB = b.slice(diffIndex + 1, endB)

  logError('Diff index:', diffIndex)

  logError(`A: …${beforeA}[${a[diffIndex] ?? '∅'}]${afterA}…`)

  logError(`B: …${beforeB}[${b[diffIndex] ?? '∅'}]${afterB}…`)
}
