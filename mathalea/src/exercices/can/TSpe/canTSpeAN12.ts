import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { fraction } from '../../../modules/fractions'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Résoudre des inéquations du type a^x<b'
export const dateDePublication = '4/5/2024'
export const uuid = 'ce764'
export const interactifReady = true

export const refs = {
  'fr-fr': ['canTSpeAN12'],
  'fr-ch': [],
}
/**
 *
 * @author Claire Rousset

*/
export default class ExerciceCalculsDeLog extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.spacingCorr = 2
    this.sup = '4'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? "Résoudre l'inéquation suivante. "
        : 'Résoudre les inéquations suivantes. '
    this.consigne +=
      "Les solutions devront être écrites sous la forme d'un intervalle."
    type Operators = '>=' | '>' | '<=' | '<'
    const operators: Operators[] = ['>=', '>', '<=', '<']

    // La liste des signes de comparaison pour varier
    const listeOperators: Operators[] = combinaisonListes(
      operators,
      this.nbQuestions,
    ) as Operators[]
    // La liste des types de questions fabriquée à partir du paramètre this.sup
    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: '1-2',
      min: 1,
      max: 4,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // on déclare les objets A et B qui servent à définir a et b
      let A: { base: number; exp: number }
      let B: { base: number; exp: number }
      switch (listeTypeQuestions[i]) {
        case 1:
          do {
            // Cas rationnel : même base pour a et b, mais exposants non multiples
            A = { base: choice([2, 5]), exp: randint(-3, 3, [0, -1, 1]) }
            B = { base: A.base, exp: randint(-4, 4, [0, A.exp]) }
          } while (B.exp % A.exp === 0)

          break
        default: // Cas entier : même base et exposant de b multiple de |A.exp|
          A = { base: choice([2, 3]), exp: randint(2, 3) }
          B = { base: A.base, exp: Math.abs(A.exp) * 2 } // On évite l'exposant triple pour la base 5 car ça fait de trop grands nombres
          break
        /* default: // Cas irrationnel : base différentes
          A = { base: choice([2, 5]), exp: randint(-2, 2, 0) }
          B = { base: choice([2, 3, 5], [A.base]), exp: randint(2, 5, A.exp) }
          break
          */
      }
      // Les nombres a et b sont construits à partir de A et B.
      const a = A.base ** A.exp
      const b = B.base ** B.exp
      // les nombres formatés
      const stringA = texNombre(a, 5)
      const stringB = texNombre(b, 5)
      // pour cas 1 et 2 : on crée une fraction (classe FractionEtendue) qui peut être entière pour le cas 3 quotient vaut null
      const quotient = A.base !== B.base ? null : fraction(B.exp, A.exp)
      // un ternaire dans un ternaire... pour définir resultat selon le cas de figure
      // Si quotient est null, alors on écrit le quotient de logs
      // sinon, si quotient est entier, on écrit le nombre formaté par texNombre
      // et sinon, on écrit la fraction formatée par texFSD (fraction signe devant)
      const resultat =
        quotient === null
          ? `\\dfrac{\\log{(${stringB})}}{\\log{(${stringA})}}` // cas 3 (irrationnel)
          : quotient.estEntiere
            ? texNombre(quotient.valeurDecimale, 0) // cas 2 (entier)
            : quotient.texFSD // cas 1 (rationnel)

      // Un objet pour réunir toutes les corrections en un seul et même code où juste des morceaux changent.
      // on accède à un élément avec dico['>'] par exemple.
      // les propriétés d'un élément sont :
      // signe pour l'opérateur
      // signeInverse pour le signe dans la deuxième partie (qui a changé ou pas de côté)
      // crochetG pour le crochet au début de l'intervalle
      // crochetD pour celui de fin
      // borneG pour la borne de gauche
      // borneD pour la borne de droite
      const dico = {
        '<': {
          signe: '<',
          crochetG: '\\left]',
          crochetD: '\\right[',
          signeInverse: a > 1 ? '<' : '>',
          borneG: a > 1 ? '-\\infty' : resultat,
          borneD: a > 1 ? resultat : '+\\infty',
        },
        '>': {
          signe: '>',
          crochetG: '\\left]',
          crochetD: '\\right[',
          signeInverse: a > 1 ? '>' : '<',
          borneG: a > 1 ? resultat : '-\\infty',
          borneD: a > 1 ? '+\\infty' : resultat,
        },
        '<=': {
          signe: '\\leqslant',
          crochetG: a > 1 ? '\\left]' : '\\left[',
          crochetD: a > 1 ? '\\right]' : '\\right[',
          signeInverse: a > 1 ? '\\leqslant' : '\\geqslant',
          borneG: a > 1 ? '-\\infty' : resultat,
          borneD: a > 1 ? resultat : '+\\infty',
        },
        '>=': {
          signe: '\\geqslant',
          crochetG: a > 1 ? '\\left[' : '\\left]',
          crochetD: a > 1 ? '\\right[' : '\\right]',
          signeInverse: a > 1 ? '\\geqslant' : '\\leqslant',
          borneG: a > 1 ? resultat : '-\\infty',
          borneD: a > 1 ? '+\\infty' : resultat,
        },
      }

      // On récupère les strings utiles pour le type de question dans notre dico.
      const { signe, crochetG, crochetD, signeInverse, borneG, borneD } =
        dico[listeOperators[i]]
      // la question
      let texte = `$${texNombre(a, 5)}^x ${signe} ${stringB}$`
      // la correction
      const compareAetZero = a > 1 ? '>0' : '<0' // pour la justification selon la valeur de a
      let texteCorr = `$\\log{(${stringA}^x)} ${signe} \\log{(${stringB})}$`
      texteCorr += `<br>$x\\log{(${stringA})} ${signe} \\log{(${stringB})}$`
      texteCorr += `<br>$x ${signeInverse} \\dfrac{\\log{(${stringB})}}{\\log{(${stringA})}}$  car $\\log{(${stringA})}${compareAetZero}$`
      // ici on traite le cas rationnel ou entier en ajoutant la phrase qui justifie
      if (quotient !== null) {
        texteCorr += `<br>Or, $\\dfrac{\\log{(${stringB})}}{\\log{(${stringA})}}= ${resultat}$ donc `
      }
      // La fin est commune
      texteCorr += `<br>$\\mathcal{S}=${miseEnEvidence(`${crochetG} ${borneG} ; ${borneD} ${crochetD}`)}$`

      if (this.interactif) {
        // demander à Éric Elter pourquoi la comparaison d'intervalles ne fonctionne pas.
        handleAnswers(this, i, {
          reponse: {
            value: `${crochetG} ${borneG} ; ${borneD} ${crochetD}`,
            options: { intervalle: true },
          },
        })
        texte += `<br>$${lettreDepuisChiffre(i + 1)} = $`
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierFonctionsTerminales,
        )
      }
      if (this.questionJamaisPosee(i, a, b, listeOperators[i])) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
