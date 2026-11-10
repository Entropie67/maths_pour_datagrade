import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const interactifReady = true
export const interactifType = 'mathLive'

export const titre = 'Effectuer des calculs avec la notation scientifique'
export const dateDePublication = '20/10/2026' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '05/11/2026'

/**
 * Calculs avec la notation scientifique
 * @author Michael Rossel

 * 2026-10-20
*/
export const uuid = '0ec6a'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['PRQNO07C-12', 'PRQNO15C-10', '11LSNO3A-1'],
}
export default class CalculsPuissancesDe10 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Opérations',
      '1 : Addition\n2 : Soustraction\n3 : Division\n4 : Multiplication\n5 : Mélange',
    ]

    this.besoinFormulaire2Numerique = [
      'Niveau de difficulté',
      3,
      '1 : Facile\n2 : Moyen\n3 : Difficile',
    ]
    this.besoinFormulaire3Numerique = [
      'Nombres de départ en notation scientifique',
      2,
      '1 : Oui\n2 : Non',
    ]
    this.besoinFormulaire4Numerique = [
      'Signe des exposants',
      3,
      '1 : Positive\n2 : Négative\n3 : Mélange',
    ]

    this.sup = 5
    this.sup2 = 1
    this.sup3 = 2
    this.sup4 = 3

    this.nbQuestions = 4
    this.correctionDetailleeDisponible = true // booléen qui indique si une correction détaillée est disponible.
    this.correctionDetaillee = false // booléen indiquant si la correction détaillée doit être affiché par défaut (récupéré dans l'url avec le paramètre `,cd=`).

    this.consigne = 'Calculer et donner le résultat en notation scientifique.'
  }

  NotationScientifique(nombre: number): [number, number] {
    if (!Number.isFinite(nombre) || nombre === 0) {
      throw new RangeError(
        'La notation scientifique exige un nombre fini non nul.',
      )
    }
    let mantisse = new Decimal(nombre)
    let exposant = 0
    while (mantisse.abs().lt(1)) {
      mantisse = mantisse.times(10)
      exposant--
    }
    while (mantisse.abs().gte(10)) {
      mantisse = mantisse.div(10)
      exposant++
    }
    return [mantisse.toNumber(), exposant]
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      listeOfCase: ['Addition', 'Soustraction', 'Division', 'Multiplication'],
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
    }).map(String)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      cpt++
      let texte = ''
      const etapes: { calcul: string; commentaire?: string }[] = []
      let reponse: string | undefined
      let a: number
      let b: number
      const signe = () =>
        this.sup4 === 1
          ? 1
          : this.sup4 === 2
            ? -1
            : randint(0, 1) === 0
              ? -1
              : 1

      let exposants: [number, number]
      let mantisses: [number, number]
      const precision = 10 ** (this.sup2 - 1)
      if (
        listeTypeDeQuestions[i] === 'Addition' ||
        listeTypeDeQuestions[i] === 'Soustraction'
      ) {
        // Exposants
        const decalageExposant =
          this.sup2 === 1 ? 0 : this.sup2 === 2 ? randint(1, 2) : randint(2, 4)
        const premierSigne = signe()
        const secondSigne = signe()
        const ordre = randint(0, 1)
        const exposant = randint(1, 7)
        exposants =
          ordre == 0
            ? [
                premierSigne * exposant + secondSigne * decalageExposant,
                premierSigne * exposant,
              ]
            : [
                premierSigne * exposant,
                premierSigne * exposant + secondSigne * decalageExposant,
              ]
        // Mantisses
        a = randint(precision, 10 * precision - 1)
        b = randint(precision, 10 * precision - 1)
        if (this.sup3 === 1) {
          // Notation scientifique.
          mantisses = [a / precision, b / precision]
        } else {
          // À exposant commun, limiter l'écart des ordres de grandeur à 0, 1 ou 2.
          const ecartMaximum = this.sup2 - 1
          const ecartFinal = randint(-ecartMaximum, ecartMaximum)
          const decalageMantisse1 = randint(-3, 3)
          const decalageMantisse2 =
            decalageMantisse1 + exposants[0] - exposants[1] - ecartFinal
          mantisses = [
            new Decimal(a)
              .div(precision)
              .times(new Decimal(10).pow(decalageMantisse1))
              .toNumber(),
            new Decimal(b)
              .div(precision)
              .times(new Decimal(10).pow(decalageMantisse2))
              .toNumber(),
          ]
        }
        // Aligner les deux termes sur le plus grand exposant, dans l'ordre initial.
        const exposantMax = Math.max(...exposants)
        const mantissesCommunes = mantisses.map((mantisse, index) =>
          new Decimal(mantisse).times(
            new Decimal(10).pow(exposants[index] - exposantMax),
          ),
        )
        const operation = listeTypeDeQuestions[i] === 'Addition' ? '+' : '-'
        const resultat = (
          operation === '+'
            ? mantissesCommunes[0].plus(mantissesCommunes[1])
            : mantissesCommunes[0].minus(mantissesCommunes[1])
        ).toNumber()
        // Zéro n'a pas d'écriture scientifique normalisée : tirer une autre question.
        if (resultat === 0) continue

        const [mantisseReponse, decalageReponse] =
          this.NotationScientifique(resultat)
        const exposantReponse = decalageReponse + exposantMax
        const formatNombre = (nombre: number) =>
          texNombre(new Decimal(nombre), 15)
        reponse = `${formatNombre(mantisseReponse)} \\times 10^{${exposantReponse}}`
        const expression = `${formatNombre(mantisses[0])} \\times 10^{${exposants[0]}} ${operation} ${formatNombre(mantisses[1])} \\times 10^{${exposants[1]}}`
        texte = `$${expression}=$`
        etapes.push({ calcul: expression })
        if (exposants[0] !== exposants[1]) {
          const termes = mantisses.map((mantisse, index) => {
            const decalage = exposants[index] - exposantMax
            return `${formatNombre(mantisse)}${decalage === 0 ? '' : ` \\times 10^{${decalage}}`} \\times 10^{${exposantMax}}`
          })
          etapes.push({
            calcul: `${termes[0]} ${operation} ${termes[1]}`,
            commentaire:
              "Modifier les nombres pour qu'ils aient le même exposant.",
          })
        }
        etapes.push({
          calcul: `(${formatNombre(mantissesCommunes[0].toNumber())} ${operation} ${formatNombre(mantissesCommunes[1].toNumber())}) \\times 10^{${exposantMax}}`,
          commentaire: `${operation === '+' ? 'Additionner' : 'Soustraire'} les coefficients.`,
        })
        if (decalageReponse !== 0) {
          const coefficient =
            resultat < 0
              ? `(${formatNombre(resultat)})`
              : formatNombre(resultat)
          etapes.push({
            calcul: `${coefficient} \\times 10^{${exposantMax}}`,
          })
        }
      } else {
        // Exposants
        const maximum = this.sup2 === 1 ? 5 : 9
        const premierSigne = signe()
        const secondSigne = this.sup2 === 1 ? premierSigne : signe()
        exposants = [
          premierSigne * randint(1, maximum),
          secondSigne * randint(1, maximum),
        ]
        // Construire les calculs à partir des tables de 1 à 15.
        const division = listeTypeDeQuestions[i] === 'Division'
        const facile = this.sup2 === 1
        if (facile && this.sup3 === 1) {
          // Des coefficients entiers entre 1 et 9, même pour le numérateur.
          b = randint(1, 9)
          a = randint(1, division ? Math.floor(9 / b) : 9)
        } else {
          a = randint(1, 15)
          b = randint(1, 15)
        }
        // En division, le numérateur est un multiple du dénominateur.
        mantisses = division ? [a * b, b] : [a, b]
        if (this.sup3 === 1) {
          mantisses = mantisses.map(
            (coefficient) => this.NotationScientifique(coefficient)[0],
          ) as [number, number]
        } else if (!facile) {
          // Déplacer les virgules sans augmenter la difficulté des tables utilisées.
          const ecartMaximum = this.sup2 === 2 ? 1 : 2
          mantisses = mantisses.map((coefficient) =>
            new Decimal(coefficient)
              .times(new Decimal(10).pow(randint(-ecartMaximum, ecartMaximum)))
              .toNumber(),
          ) as [number, number]
        }
        const formatNombre = (nombre: number) =>
          texNombre(new Decimal(nombre), 15)
        const termes = mantisses.map(
          (coefficient, index) =>
            `${formatNombre(coefficient)} \\times 10^{${exposants[index]}}`,
        )
        const expression = division
          ? `\\dfrac{${termes[0]}}{${termes[1]}}`
          : `${termes[0]} \\times ${termes[1]}`
        texte = `$${expression}=$`
        const coefficient = (
          division
            ? new Decimal(mantisses[0]).div(mantisses[1])
            : new Decimal(mantisses[0]).times(mantisses[1])
        ).toNumber()
        const exposant = division
          ? exposants[0] - exposants[1]
          : exposants[0] + exposants[1]
        const [mantisseReponse, decalageReponse] =
          this.NotationScientifique(coefficient)
        reponse = `${formatNombre(mantisseReponse)} \\times 10^{${exposant + decalageReponse}}`
        etapes.push({ calcul: expression })
        const calculCoefficient = division
          ? `\\dfrac{${formatNombre(mantisses[0])}}{${formatNombre(mantisses[1])}}`
          : `(${formatNombre(mantisses[0])} \\times ${formatNombre(mantisses[1])})`
        const secondExposant =
          exposants[1] < 0 ? `(${exposants[1]})` : String(exposants[1])
        const calculExposant = `${exposants[0]} ${division ? '-' : '+'} ${secondExposant}`
        etapes.push({
          calcul: `${calculCoefficient} \\times 10^{${calculExposant}}`,
          commentaire: division
            ? 'Diviser les coefficients et soustraire les exposants.'
            : 'Multiplier les coefficients et additionner les exposants.',
        })
        // Montrer les résultats des deux calculs avant la normalisation éventuelle.
        if (decalageReponse !== 0) {
          etapes.push({
            calcul: `${formatNombre(coefficient)} \\times 10^{${exposant}}`,
          })
        }
      }

      etapes.push({
        calcul: miseEnEvidence(reponse),
        commentaire: 'Donner le résultat en notation scientifique.',
      })
      const texteCorr = this.correctionDetaillee
        ? `$${etapes[0].calcul}$<br>$\\qquad\\begin{array}{rll}${etapes
            .slice(1)
            .map(
              ({ calcul, commentaire }) =>
                `= & ${calcul} & ${commentaire ? `\\text{${commentaire}}` : ''}`,
            )
            .join('\\\\[0.5em]')}\\end{array}$`
        : `$${etapes.map(({ calcul }) => calcul).join('=')}$`

      if (texte === '') continue

      if (this.questionJamaisPosee(i, texte)) {
        // Si la question n'a jamais été posée, on en crée une autre
        if (this.interactif) {
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierFullOperations,
          )
        }

        handleAnswers(this, i, {
          reponse: {
            value: reponse,
            options: { ecritureScientifique: true },
          },
        })

        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }

    listeQuestionsToContenu(this)
  }
}
