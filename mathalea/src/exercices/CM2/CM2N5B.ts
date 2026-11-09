import { bleuMathalea } from '../../lib/colors'
import {
  addPossibleMultiLinesAnswer,
  baremeMultiLignes,
  besoinFormulaireVerificationMultiLignes,
  commentaireMultiLignes,
} from '../../lib/customElements/PossibleMultiLinesAnswerElement'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif' // fonction qui va préparer l'analyse de la saisie
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import {
  contraindreValeur,
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const titre = 'Calculer une expression avec des parenthèses'
export const dateDePublication = '30/06/2025' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

export const uuid = '5e37d'
export const refs = {
  'fr-fr': ['CM2N5B'],
  'fr-2016': ['6C33-3'],
  'fr-ch': ['9R1NO8B-4', '9R2NO8B-4', '9R3NO8B-4', 'PRQNO13A-4'],
}
/**
 * Exercice de calcul d'expressions avec des parenthèses sans autres priorités.
 * @author Olivier Mimeau
 */
export default class nomExercice extends Exercice {
  constructor() {
    super()
    this.consigne = 'Calculer en détaillant les étapes de calculs.'
    this.nbQuestions = 6 // nombre de questions
    this.besoinFormulaireTexte = [
      "Types d'expression",
      'Nombres séparés par des tirets :\n1 : Deux Parenthèses séparées\n2 : Deux parenthèses imbriquées\n3: Une seule parenthèse',
    ]
    this.sup = '1-2-3'
    this.besoinFormulaire2Numerique = ['Résulat maximum', 10000] // 10000 car listeNombresPremiersStrictJusqua renvoie un tableau de premiers inférieurs à 10000
    this.sup2 = 200
    this.besoinFormulaire3Numerique = besoinFormulaireVerificationMultiLignes
    this.sup3 = 2
    this.comment = `Résultat maximum : Il s'agit de produire des expressions dont le résulat est inférieur au maximum. Si ce maximum est trop petit il sera fixé à 50.<br><br>${commentaireMultiLignes}`
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = [
      'deuxParenthesesseparees',
      'deuxParenthesesimbriquees',
      'UneParenthese',
    ]
    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      listeOfCase: typeQuestionsDisponibles,
      nbQuestions: this.nbQuestions,
    })
    // const listeTypeQuestions = combinaisonListes(typeQuestionsDisponibles, this.nbQuestions)
    const ResultatMmax = contraindreValeur(50, 10000, this.sup2, 200)
    const avecDivision = false // pas de division pour le moment
    this.consigne = 'Calculer'
    this.consigne +=
      this.nbQuestions < 2
        ? " l'expression suivante"
        : ' les expressions suivantes'
    this.consigne += this.interactif
      ? '.'
      : ' en détaillant les étapes de calculs.'
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const lettre = lettreDepuisChiffre(i + 1)
      let texte = '' // texte de la question
      let resultat = 0
      let texteCorr = ''
      let txtArbre: string = ''
      let tree: BinaryTree | undefined
      const op1 = unOperateur(avecDivision)
      // eviter 1+((2+3)+4)
      // const op2 =  unOperateur(avecDivision)
      const op2 =
        op1 !== '+' && op1 !== '*'
          ? unOperateur(avecDivision, [op1])
          : unOperateur(avecDivision)
      const op3 = unOperateur(avecDivision)

      switch (listeTypeQuestions[i]) {
        case 'deuxParenthesesseparees':
          tree = new BinaryTree(
            new TreeNode(
              op1,
              new TreeNode(
                op2,
                new TreeNode(randint(1, 10)),
                new TreeNode(randint(1, 10)),
              ),
              new TreeNode(
                op3,
                new TreeNode(randint(1, 10)),
                new TreeNode(randint(1, 10)),
              ),
            ),
          )
          break
        case 'deuxParenthesesimbriquees':
          tree = new BinaryTree(
            new TreeNode(
              op1,
              new TreeNode(randint(1, 10)),
              new TreeNode(
                op2,
                new TreeNode(randint(1, 10)),
                new TreeNode(
                  op3,
                  new TreeNode(randint(1, 10)),
                  new TreeNode(randint(1, 10)),
                ),
              ),
            ),
          )
          braceLArbre(tree.root)
          break
        case 'UneParenthese':
        default:
          tree = new BinaryTree(
            new TreeNode(
              op1,
              new TreeNode(
                op2,
                new TreeNode(randint(1, 10)),
                new TreeNode(randint(1, 10)),
              ),
              new TreeNode(randint(1, 10)),
            ),
          )
          braceLArbre(tree.root)
          break
      }
      if (tree !== undefined) {
        verifiePositif(tree.root)
        texte += `$${lettre} = ${ecritExpression(tree.root)}$`
        texteCorr += `$${lettre} = ${ecritExpression(tree.root, true)}$<br>`
        if (tree.root !== null) {
          txtArbre = ''
          let txtExpression: string | void | [string, boolean] = ''
          do {
            effectueUneEtape(tree.root)
            txtExpression = ecritExpression(tree.root, true)

            if (typeof tree.root.value === 'number') {
              txtArbre += `$${lettre} = ${miseEnEvidence(`${txtExpression}`)}$<br>` // miseEnEvidence(`${txtExpression}`, bleuMathalea)
            } else {
              txtArbre += `$${lettre} = ${txtExpression}$<br>`
            }
          } while (typeof tree.root.value !== 'number')
          texteCorr += `${txtArbre}<br>`
        }
        resultat = evalueArbre(tree.root)
        tree = undefined
      }
      handleAnswers(this, i, {
        reponse: {
          value: resultat,
          options: { nombreDecimalSeulement: true },
        },
      })
      texte += addPossibleMultiLinesAnswer(this, i, {
        prefix: `${lettre} =`,
        style: KeyboardType.clavierDeBaseAvecFraction,
        bareme: baremeMultiLignes(this.sup3),
      })
      if (resultat < ResultatMmax && this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

type oper = '+' | '-' | '*' | '/'
class TreeNode {
  constructor(
    public value: number | oper,
    public left: TreeNode | null = null,
    public right: TreeNode | null = null,
  ) {}
}
class BinaryTree implements Iterable<number | oper> {
  constructor(public root: TreeNode | null) {} // private root: TreeNode | null) {}

  *[Symbol.iterator](): Iterator<number | oper> {
    function* inOrderTraversal(
      node: TreeNode | null,
    ): Generator<number | oper> {
      if (node) {
        if (node.left) yield* inOrderTraversal(node.left)
        yield node.value
        if (node.right) yield* inOrderTraversal(node.right)
      }
    }

    yield* inOrderTraversal(this.root)
  }
}
// Fonction pour parcourir l'arbre binaire et construire l'expression  en LaTeX
// avec la possibilité de mettre en évidence une étape de calcul en gras si etapeEnGras est vrai.
// Le paramètre niveau permet de gérer les parenthèses dans l'expression.
// Le paramètre stop permet de savoir si l'on doit arrêter la mise en évidence.
// La fonction retourne une chaîne de caractères représentant l'expression en LaTeX
// et un booléen indiquant que la mise en évidence a été effectuée
function parcoursExpression(
  node: TreeNode | null,
  etapeEnGras: boolean = false,
  niveau: number = 0,
  stop: boolean = false,
): [string, boolean] {
  if (node === null) {
    return ['', stop]
  }
  let rslt = ''
  let rsltPrecedent = ''
  let misEnEvidence = stop
  let enGras = false
  if (etapeEnGras && !stop) {
    stop =
      node.left !== null &&
      node.right !== null &&
      typeof node.left.value === 'number' &&
      typeof node.right.value === 'number'
    enGras = stop
    etapeEnGras = !stop
  }
  if (niveau > 0 && typeof node.value !== 'number') {
    rslt += '('
  }
  ;[rsltPrecedent, misEnEvidence] = parcoursExpression(
    node.left,
    etapeEnGras,
    niveau + 1,
    misEnEvidence,
  )
  rslt += rsltPrecedent
  if (node.value === '*') {
    rslt += ' \\times'
  } else {
    rslt += `${node.value}`
  }
  ;[rsltPrecedent, misEnEvidence] = parcoursExpression(
    node.right,
    etapeEnGras,
    niveau + 1,
    misEnEvidence,
  )
  rslt += rsltPrecedent
  if (niveau > 0 && typeof node.value !== 'number') {
    rslt += ')'
  }
  if (enGras) {
    rslt = miseEnEvidence(`${rslt}`, bleuMathalea) // pour indiquer calcul à faire
  }
  return [rslt, enGras]
}

function ecritExpression(
  node: TreeNode | null,
  etapeEnGras: boolean = false,
): string {
  const temp = parcoursExpression(node, etapeEnGras)
  return temp[0]
}

function evalueArbre(node: TreeNode | null): number {
  if (node === null) {
    return 0
  }
  let rslt = 0
  const rsltGauche = evalueArbre(node.left)
  const rsltDroite = evalueArbre(node.right)
  if (typeof node.value !== 'number') {
    switch (node.value) {
      case '+':
        rslt = rsltGauche + rsltDroite
        break
      case '-':
        rslt = rsltGauche - rsltDroite
        break
      case '*':
        rslt = rsltGauche * rsltDroite
        break
      case '/':
        rslt = rsltDroite !== 0 ? rsltGauche / rsltDroite : 0
        break
      default:
        rslt = 0
    }
  } else {
    if (typeof node.value === 'number') {
      rslt = node.value
    }

    return rslt
  }
  return rslt
}

function effectueUneEtape(node: TreeNode | null): boolean {
  if (node === null) {
    return false
  }
  let rslt = 0
  let stop = false
  if (
    node.left !== null &&
    node.right !== null &&
    typeof node.left.value === 'number' &&
    typeof node.right.value === 'number'
  ) {
    const rsltGauche = node.left.value
    const rsltDroite = node.right.value
    if (typeof node.value !== 'number') {
      switch (node.value) {
        case '+':
          rslt = rsltGauche + rsltDroite
          break
        case '-':
          rslt = rsltGauche - rsltDroite
          break
        case '*':
          rslt = rsltGauche * rsltDroite
          break
        case '/':
          rslt = rsltDroite !== 0 ? rsltGauche / rsltDroite : 0
          break
        default:
          rslt = 0
      }
    }
    node.value = rslt
    node.left = null // new TreeNode(rsltGauche)
    node.right = null // new TreeNode(rsltDroite)
    stop = true
  }
  stop = effectueUneEtape(node.left) || effectueUneEtape(node.right) || stop
  return stop
}

function braceLArbre(node: TreeNode | null): boolean {
  if (node === null) {
    return false
  }
  const stop = false
  if (node !== null && typeof node.value !== 'number') {
    if (choice([0, 1]) === 1) {
      const treeTemp = node.right
      node.right = node.left
      node.left = treeTemp
    }
  }

  braceLArbre(node.left)
  braceLArbre(node.right)
  return stop
}

function verifiePositif(node: TreeNode | null): boolean {
  if (node === null) {
    return false
  }
  const stop = false

  verifiePositif(node.left)
  verifiePositif(node.right)
  if (node !== null && typeof node.value !== 'number') {
    if (node.value === '-') {
      const rsltGauche = evalueArbre(node.left)
      const rsltDroite = evalueArbre(node.right)
      if (rsltGauche - rsltDroite < 0) {
        const treeTemp = node.right
        node.right = node.left
        node.left = treeTemp
      }
    }
  }
  return stop
}

function unOperateur(avecDivision: boolean = false, eviter: oper[] = []): oper {
  let rslt: oper
  if (avecDivision) {
    rslt = choice(['+', '-', '*', '+', '-', '*', '/'], eviter)
  } else {
    rslt = choice(['+', '-', '*'], eviter)
  }
  return rslt
}
