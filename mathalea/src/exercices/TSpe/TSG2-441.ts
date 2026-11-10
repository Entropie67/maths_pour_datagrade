import { createList } from '../../lib/format/lists'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf0,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiMoins,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Déterminer la position relative d'une droite et d'un plan"

export const dateDePublication = '26/01/2025' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

export const uuid = 'd5252'

export const refs = {
  'fr-fr': ['TSG2-441'],
  'fr-ch': ['3G99-8'],
}

/**
 *
 * @author Stéphane Guyon
 */
export default class positionRelative extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      let texteCorr = ''
      let produitScalaire: number = 0
      let a = 0
      let b = 0
      let c = 0
      let d = 0
      let ux = 0
      let uy = 0
      let uz = 0
      let z0 = 0
      let cas = ''
      const x0 = randint(-5, 5, 0)
      const y0 = randint(-5, 5, 0)
      // Plan : équation ax + by + cz + d = 0 avec (a,b,c) non nul
      a = randint(-4, 4, 0)
      b = randint(-4, 4, 0)
      d = randint(-4, 4, 0)

      // Choix du cas : secant plus fréquent
      const tirageCas = randint(1, 6)
      cas = tirageCas <= 3 ? 'secant' : tirageCas <= 5 ? 'parallele' : 'incluse'

      // Fonction pour obtenir un vecteur directeur orthogonal à (a,b,c)
      ux = randint(-5, 5, 0)
      uy = randint(-5, 5, 0)

      // On gère le cas le plus simple : droite incluse dans le plan
      z0 = -a * x0 - b * y0 - d // Point du plan On fixe c=1 pour ne pas s'emmerder
      c = 1
      uz = -(a * ux + b * uy) // vecteur u orthogonal à n

      if (cas === 'parallele') {
        z0 = z0 + randint(-5, 5, [0, -z0]) // On ajuste la cote du point pour que le point ne soit pas dans le plan + côte différente de 0 pour ne pas avoir un affichage du type 0 + 2t
      }

      if (cas === 'secant') {
        // Cas sécant : vecteur non orthogonal au normal
        uz = uz + randint(-4, 4, [0, -uz])
        c = randint(-4, 4, [0, 1])
      }
      const equationPlan = `${rienSi1(a)}x${ecritureAlgebriqueSauf1(b)}y${ecritureAlgebriqueSauf1(c)}z${ecritureAlgebriqueSauf0(d)}=0`
      produitScalaire = a * ux + b * uy + c * uz
      // Les fractions suivantes ne sont utiles que dans le cas sécant.
      // Si le produit scalaire est nul, on évite un dénominateur nul.
      const solution =
        produitScalaire !== 0
          ? new FractionEtendue(-a * x0 - b * y0 - c * z0 - d, produitScalaire)
          : null
      const solutionsimplifiee =
        produitScalaire !== 0
          ? new FractionEtendue(-a * x0 - b * y0 - c * z0 - d, produitScalaire)
              .texFractionSimplifiee
          : null
      const abscisseM =
        produitScalaire !== 0
          ? new FractionEtendue(
              x0 * produitScalaire + ux * (-a * x0 - b * y0 - c * z0 - d),
              produitScalaire,
            )
          : null
      const ordonneeM =
        produitScalaire !== 0
          ? new FractionEtendue(
              y0 * produitScalaire + uy * (-a * x0 - b * y0 - c * z0 - d),
              produitScalaire,
            )
          : null
      const coteM =
        produitScalaire !== 0
          ? new FractionEtendue(
              z0 * produitScalaire + uz * (-a * x0 - b * y0 - c * z0 - d),
              produitScalaire,
            )
          : null
      texte =
        "Dans l'espace muni d'un repère orthonormé, on considère un plan $(\\mathcal{P})$ et une droite $(d)$.<br>"
      texte += createList({
        items: [
          `Le plan $(\\mathcal{P})$ a pour équation cartésienne : $${equationPlan}$.<br>`,
          `La droite $(d)$ admet la représentation paramétrique suivante : $\\begin{cases}x=${x0}${ecritureAlgebriqueSauf1(ux)}t\\\\y=${y0}${ecritureAlgebriqueSauf1(uy)}t\\\\z=${z0 === 0 ? (uz === 0 ? '0' : `${uz}t`) : `${z0}${uz === 0 ? '' : `${ecritureAlgebriqueSauf1(uz)}t`}`}\\end{cases}\\quad(t\\in\\mathbb{R}).$<br>`,
        ],
        style: 'nombres',
      })
      texte += `Déterminer la position relative de $(d)$ et $(\\mathcal{P})$.<br>
      En cas d’intersection, calculer les coordonnées du point commun.`

      // Correction
      let orthogonalite = `${texteEnCouleurEtGras("Étude de l'orthogonalité d'un vecteur directeur de $(d)$ et d'un vecteur normal à $(\\mathcal{P})$ ")}<br>Si un vecteur directeur de la droite $(d)$ est orthogonal à un vecteur normal du plan $(\\mathcal{P})$, alors la droite $(d)$ est strictement parallèle au plan $(\\mathcal{P})$ ou incluse dans ce plan. <br>
      Dans le cas contraire, la droite $(d)$ est sécante au plan $(\\mathcal{P})$.<br>
      On sait qu'un plan qui possède une équation cartésienne du type $ax+by+cz+d=0$, admet $\\vec n\\begin{pmatrix}a\\\\b\\\\c\\end{pmatrix}$ comme vecteur normal. <br>
      On en déduit que le vecteur $\\vec n\\begin{pmatrix}${a}\\\\${b}\\\\${c}\\end{pmatrix}$ est un vecteur normal au plan $(\\mathcal{P})$. <br>
      On sait qu'une droite qui possède une représentation paramétrique de la forme 
      $\\begin{cases}
      x=x_0+\\alpha t\\\\
      y=y_0+\\beta t\\quad (t\\in\\mathbb{R})\\\\
      z=z_0+\\gamma t
      \\end{cases}$,$\\quad$ admet $\\vec u\\begin{pmatrix} \\alpha\\\\\\beta\\\\\\gamma\\end{pmatrix}$ comme vecteur directeur. <br>
      On en déduit qu'un vecteur directeur de la droite $(d)$ est $\\vec u\\begin{pmatrix}${ux}\\\\${uy}\\\\${uz}\\end{pmatrix}$. <br>
      On calcule le produit scalaire des vecteurs $\\vec n$ et $ \\vec u$ :<br>
      $\\begin{aligned}
      \\vec n \\cdot \\vec u &=${a}\\times ${ecritureParentheseSiNegatif(ux)}${ecritureAlgebrique(b)}\\times ${ecritureParentheseSiNegatif(uy)}${ecritureAlgebrique(c)}\\times ${ecritureParentheseSiNegatif(uz)}\\\\
        & = ${produitScalaire}.
        \\end{aligned}$<br>`
      if (produitScalaire !== 0) {
        orthogonalite +=
          'Le produit scalaire est non nul, les vecteurs ne sont donc pas orthogonaux. La droite $(d)$ est sécante au plan $(\\mathcal{P})$.'
      } else {
        orthogonalite +=
          'Le produit scalaire est nul, les vecteurs sont donc orthogonaux. Il reste donc deux possibilités : soit la droite $(d)$ est strictement parallèle au plan $(\\mathcal{P})$ soit elle est incluse dans ce plan.'
      }

      let pointCommun = `${texteEnCouleurEtGras("Étude de l'intersection entre la droite $(d)$ et le plan $(\\mathcal{P})$")}<br>`
      if (produitScalaire === 0) {
        pointCommun +=
          "Pour différencier les deux cas possibles, on va chercher s'il existe des points d'intersection entre la droite $(d)$ et le plan $(\\mathcal{P})$. On cherche donc les points $M(x;y;z)$ dont les coordonnées vérifient en même temps la représentation paramétrique de $(d)$ et l'équation cartésienne de $(\\mathcal{P})$. <br>"
      } else {
        pointCommun +=
          "On cherche les coordonnées du point $M(x;y;z)$, intersection entre la droite $(d)$ et le plan $(\\mathcal{P})$. Ses coordonnées vérifient donc la représentation paramétrique de $(d)$ et l'équation cartésienne de $(\\mathcal{P})$. <br>"
      }
      pointCommun += `On cherche donc l'ensemble des $(x, y, z, t)$ qui vérifient le système : <br>
      $\\begin{cases}
      x=${x0}${ecritureAlgebriqueSauf1(ux)}t\\\\
      y=${y0}${ecritureAlgebriqueSauf1(uy)}t\\\\
      z=${z0}${ecritureAlgebriqueSauf1(uz)}t\\\\
       ${equationPlan}
       \\end{cases}$<br>
       En remplaçant les expressions de $x$, $y$ et $z$ issues de la représentation paramétrique de la droite dans l'équation du plan, on obtient cette équation en $t$ :<br>
       $\\begin{aligned}
       ${rienSi1(a)}\\big(${x0}${ecritureAlgebriqueSauf1(ux)}t\\big)${ecritureAlgebriqueSauf1(b)}\\big(${y0}${ecritureAlgebriqueSauf1(uy)}t\\big)${ecritureAlgebriqueSauf1(c)}\\big(${z0}${ecritureAlgebriqueSauf1(uz)}t\\big)${ecritureAlgebriqueSauf0(d)}&=0\\\\
      ${a * x0}${ecritureAlgebriqueSauf1(ux * a)}t${ecritureAlgebrique(b * y0)}${ecritureAlgebriqueSauf1(uy * b)}t${ecritureAlgebrique(c * z0)}${ecritureAlgebriqueSauf1(uz * c)}t${ecritureAlgebrique(d)}&=0\\\\
     ${produitScalaire} t
     &=${-(a * x0 + b * y0 + c * z0 + d)}.
       \\end{aligned}$<br>`
      // Cas sécant
      if (
        cas === 'secant' &&
        solution &&
        abscisseM &&
        ordonneeM &&
        coteM &&
        solutionsimplifiee
      ) {
        pointCommun += `On obtient alors : $\\begin{aligned}\\phantom {${a * x0}${ecritureAlgebriqueSauf1(ux * a)}t${a * x0}${ecritureAlgebriqueSauf1(ux * a)}t${ecritureAlgebrique(b * y0)}${ecritureAlgebriqueSauf1(uy * b)}t${ecritureAlgebrique(c * z0)}${ecritureAlgebriqueSauf1(uz * c)}}t&=${solution.texFractionSimplifiee}\\\\
     \\end{aligned}.$<br>
     On remplace cette valeur de $t$ dans la représentation paramétrique de la droite pour obtenir les coordonnées du point d'intersection : <br>
     $\\begin{cases}
     x=${x0}${ecritureAlgebrique(ux)}\\times ${ecritureParentheseSiMoins(solutionsimplifiee)}\\\\
     y=${y0}${ecritureAlgebrique(uy)}\\times ${ecritureParentheseSiMoins(solutionsimplifiee)}\\\\
     z=${z0}${ecritureAlgebrique(uz)}\\times ${ecritureParentheseSiMoins(solutionsimplifiee)}
     \\end{cases}\\quad$ c'est-à-dire 
       $\\begin{cases}x=${abscisseM.texFractionSimplifiee}\\\\
       y=${ordonneeM.texFractionSimplifiee}\\\\
       z=${coteM.texFractionSimplifiee}\\end{cases}$<br>
       ${texteEnCouleurEtGras(`La droite $(d)$ et le plan $(\\mathcal{P})$ sont donc sécants en $M\\left(${abscisseM.texFractionSimplifiee};${ordonneeM.texFractionSimplifiee};${coteM.texFractionSimplifiee}\\right)$.`)}<br>`
      }
      // Cas parallèles
      if (cas === 'parallele') {
        pointCommun += `Cette équation n'admet pas de solution. Il n'y a pas de point commun à $(d)$ et $(\\mathcal{P})$. <br> ${texteEnCouleurEtGras('On peut conclure que la droite $(d)$ et le plan $(\\mathcal{P})$ sont strictement parallèles.')}`
      }
      // Cas confondus
      if (cas === 'incluse') {
        pointCommun += `Cette équation admet une infinité de solutions. Il y a une infinité de points commun à $(d)$ et $(\\mathcal{P})$. <br> ${texteEnCouleurEtGras('On peut conclure que la droite $(d)$ est incluse dans le plan $(\\mathcal{P})$.')}`
      }

      texteCorr =
        "Étudier la position relative de la droite $(d)$ et du plan $(\\mathcal{P})$, c'est déterminer si : "
      texteCorr += createList({
        items: [
          '$(d)$ est strictement parallèle à $(\\mathcal{P})$,',
          '$(d)$ est incluse dans $(\\mathcal{P})$,',
          '$(d)$ est sécante à $(\\mathcal{P})$.',
        ],
        style: 'fleches',
      })
      texteCorr +=
        '<br><br>Nous allons pour cela procéder en deux étapes. <br>' +
        createList({ items: [orthogonalite, pointCommun], style: 'nombres' })

      if (this.questionJamaisPosee(i, uz, uy, ux, d, c, b, a, z0, y0, x0)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
  }
}
