import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import {
  listeDeBases,
  patronEnS,
  patronEnT,
  patronHasard,
} from '../../modules/PatronsPrismes'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const interactifReady = true

export const titre = "Identifier les bases d'un prisme"

export const dateDePublication = '15/05/2026'
export const uuid = '2d961'
export const refs = {
  'fr-fr': ['5G2B-1'],
  'fr-2016': ['5G52-1'],
  'fr-ch': ['10CTES1A-3', '10LCES1A-3', '10LSES1A-3', 'PRQES07C-5'],
}
/**
 * Identifier les bases d'un prisme à partir de son patron.
 * @author Olivier Mimeau
 */
export default class nomExercice extends Exercice {
  constructor() {
    super()
    this.consigne = `Les patrons ci-dessous sont des patrons de prismes.<br>Quels sont les numéros des bases${sp()}?<br>`
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Type de question entre 1 et 2',
      [
        'Nombres séparés par des tirets  :',
        '0 : melange',
        '1 : patrons simples', //  Les patrons sont en T ou en S.
        '2 : patrons plus complexes',
      ].join('\n'),
    ]
    this.sup = '1-1-2'
  }

  nouvelleVersion() {
    if (this.nbQuestions === 1) {
      this.consigne = `Le patron ci-dessous est celui d'un prisme.<br>Quels sont les numéros des bases${sp()}?<br>`
    }
    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 0,
      defaut: 1,
      // listeOfCase: ['EnT', 'EnS', 'Hasard'],
      nbQuestions: this.nbQuestions,
    })

    const listeTypeDeBase = combinaisonListes(
      [...Array(listeDeBases.length - 1).keys()],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = '<br><br>'
      let texteCorr = ''
      let reponse1: number = -1
      let reponse2: number = -1
      const laDefBase = listeDeBases[listeTypeDeBase[i]]
      const nbSommetBase = laDefBase.nbSommet
      const listeCotesBase = laDefBase.listeCotes
      const listeAnglesBase = laDefBase.listeAngles
      const hauteurPrisme = randint(2, 5)
      const genrePatron =
        listeTypeQuestions[i] === 1 ? choice(['EnT', 'EnS']) : 'Hasard'

      switch (genrePatron) {
        case 'EnT':
          {
            const base1 = patronEnT(
              nbSommetBase,
              hauteurPrisme,
              listeCotesBase,
              listeAnglesBase,
              {
                angleDeDepart: 0,
                horizontal: 'horizontal',
                tNumerotation: 'hasard',
              },
            )
            texte += base1.dessinerObjet('hasard', 'sans')

            reponse1 = base1.numFace
            reponse2 = base1.trouverDeuxiemeBase()[0].numFace
          }
          break
        case 'EnS':
          {
            const base1 = patronEnS(
              nbSommetBase,
              hauteurPrisme,
              listeCotesBase,
              listeAnglesBase,
              {
                angleDeDepart: 0,
                horizontal: 'horizontal',
                tNumerotation: 'hasard',
              },
            )
            texte += base1.dessinerObjet('hasard', 'sans')
            reponse1 = base1.numFace
            reponse2 = base1.trouverDeuxiemeBase()[0].numFace
          }
          break
        case 'Hasard':
          {
            const base1 = patronHasard(
              nbSommetBase,
              hauteurPrisme,
              listeCotesBase,
              listeAnglesBase,
              {
                angleDeDepart: 0,
                horizontal: 'horizontal',
                enT: false,
                enS: false,
                tNumerotation: 'hasard',
              },
            )
            texte += base1.dessinerObjet('hasard', 'sans')
            reponse1 = base1.numFace
            reponse2 = base1.trouverDeuxiemeBase()[0].numFace
          }
          break
      }
      if (this.interactif) {
        texte +=
          '<br>' +
          `Numéros des bases séparés par des points-virgules${sp()}: ` +
          ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
          )
        const reponseInteractive = `${reponse1};${reponse2}`
        handleAnswers(
          this,
          i,
          {
            reponse: {
              value: reponseInteractive,
              options: { suiteDeNombres: true },
            },
          },
          {
            formatInteractif: 'mathlive',
          },
        )
      }

      texteCorr += `Lorsque le prisme n'est pas un pavé droit, les bases sont les deux faces superposables qui ne sont pas des rectangles.<br>`
      texteCorr += `Les bases sont donc les faces $${miseEnEvidence(`${reponse1};${reponse2}`)}$.`
      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
