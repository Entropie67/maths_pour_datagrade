import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { listeDeNotes, unMoisDeTemperature } from '../../lib/outils/aleatoires'
import { choice } from '../../lib/outils/arrayOutils'
import { joursParMois } from '../../lib/outils/dateEtHoraires'
import { arrondi } from '../../lib/outils/nombres'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import { OutilsStats } from '../../modules/outilsStat'
import Exercice from '../Exercice'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const titre = 'Calculer des moyennes'

export const dateDeModifImportante = '24/06/2024'

/**
 * Calcul de moyennes de série statistiques
 * @author Jean-claude Lhote
 * @author Guillaume Valmont
 *  (Interactif et AMC par EE)
 * 12/01/2023 : Mickael Guironnet Refactoring (remodifié par EE car il n'y avait plus de correction et l'interactif ne fonctionnait plus)
 */
export const uuid = 'ab91d'

export const refs = {
  'fr-fr': ['5D1F', 'BP2AutoD1', 'BP1AUTO044'],
  'fr-2016': ['5S14', 'BP2AutoD1'],
  'fr-ch': ['10CTFA2A-6', '10LCFA2A-6', '10LSFA2A-6', 'PRQST01B-1'],
}
export default class CalculerDesMoyennes extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de séries',
      'Nombres séparés par des tirets :\n1 : Liste de notes\n2 : Un mois de températures\n3 : Pointures de chaussures\n4 : Mélange',
    ]

    this.nbQuestions = 1

    this.spacingCorr = 2.5

    this.sup = 1
  }

  nouvelleVersion() {
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
        reponse,
        nombreTemperatures,
        temperatures,
        texte,
        texteCorr,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      if (typeDeQuestions[i] === 1) {
        // ici on trie des notes
        const nombreNotes = choice([8, 10, 12])
        const notes = listeDeNotes(nombreNotes, randint(0, 7), randint(13, 20)) // on récupère une liste de notes (série brute)
        texte = OutilsStats.texteNotes(notes)
        texte += '<br>Calculer la moyenne des notes.'
        const [, somme] = OutilsStats.computeMoyenne(notes)
        texteCorr = OutilsStats.texteCorrMoyenneNotes(notes, somme, nombreNotes)
        reponse = arrondi(somme / nombreNotes, 1)
      } else if (typeDeQuestions[i] === 2) {
        // ici on relève des températures
        const mois = randint(1, 12)
        const annee = randint(1980, 2019)
        const temperaturesDeBase = [3, 5, 9, 13, 19, 24, 26, 25, 23, 18, 10, 5]
        nombreTemperatures = joursParMois(mois, annee)
        temperatures = unMoisDeTemperature(
          temperaturesDeBase[mois - 1],
          mois,
          annee,
        ) // série brute de un mois de température
        texte = OutilsStats.texteTemperatures(annee, mois, temperatures)
        texte += '<br>Calculer la moyenne des températures.'
        const [, somme] = OutilsStats.computeMoyenne(temperatures)
        texteCorr = OutilsStats.texteCorrMoyenneNotes(
          temperatures,
          somme,
          temperatures.length,
          'températures',
        )
        reponse = arrondi(somme / nombreTemperatures, 1)
      } else {
        // pointures des membres du club de foot (moyenne pondérée)
        const nombreNotes = 5 // 5 colonnes
        const min = randint(33, 35)
        const max = randint(min + nombreNotes, min + nombreNotes + 3)
        const notes = listeDeNotes(nombreNotes, min, max, true).sort() // on récupère une série de notes (pointures) distinctes et ordonnées
        const effectifs = listeDeNotes(
          nombreNotes,
          randint(2, 4),
          randint(8, 12),
        ) // on récupère une liste d'effectifs
        const pointures = Array.from(notes, (x, i) => [x, effectifs[i]])
        const effectifTotal = pointures.reduce((accumulator, currentValue) => {
          return accumulator + currentValue[1]
        }, 0)
        texte = OutilsStats.texteSalaires(pointures, [], 'pointures')
        texte += '<br>Calculer la pointure moyenne des membres de ce club.'
        const [, somme, effectif] =
          OutilsStats.computeMoyenneTirages2D(pointures)
        texteCorr = OutilsStats.texteCorrMoyenneNotes(
          pointures,
          somme,
          effectif,
          'pointures',
        )
        reponse = arrondi(somme / effectifTotal, 1)
      }
      if (this.interactif) {
        texte += ' Si besoin, on arrondira au dixième.<br>'
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
        handleAnswers(
          this,
          i,
          { reponse: { value: reponse } },
          { digits: 5, digitsNum: 3, digitsDen: 2, signe: true },
        )
      }
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: texte,
          options: { multicols: true, barreseparation: true }, // facultatif. Par défaut, multicols est à false. Ce paramètre provoque un multicolonnage (sur 2 colonnes par défaut) : pratique quand on met plusieurs AMCNum. !!! Attention, cela ne fonctionne pas, nativement, pour AMCOpen. !!!
          propositions: [
            {
              type: 'AMCOpen',
              propositions: [
                {
                  texte: texteCorr,
                  statut: 3,
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  statut: '',
                  reponse: {
                    texte: 'Résultat (si besoin, on arrondira au dixième.)',
                    valeur: [reponse],
                    param: {
                      signe: false,
                      approx: 0,
                    },
                  },
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
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
