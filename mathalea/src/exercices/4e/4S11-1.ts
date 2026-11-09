import {
  listeDeNotes,
  tirerLesDes,
  unMoisDeTemperature,
} from '../../lib/outils/aleatoires'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import { OutilsStats } from '../../modules/outilsStat'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { arrondi } from '../../lib/outils/nombres'

export const titre = 'Déterminer une médiane'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '01/12/2021'
export const dateDeModifImportante = '24/06/2024'

/**
 * Détermination de médianes dans des séries statistiques numériques
 * @author Sébastien Lozano forked de Jean-claude Lhote
 * Ajout de l'alternance entre effectif total pair et impair le 18/08/2021 : Guilllaume Valmont
 */
export const uuid = '7c068'

export const refs = {
  'fr-fr': ['4S11-1'],
  'fr-ch': ['NR'],
}
export default class DeterminerDesMedianes extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de séries',
      'Nombres séparés par des tirets :\n1 : Lancers de dés \n2 : Liste de notes\n3 : Un mois de températures\n4 : Mélange',
    ]

    this.nbQuestions = 1

    this.spacingCorr = 1.5

    this.sup = 1
    if (context.isHtml) {
      this.spacing = 2
      this.spacingCorr = 2
    }
  }

  nouvelleVersion() {
    const listePairOuImpair = combinaisonListes(
      ['pair', 'impair'],
      this.nbQuestions,
    )
    const typeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })

    for (
      let i = 0,
        temperatures,
        nombreNotes,
        notes,
        nombreDes,
        nombreTirages,
        tirages,
        texte,
        texteCorr,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let repInteractive
      if (typeDeQuestions[i] === 1) {
        // ici on lance des dés
        nombreDes = randint(1, 2)
        const nombreFaces: 4 | 6 | 8 | 10 = choice([4, 6, 8, 10])
        if (listePairOuImpair[i] === 'pair') {
          nombreTirages = choice([50, 100, 200, 500, 1000, 2000])
        } else {
          nombreTirages = choice([49, 99, 199, 299, 999, 1999])
        }
        tirages = tirerLesDes(nombreTirages, nombreFaces, nombreDes) // on récupère une série rangée dans l'ordre croissant avec les effectifs correspondants
        texte = OutilsStats.texteTirages2D(
          nombreDes,
          nombreTirages,
          nombreFaces,
          tirages,
          false,
        )
        const [scoresMedians, medianeCorr] =
          OutilsStats.computeMedianeTirages2D(
            nombreTirages,
            tirages,
          ) as unknown as [[number, number], number]
        texteCorr = OutilsStats.texteCorrMedianeTirages2D(
          nombreTirages,
          medianeCorr,
          scoresMedians,
          tirages,
        )
        repInteractive = medianeCorr
      } else if (typeDeQuestions[i] === 2) {
        // ici on trie des notes
        if (listePairOuImpair[i] === 'pair') {
          nombreNotes = choice([8, 10, 12])
        } else {
          nombreNotes = choice([7, 9, 11])
        }
        notes = listeDeNotes(nombreNotes, randint(0, 7), randint(13, 20)) // on récupère une liste de notes (série brute)
        texte = OutilsStats.texteNotes(notes)
        const [mediane, medianeCorr] = OutilsStats.computeMediane(notes)
        texteCorr = OutilsStats.texteCorrMedianeNotes(
          notes,
          medianeCorr,
          mediane,
        )
        repInteractive = medianeCorr
      } else {
        // ici on relève des températures
        const annee = randint(1980, 2019)
        let listeMois
        if (listePairOuImpair[i] === 'pair') {
          listeMois = [4, 6, 9, 11]
        } else {
          listeMois = [1, 3, 5, 7, 8, 10, 12]
        }
        if (
          ((annee % 4 === 0 && annee % 100 !== 0) || annee % 400 === 0) &&
          listePairOuImpair[i] === 'impair'
        ) {
          // Si l'année est bissextile et qu'on veut une liste impair
          listeMois.push(2)
        } else if (
          !((annee % 4 === 0 && annee % 100 !== 0) || annee % 400 === 0) &&
          listePairOuImpair[i] === 'pair'
        ) {
          // Si l'année n'est pas bissextile et qu'on veut une liste paire
          listeMois.push(2)
        }
        const mois = listeMois[randint(0, listeMois.length - 1)]
        const temperaturesDeBase = [3, 5, 9, 13, 19, 24, 26, 25, 23, 18, 10, 5]
        temperatures = unMoisDeTemperature(
          temperaturesDeBase[mois - 1],
          mois,
          annee,
        ) // on récupère une série de température correspondant à 1 mois d'une année (série brute)
        texte = OutilsStats.texteTemperatures(annee, mois, temperatures)
        const [mediane, medianeCorr] = OutilsStats.computeMediane(temperatures)
        texteCorr = OutilsStats.texteCorrMedianeTemperatures(
          temperatures,
          medianeCorr,
          mediane,
        )
        repInteractive = medianeCorr
      }

      // On factorise la question
      if (this.interactif && !context.isAmc) texte += '<br><br>Déterminer une médiane de cette série : '
      else texte += '<br>Déterminer une médiane de cette série.'

      if (Array.isArray(repInteractive)) {
        handleAnswers(this, i, {
          reponse: {
            value: `]${repInteractive[0]};${repInteractive[1]}[`,
            options: { estDansIntervalle: true },
          },
        })
      } else {
        handleAnswers(this, i, { reponse: { value: repInteractive } })
      }
      if (this.interactif && !context.isAmc) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
      }
      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
