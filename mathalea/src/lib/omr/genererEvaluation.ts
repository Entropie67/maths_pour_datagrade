import {
  compileTypstToPdfAndQuery,
  compileTypstToSvg,
  type TypstAnchor,
} from '../../components/setup/typst/typstCompiler'
import { downloadBlob } from '../spreadsheet'
import {
  appelCopie,
  assemblerGabarit,
  defaultOmrDocumentOptions,
  rendreCorriges,
  SEPARATEUR_DE_COPIE,
  type OmrCopieSource,
  type OmrDocumentOptions,
  type OmrDocumentSource,
  type OmrExerciceSource,
} from './buildOmrDocument'
import { buildEvaluation, parseAnchors } from './omrLayout'
import { nomDeFichier } from './omrExport'
import { OMR_SELECTEUR } from './omrTypstTemplate'
import type { OmrEvaluation } from './omrTypes'

/**
 * Production d'une évaluation papier : le PDF à imprimer et le fichier
 * d'accompagnement qui permettra de le corriger.
 *
 * Les deux sortent d'une **seule** compilation Typst. C'est essentiel : deux
 * compilations séparées ne garantiraient pas que les positions décrivent bien
 * le PDF remis au professeur, et un décalage d'un millimètre entre les deux
 * fausserait toute la correction sans rien signaler.
 */

/** Un élève de la liste importée par le professeur. */
export interface EleveSource {
  id: string
  nom: string
}

/**
 * Lit une liste de classe collée par le professeur : un nom par ligne.
 *
 * La liste ne quitte jamais le navigateur. Elle n'est pas non plus conservée :
 * elle vit dans le fichier d'accompagnement que le professeur garde chez lui.
 */
export function lireListeDeClasse(texte: string): EleveSource[] {
  const noms = texte
    .split(/\r?\n/)
    // une liste collée depuis un tableur amène souvent des colonnes : on ne
    // garde que la première, qui porte le nom
    .map((ligne) => ligne.split(/[\t;]/)[0].trim())
    .filter((nom) => nom !== '')
  return noms.map((nom, index) => ({
    id: `e${String(index + 1).padStart(2, '0')}`,
    nom,
  }))
}

/** Identifiant court d'une copie, tel qu'il figure dans le QR-code. */
export function identifiantCopie(index: number): string {
  return `c${String(index + 1).padStart(2, '0')}`
}

/**
 * Identifiant court du sujet, dérivé de son empreinte.
 *
 * Il sert à écarter un lot scanné qui ne correspondrait pas au fichier
 * d'accompagnement chargé — se tromper de sujet est une erreur facile en fin
 * de trimestre, et elle produirait des notes absurdes.
 */
export function identifiantSujet(checkSum: string): string {
  const nettoye = checkSum.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  return nettoye.slice(0, 6).padEnd(6, '0')
}

/**
 * Assemble la description du document à compiler.
 *
 * @param exercices exercices communs à toute la classe (« même sujet pour
 *   tous »)
 * @param exercicesParEleve si fourni, les exercices propres à chaque élève,
 *   dans le même ordre que `eleves` — c'est le cas « une graine par élève ».
 *   Un élève sans entrée retombe sur `exercices`.
 */
export function decrireDocument(
  titre: string,
  checkSum: string,
  eleves: readonly EleveSource[],
  exercices: readonly OmrExerciceSource[],
  consigne?: string,
  exercicesParEleve?: readonly (readonly OmrExerciceSource[])[],
): OmrDocumentSource {
  const copies: OmrCopieSource[] = eleves.map((eleve, index) => ({
    copieId: identifiantCopie(index),
    eleve,
    exercices: [...(exercicesParEleve?.[index] ?? exercices)],
  }))
  return {
    titre,
    sujetId: identifiantSujet(checkSum),
    consigne,
    copies,
  }
}

/** Le PDF et son fichier d'accompagnement. */
export interface EvaluationGeneree {
  pdf: Uint8Array
  evaluation: OmrEvaluation
  /** Diagnostics Typst, à afficher même quand la compilation aboutit */
  diagnostics: string[]
}

/** Aperçu SVG d'une copie. */
export interface ApercuCopie {
  /** Document rendu en SVG, absent si la compilation a échoué */
  svg?: string
  diagnostics: string[]
  /** Repères de la palette de mise en page (`<mathalea-anchor>`) */
  anchors?: TypstAnchor[]
}

/**
 * Compile l'aperçu SVG d'**une** copie, à partir du gabarit — éventuellement
 * retouché par le professeur — et des questions de cette copie.
 *
 * Le gabarit est le même pour tout le monde ; seul le corps change d'une copie
 * à l'autre. Retoucher le gabarit dans l'aperçu, c'est donc le retoucher pour
 * toute la classe (voir `compilerEvaluation`).
 */
