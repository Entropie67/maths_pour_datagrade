// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 2z3e5 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { handleAnswers } from '../../lib/interactif/gestionInteractif' // fonction qui va préparer l'analyse de la saisie
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive' // fonctions de mise en place des éléments interactifs
import { prenom } from '../../lib/outils/Personne'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnCouleur, miseEnEvidence } from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ce from '../../lib/interactif/comparisonFunctions'

import { bleuMathalea } from '../../lib/colors'
import {
  parseExpression,
  type Expression,
  type Operator,
} from '../../lib/mathFonctions/expression'
export const interactifReady = true

export const titre = 'Organiser des calculs en une seule ligne'
export const dateDePublication = '31/05/2024'

/**
 *
 * @author Guillaume Valmont
 */
export const uuid = '2z3e5'
export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}

export function rediger(
  expression1: string,
  signe: string,
  expression2: string,
): string {
  if (isNaN(Number(expression2))) expression2 = `( ${expression2} )`
  return `(${expression1}) ${signe} ${expression2}`
}

export function checkValue(
  nombreCible: number,
  nombresUtilises: number[],
  resultat: number[],
): boolean {
  if (nombreCible < 2) {
    return false
  }
  if (Math.floor(nombreCible) !== nombreCible) {
    return false
  }
  if (nombresUtilises.includes(nombreCible)) {
    return false
  }
  for (let i = 0; i < resultat.length; i++) {
    if (Math.floor(resultat[i]) !== resultat[i]) {
      return false
    }
    if (resultat[i] < 2) {
      return false
    }
    if (nombreCible === resultat[i]) {
      return false
    }
    if (nombresUtilises.includes(resultat[i])) {
      return false
    }
  }
  return true
}

