import { createList } from '../../lib/format/lists'
import { lampeMessage } from '../../lib/format/message'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Étudier la position relative de deux plans'

export const dateDePublication = '04/04/2026'

export const uuid = '7c2ea1'

export const refs = {
  'fr-fr': ['TSG2-45'],
  'fr-ch': ['3G99-9'],
}
/**
 *
 * @author Stéphane Guyon
 */
export default class PlanRelatif extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      let texteCorr = ''

      // Choix du scénario avec rareté pour "confondus" et plus de poids pour "orthogonaux"
      const tirage = randint(1, 10)
      const scenario =
        tirage === 1
          ? 'confondus' // 10 %
          : tirage <= 3
            ? 'paralleles' // 20 %
            : tirage <= 7
              ? 'orthogonaux' // 30 %
              : 'secants' // 40 %

      // Plan P : n1 = (a1,b1,c1)
      const a1 = randint(-4, 4, 0)
      const b1 = randint(-4, 4, 0)
      const c1 = randint(-4, 4, 0)
      const d1 = randint(-6, 6, 0)

      let a2 = 0
      let b2 = 0
      let c2 = 0
      let d2 = 0

      if (scenario === 'confondus' || scenario === 'paralleles') {
        const k = randint(-3, 3, [0, 1, -1])
        a2 = k * a1
        b2 = k * b1
        c2 = k * c1
        if (scenario === 'confondus') {
          d2 = k * d1
        } else {
          d2 = k * d1 + randint(1, 4) // rendre distinct
        }
      } else if (scenario === 'orthogonaux') {
        // choisir n2 tel que n1·n2 = 0
        let essais = 0
        do {
          a2 = randint(-8, 8, [0, a1])
          b2 = randint(-8, 8, [0, b1])
          c2 = randint(-8, 8, [0, c1])
          essais++
        } while (essais < 100 && a1 * a2 + b1 * b2 + c1 * c2 !== 0)
        if (
          a1 * a2 + b1 * b2 + c1 * c2 !== 0 ||
          (a1 * b2 === a2 * b1 && a1 * c2 === a2 * c1 && b1 * c2 === b2 * c1)
        ) {
          //  orthogonal non colinéaire
          if (a1 !== 0 || b1 !== 0) {
            a2 = -b1
            b2 = a1
            c2 = randint(-3, 3, 0)
          } else {
            a2 = 1
            b2 = 1
            c2 = 0
          }
        }
        d2 = randint(-6, 6, 0)
      } else {
        // secants non orthogonaux, non parallèles
        do {
          a2 = randint(-4, 4, 0)
          b2 = randint(-4, 4, 0)
          c2 = randint(-4, 4, 0)
        } while (
          (a1 * b2 === a2 * b1 && a1 * c2 === a2 * c1 && b1 * c2 === b2 * c1) ||
          a1 * a2 + b1 * b2 + c1 * c2 === 0
        )
        d2 = randint(-6, 6, 0)
      }

      const paralleles =
        a1 * b2 === a2 * b1 && a1 * c2 === a2 * c1 && b1 * c2 === b2 * c1
      const confondus =
        paralleles &&
        a1 * d2 === a2 * d1 &&
        b1 * d2 === b2 * d1 &&
        c1 * d2 === c2 * d1
      const orthogonaux = a1 * a2 + b1 * b2 + c1 * c2 === 0 && !paralleles
      const position = confondus
        ? 'confondus'
        : paralleles
          ? 'paralleles'
          : orthogonaux
            ? 'orthogonaux'
            : 'secants'

      texte =
        "Dans un repère orthonormé de l'espace, on considère les deux plans $\\mathcal P_1$ et $\\mathcal P_2$ d'équations cartésiennes :<br>" +
        createList({
          items: [
            `$\\mathcal P_1 : ${rienSi1(a1)}x ${ecritureAlgebriqueSauf1(b1)}y ${ecritureAlgebriqueSauf1(c1)}z ${ecritureAlgebrique(d1)} = 0$`,
            `$\\mathcal P_2 : ${rienSi1(a2)}x ${ecritureAlgebriqueSauf1(b2)}y ${ecritureAlgebriqueSauf1(c2)}z ${ecritureAlgebrique(d2)} = 0$`,
          ],
          style: 'fleches',
        }) +
        'Déterminer leur position relative. On distinguera les cas : plans confondus, parallèles distincts, sécants non orthogonaux ou sécants orthogonaux. Justifier.'

      const Colineaire = `${texteEnCouleurEtGras('Si les vecteurs normaux sont colinéaires :', 'black')}<br>Les plans $\\mathcal P_1$ et $\\mathcal P_2$ sont strictement parallèles ou confondus. <br> Pour distinguer les deux cas, on pourra regarder si les deux équations cartésiennes sont équivalentes ou non.`
      const Orthogonaux = `${texteEnCouleurEtGras('Si les vecteurs normaux sont orthogonaux :', 'black')}<br>Les plans $\\mathcal P_1$ et $\\mathcal P_2$ sont orthogonaux.`
      const Sécants = `${texteEnCouleurEtGras('Si les vecteurs normaux ne sont ni colinéaires, ni orthogonaux :', 'black')}<br>Les plans $\\mathcal P_1$ et $\\mathcal P_2$ sont sécants non orthogonaux.`
      const k1 = new FractionEtendue(a1, a2)
      const k2 = new FractionEtendue(b1, b2)
      const k3 = new FractionEtendue(c1, c2)
      texteCorr = lampeMessage({
        titre: 'Méthode :',
        texte:
          "Pour étudier la position relative de deux plans, il suffit d'étudier leurs vecteurs normaux : <br>" +
          createList({
            items: [Colineaire, Orthogonaux, Sécants],
            style: 'fleches',
          }),
      })
      texteCorr += `À partir des deux équations cartésiennes, on déduit un vecteur normal à chacun des deux plans : <br>  
      Un vecteur normal à $\\mathcal P_1$ est $\\vec n_1\\begin{pmatrix}${a1}\\\\${b1}\\\\${c1}\\end{pmatrix}$ 
      et un vecteur normal à $\\mathcal P_2$ est $\\vec n_2\\begin{pmatrix}${a2}\\\\${b2}\\\\${c2}\\end{pmatrix}$.<br>`

      let kDifferentDe1 = ''
      kDifferentDe1 += `${texteEnCouleurEtGras('Test de parallélisme :', 'black')}<br>
        Pour savoir si les vecteurs $\\vec n_1$ et $\\vec n_2$ sont colinéaires, on cherche s'il existe un réel  $k$ tel que : <br>
        $\\vec n_1= k \\vec n_2$       
         $\\iff\\begin{cases}${a1}=${rienSi1(a2)}k\\\\${b1}=${rienSi1(b2)}k\\\\${c1}=${rienSi1(c2)}k\\end{cases}\\quad\\iff\\quad
          \\begin{cases}k=${k1.texFractionSimplifiee}\\\\k=${k2.texFractionSimplifiee}\\\\k=${k3.texFractionSimplifiee}.\\end{cases}$<br>`
      if (paralleles) {
        kDifferentDe1 += `Le système admet une unique solution $k=${k1.texFractionSimplifiee}$.<br>
          On vient donc de montrer que $\\vec n_1= ${k1.texFractionSimplifiee} \\vec n_2$. 
            Les vecteurs sont donc colinéaires.<br> Les plans $\\mathcal P_1$ et $\\mathcal P_2$ sont parallèles (éventuellement confondus).`
      } else {
        kDifferentDe1 +=
          "Le système n'admet aucune solution.<br> Il n'existe pas de réel $k$ tel que $\\vec n_1= k \\vec n_2$. Les deux vecteurs ne sont donc pas colinéaires. <br>Les plans $\\mathcal P_1$ et $\\mathcal P_2$  ne sont pas parallèles, ils sont donc sécants."
      }
      const kEgalA1 =
        'On observe que les deux vecteurs normaux sont égaux.<br> Les plans $\\mathcal P_1$ et $\\mathcal P_2$ sont parallèles (éventuellement confondus).'
      if (a1 === a2 || b1 === b2 || c1 === c2) texteCorr += kEgalA1
      else texteCorr += kDifferentDe1
      if (paralleles) {
        texteCorr += `<br>Pour distinguer le cas des plans strictement parallèle du cas des plans confondus, il suffit de chercher un point commun aux deux plans :<br>
        Un point $M(x;y;z)$ appartient aux deux plans si ses coordonnées verifient le système :<br>
        $\\begin{cases} ${rienSi1(a1)}x  ${ecritureAlgebriqueSauf1(b1)}y  ${ecritureAlgebriqueSauf1(c1)}z  ${ecritureAlgebrique(d1)} = 0\\\\
        ${rienSi1(a2)}x  ${ecritureAlgebriqueSauf1(b2)}y  ${ecritureAlgebriqueSauf1(c2)}z  ${ecritureAlgebrique(d2)} = 0\\end{cases}$<br>
        En multipliant la première équation par $${texNombre(a2)}$ et la deuxième par $${texNombre(a1)}$, le système précédent est équivalent à :<br>  
        $\\begin{cases} ${rienSi1(a1 * a2)}x  ${ecritureAlgebriqueSauf1(b1 * a2)}y  ${ecritureAlgebriqueSauf1(c1 * a2)}z  ${ecritureAlgebrique(d1 * a2)} = 0\\\\
        ${rienSi1(a2 * a1)}x  ${ecritureAlgebriqueSauf1(b2 * a1)}y  ${ecritureAlgebriqueSauf1(c2 * a1)}z  ${ecritureAlgebrique(d2 * a1)} = 0\\end{cases}$<br>
        On observe que les deux équations sont ${
          confondus
            ? 'proportionnelles, les plans sont donc confondus.'
            : 'non proportionnelles, donc les plans sont parallèles distincts.'
        }`
      } else {
        texteCorr += `${texteEnCouleurEtGras("<br>Test d'orthogonalité :", 'black')}<br>Pour vérifier l'orthogoanlité des plans, on calcule le produis sclaire de leurs vecteurs normaux : <br>
        $\\begin{aligned}\\vec n_1\\cdot\\vec n_2 &= ${a1}\\times${ecritureParentheseSiNegatif(a2)} + ${b1}\\times${ecritureParentheseSiNegatif(b2)} + ${c1}\\times${ecritureParentheseSiNegatif(c2)}\\\\& = ${a1 * a2 + b1 * b2 + c1 * c2}\\end{aligned}$ 
        <br>Le produit scalaire est ${orthogonaux ? 'nul' : 'non nul'}, donc les plans sont ${orthogonaux ? 'orthogonaux' : 'non orthogonaux'}.`
      }

      texteCorr +=
        `${texteEnCouleurEtGras('<br>Conclusion :', 'black')}<br>` +
        (position === 'confondus'
          ? `${texteEnCouleurEtGras('Les deux plans sont confondus.')}`
          : position === 'paralleles'
            ? `${texteEnCouleurEtGras('Les deux plans sont parallèles distincts.')}`
            : position === 'orthogonaux'
              ? `${texteEnCouleurEtGras('Les plans sont sécants orthogonaux.')}`
              : `${texteEnCouleurEtGras('Les plans sont sécants non orthogonaux.')}`)

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