export async function compilerApercu(
  gabarit: string,
  source: OmrDocumentSource,
  copieId: string,
  options: OmrDocumentOptions = defaultOmrDocumentOptions,
): Promise<ApercuCopie> {
  const copie =
    source.copies.find((c) => c.copieId === copieId) ?? source.copies[0]
  if (copie == null) return { diagnostics: ['aucune copie à prévisualiser'] }
  // l'aperçu ne montre qu'une copie : son corrigé est donc celui de cette
  // copie, et jamais nommé — c'est bien le seul du document prévisualisé
  const corriges = rendreCorriges({ ...source, copies: [copie] }, options)
  const code = `${gabarit}\n${appelCopie(source, copie, options)}\n${corriges}\n`
  const { svg, diagnostics, anchors } = await compileTypstToSvg(code)
  return { svg, diagnostics, anchors }
}

/**
 * Compile toutes les copies avec le gabarit (éventuellement retouché) et
 * assemble le fichier d'accompagnement.
 *
 * Le code produit est identique à celui de `buildOmrDocument` quand le gabarit
 * n'a pas été touché : `appelCopie` et `SEPARATEUR_DE_COPIE` sont partagés.
 *
 * @throws si Typst n'a pas produit de PDF ; les diagnostics sont joints au
 *   message, sans quoi l'échec serait indéchiffrable pour le professeur
 */
export async function compilerEvaluation(
  gabarit: string,
  source: OmrDocumentSource,
  meta: OmrEvaluation['sujet'],
  options: OmrDocumentOptions = defaultOmrDocumentOptions,
): Promise<EvaluationGeneree> {
  const appels = source.copies.map((copie) =>
    appelCopie(source, copie, options),
  )
  // les corrigés sont groupés après toutes les copies : le professeur imprime
  // les premières pages pour la classe et garde les dernières
  const code = `${gabarit}\n${appels.join(SEPARATEUR_DE_COPIE)}\n${rendreCorriges(
    source,
    options,
  )}\n`
  const { pdf, values, diagnostics } = await compileTypstToPdfAndQuery(
    code,
    OMR_SELECTEUR,
  )
  if (pdf == null) {
    throw new Error(
      `la compilation du sujet a échoué${
        diagnostics.length > 0 ? ` : ${diagnostics.join(' ; ')}` : ''
      }`,
    )
  }
  const anchors = parseAnchors(values)
  if (anchors.length === 0) {
    throw new Error(
      'aucune case à cocher n’a été trouvée dans le sujet : les questions ' +
        'choisies ne se prêtent pas à la lecture optique',
    )
  }
  return {
    pdf,
    evaluation: buildEvaluation(source, anchors, meta),
    diagnostics,
  }
}

/**
 * Compile le document et assemble le fichier d'accompagnement, sans retouche
 * du gabarit. Raccourci de `assemblerGabarit` + `compilerEvaluation`.
 *
 * @throws si Typst n'a pas produit de PDF
 */
export async function genererEvaluation(
  source: OmrDocumentSource,
  meta: OmrEvaluation['sujet'],
  options: OmrDocumentOptions = defaultOmrDocumentOptions,
): Promise<EvaluationGeneree> {
  const { gabarit } = assemblerGabarit(source, options)
  return compilerEvaluation(gabarit, source, meta, options)
}

/**
 * Télécharge le sujet à imprimer et son fichier d'accompagnement.
 *
 * Les deux téléchargements sont espacés : deux `a.click()` déclenchés dans le
 * même tour de boucle se court-circuitent dans Chrome — le second remplace le
 * premier avant qu'il n'aboutisse, et seul le fichier JSON, plus petit,
 * arrivait. Un court délai laisse le navigateur valider le PDF d'abord.
 */
export async function telechargerEvaluation(
  generee: EvaluationGeneree,
): Promise<void> {
  const nom = nomDeFichier(generee.evaluation.sujet.titre)
  downloadBlob(
    new Blob([generee.pdf as BlobPart], { type: 'application/pdf' }),
    `${nom}-sujets.pdf`,
  )
  await new Promise((resolve) => setTimeout(resolve, 400))
  downloadBlob(
    new Blob([JSON.stringify(generee.evaluation)], {
      type: 'application/json',
    }),
    `${nom}.mathalea-eval.json`,
  )
}

/** Relit un fichier d'accompagnement déposé par le professeur. */
export function lireFichierEvaluation(texte: string): OmrEvaluation {
  const donnees = JSON.parse(texte) as OmrEvaluation
  if (donnees?.version !== 1 || donnees.layouts == null) {
    throw new Error(
      'ce fichier n’est pas un accompagnement d’évaluation MathALÉA',
    )
  }
  return donnees
}
