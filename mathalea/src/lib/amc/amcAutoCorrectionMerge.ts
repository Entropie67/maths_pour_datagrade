import { normalizeTexte } from './amcHelpers'
/**
 * @author Jean-claude Lhote
 */
function copyLatexTextsOnPropositions(target: any, source: any): void {
  if (!target || !source) return

  if (typeof source.enonce === 'string') target.enonce = source.enonce
  if (typeof source.texte === 'string') target.texte = source.texte
  if (typeof source.feedback === 'string') target.feedback = source.feedback

  if (target.reponse == null && source.reponse != null) {
    target.reponse = {}
  }
  if (
    target.reponse != null &&
    source.reponse != null &&
    typeof source.reponse.texte === 'string'
  ) {
    target.reponse.texte = source.reponse.texte
  }

  const targetSubProps = Array.isArray(target.propositions)
    ? target.propositions
    : []
  const sourceSubProps = Array.isArray(source.propositions)
    ? source.propositions
    : []
  const length = Math.min(targetSubProps.length, sourceSubProps.length)
  for (let i = 0; i < length; i++) {
    copyLatexTextsOnPropositions(targetSubProps[i], sourceSubProps[i])
  }
}

export function alignSourcePropositionsByText(
  targetProps: any[],
  sourceProps: any[],
): any[] {
  if (targetProps.length === 0 || sourceProps.length === 0) return sourceProps

  const buckets = new Map<string, number[]>()
  const usedSourceIndexes = new Set<number>()
  const aligned = new Array<any>(targetProps.length)

  for (let i = 0; i < sourceProps.length; i++) {
    const text =
      typeof sourceProps[i]?.texte === 'string'
        ? normalizeTexte(sourceProps[i].texte)
        : ''
    if (text.length === 0) continue
    const bucket = buckets.get(text)
    if (bucket) {
      bucket.push(i)
    } else {
      buckets.set(text, [i])
    }
  }

  for (let i = 0; i < targetProps.length; i++) {
    const text =
      typeof targetProps[i]?.texte === 'string'
        ? normalizeTexte(targetProps[i].texte)
        : ''
    if (text.length === 0) continue
    const bucket = buckets.get(text)
    const sourceIndex = bucket?.shift()
    if (sourceIndex == null) continue
    usedSourceIndexes.add(sourceIndex)
    aligned[i] = sourceProps[sourceIndex]
  }

  for (let i = 0; i < targetProps.length; i++) {
    if (aligned[i] != null) continue

    if (i < sourceProps.length && !usedSourceIndexes.has(i)) {
      usedSourceIndexes.add(i)
      aligned[i] = sourceProps[i]
      continue
    }

    const fallbackIndex = sourceProps.findIndex(
      (_prop, index) => !usedSourceIndexes.has(index),
    )
    if (fallbackIndex === -1) break
    usedSourceIndexes.add(fallbackIndex)
    aligned[i] = sourceProps[fallbackIndex]
  }

  return aligned
}

export function mergeLatexTextsOnPropositions(
  targetProps: any[],
  sourceProps: any[],
): void {
  const alignedSourceProps = alignSourcePropositionsByText(
    targetProps,
    sourceProps,
  )
  const length = Math.min(targetProps.length, alignedSourceProps.length)

  for (let i = 0; i < length; i++) {
    copyLatexTextsOnPropositions(targetProps[i], alignedSourceProps[i])
  }
}
