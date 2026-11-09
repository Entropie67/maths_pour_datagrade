/**
 * Contrôle informatif de l'accessibilité des exercices modifiés, sur trois
 * graines. Ce test ne doit jamais échouer à cause d'un exercice : il rédige un
 * rapport. Voir documentation/tests/controle-accessibilite.md
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, describe, it } from 'vitest'
import '../../helpers/setupExerciseGeneration'
import type { IExercice } from '../../../../src/lib/types'
import {
  BilanExercice,
  cheminsModifiesParGit,
  type Fragment,
  redigeRapport,
  selectionneExercices,
} from '../../helpers/accessibiliteExercice'
import {
  combinaisonsParametres,
  installeGardeDeBoucle,
} from '../../helpers/empreinteExercice'

const { mathaleaLoadExerciceFromUuid, mathaleaHandleExerciceSimple } =
  await import('../../../../src/lib/mathalea')

const racine = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..')
const catalogue: Record<string, string> = JSON.parse(
  readFileSync(resolve(racine, 'src/json/uuidsToUrlFR.json'), 'utf8'),
)
const selection = selectionneExercices(
  Object.entries(catalogue),
  process.env,
  () => cheminsModifiesParGit(racine),
)
const GRAINES = ['a11y-a', 'a11y-b', 'a11y-c']
const guard = installeGardeDeBoucle()
const bilans: BilanExercice[] = []

async function load(uuid: string): Promise<IExercice> {
  const exercise = await mathaleaLoadExerciceFromUuid(uuid)
  if (/^Erreur -|^L'exercice n'existe pas/.test(exercise.titre)) {
    throw new Error(exercise.titre)
  }
  exercise.numeroExercice = 1
  if (exercise.nbQuestionsModifiable !== false) exercise.nbQuestions = 3
  return exercise
}

const texteDe = (valeur: unknown) => (typeof valeur === 'string' ? valeur : '')

/** Tout ce que l'exercice affiche. La vérification 5 ne lit que l'énoncé. */
function fragmentsDe(exercise: IExercice): Fragment[] {
  const questions = exercise.listeQuestions ?? []
  const corrections = exercise.listeCorrections ?? []
  return [
    { lieu: 'consigne', html: texteDe(exercise.consigne), enonce: true },
    {
      lieu: 'introduction',
      html: texteDe(exercise.introduction),
      enonce: true,
    },
    ...questions.map((html, i) => ({
      lieu: `question ${i + 1}`,
      html: texteDe(html),
      enonce: true,
    })),
    {
      lieu: 'consigne',
      html: texteDe(exercise.consigneCorrection),
      enonce: false,
    },
    ...corrections.map((html, i) => ({
      lieu: `question ${i + 1}`,
      html: texteDe(html),
      enonce: false,
    })),
  ]
}

const message = (erreur: unknown) =>
  erreur instanceof Error ? erreur.message : String(erreur)

async function analyse(uuid: string, chemin: string): Promise<BilanExercice> {
  const bilan = new BilanExercice(chemin, uuid)
  const modele = await load(uuid)
  const combinaisons = combinaisonsParametres(
    [
      {
        numerique: modele.besoinFormulaireNumerique,
        texte: modele.besoinFormulaireTexte,
        caseACocher: modele.besoinFormulaireCaseACocher,
      },
      {
        numerique: modele.besoinFormulaire2Numerique,
        texte: modele.besoinFormulaire2Texte,
        caseACocher: modele.besoinFormulaire2CaseACocher,
      },
      {
        numerique: modele.besoinFormulaire3Numerique,
        texte: modele.besoinFormulaire3Texte,
        caseACocher: modele.besoinFormulaire3CaseACocher,
      },
    ],
    [modele.sup, modele.sup2, modele.sup3],
  )
  // Un champ écrit à la main n'apparaît souvent qu'en mode interactif.
  const modes = modele.interactifReady ? [false, true] : [false]
  if (modele.demandeLaVue) bilan.signaleDemandeLaVue()
  modele.destroy?.()

  for (const { cle, valeurs } of combinaisons) {
    for (const graine of GRAINES) {
      for (const interactif of modes) {
        const exercise = await load(uuid)
        exercise.seed = graine
        exercise.interactif = interactif
        if (valeurs[0] !== undefined) exercise.sup = valeurs[0]
        if (valeurs[1] !== undefined) exercise.sup2 = valeurs[1]
        if (valeurs[2] !== undefined) exercise.sup3 = valeurs[2]
        guard.demarre()
        try {
          if (exercise.typeExercice === 'simple') {
            mathaleaHandleExerciceSimple(exercise, interactif)
          } else {
            exercise.nouvelleVersionWrapper()
          }
          guard.arrete()
          for (const fragment of fragmentsDe(exercise)) {
            bilan.ajouteFragment(fragment, { graine, cle, interactif })
          }
        } catch (erreur) {
          const reglages = [graine, cle, interactif ? 'interactif' : '']
            .filter(Boolean)
            .join(', ')
          if (bilan.erreurs.length < 2) {
            bilan.erreurs.push(`${reglages} : ${message(erreur)}`)
          }
        } finally {
          guard.arrete()
          exercise.destroy?.()
        }
      }
    }
  }
  return bilan
}

describe(`Accessibilité (${selection.cibles.length} exercices, informatif)`, () => {
  afterAll(() => {
    console.log(redigeRapport(selection, bilans))
  })

  it('explique sa sélection', () => {
    // Présent même sans exercice sélectionné : le rapport s'affiche toujours.
  })

  for (const [uuid, chemin] of selection.cibles) {
    it(chemin, async () => {
      try {
        bilans.push(await analyse(uuid, chemin))
      } catch (erreur) {
        const bilan = new BilanExercice(chemin, uuid)
        bilan.erreurs.push(message(erreur))
        bilans.push(bilan)
      }
    })
  }
})
