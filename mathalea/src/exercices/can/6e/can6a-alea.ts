import { propositionsQcm } from '../../../lib/interactif/qcm'
import { shuffle } from '../../../lib/outils/arrayOutils'

import seedrandom from 'seedrandom'
import uuidToUrl from '../../../json/uuidsToUrlFR.json'
import {
  mathaleaHandleExerciceSimple,
  mathaleaLoadExerciceFromUuid,
} from '../../../lib/mathalea'
import Exercice from '../../Exercice'
export const titre = 'Choix aléatoires des questions'
export const interactifReady = true

export const amcReady = false

/**
 * @author Mickael Guironnet
 * Créé 12 novembre 2023
 * Exercice qui permet de charger les différentes questions du CAN 6e pour un export LATEX ou la vue PROF
 * ATTENTION : exercice avec chargement dynamique des questions.
 */
export const uuid = '315b6'

export const refs = {
  'fr-fr': ['can6a-Aléa'],
  'fr-ch': ['NR'],
}

const log = function (str: string) {
  if (window.logDebug > 1) console.info(str)
}

/**
 * Questions disponibles classées par rubrique : « can6C51-02 » appartient à la rubrique « C51 ».
 * Les anciennes versions (can6C1-01Old, can6a-2024...) ne suivent pas ce nommage et sont ignorées.
 */
const questionsParRubrique = new Map<string, string[]>()
for (const url of Object.values(uuidToUrl)) {
  const nomFichier = url.replaceAll('\\', '/').split('/').reverse()[0]
  const trouve = /^(can6([A-Z]\d*)-\d+)\.ts$/.exec(nomFichier)
  if (trouve == null) continue
  const questions = questionsParRubrique.get(trouve[2]) ?? []
  questions.push(trouve[1])
  questionsParRubrique.set(trouve[2], questions)
}

/**
 * Renvoie les noms de fichiers des questions des rubriques dont le code commence par l'un des
 * codes de la saisie (« C » pour tout le calcul, « N2 » pour N21 et N22, « I » pour l'informatique...).
 * Une saisie vide, « All » ou sans code reconnu sélectionne toutes les rubriques.
 */
function questionsDeLaSaisie(saisie: string): Map<string, string[]> {
  const codes = saisie
    .split('-')
    .map((code) => code.trim().toUpperCase())
    .filter((code) => code !== '' && code !== 'ALL')
  const rubriques = [...questionsParRubrique.keys()].filter(
    (rubrique) =>
      codes.length === 0 || codes.some((code) => rubrique.startsWith(code)),
  )
  const parFamille = new Map<string, string[]>()
  for (const rubrique of rubriques.length > 0
    ? rubriques
    : questionsParRubrique.keys()) {
    const famille = rubrique[0]
    parFamille.set(famille, [
      ...(parFamille.get(famille) ?? []),
      ...(questionsParRubrique.get(rubrique) ?? []),
    ])
  }
  return parFamille
}

