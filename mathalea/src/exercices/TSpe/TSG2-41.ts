import { createList } from '../../lib/format/lists'
import { lampeMessage } from '../../lib/format/message'
import {
  all,
  isEquation,
  isEquivalentEquation,
} from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  crossProduct,
  equationPlanTex,
  expressionLineaireTex,
  simplifieVector,
} from '../../lib/outils/geometrieVectorielle'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer une équation cartésienne d’un plan à partir de trois points'

export const dateDePublication = '28/01/2026'
export const interactifReady = true

export const uuid = '7c2e8'

export const refs = {
  'fr-fr': ['TSG2-41'],
  'fr-ch': ['3G99-3'],
}

/**
 *
 * @author Stéphane Guyon et Nathan Scheinmann pour l'interactif
 */
export default class NomExercice extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireCaseACocher = [
      'Autoriser des coordonnées nulles pour le vecteur normal',
      false,
    ]
    this.sup = false
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''

      // Points A, B, C non alignés
      let xA: number, yA: number, zA: number
      let xB: number, yB: number, zB: number
      let xC: number, yC: number, zC: number
      let ABx: number, ABy: number, ABz: number
      let ACx: number, ACy: number, ACz: number
      let nx: number, ny: number, nz: number

      do {
        xA = randint(-3, 4)
        yA = randint(-3, 4)
        zA = randint(-3, 4)
        xB = randint(-3, 4, [xA])
        yB = randint(-3, 4, [yA])
        zB = randint(-3, 4, [zA])
        xC = randint(-3, 4, [xA, xB])
        yC = randint(-3, 4, [yA, yB])
        zC = randint(-3, 4, [zA, zB])

        ABx = xB - xA
        ABy = yB - yA
        ABz = zB - zA
        ACx = xC - xA
        ACy = yC - yA
        ACz = zC - zA

        // vecteur normal par produit vectoriel AB ^ AC
        ;[nx, ny, nz] = crossProduct([ABx, ABy, ABz], [ACx, ACy, ACz])
        // on boucle si points alignés => normal nul
      } while (
        (nx === 0 && ny === 0 && nz === 0) ||
        (this.sup === false && (nx === 0 || ny === 0 || nz === 0))

        // simplifier le vecteur normal
      )
      ;[nx, ny, nz] = simplifieVector([nx, ny, nz])

      const d = -(nx * xA + ny * yA + nz * zA)
      const resultat = equationPlanTex(nx, ny, nz, d)

      const valeurAB = nx * ABx + ny * ABy + nz * ABz
      const valeurAC = nx * ACx + ny * ACy + nz * ACz
      const question1 =
        'Montrer que les points $A$, $B$ et $C$ ne sont pas alignés.'
      const question2 = `Soit $\\vec n \\begin{pmatrix}${nx}\\\\${ny}\\\\${nz}\\end{pmatrix}$. Vérifier que $\\vec n$ est orthogonal au plan $(ABC)$.`
      const question3 = 'En déduire une équation cartésienne du plan $(ABC)$.'
      texte =
        'On se place dans un repère orthonormé de l’espace.<br>' +
        `On considère les points $A(${xA}~;~${yA}~;~${zA})$, $B(${xB}~;~${yB}~;~${zB})$ et $C(${xC}~;~${yC}~;~${zC})$.<br>` +
        createList({
          items: [question1, question2, question3],
          style: 'nombres',
        })
      if (this.interactif) {
        texte += '<br>Équation cartésienne du plan $(ABC)$ : '
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.lycee)
      }

      handleAnswers(this, i, {
        reponse: {
          value: resultat,
          compare: all([isEquation(), isEquivalentEquation()]),
        },
      })

      let reponse1 =
        lampeMessage({
          titre: 'Méthode :',
          texte:
            "Les points $A$, $B$ et $C$ forment un plan, s'ils ne sont pas alignés.<br> Pour le prouver, on regarde si les vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ sont colinéaires.",
          couleur: 'black',
        }) +
        ` On calcule les coordonnées des vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$.<br>
         $\\overrightarrow{AB}\\begin{pmatrix}${xB}${ecritureAlgebrique(-xA)}\\\\${yB}${ecritureAlgebrique(-yA)}\\\\${zB}${ecritureAlgebrique(-zA)}\\end{pmatrix}$ donc $\\overrightarrow{AB}\\begin{pmatrix}${ABx}\\\\${ABy}\\\\${ABz}\\end{pmatrix}$.<br>
        $\\overrightarrow{AC}\\begin{pmatrix}${xC}${ecritureAlgebrique(-xA)}\\\\${yC}${ecritureAlgebrique(-yA)}\\\\${zC}${ecritureAlgebrique(-zA)}\\end{pmatrix}$ donc $\\overrightarrow{AC}\\begin{pmatrix}${ACx}\\\\${ACy}\\\\${ACz}\\end{pmatrix}$.<br>
          Deux vecteurs sont colinéaires s’il existe un réel $k$ tel que $\\overrightarrow{AB} = k \\overrightarrow{AC}$, c’est-à-dire si un réel $k$ vérifie :<br>
          $\\begin{cases} ${ABx} = ${rienSi1(ACx)}k\\\\
          ${ABy} = ${rienSi1(ACy)}k\\\\
          ${ABz} = ${rienSi1(ACz)}k
          \\end{cases}$`

      const fraction1 = new FractionEtendue(ABx, ACx)
      const fraction2 = new FractionEtendue(ABy, ACy)
      const fraction3 = new FractionEtendue(ABz, ACz)
      reponse1 += `$\\iff
           \\begin{cases} k =${fraction1.texFractionSimplifiee}\\\\
          k = ${fraction2.texFractionSimplifiee}\\\\
          k = ${fraction3.texFractionSimplifiee}
          \\end{cases}$.<br>`

      reponse1 += `Ce système n'admet pas de solution. <br>Les vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ ne sont donc pas colinéaires.<br>
        Donc les points $A$, $B$ et $C$ ne sont pas alignés, ils forment donc un plan.`

      const reponse2 =
        lampeMessage({
          titre: 'Méthode :',
          texte:
            "Pour vérifier qu'un vecteur $\\vec n$ est normal à un plan engendré par $3$ points $A$, $B$ et $C$, il suffit de vérifier que le vecteur $\\vec n$ est normal au vecteur $\\overrightarrow{AB}$ et au vecteur $\\overrightarrow{AC}$.<br>",
        }) +
        `On calcule les produits scalaires du vecteur $\\vec n$ avec les vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ :<br>
        $\\begin{aligned}\\vec n \\cdot \\overrightarrow{AB} &= ${nx}\\times${ecritureParentheseSiNegatif(ABx)} ${ecritureAlgebrique(ny)}\\times${ecritureParentheseSiNegatif(ABy)} ${ecritureAlgebrique(nz)}\\times${ecritureParentheseSiNegatif(ABz)} \\\\
        &= ${nx * ABx} ${ecritureAlgebrique(ny * ABy)}${ecritureAlgebrique(nz * ABz)}\\\\
       &= ${valeurAB}\\\\
       \\end{aligned}$.<br>
       $\\begin{aligned}\\vec n \\cdot \\overrightarrow{AC} &= ${nx}\\times${ecritureParentheseSiNegatif(ACx)} ${ecritureAlgebrique(ny)}\\times${ecritureParentheseSiNegatif(ACy)} ${ecritureAlgebrique(nz)}\\times${ecritureParentheseSiNegatif(ACz)} \\\\
         &= ${nx * ACx} ${ecritureAlgebrique(ny * ACy)}${ecritureAlgebrique(nz * ACz)}\\\\
         &= ${valeurAC}\\\\
       \\end{aligned}$.<br>` +
        'Les deux produits scalaires sont nuls, donc $\\vec n$ est orthogonal au plan $(ABC)$.'

      let reponse3 = lampeMessage({
        titre: 'Méthode :',
        texte:
          "On utilise le fait que le vecteur $\\vec n\\begin{pmatrix}a\\\\b\\\\c\\end{pmatrix}$ est normal au plan d' équation cartésienne $ax+by+cz+d=0$. <br> Il suffit ensuite de tester les coordonnées d'un des points connus du plan dans l'équation cartésienne, pour déterminer le dernier paramètre $d$.",
      })
      reponse3 += `Le vecteur $\\vec n \\begin{pmatrix}${nx}\\\\${ny}\\\\${nz}\\end{pmatrix}$ est normal au plan $(ABC)$. <br>Une équation cartésienne du plan est donc sous la forme $${expressionLineaireTex([nx, ny, nz], ['x', 'y', 'z'])} + d = 0$.<br>`
      reponse3 += `Pour déterminer la valeur de $d$, on utilise les coordonnées d'un point du plan, par exemple $A(${xA}~;~${yA}~;~${zA})$ :<br>`
      reponse3 += `$\\begin{aligned}
&${nx}\\times ${ecritureParentheseSiNegatif(xA)} ${ecritureAlgebrique(ny)}\\times${ecritureParentheseSiNegatif(yA)} ${ecritureAlgebrique(nz)}\\times${ecritureParentheseSiNegatif(zA)} + d = 0 \\\\
\\iff &${nx * xA + ny * yA + nz * zA} + d = 0\\\\
\\iff &d = ${d}
\\end{aligned}$.<br>`

      reponse3 += `Ainsi, le plan $(ABC)$ admet l’équation cartésienne :<br>$${miseEnEvidence(resultat)}$.`

      texteCorr = createList({
        items: [reponse1, reponse2, reponse3],
        style: 'nombres',
      })

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
