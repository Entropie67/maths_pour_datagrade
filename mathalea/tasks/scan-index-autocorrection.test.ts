/**
 * Repère les exercices interactifs qui n'ont pas une seule entrée
 * `autoCorrection[i]` par question (champs en `2 * i`, `2 * i + 1`, compteurs
 * qui se croisent, index partagés entre questions…).
 *
 * Chaque exercice interactif du catalogue est généré en mode interactif avec
 * les combinaisons de paramètres du test de stabilité. Rapport JSON :
 * `reports/index-autocorrection.json`.
 *
 * Usage :
 *   pnpm scan:index                              tout le catalogue (~2 min)
 *   CIBLES=3e/3G20.ts,4e/4G30.ts pnpm scan:index quelques exercices
 *                                                (chemins relatifs à src/exercices)
 *   ARCHIVES=1 pnpm scan:index                   inclut les exercices archivés (`…Old`)
 *
 * Voir documentation/developpement/auteurs-exercices/complements/un-index-par-question.md
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'vitest'
import {
  combinaisonsParametres,
  grainePourUuid,
  installeGardeDeBoucle,
} from '../tests/e2e/helpers/empreinteExercice'
import '../tests/e2e/helpers/setupExerciseGeneration'

const { mathaleaLoadExerciceFromUuid } = await import('../src/lib/mathalea')
const garde = installeGardeDeBoucle()

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const NB_QUESTIONS = 4
const CIBLES = (process.env.CIBLES ?? '').split(',').filter(Boolean)

const uuidVersFichier: Record<string, string> = JSON.parse(
  readFileSync(resolve(RACINE, 'src/json/uuidsToUrlFR.json'), 'utf8'),
)

/**
 * - `partages` : plusieurs questions utilisent les mêmes index
 * - `collision` : un index sert à deux questions différentes
 * - `multi` : plus d'entrées `autoCorrection` que de questions
 * - `orpheline` : une entrée en trop dans certaines combinaisons seulement
 *   (question rejetée par le test d'unicité mais déjà enregistrée)
 */
type Categorie = 'partages' | 'collision' | 'multi' | 'orpheline'

type Resultat = {
  exercice: string
  uuid: string
  categorie: Categorie
  /** Nombre de questions et d'entrées `autoCorrection` (combinaison par défaut). */
  nbQuestions: number
  nbEntrees: number
  /** Index `Ex…Q<j>` trouvés dans l'énoncé de chaque question. */
  indexParQuestion: number[][]
  /** Formats interactifs des premières entrées. */
  formats: string[]
  /** Combinaisons `sup/sup2/sup3` où l'anomalie apparaît. */
  combinaisons: string[]
}

type Releve = {
  nbQuestions: number
  nbEntrees: number
  indexParQuestion: number[][]
  formats: string[]
}

const releve = (exercice: any): Releve => {
  const autoCorrection = exercice.autoCorrection ?? []
  return {
    nbQuestions: exercice.listeQuestions.length,
    // `length` et non le nombre de clés : un index trop grand laisse des trous
    nbEntrees: autoCorrection.length,
    indexParQuestion: exercice.listeQuestions.map((q: string) =>
      [
        ...new Set(
          [...String(q).matchAll(/Ex\d+Q(\d+)/g)].map((m) => Number(m[1])),
        ),
      ].sort((a, b) => a - b),
    ),
    formats: Object.values(autoCorrection)
      .slice(0, 6)
      .map(
        (a: any) =>
          a?.reponse?.param?.formatInteractif ?? a?.formatInteractif ?? '?',
      ),
  }
}

/** Un index qui apparaît dans deux questions différentes. */
const aCollision = (indexParQuestion: number[][]): boolean => {
  const vu = new Map<number, number>()
  return indexParQuestion.some((indexes, q) =>
    indexes.some((k) => {
      const deja = vu.get(k)
      vu.set(k, q)
      return deja !== undefined && deja !== q
    }),
  )
}

/** `null` quand la question respecte la règle « un index par question ». */
const classe = (r: Releve): Categorie | null => {
  const { nbQuestions, nbEntrees, indexParQuestion } = r
  const memesIndex =
    nbQuestions > 1 &&
    indexParQuestion.every(
      (x) => x.length > 1 && x.join() === indexParQuestion[0].join(),
    )
  if (memesIndex && nbEntrees < nbQuestions) return 'partages'
  if (nbEntrees <= nbQuestions) return null
  if (aCollision(indexParQuestion)) return 'collision'
  // champs d'index différent de la question : plusieurs entrées par question
  const plusieursChamps = indexParQuestion.some((x, q) =>
    x.some((k) => k !== q),
  )
  return plusieursChamps ? 'multi' : 'orpheline'
}