export default class ExpressionsDepuisCalculsOld extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = false
    this.sup2 = '2'
    this.sup3 = false
    this.besoinFormulaireCaseACocher = ['Inclure des divisions']
    this.besoinFormulaire2Texte = [
      'Nombre de calculs (2 à 4) séparés par des tirets :',
      '2 : 2 opérations successives\n3 : 3 opérations successives\n4 : 4 opérations successives\n5 : Mélange',
    ]
    this.besoinFormulaire3CaseACocher = ['Sans parenthèses inutiles', false]
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = false
  }

  nouvelleVersion() {
    const avecDivision = !!this.sup
    const nbOps = gestionnaireFormulaireTexte({
      defaut: 2,
      saisie: this.sup2,
      min: 2,
      max: 4,
      melange: 5,
      nbQuestions: this.nbQuestions,
    }) as number[]
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 200; cpt++) {
      const A = randint(2, 9)
      const B = randint(2, 9, [A])
      const C = randint(2, 10, [A, B])
      const D = randint(2, 12, [A, B, C])
      const E = randint(2, 20, [A, B, C, D])
      const nombres = shuffle([A, B, C, D, E])
      const signes = avecDivision
        ? shuffle(['+', '-', '\\times', '\\div'])
        : combinaisonListes(['+', '-', '\\times'], 4)
      const calcul1 = `${nombres[0]} ${signes[0]} ${nombres[1]}`
      const calcul1EN: Expression = {
        operator: signes[0] as Operator,
        left: nombres[0],
        right: nombres[1],
      }
      const resultat1 = ce.parse(calcul1).simplify().latex
      const calcul2 = `${resultat1} ${signes[1]} ${nombres[2]}`
      const resultat2 = ce.parse(calcul2).simplify().latex
      const calcul3 = `${resultat2} ${signes[2]} ${nombres[3]}`
      const resultat3 = ce.parse(calcul3).simplify().latex
      const calcul4 = `${resultat3} ${signes[3]} ${nombres[4]}`
      const resultat4 = ce.parse(calcul4).simplify().latex

      let calculRedaction: Expression = ''
      let nombreCible: string
      let redaction: string
      let cd: string = '' // correction détaillée

      switch (Number(nbOps[i])) {
        case 2:
          nombreCible = resultat2
          redaction = rediger(calcul1, signes[1], nombres[2].toString())
          calculRedaction = {
            operator: signes[1] as Operator,
            left: calcul1EN,
            right: nombres[2],
          }
          if (
            !checkValue(
              Number(nombreCible),
              [nombres[1], nombres[2], nombres[0]],
              [Number(resultat1)],
            )
          ) {
            continue
          }
          if (this.sup3) redaction = parseExpression(calculRedaction) // sans parenthèse inutile
          cd = `
$${miseEnCouleur(`${calcul1} = ${resultat1}`, 'red')}$<br>
$${miseEnCouleur(`${miseEnCouleur(`\\overset{${calcul1}}{${resultat1}}`, 'red')} ${signes[1]} ${nombres[2]} = ${resultat2}`, bleuMathalea)}$<br>
<br>
$${miseEnCouleur(`(${calcul1})`, 'red')}${miseEnCouleur(`${signes[1]}${nombres[2]} = ${nombreCible}`, bleuMathalea)}$<br>
<br>
En supprimant les parenthèses inutiles, on peut écrire :<br> $${miseEnEvidence(parseExpression(calculRedaction))} = ${nombreCible}$<br>
`
          break
        case 3:
          nombreCible = resultat3
          redaction = rediger(
            rediger(calcul1, signes[1], nombres[2].toString()),
            signes[2],
            nombres[3].toString(),
          )
          calculRedaction = {
            operator: signes[2] as Operator,
            left: {
              operator: signes[1] as Operator,
              left: calcul1EN,
              right: nombres[2],
            },
            right: nombres[3],
          }
          if (
            !checkValue(
              Number(nombreCible),
              [nombres[1], nombres[2], nombres[0], nombres[3]],
              [Number(resultat1), Number(resultat2)],
            )
          ) {
            continue
          }
          if (this.sup3) redaction = parseExpression(calculRedaction) // sans parenthèse inutile
          cd = `
$${miseEnCouleur(`${calcul1} = ${resultat1}`, 'red')}$<br>
$${miseEnCouleur(`${miseEnCouleur(`\\overset{${calcul1}}{${resultat1}}`, 'red')} ${signes[1]} ${nombres[2]} = ${resultat2}`, bleuMathalea)}$<br>
$${miseEnCouleur(`${miseEnCouleur(`\\overset{(${miseEnCouleur(`(${calcul1})`, 'red')}${signes[1]}${nombres[2]})}{${resultat2}}`, bleuMathalea)} ${signes[2]} ${nombres[3]} = ${resultat3}`, 'green')}$<br>
<br>
$${miseEnCouleur(`${miseEnCouleur(`(${miseEnCouleur(`(${calcul1})`, 'red')}${signes[1]}${nombres[2]})`, bleuMathalea)}${signes[2]}${nombres[3]}=${resultat3}`, 'green')}$<br>
<br>
En supprimant les parenthèses inutiles, on peut écrire : <br> $${miseEnEvidence(parseExpression(calculRedaction))} = ${nombreCible}$<br>
`
          break
        case 4:
        default:
          nombreCible = resultat4
          redaction = rediger(
            rediger(
              rediger(calcul1, signes[1], nombres[2].toString()),
              signes[2],
              nombres[3].toString(),
            ),
            signes[3],
            nombres[4].toString(),
          )
          calculRedaction = {
            operator: signes[3] as Operator,
            left: {
              operator: signes[2] as Operator,
              left: {
                operator: signes[1] as Operator,
                left: calcul1EN,
                right: nombres[2],
              },
              right: nombres[3],
            },
            right: nombres[4],
          }
          if (
            !checkValue(
              Number(nombreCible),
              [nombres[1], nombres[2], nombres[0], nombres[3], nombres[3]],
              [Number(resultat1), Number(resultat2), Number(resultat3)],
            )
          ) {
            continue
          }
          if (this.sup3) redaction = parseExpression(calculRedaction) // sans parenthèse inutile
          cd = `
$${miseEnCouleur(`${calcul1} = ${resultat1}`, 'red')}$<br>
$${miseEnCouleur(`${miseEnCouleur(`\\overset{${calcul1}}{${resultat1}}`, 'red')} ${signes[1]} ${nombres[2]} = ${resultat2}`, bleuMathalea)}$<br>
$${miseEnCouleur(`${miseEnCouleur(`\\overset{(${miseEnCouleur(`(${calcul1})`, 'red')}${signes[1]}${nombres[2]})}{${resultat2}}`, bleuMathalea)} ${signes[2]} ${nombres[3]} = ${resultat3}`, 'green')}$<br>
$${miseEnCouleur(`\\overset{(${miseEnCouleur(`(${miseEnCouleur(`(${calcul1})`, 'red')}${signes[1]}${nombres[2]})`, bleuMathalea)}${signes[2]}${nombres[3]})}{${resultat3}}`, 'green')} ${signes[3]} ${nombres[4]} = ${nombreCible}$<br>
<br>
$${miseEnCouleur(`(${miseEnCouleur(`(${miseEnCouleur(`(${calcul1})`, 'red')}${signes[1]}${nombres[2]})`, bleuMathalea)}${signes[2]}${nombres[3]})`, 'green')} ${signes[3]} ${nombres[4]} = ${nombreCible}$<br>
<br>
En supprimant les parenthèses inutiles, on peut écrire : <br> $${miseEnEvidence(parseExpression(calculRedaction))} = ${nombreCible}$<br>
`
          break
      }

      const texteCorr = this.correctionDetaillee
        ? cd
        : `$${miseEnEvidence(redaction)} = ${nombreCible}$`

      const enonce = [
        `$${calcul1} = ${resultat1}$<br>`,
        `$${calcul2} = ${resultat2}$<br>`,
        `$${calcul3} = ${resultat3}$<br>`,
        `$${calcul4} = ${resultat4}$<br>`,
      ]
      const tirage = nombres.slice(0, nbOps[i] + 1)
      const texte = `${prenom()} a obtenu le nombre $${nombreCible}$ à partir des nombres suivants : ${tirage.map((n) => `$${n}$`).join(' ; ')}.<br>
Voici ses calculs :<br>${enonce.slice(0, nbOps[i]).join('\n')}
Les écrire en une seule ligne. ${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBaseAvecEgal)}`
      handleAnswers(this, i, {
        reponse: {
          value: redaction,
          options: { expressionNumerique: true },
        },
      })
      //   if (!this.correctionDetaillee) texteCorr = ''
      //   texteCorr += `$${miseEnEvidence(redaction)} = ${nombreCible}$`

      const nombreCibleValide = Number(nombreCible) < 100 * Number(nbOps[i])
      if (
        this.questionJamaisPosee(i, ...nombres, ...signes, redaction) &&
        nombreCibleValide
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
