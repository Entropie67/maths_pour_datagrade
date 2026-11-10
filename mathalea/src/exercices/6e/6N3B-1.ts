import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '10/03/2021'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const titre = 'Donner une écriture fractionnaire'

/**
 * Donner la fraction correspondant à un nombre ou à un calcul
 * @author Jean-claude Lhote
 */
export const uuid = '4d0dd'

export const refs = {
  'fr-fr': ['6N3B-1'],
  'fr-2016': ['6N23-5'],
  'fr-ch': ['9R1NO4C-2', '9R2NO4C-2', '9R3NO4C-2'], // Primaire anciennement : ['9NO10-4'],
}
export default class SensDeLaFraction extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de questions',
      "1 : Le quotient de a par b\n2 : Le nombre qui, multiplié par b, donne a\n3 : L'opération : a divisé par b\n4 : Nombre décimal\n5 : Mélange",
    ]

    this.nbQuestions = 4
    this.sup = '5'
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      defaut: 5,
      melange: 5,
      nbQuestions: this.nbQuestions,
    })

    for (
      let i = 0, texte, texteCorr, a, b, f, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = ''
      texteCorr = ''

      switch (listeTypeDeQuestions[i]) {
        case 1:
          a = randint(10, 25)
          b = randint(10, 25, a)
          texte = `Le quotient de $${a}$ par $${b}$ s'écrit en écriture fractionnaire : $${texFractionFromString(
            '\\dots',
            '\\dots',
          )}$`
          texteCorr = `Le quotient de $${a}$ par $${b}$ s'écrit $${miseEnEvidence(new FractionEtendue(a, b).texFraction)}$.`
          this.autoCorrection[i] = {}
          this.autoCorrection[i].enonce = `${texte}\n`
          this.autoCorrection[i].propositions = [
            {
              texte: `$${texFractionFromString(a, b)}$`,
              statut: true,
            },
            {
              texte: `$${texFractionFromString(b, a)}$`,
              statut: false,
            },
            {
              texte: `$${texFractionFromString(Math.abs(a - b), b)}$`,
              statut: false,
            },
            {
              texte: `$${texFractionFromString(a + b, b)}$`,
              statut: false,
            },
            {
              texte: `$${texFractionFromString(a * 10, b)}$`,
              statut: false,
            },
          ]
          break

        case 2:
          a = randint(10, 25)
          b = randint(10, 25, a)
          texte = `Le nombre qui, multiplié par $${b}$, donne $${a}$ s'écrit en écriture fractionnaire : $${texFractionFromString(
            '\\dots',
            '\\dots',
          )}$`
          texteCorr = `Le nombre qui, multiplié par $${b}$, donne $${a}$ s'écrit $${miseEnEvidence(new FractionEtendue(a, b).texFraction)}$.`
          texteCorr += `<br>$${b} \\times ${miseEnEvidence(new FractionEtendue(a, b).texFraction)} = ${a}$`
          this.autoCorrection[i] = {}
          this.autoCorrection[i].enonce = `${texte}\n`
          this.autoCorrection[i].propositions = [
            {
              texte: `$${texFractionFromString(a, b)}$`,
              statut: true,
            },
            {
              texte: `$${texFractionFromString(b, a)}$`,
              statut: false,
            },
            {
              texte: `$${texFractionFromString(Math.abs(a - b), b)}$`,
              statut: false,
            },
            {
              texte: `$${texFractionFromString(a + b, b)}$`,
              statut: false,
            },
            {
              texte: `$${texFractionFromString(a * 10, b)}$`,
              statut: false,
            },
          ]
          break

        case 3:
          a = randint(10, 25)
          b = randint(10, 25, a)
          texte = `$${a}\\div ${b}$ s'écrit en écriture fractionnaire : $${texFractionFromString(
            '\\dots',
            '\\dots',
          )}$`
          texteCorr = `$${a}\\div ${b}$ s'écrit  $${miseEnEvidence(new FractionEtendue(a, b).texFraction)}$.`
          this.autoCorrection[i] = {}
          this.autoCorrection[i].enonce = `${texte}\n`
          this.autoCorrection[i].propositions = [
            {
              texte: `$${texFractionFromString(a, b)}$`,
              statut: true,
            },
            {
              texte: `$${texFractionFromString(b, a)}$`,
              statut: false,
            },
            {
              texte: `$${texFractionFromString(Math.abs(a - b), b)}$`,
              statut: false,
            },
            {
              texte: `$${texFractionFromString(a + b, b)}$`,
              statut: false,
            },
            {
              texte: `$${texFractionFromString(a * 10, b)}$`,
              statut: false,
            },
          ]
          break

        case 4:
          a = randint(1, 5) * 2 + 1
          b = choice([2, 4, 5, 10])
          a += b
          if (Number.isInteger(a / b)) {
            a++
          }
          f = fraction(a, b)

          texte = `Le nombre $${texNombre(arrondi(a / b))}$ peut s'écrire en écriture fractionnaire : $${texFractionFromString(
            '\\dots',
            '\\dots',
          )}$`
          texteCorr = `Le nombre $${texNombre(arrondi(a / b))}$ peut s'écrire  $${miseEnEvidence(f.fractionDecimale().texFraction)}$`
          if (f.fractionDecimale().texFraction !== f.texFractionSimplifiee) {
            texteCorr += ` ou $${miseEnEvidence(f.texFractionSimplifiee)}$.`
          } else texte += '.'
          this.autoCorrection[i] = {}
          this.autoCorrection[i].enonce = `${texte}\n`
          this.autoCorrection[i].propositions = [
            {
              texte: `$${f.fractionDecimale().texFraction}$`,
              statut: true,
            },
            {
              texte: `$${texFractionFromString(b, a)}$`,
              statut: false,
            },
            {
              texte: `$${texFractionFromString(a, b * 10)}$`,
              statut: false,
            },
            {
              texte: `$${texFractionFromString(a * 10, b)}$`,
              statut: false,
            },
            {
              texte: `$${texFractionFromString(Math.floor(a / b), fraction(arrondi(a / b - Math.floor(a / b)) * 100, 100).fractionDecimale().n)}$`,
              statut: false,
            },
          ]
          break
      }
      this.autoCorrection[i].options = {
        ordered: false,
        lastChoice: 5,
      }
      const props = propositionsQcm(this, i)
      if (this.interactif) {
        texte += '<br>' + props.texte
        texte = texte.replace(
          `$${texFractionFromString('\\dots', '\\dots')}$`,
          '',
        )
      }
      if (this.listeQuestions.indexOf(texte) === -1) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
