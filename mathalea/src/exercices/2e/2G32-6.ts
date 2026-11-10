import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const titre = "Montrer qu'un point appartient ou non à une droite"
export const dateDePublication = '20/04/2026'

/**
 *
 * @author Arnaud Meistermann

*/
export const uuid = '843aa'
export const refs = {
  'fr-fr': ['2G32-6'],
  'fr-ch': [],
}

export default class PtSurDroiteEqCartesienne extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Choix des questions',
      "1 : Le point est sur la droite \n2 : Le point n'est pas sur la droite \n3 : Mélange des cas précédents",
    ]
    this.sup = '3'

    this.nbCols = 2
    this.spacing = 1.5 // Interligne des questions
    this.spacingCorr = 1.5 // Interligne des réponses
  }

  nouvelleVersion() {
    this.autoCorrection = []
    this.besoinFormulaireTexte = [
      'Type de question (nombres séparés par des tirets)',
      "1: Le point appartient à la droite\n2: Le point n'appartient pas à la droite\n3: Mélange",
    ]
    const listeTypeDeQuestion = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const nomPt = choice([
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'M',
        'N',
        'R',
        'S',
      ])
      let a = randint(-5, 5)
      let b = a === 0 ? randint(-5, 5, 0) : randint(-5, 5) // a et b non simultanément nul
      a = a / pgcd(a, b)
      b = b / pgcd(a, b)
      const x0 = randint(-10, 10) // x0 abscisse d'un point sur la droite
      const y0 = randint(-10, 10)
      const c = -a * x0 - b * y0
      const x1 = randint(-5, 5, x0)
      let y1
      do {
        y1 = randint(-10, 10)
      } while (a * x1 + b * y1 + c === 0)

      let pointX, pointY, bonneReponse

      switch (listeTypeDeQuestion[i]) {
        case 1:
          // Point sur la droite
          pointX = x0
          pointY = y0
          bonneReponse = true
          break
        case 2:
          // Point pas sur la droite
          pointX = x1
          pointY = y1
          bonneReponse = false
          break
        default:
          // Mélange
          if (randint(0, 1) === 0) {
            pointX = x0
            pointY = y0
            bonneReponse = true
          } else {
            pointX = x1
            pointY = y1
            bonneReponse = false
          }
      }

      let eq = '$'
      if (a !== 0) {
        eq += `${rienSi1(a)}x`
      }
      if (b !== 0) {
        eq +=
          a === 0
            ? `${rienSi1(b)}y`
            : `${ecritureAlgebrique(b).replace(/^([+-])1$/, '$1')}y`
      }
      if (c !== 0) {
        eq += ` ${ecritureAlgebrique(c)}`
      }
      eq += '=0$'

      let texte = ''
      let texteCorr = ''

      // QCM
      this.autoCorrection[i] = {
        options: { ordered: true, radio: true },
        enonce: '',
        propositions: [
          { texte: 'OUI', statut: bonneReponse },
          { texte: 'NON', statut: !bonneReponse },
        ],
      }

      const monQCM = propositionsQcm(this, i)

      // ÉNONCÉ
      texte = `Soit $(d)$ la droite d'équation cartésienne : ${eq} <br> Le point $${nomPt}(${pointX}; ${pointY})$ appartient-il à la droite $(d)$ ?<br>`
      if (this.interactif) {
        texte += monQCM.texte
      }

      // CORRECTION
      texteCorr = `On remplace $x$ et $y$ par les coordonnées du point $${nomPt}(${pointX}; ${pointY})$ :<br>`
      texteCorr += `$`
      texteCorr += a !== 1 ? `${a} \\times ` : ``
      texteCorr += `${ecritureParentheseSiNegatif(pointX)} + ${ecritureParentheseSiNegatif(b)} \\times ${ecritureParentheseSiNegatif(pointY)}${c !== 0 ? ecritureAlgebrique(c) : ''} = ${a * pointX + b * pointY + c}`
      switch (listeTypeDeQuestion[i]) {
        case 1:
          texteCorr += `$ <br> L'équation est vérifiée, donc $${nomPt}$ appartient à la droite $(d)$. La réponse est ${texteEnCouleurEtGras('OUI')}.<br>`
          break
        case 2:
          texteCorr += `\\neq 0$ <br>L'équation n'est pas vérifiée, donc $${nomPt}$ n'appartient pas à la droite $(d)$. La réponse est ${texteEnCouleurEtGras('NON')}.<br>`
          break
      }

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