export default class can6eAll extends Exercice {
  constructor() {
    super()
    this.reponseCourteDisponible = false // Les questions sont chargées depuis d'autres exercices, après la génération.
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Codes des rubriques séparés par des tirets :',
        'All : Mélange',
        'C1 à C7, C51 à C53 : calcul',
        'D1 à D3 : durées',
        'G1 à G3 : géométrie',
        'I : informatique',
        'M1 à M4 : mesure',
        'N1, N21, N22, N3 : numération',
        'P1, P2 : proportionnalité',
        'S : statistiques',
        'Une lettre seule (C, G, M, N...) ou un début de code (C5, N2) sélectionne toutes les rubriques correspondantes',
      ].join('\n'),
    ]
    this.nbQuestions = 4
    this.sup = 'All'
    this.lastCallback = ''

    this.nouvelleVersionWrapper = function () {
      this.nouvelleVersion()
    }
  }

  nouvelleVersion() {
    this.questionJamaisPosee(
      0,
      this.seed ?? 'empty',
      this.sup,
      this.sup2,
      this.sup3,
      String(this.interactif),
      this.nbQuestions,
    )
    if (this.lastCallback === this.listeArguments[0]) {
      // identique
      // pas de recalcul à faire
      log('pas de recalcul')
      return
    }
    this.lastCallback = this.listeArguments[0]

    if (this.sup === null || this.sup === '') {
      this.sup = 'All'
    } else {
      this.sup = this.sup.toString()
    }

    log(this.sup)
    // On alterne les familles (calcul, géométrie...) dans un ordre aléatoire, puis on pioche
    // sans répétition dans chaque famille tant qu'il reste des questions.
    const parFamille = questionsDeLaSaisie(this.sup)
    const familles = shuffle([...parFamille.keys()])
    const questionsMelangees = new Map(
      familles.map((famille) => [famille, shuffle(parFamille.get(famille)!)]),
    )
    const questionsDisponibles: string[] = []
    for (let q = 0; q < this.nbQuestions; q++) {
      const famille = familles[q % familles.length]
      const questions = questionsMelangees.get(famille)!
      const rang = Math.floor(q / familles.length)
      questionsDisponibles.push(questions[rang % questions.length])
    }
    log(questionsDisponibles.join('\n'))

    async function loadAllQuests(exercice: can6eAll, numeros: string[]) {
      const promises = []
      for (let q = 0; q < numeros.length; q++) {
        if (q === 0) {
          /** MGu
           * On est obligé car la première question (indice:0) dans HandleAnswers réinitialise : exercice.autoCorrection
           */
          await loadQuest(exercice, numeros[q], q)
        } else {
          promises.push(loadQuest(exercice, numeros[q], q))
        }
      }

      await Promise.all(promises)

      const updateAsyncEx = new window.Event('updateAsyncEx', {
        bubbles: true,
      })
      document.dispatchEvent(updateAsyncEx)
      log('dispatched all Questions chargées')
    }

    function findUuid(fileScript: string) {
      const uuids = Object.entries(uuidToUrl)
      const found =
        uuids.find((element) => {
          const [filename, ,] = element[1]
            .replaceAll('\\', '/')
            .split('/')
            .reverse()
          if (filename.split('.')[0] === fileScript) {
            return true
          }
          return false
        }) ?? []
      return found[0]
    }

    async function loadQuest(
      exercice: Exercice,
      fileScript: string,
      i: number,
    ) {
      // const uuid = refToUuid[fileScript]
      const uuid = findUuid(fileScript) ?? ''
      const quest = mathaleaLoadExerciceFromUuid(uuid)
        .then((exports) => {
          // const quest =  import(fileScript).then(exports => {
          const q2 = exports // new exports.default()
          const k = i
          if (exercice.interactif) q2.interactif = true
          else q2.interactif = false
          q2.numeroExercice = exercice.numeroExercice
          q2.seed = exercice.seed
          if (q2?.typeExercice === 'simple') {
            mathaleaHandleExerciceSimple(
              q2,
              q2.interactif,
              q2.numeroExercice,
              q2.seed,
            )
          } else {
            seedrandom(q2.seed, { global: true })
            q2.nouvelleVersion(q2.numeroExercice)
          }
          exercice.listeCorrections[k] = q2.listeCorrections[0]
          exercice.listeCanEnonces[k] = q2.listeCanEnonces[0]
          exercice.listeCanReponsesACompleter[k] =
            q2.listeCanReponsesACompleter[0]
          exercice.autoCorrection[k] = q2.autoCorrection[0]
          exercice.listeQuestions[k] = q2.listeQuestions[0]

          if (q2?.autoCorrection[0]?.propositions === undefined) {
            // mathlive
            // update les références HTML
            exercice.listeQuestions[k] = exercice.listeQuestions[k].replaceAll(
              `champTexteEx${exercice.numeroExercice}Q${0}`,
              `champTexteEx${exercice.numeroExercice}Q${k}`,
            )
            exercice.listeQuestions[k] = exercice.listeQuestions[k].replaceAll(
              `resultatCheckEx${exercice.numeroExercice}Q${0}`,
              `resultatCheckEx${exercice.numeroExercice}Q${k}`,
            )
            exercice.listeQuestions[k] = exercice.listeQuestions[k].replaceAll(
              `tabMathliveEx${exercice.numeroExercice}Q${0}`,
              `tabMathliveEx${exercice.numeroExercice}Q${k}`,
            )
            exercice.listeQuestions[k] = exercice.listeQuestions[k].replaceAll(
              `tabMathliveEx${exercice.numeroExercice}Q${0}`,
              `tabMathliveEx${exercice.numeroExercice}Q${k}`,
            )
            exercice.listeQuestions[k] = exercice.listeQuestions[k].replaceAll(
              `spanEx${exercice.numeroExercice}Q${0}`,
              `spanEx${exercice.numeroExercice}Q${k}`,
            )
          } else {
            // qcm
            const monQcm = propositionsQcm(exercice, k) // update les références HTML
            exercice.listeCanReponsesACompleter[k] = monQcm.texte
            exercice.listeQuestions[k] =
              exercice.autoCorrection[k].enonce + monQcm.texte
          }
          log('Question chargée' + i)
        })
        .catch(function (err) {
          if (exercice instanceof Exercice) {
            log(err)
            exercice.listeQuestions[i] = 'Erreur de chargement:' + fileScript
          } else {
            window.notify('Erreur de chargement:' + fileScript, { error: err })
          }
        })

      log('Calling Question chargée' + i)
      return quest
    }

    loadAllQuests(this, questionsDisponibles)

    this.listeQuestions = []
    this.listeCorrections = []
    this.listeCanEnonces = []
    this.listeCanReponsesACompleter = []
    this.autoCorrection = []
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      this.listeCorrections[i] = ''
      this.listeCanEnonces[i] = ''
      this.listeCanReponsesACompleter[i] = ''
      this.listeQuestions[i] = 'chargement $\\ldots$'
      i++
    }
    log('fin nouvelleVersion')
  }
}
