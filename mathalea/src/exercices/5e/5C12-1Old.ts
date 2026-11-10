import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ce from '../../lib/interactif/comparisonFunctions'
import { handleAnswers } from '../../lib/interactif/gestionInteractif' // fonction qui va préparer l'analyse de la saisie
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive' // fonctions de mise en place des éléments interactifs
import {
  parseExpression,
  type Expression,
  type Operator,
} from '../../lib/mathFonctions/expression'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import { lister } from '../../lib/outils/ecritures'
import { miseEnCouleur, miseEnEvidence } from '../../lib/outils/embellissements'
import { prenom } from '../../lib/outils/Personne'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const interactifReady = true

export const titre = 'Organiser des calculs en une seule ligne'
export const dateDePublication = '31/05/2024'

/**
 *
 * @author Guillaume Valmont
 */
export const uuid = '2b06d'
export const refs = {
  'fr-fr': [''],
  'fr-2016': ['6C33-1'],
  'fr-ch': ['NR'],
}
export default class OrganiserDesCalculsEnUneSeuleLigne extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = false
    this.besoinFormulaireCaseACocher = ['Inclure des divisions']
    this.besoinFormulaire2Texte = [
      'Nombre de calculs (2 à 4) séparés par des tirets :',
      '2 : 2 opérations successives\n3 : 3 opérations successives\n4 : 4 opérations successives\n5 : Mélange',
    ]
    this.besoinFormulaire3CaseACocher = ['Sans parenthèses inutiles', false]
    this.sup2 = '4'
    this.sup3 = false
    // Ce paramètre n'aura de sens que si la correction fournie ne comporte pas de parenthèses inutiles conformément au paramètre
    // this.besoinFormulaire3CaseACocher = ['Sanctionner les parenthèses inutiles', false]
    // this.sup3 = false
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = false
  }

  nouvelleVersion() {
    const avecDivision = !!this.sup
    const nombreDeCalculs = gestionnaireFormulaireTexte({
      shuffle: false,
      saisie: this.sup2,
      nbQuestions: this.nbQuestions,
      min: 2,
      max: 4,
      defaut: 4,
      melange: 5,
    }).map(Number)
    const typeQuestionsDisponibles = [
      'Enchaînement simple',
      '1 -> 3',
      '1 -> 4',
      '2 -> 4',
    ]

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 200; cpt++) {
      const A = randint(2, 10)
      const B = randint(2, 10, [A])
      const C = randint(2, 14, [A, B])
      const D = randint(2, 16, [A, B, C])
      const E = randint(2, 20, [A, B, C, D])
      const nombres = shuffle([A, B, C, D, E])
      let nombresUtilises = nombres.slice(0, 3)
      const signes = avecDivision
        ? shuffle(['+', '-', '\\times', '\\div'])
        : combinaisonListes(['+', '-', '\\times'], 4)
      let calcul1: string
      let calcul2: string
      let calcul3: string
      let calcul4: string
      let resultat1: string
      let resultat2: string
      let resultat3: string
      let nombreCible: string
      let redaction: string
      let texteCorr: string
      let derniereLigneCorrection: string
      let calculs: string
      switch (Number(nombreDeCalculs[i])) {
        case 2:
          switch (listeTypeQuestions[i]) {
            case '1 -> 3':
            case '2 -> 4': {
              // c'est juste pour équilibrer les cas
              calcul1 = `${nombres[1]} ${signes[0]} ${nombres[2]}`
              const calcul1EN: Expression = {
                operator: signes[0] as Operator,
                left: nombres[1],
                right: nombres[2],
              }
              resultat1 = ce.parse(calcul1).simplify().latex
              calcul2 =
                signes[1] === '+' || signes[1] === '\\times'
                  ? `${resultat1} ${signes[1]} ${nombres[0]}`
                  : `${nombres[0]} ${signes[1]} ${resultat1}`
              const calcul2EN: Expression =
                signes[1] === '+' || signes[1] === '\\times'
                  ? {
                      operator: signes[1] as Operator,
                      left: calcul1EN,
                      right: nombres[0],
                    }
                  : {
                      operator: signes[1] as Operator,
                      left: nombres[0],
                      right: calcul1EN,
                    }
              resultat2 = ce.parse(calcul2).simplify().latex
              nombreCible = resultat2
              if (
                !checkValue(
                  Number(nombreCible),
                  [nombres[1], nombres[2], nombres[0]],
                  [Number(resultat1)],
                )
              ) {
                continue
              }
              redaction =
                signes[1] === '+' || signes[1] === '\\times'
                  ? rediger(calcul1, signes[1], nombres[0].toString())
                  : rediger(nombres[0].toString(), signes[1], calcul1)
              if (this.sup3) redaction = parseExpression(calcul2EN) // sans parenthèse inutile
              texteCorr = `$${miseEnCouleur(`${calcul1} = ${resultat1}`, 'red')}$<br>
$${miseEnCouleur(`${nombres[0]} ${signes[1]}${miseEnCouleur(`\\overset{${calcul1}}{${resultat1}}`, 'red')} = ${resultat2}`, 'green')}$<br><br>`
              break
            }
            default: {
              calcul1 = `${nombres[0]} ${signes[0]} ${nombres[1]}`
              resultat1 = ce.parse(calcul1).simplify().latex
              const calcul1EN: Expression = {
                operator: signes[0] as Operator,
                left: nombres[0],
                right: nombres[1],
              }
              calcul2 = `${resultat1} ${signes[1]} ${nombres[2]}`
              const calcul2EN: Expression = {
                operator: signes[1] as Operator,
                left: calcul1EN,
                right: nombres[2],
              }
              resultat2 = ce.parse(calcul2).simplify().latex
              nombreCible = resultat2
              if (
                !checkValue(
                  Number(nombreCible),
                  [nombres[0], nombres[1], nombres[2]],
                  [Number(resultat1)],
                )
              ) {
                continue
              }
              redaction = rediger(calcul1, signes[1], nombres[2].toString())
              if (this.sup3) redaction = parseExpression(calcul2EN) // sans parenthèse inutile
              texteCorr = `$${miseEnCouleur(`${calcul1} = ${resultat1}`, 'red')}$<br>
$${miseEnCouleur(`${miseEnCouleur(`\\overset{${calcul1}}{${resultat1}}`, 'red')} ${signes[1]} ${nombres[2]} = ${resultat2}`, bleuMathalea)}$<br>
`
              break
            }
          }
          calculs = `$${calcul1}=${resultat1}$<br>$${calcul2}=${resultat2}$<br>`
          nombresUtilises = nombres.slice(0, 3)
          break
        case 3:
          switch (listeTypeQuestions[i]) {
            case '1 -> 3':
            case '2 -> 4': {
              // c'est juste pour équilibrer les cas
              calcul1 = `${nombres[0]} ${signes[0]} ${nombres[1]}`
              const calcul1EN: Expression = {
                operator: signes[0] as Operator,
                left: nombres[0],
                right: nombres[1],
              }
              resultat1 = ce.parse(calcul1).simplify().latex
              calcul2 = `${nombres[2]} ${signes[1]} ${nombres[3]}`
              const calcul2EN: Expression = {
                operator: signes[1] as Operator,
                left: nombres[2],
                right: nombres[3],
              }
              resultat2 = ce.parse(calcul2).simplify().latex
              calcul3 = `${resultat1} ${signes[2]} ${resultat2}`
              const calcul3EN: Expression = {
                operator: signes[2] as Operator,
                left: calcul1EN,
                right: calcul2EN,
              }
              resultat3 = ce.parse(calcul3).simplify().latex
              nombreCible = resultat3
              redaction = rediger(calcul1, signes[2], calcul2)
              if (
                !checkValue(
                  Number(nombreCible),
                  [nombres[0], nombres[1], nombres[2], nombres[3]],
                  [Number(resultat1), Number(resultat2)],
                )
              ) {
                continue
              }
              if (this.sup3) redaction = parseExpression(calcul3EN) // sans parenthèse inutile
              texteCorr = `
$${miseEnCouleur(`${calcul1} = ${resultat1}`, 'red')}$<br>
$${miseEnCouleur(`${calcul2} = ${resultat2}`, bleuMathalea)}$<br>
$${miseEnCouleur(`${miseEnCouleur(`\\overset{${calcul1}}{${resultat1}}`, 'red')} ${signes[2]} ${miseEnCouleur(`\\overset{${calcul2}}{${resultat2}}`, bleuMathalea)} = ${resultat3}`, 'green')}$<br>
$${miseEnCouleur(`(${calcul1})`, 'red')} ${signes[2]} ${miseEnCouleur(`${miseEnCouleur(`(${calcul2})`, bleuMathalea)} = ${nombreCible}`, 'green')}$<br><br>`
              break
            }
            default: {
              calcul1 = `${nombres[0]} ${signes[0]} ${nombres[1]}`
              const calcul1EN: Expression = {
                operator: signes[0] as Operator,
                left: nombres[0],
                right: nombres[1],
              }
              resultat1 = ce.parse(calcul1).simplify().latex
              calcul2 = `${resultat1} ${signes[1]} ${nombres[2]}`
              const calcul2EN: Expression = {
                operator: signes[1] as Operator,
                left: calcul1EN,
                right: nombres[2],
              }
              resultat2 = ce.parse(calcul2).simplify().latex
              calcul3 = `${resultat2} ${signes[2]} ${nombres[3]}`
              resultat3 = ce.parse(calcul3).simplify().latex
              nombreCible = resultat3
              const calcul3EN: Expression = {
                operator: signes[2] as Operator,
                left: calcul2EN,
                right: nombres[3],
              }
              if (
                !checkValue(
                  Number(nombreCible),
                  [nombres[0], nombres[1], nombres[2], nombres[3]],
                  [Number(resultat1), Number(resultat2)],
                )
              ) {
                continue
              }
              redaction = rediger(
                rediger(calcul1, signes[1], nombres[2].toString()),
                signes[2],
                nombres[3].toString(),
              )
              if (this.sup3) redaction = parseExpression(calcul3EN) // sans parenthèse inutile
              texteCorr = `$${miseEnCouleur(`${calcul1} = ${resultat1}`, 'red')}$<br>
$${miseEnCouleur(`${miseEnCouleur(`\\overset{${calcul1}}{${resultat1}}`, 'red')} ${signes[1]} ${nombres[2]} = ${resultat2}`, bleuMathalea)}$<br><br>
$${miseEnCouleur(`${miseEnCouleur(`\\overset{${miseEnCouleur(`(${calcul1})`, 'red')} ${signes[1]} ${nombres[2]}}{${resultat2}}`, bleuMathalea)} ${signes[2]} ${nombres[2]} = ${resultat3}`, 'green')}$<br><br>
`
              derniereLigneCorrection = miseEnCouleur(
                `(${miseEnCouleur(`(${calcul1})`, 'red')}${signes[1]}${nombres[2]})`,
                bleuMathalea,
              )
              derniereLigneCorrection = miseEnCouleur(
                `(${derniereLigneCorrection}${signes[2]}${nombres[3]})`,
                'green',
              )
              texteCorr += `$ ${derniereLigneCorrection} = ${nombreCible}$<br><br>`
              break
            }
          }
          calculs = `$${calcul1}=${resultat1}$<br>$${calcul2}=${resultat2}$<br>$${calcul3}=${resultat3}$<br>`
          nombresUtilises = nombres.slice(0, 4)
          break
        default:
          switch (listeTypeQuestions[i]) {
            case '1 -> 3': {
              const calcul1EN: Expression = {
                operator: signes[0] as Operator,
                left: nombres[0],
                right: nombres[1],
              }
              calcul1 = `${nombres[0]} ${signes[0]} ${nombres[1]}`
              resultat1 = ce.parse(calcul1).simplify().latex
              calcul2 = `${nombres[2]} ${signes[1]} ${nombres[3]}`
              const calcul2EN: Expression = {
                operator: signes[1] as Operator,
                left: nombres[2],
                right: nombres[3],
              }
              resultat2 = ce.parse(calcul2).simplify().latex
              calcul3 = `${resultat1} ${signes[2]} ${nombres[4]}`
              const calcul3EN: Expression = {
                operator: signes[2] as Operator,
                left: calcul1EN,
                right: nombres[4],
              }
              resultat3 = ce.parse(calcul3).simplify().latex
              calcul4 = `${resultat2} ${signes[3]} ${resultat3}`
              const calcul4EN: Expression = {
                operator: signes[3] as Operator,
                left: calcul2EN,
                right: calcul3EN,
              }
              nombreCible = ce.parse(calcul4).simplify().latex
              if (
                !checkValue(
                  Number(nombreCible),
                  [nombres[0], nombres[1], nombres[2], nombres[3], nombres[4]],
                  [Number(resultat1), Number(resultat2), Number(resultat3)],
                )
              ) {
                continue
              }
              redaction = rediger(
                calcul2,
                signes[3],
                rediger(calcul1, signes[2], nombres[4].toString()),
              )
              if (this.sup3) redaction = parseExpression(calcul4EN) // sans parenthèse inutile
              texteCorr = `
$${miseEnCouleur(`${calcul1} = ${resultat1}`, 'red')}$<br>
$${miseEnCouleur(`${calcul2} = ${resultat2}`, bleuMathalea)}$<br>
$${miseEnCouleur(`${miseEnCouleur(`\\overset{${calcul1}}{${resultat1}}`, 'red')} ${signes[2]} ${nombres[4]} = ${resultat3}`, 'green')}$<br>
$${miseEnCouleur(`\\overset{${calcul2}}{${resultat2}}`, bleuMathalea)} ${signes[3]} ${miseEnCouleur(`\\overset{${miseEnCouleur(`(${calcul1})`, 'red')} ${signes[2]} ${nombres[4]}}{${resultat3}}`, 'green')} = ${nombreCible}$<br>
<br>
$${miseEnCouleur(`(${calcul2})`, bleuMathalea)} ${signes[3]} ${miseEnCouleur(`(${miseEnCouleur(`(${calcul1})`, 'red')} ${signes[2]} ${nombres[4]})`, 'green')} = ${nombreCible}$<br>
<br>
`
              break
            }
            case '1 -> 4': {
              calcul1 = `${nombres[0]} ${signes[0]} ${nombres[1]}`
              const calcul1EN: Expression = {
                operator: signes[0] as Operator,
                left: nombres[0],
                right: nombres[1],
              }
              resultat1 = ce.parse(calcul1).simplify().latex
              calcul2 = `${nombres[2]} ${signes[1]} ${nombres[3]}`
              const calcul2EN: Expression = {
                operator: signes[1] as Operator,
                left: nombres[2],
                right: nombres[3],
              }
              resultat2 = ce.parse(calcul2).simplify().latex
              calcul3 = `${resultat2} ${signes[2]} ${nombres[4]}`
              const calcul3EN: Expression = {
                operator: signes[2] as Operator,
                left: calcul2EN,
                right: nombres[4],
              }
              resultat3 = ce.parse(calcul3).simplify().latex
              calcul4 = `${resultat1} ${signes[3]} ${resultat3}`
              const calcul4EN: Expression = {
                operator: signes[3] as Operator,
                left: calcul1EN,
                right: calcul3EN,
              }
              nombreCible = ce.parse(calcul4).simplify().latex
              if (
                !checkValue(
                  Number(nombreCible),
                  [nombres[0], nombres[1], nombres[2], nombres[3], nombres[4]],
                  [Number(resultat1), Number(resultat2), Number(resultat3)],
                )
              ) {
                continue
              }
              redaction = rediger(
                calcul1,
                signes[3],
                rediger(calcul2, signes[2], nombres[4].toString()),
              )
              if (this.sup3) redaction = parseExpression(calcul4EN) // sans parenthèse inutile
              texteCorr = `
$${miseEnCouleur(`${calcul1} = ${resultat1}`, 'red')}$<br>
$${miseEnCouleur(`${calcul2} = ${resultat2}`, bleuMathalea)}$<br>
$${miseEnCouleur(`${miseEnCouleur(`\\overset{${calcul2}}{${resultat2}}`, bleuMathalea)} ${signes[2]} ${nombres[4]} = ${resultat3}`, 'green')}$<br>
$${miseEnCouleur(`\\overset{${calcul1}}{${resultat1}}`, 'red')} ${signes[3]} ${miseEnCouleur(`\\overset{${miseEnCouleur(`(${calcul2})`, bleuMathalea)} ${signes[2]} ${nombres[4]}}{${resultat3}}`, 'green')} = ${nombreCible}$<br>
<br>
$${miseEnCouleur(`(${calcul1})`, 'red')} ${signes[3]} ${miseEnCouleur(`(${miseEnCouleur(`(${calcul2})`, bleuMathalea)} ${signes[2]} ${nombres[4]})`, 'green')} = ${nombreCible}$<br>
<br>
`
              break
            }
            case '2 -> 4': {
              calcul1 = `${nombres[0]} ${signes[0]} ${nombres[1]}`
              const calcul1EN: Expression = {
                operator: signes[0] as Operator,
                left: nombres[0],
                right: nombres[1],
              }
              resultat1 = ce.parse(calcul1).simplify().latex
              calcul2 = `${resultat1} ${signes[1]} ${nombres[2]}`
              const calcul2EN: Expression = {
                operator: signes[1] as Operator,
                left: calcul1EN,
                right: nombres[2],
              }
              resultat2 = ce.parse(calcul2).simplify().latex
              calcul3 = `${nombres[3]} ${signes[2]} ${nombres[4]}`
              const calcul3EN: Expression = {
                operator: signes[2] as Operator,
                left: nombres[3],
                right: nombres[4],
              }
              resultat3 = ce.parse(calcul3).simplify().latex
              calcul4 = `${resultat2} ${signes[3]} ${resultat3}`
              const calcul4EN: Expression = {
                operator: signes[3] as Operator,
                left: calcul2EN,
                right: calcul3EN,
              }
              nombreCible = ce.parse(calcul4).simplify().latex
              if (
                !checkValue(
                  Number(nombreCible),
                  [nombres[0], nombres[1], nombres[2], nombres[3], nombres[4]],
                  [Number(resultat1), Number(resultat2), Number(resultat3)],
                )
              ) {
                continue
              }
              redaction = rediger(
                rediger(calcul1, signes[1], nombres[2].toString()),
                signes[3],
                calcul3,
              )
              if (this.sup3) redaction = parseExpression(calcul4EN) // sans parenthèse inutile
              texteCorr = `
$${miseEnCouleur(`${calcul1} = ${resultat1}`, 'red')}$<br>
$${miseEnCouleur(`${miseEnCouleur(`\\overset{${calcul1}}{${resultat1}}`, 'red')} ${signes[1]} ${nombres[2]} = ${resultat2}`, bleuMathalea)}$<br>
$${miseEnCouleur(`${calcul3} = ${resultat3}`, 'green')}$<br>
$${miseEnCouleur(`\\overset{${miseEnCouleur(`(${calcul1})`, 'red')} ${signes[1]} ${nombres[2]}}{${resultat2}}`, bleuMathalea)} ${signes[3]} ${miseEnCouleur(`\\overset{${calcul3}}{${resultat3}}`, 'green')} = ${nombreCible}$<br>
<br>
$${miseEnCouleur(`(${miseEnCouleur(`(${calcul1})`, 'red')} ${signes[1]} ${nombres[2]})`, bleuMathalea)} ${signes[3]} ${miseEnCouleur(`(${calcul3})`, 'green')} = ${nombreCible}$<br>
<br>
`
              break
            }
            default: {
              calcul1 = `${nombres[0]} ${signes[0]} ${nombres[1]}`
              const calcul1EN: Expression = {
                operator: signes[0] as Operator,
                left: nombres[0],
                right: nombres[1],
              }
              resultat1 = ce.parse(calcul1).simplify().latex
              calcul2 = `${resultat1} ${signes[1]} ${nombres[2]}`
              const calcul2EN: Expression = {
                operator: signes[1] as Operator,
                left: calcul1EN,
                right: nombres[2],
              }
              resultat2 = ce.parse(calcul2).simplify().latex
              calcul3 = `${resultat2} ${signes[2]} ${nombres[3]}`
              const calcul3EN: Expression = {
                operator: signes[2] as Operator,
                left: calcul2EN,
                right: nombres[3],
              }
              resultat3 = ce.parse(calcul3).simplify().latex
              calcul4 = `${resultat3} ${signes[3]} ${nombres[4]}`
              const calcul4EN: Expression = {
                operator: signes[3] as Operator,
                left: calcul3EN,
                right: nombres[4],
              }
              nombreCible = ce.parse(calcul4).simplify().latex
              if (
                !checkValue(
                  Number(nombreCible),
                  [nombres[0], nombres[1], nombres[2], nombres[3], nombres[4]],
                  [Number(resultat1), Number(resultat2), Number(resultat3)],
                )
              ) {
                continue
              }
              redaction = rediger(
                rediger(
                  rediger(calcul1, signes[1], nombres[2].toString()),
                  signes[2],
                  nombres[3].toString(),
                ),
                signes[3],
                nombres[4].toString(),
              )
              if (this.sup3) redaction = parseExpression(calcul4EN) // sans parenthèse inutile

              texteCorr = `$${miseEnCouleur(`${calcul1} = ${resultat1}`, 'red')}$<br>
$${miseEnCouleur(`${miseEnCouleur(`\\overset{${calcul1}}{${resultat1}}`, 'red')} ${signes[1]} ${nombres[2]} = ${resultat2}`, bleuMathalea)}$<br>`
              texteCorr += `$${miseEnCouleur(`\\overset{${miseEnCouleur(`${miseEnCouleur(`(${calcul1})`, 'red')} ${signes[1]} ${nombres[2]}`, bleuMathalea)}}{${miseEnCouleur(resultat2, bleuMathalea)}} ${signes[2]} ${nombres[3]} = ${resultat3}`, 'green')}$<br>`
              texteCorr += `$${miseEnCouleur(`\\overset{(${miseEnCouleur(`(${miseEnCouleur(`(${calcul1})`, 'red')}${signes[1]}${nombres[2]})`, bleuMathalea)}${signes[2]}${nombres[3]})}{${resultat3}}`, 'green')} ${signes[3]} ${nombres[4]} = ${nombreCible}$<br><br>`
              derniereLigneCorrection = miseEnCouleur(
                `(${miseEnCouleur(`(${calcul1})`, 'red')}${signes[1]}${nombres[2]})`,
                bleuMathalea,
              )
              derniereLigneCorrection = miseEnCouleur(
                `(${derniereLigneCorrection}${signes[2]}${nombres[3]})`,
                'green',
              )
              derniereLigneCorrection = `${derniereLigneCorrection}${signes[3]}${nombres[4]}`
              texteCorr += `$ ${derniereLigneCorrection} = ${nombreCible}$<br><br>`
              break
            }
          }
          calculs = `$${calcul1}=${resultat1}$<br>$${calcul2}=${resultat2}$<br>$${calcul3}=${resultat3}$<br>$${calcul4}=${nombreCible}$<br>`
          nombresUtilises = nombres.slice()
          break
      }
      const texte = `${prenom()} a obtenu le nombre ${nombreCible} à partir des nombres suivants : ${lister(nombresUtilises)}.<br>
Voici ses calculs :<br>
${calculs}
Les écrire en une seule ligne. ${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)}`

      const expressionReduite = ce.parse(redaction, {
        form: 'canonical',
      }).latex
      handleAnswers(this, i, {
        reponse: {
          value: [expressionReduite, redaction],
          options: { calculFormel: true },
        },
      })
      if (!this.correctionDetaillee) texteCorr = ''
      texteCorr += `$${miseEnEvidence(redaction)} = ${nombreCible}$`
      /* On ne peut pas proposer cette expression à des 6e car computeEngine n'écrit pas les multiplications implicites et place les négatifs en premier dans une somme
      if (noUselessParen) {
        texteCorr += `<br>En supprimant les parenthèses inutiles, on peut écrire : $${miseEnEvidence(expressionReduite)} = ${nombreCible}$`
      }
       */

      const nombreCibleValide =
        Number(nombreCible) < 100 * Number(nombreDeCalculs[i])
      if (
        this.questionJamaisPosee(
          i,
          ...nombres,
          ...signes,
          listeTypeQuestions[i],
        ) &&
        nombreCibleValide
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
        cpt = 0
      }
    }
    listeQuestionsToContenu(this)

    function rediger(
      expression1: string,
      signe: string,
      expression2: string,
    ): string {
      const expression2New = Number.isNaN(Number(expression2))
        ? `( ${expression2} )`
        : expression2
      return `(${expression1}) ${signe} ${expression2New}`
    }

    function checkValue(
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
  }
}
