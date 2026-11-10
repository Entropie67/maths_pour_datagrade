import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { generateCleaner } from '../../lib/interactif/cleaners'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { combinaisonListes, choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import type { CompareFunction } from '../../lib/types'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Déterminer les parties réelle et imaginaire d'un nombre complexe"
export const interactifReady = true
export const dateDePublication = '30/08/2026'
export const dateDeModifImportante = '30/08/2026'
export const uuid = '9fa42'

export const refs = {
  'fr-fr': ['TEC1-11'],
  'fr-ch': [],
}

type TypeQuestion =
  | 'formeAlgebrique'
  | 'termesInverses'
  | 'quotientEntier'
  | 'quotientRacine'
  | 'imaginairePur'
  | 'zero'
  | 'carreDeI'
  | 'puissanceDeI'

const ecritureAlgebrique = (partieReelle: number, partieImaginaire: number) => {
  const termeImaginaire =
    Math.abs(partieImaginaire) === 1 ? 'i' : `${Math.abs(partieImaginaire)}i`
  return `${partieReelle}${partieImaginaire > 0 ? '+' : '-'}${termeImaginaire}`
}

const valeurPuissanceDeI = (exposant: number) => {
  switch (exposant % 4) {
    case 0:
      return { ecriture: '1', partieReelle: '1', partieImaginaire: '0' }
    case 1:
      return { ecriture: 'i', partieReelle: '0', partieImaginaire: '1' }
    case 2:
      return { ecriture: '-1', partieReelle: '-1', partieImaginaire: '0' }
    default:
      return { ecriture: '-i', partieReelle: '0', partieImaginaire: '-1' }
  }
}

const nettoieEcritureImaginaire = generateCleaner(['imaginaires', 'mathrm'])

const compareValeurReelle: CompareFunction = (saisie, reponse, options) => {
  const saisieNettoyee = nettoieEcritureImaginaire(saisie)
  if (/(^|[^a-zA-Z])i([^a-zA-Z]|$)/.test(saisieNettoyee)) {
    return {
      isOk: false,
      feedback:
        "La partie réelle et la partie imaginaire sont des nombres réels : il ne faut pas écrire l'unité imaginaire $i$ dans ces champs.",
    }
  }
  return fonctionComparaison(saisie, reponse, options)
}

/**
 * Déterminer les parties réelle et imaginaire de nombres complexes présentés
 * sous différentes formes.
 *
 * @author Stéphane Guyon
 */
export default class PartiesReelleEtImaginaire extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.nbQuestionsModifiable = true
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Déterminer la partie réelle et la partie imaginaire du nombre complexe suivant.'
        : 'Déterminer la partie réelle et la partie imaginaire de chacun des nombres complexes suivants.'

    const typesDisponibles: TypeQuestion[] = [
      'formeAlgebrique',
      'termesInverses',
      'quotientEntier',
      'quotientRacine',
      'imaginairePur',
      'zero',
      'carreDeI',
      'puissanceDeI',
    ]
    const typesQuestions = combinaisonListes(typesDisponibles, this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const typeQuestion = typesQuestions[i]
      let nombre = ''
      let formeAlgebrique = ''
      let partieReelle = ''
      let partieImaginaire = ''
      let explication = ''

      switch (typeQuestion) {
        case 'formeAlgebrique': {
          const a = randint(-6, 6, 0)
          const b = randint(-6, 6, 0)
          nombre = ecritureAlgebrique(a, b)
          formeAlgebrique = nombre
          partieReelle = `${a}`
          partieImaginaire = `${b}`
          break
        }
        case 'termesInverses': {
          const a = randint(-6, 6, 0)
          const b = randint(-6, 6, 0)
          const termeImaginaire =
            Math.abs(b) === 1 ? `${b < 0 ? '-' : ''}i` : `${b}i`
          nombre = `${termeImaginaire}${a > 0 ? '+' : ''}${a}`
          formeAlgebrique = ecritureAlgebrique(a, b)
          partieReelle = `${a}`
          partieImaginaire = `${b}`
          break
        }
        case 'quotientEntier': {
          const a = randint(-8, 8, 0)
          const b = randint(-8, 8, 0)
          const d = randint(2, 6)
          const re = new FractionEtendue(a, d)
          const im = new FractionEtendue(b, d)
          nombre = `\\dfrac{${ecritureAlgebrique(a, b)}}{${d}}`
          partieReelle = re.texFractionSimplifiee
          partieImaginaire = im.texFractionSimplifiee
          formeAlgebrique = `${partieReelle}${b > 0 ? '+' : ''}${partieImaginaire}i`
          break
        }
        case 'quotientRacine': {
          const a = randint(1, 6)
          const b = randint(1, 6)
          const n = choice([2, 3, 5, 6, 7])
          nombre = `\\dfrac{${b === 1 ? '' : b}i-${a}}{\\sqrt{${n}}}`
          partieReelle = `-\\dfrac{${a}}{\\sqrt{${n}}}`
          partieImaginaire = `\\dfrac{${b}}{\\sqrt{${n}}}`
          formeAlgebrique = `${partieReelle}+${partieImaginaire}i`
          break
        }
        case 'imaginairePur': {
          const b = randint(-9, 9, 0)
          nombre = Math.abs(b) === 1 ? `${b < 0 ? '-' : ''}i` : `${b}i`
          formeAlgebrique = `0${b > 0 ? '+' : ''}${nombre}`
          partieReelle = '0'
          partieImaginaire = `${b}`
          break
        }
        case 'zero':
          nombre = choice(['0', '0i', '0+0i'])
          formeAlgebrique = '0+0i'
          partieReelle = '0'
          partieImaginaire = '0'
          break
        case 'carreDeI': {
          const k = randint(0, 5)
          const exposant = 4 * k + 2
          nombre = `i^{${exposant}}`
          explication = 'Comme $i^2=-1$, on peut réduire cette puissance.'
          formeAlgebrique = `i^{${exposant}}=(i^2)^{${2 * k + 1}}=(-1)^{${2 * k + 1}}=-1`
          partieReelle = '-1'
          partieImaginaire = '0'
          break
        }
        case 'puissanceDeI':
        default: {
          const exposant = randint(5, 23, [6, 8, 10, 12, 14, 16, 18, 20, 22])
          const valeur = valeurPuissanceDeI(exposant)
          const reste = exposant % 4
          const quotient = Math.floor(exposant / 4)
          const puissanceDeI4 = quotient === 1 ? 'i^4' : `(i^4)^{${quotient}}`
          const puissanceRestante = reste === 1 ? 'i' : `i^{${reste}}`
          const valeurRestante = valeur.ecriture.startsWith('-')
            ? `(${valeur.ecriture})`
            : valeur.ecriture
          nombre = `i^{${exposant}}`
          explication = `Comme $i^2=-1$, on a $i^4=(i^2)^2=(-1)^2=1$.${reste === 3 ? ' De plus, $i^3=i^2\\times i=-i$.' : ''}`
          formeAlgebrique = `i^{${exposant}}=${puissanceDeI4}\\times ${puissanceRestante}=1\\times ${valeurRestante}=${valeur.ecriture}`
          partieReelle = valeur.partieReelle
          partieImaginaire = valeur.partieImaginaire
        }
      }

      let texte = `$z=${nombre}$`
      const estDejaSousFormeAlgebrique =
        typeQuestion === 'formeAlgebrique' ||
        typeQuestion === 'imaginairePur' ||
        typeQuestion === 'zero'
      const reecriture = estDejaSousFormeAlgebrique
        ? ''
        : `${explication === '' ? '' : `${explication}<br>`}On réécrit $z$ sous forme algébrique :<br>
      $z=${formeAlgebrique}$<br>`
      const texteCorr = `$z=${nombre}$<br>
      ${reecriture}${estDejaSousFormeAlgebrique ? 'On identifie' : 'Puis on identifie'} la partie réelle : $\\operatorname{Re}(z)=${miseEnEvidence(partieReelle)}$ et la partie imaginaire : $\\operatorname{Im}(z)=${miseEnEvidence(partieImaginaire)}$`

      if (this.interactif) {
        texte += `<br>${remplisLesBlancs(
          this,
          i,
          '\\operatorname{Re}(z)=%{champ1}\\quad;\\quad\\operatorname{Im}(z)=%{champ2}',
          KeyboardType.complexes,
        )}`
      }

      handleAnswers(
        this,
        i,
        {
          champ1: {
            value: partieReelle,
            compare: compareValeurReelle,
          },
          champ2: {
            value: partieImaginaire,
            compare: compareValeurReelle,
          },
        },
        { formatInteractif: 'fill-in-the-blank' },
      )

      if (this.questionJamaisPosee(i, nombre)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }

    listeQuestionsToContenu(this)
  }
}