/** Exercices archivés (`…-old`, `…Old`), écartés sauf avec `ARCHIVES=1`. */
const estArchive = (chemin: string): boolean =>
  /old/i.test(chemin.replace(/bold/gi, '')) && process.env.ARCHIVES !== '1'

const estControlable = (chemin: string): boolean =>
  chemin.endsWith('.ts') &&
  !estArchive(chemin) &&
  !chemin.startsWith('apps/') &&
  !chemin.startsWith('ressources/') &&
  !/-automatismes/.test(chemin) &&
  (CIBLES.length === 0 || CIBLES.includes(chemin))

describe('Un seul index autoCorrection par question', () => {
  it('scan du catalogue', async () => {
    const resultats: Resultat[] = []
    for (const [uuid, chemin] of Object.entries(uuidVersFichier)) {
      if (!estControlable(chemin)) continue
      try {
        const modele: any = await mathaleaLoadExerciceFromUuid(uuid)
        if (modele?.titre?.startsWith('Erreur')) continue
        if (modele.typeExercice === 'simple') continue
        if (!modele.interactifReady && !modele.interactifType) continue
        const declaration = (n: string) => ({
          numerique: modele[`besoinFormulaire${n}Numerique`],
          texte: modele[`besoinFormulaire${n}Texte`],
          caseACocher: modele[`besoinFormulaire${n}CaseACocher`],
        })
        const combinaisons = combinaisonsParametres(
          [declaration(''), declaration('2'), declaration('3')] as any,
          [modele.sup, modele.sup2, modele.sup3],
        )
        modele.destroy?.()

        let defaut: Releve | undefined
        let categorie: Categorie | null = null
        const concernees: string[] = []
        for (const { cle, valeurs } of combinaisons) {
          const exercice: any = await mathaleaLoadExerciceFromUuid(uuid)
          exercice.uuid = uuid
          exercice.interactif = true
          exercice.numeroExercice = 1
          exercice.nbQuestions =
            exercice.nbQuestionsModifiable === false ? 1 : NB_QUESTIONS
          exercice.seed = grainePourUuid(uuid)
          if (valeurs[0] !== undefined) exercice.sup = valeurs[0]
          if (valeurs[1] !== undefined) exercice.sup2 = valeurs[1]
          if (valeurs[2] !== undefined) exercice.sup3 = valeurs[2]
          garde.demarre()
          try {
            exercice.nouvelleVersionWrapper()
            const r = releve(exercice)
            if (cle === '') defaut = r
            const c = classe(r)
            if (c !== null) {
              concernees.push(cle === '' ? 'paramètres par défaut' : cle)
              // la catégorie la plus grave l'emporte
              const gravite = ['orpheline', 'multi', 'collision', 'partages']
              if (
                categorie === null ||
                gravite.indexOf(c) > gravite.indexOf(categorie)
              )
                categorie = c
              defaut ??= r
            }
          } catch {
            // tirage impossible dans cette combinaison : ignoré
          } finally {
            garde.arrete()
            exercice.destroy?.()
          }
        }
        if (categorie !== null && defaut !== undefined) {
          resultats.push({
            exercice: chemin,
            uuid,
            categorie,
            ...defaut,
            combinaisons: concernees,
          })
        }
      } catch {
        // exercice non chargeable dans cet environnement : ignoré
      }
    }

    const ordre = ['partages', 'collision', 'multi', 'orpheline']
    resultats.sort(
      (a, b) =>
        ordre.indexOf(a.categorie) - ordre.indexOf(b.categorie) ||
        a.exercice.localeCompare(b.exercice),
    )
    mkdirSync(resolve(RACINE, 'reports'), { recursive: true })
    writeFileSync(
      resolve(RACINE, 'reports/index-autocorrection.json'),
      JSON.stringify(resultats, null, 2),
    )
    const parCategorie = Object.groupBy(resultats, (r) => r.categorie)
    for (const categorie of ordre) {
      const liste = parCategorie[categorie] ?? []
      console.log(`\n${categorie} : ${liste.length}`)
      for (const r of liste) {
        console.log(
          `  ${r.exercice} (${r.nbEntrees} entrées pour ${r.nbQuestions} questions)`,
        )
      }
    }
    console.log(
      `\n${resultats.length} exercice(s) signalé(s), rapport dans reports/index-autocorrection.json`,
    )
  }, 3_000_000)
})
