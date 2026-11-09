import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusByPlusCzPlusD,
} from '../../lib/outils/ecritures'

import { createList } from '../../lib/format/lists'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Associer un plan à son équation cartésienne'

export const dateDePublication = '26/01/2025' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

export const uuid = 'd5254'

export const refs = {
  'fr-fr': ['TSG2-44'],
  'fr-ch': ['3G99-7'],
}

/**
 *
 * @author Stéphane Guyon
 */
export default class NomExercice extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      let texteCorr = ''

      // Point A
      const xA = randint(-6, 6, 0)
      const yA = randint(-6, 6, 0)
      const zA = randint(-6, 6, 0)

      // Vecteurs directeurs u et v non nuls et non colinéaires
      const ux = randint(-5, 5, 0)
      const uy = randint(-5, 5, 0)
      const uz = randint(-5, 5, 0)

      const vx = randint(-5, 5, 0)
      let vy = randint(-5, 5, 0)
      while (vy * ux === uy * vx) {
        vy = randint(-5, 5, 0)
      }
      let vz = randint(-5, 5, 0)
      while (vz * vy === uz * uy) {
        vz = randint(-5, 5, 0)
      }
      const nz = ux * vy - uy * vx
      const nx = uy * vz - uz * vy
      const ny = uz * vx - ux * vz

      const d = -(nx * xA + ny * yA + nz * zA)
      const produitAvecU = nx * ux + ny * uy + nz * uz
      const produitAvecV = nx * vx + ny * vy + nz * vz
      const equationPlane = `${reduireAxPlusByPlusCzPlusD(nx, ny, nz, d)}=0`

      texte =
        "Dans un repère orthonormé de l'espace, on considère le point " +
        `$A(${xA}~;${yA}~;${zA})$ et les vecteurs $\\vec u\\begin{pmatrix}${ux}\\\\${uy}\\\\${uz}\\end{pmatrix}$ et $\\vec v\\begin{pmatrix}${vx}\\\\${vy}\\\\${vz}\\end{pmatrix}$ qui ne sont pas colinéaires.<br>`
      texte +=
        'On note $\\mathcal{P}$ le plan passant par $A$ et engendré par $\\vec u$ et $\\vec v$. '
      texte += `<br>Justifier que l'équation $${equationPlane}$  est une équation cartésienne du plan $\\mathcal{P}$.<br>`

      let engendreparuv = ''
      engendreparuv = `${texteEnCouleurEtGras("Démontrer que le plan $\\mathcal{P}$ est parallèle au plan $\\mathcal{P}'$")}<br>`

      engendreparuv += `On sait qu'un plan ayant pour équation cartesienne : $ax+by+cz+d=0$ où $a$, $b$, $c$ et $d$ sont des réels, admet comme vecteur normal $\\vec n\\begin{pmatrix}a\\\\b\\\\c\\end{pmatrix}$.<br>`
      engendreparuv += `Le vecteur $\\vec n\\begin{pmatrix}${nx}\\\\${ny}\\\\${nz}\\end{pmatrix}$ est donc un vecteur normal au plan $\\mathcal{P'}$.<br>`
      engendreparuv +=
        'Calculons les produits scalaires respectifs du vecteur $\\vec n$ avec les vecteurs $\\vec u$ et $\\vec v$ :'
      engendreparuv += `<br>$\\vec n\\cdot\\vec u = ${nx}\\times ${ecritureParentheseSiNegatif(ux)}${ecritureAlgebrique(ny)}\\times ${ecritureParentheseSiNegatif(uy)}${ecritureAlgebrique(nz)}\\times ${ecritureParentheseSiNegatif(uz)} = ${produitAvecU}$.`
      engendreparuv += `<br>$\\vec n\\cdot\\vec v = ${nx}\\times ${ecritureParentheseSiNegatif(vx)}${ecritureAlgebrique(ny)}\\times ${ecritureParentheseSiNegatif(vy)}${ecritureAlgebrique(nz)}\\times ${ecritureParentheseSiNegatif(vz)} = ${produitAvecV}$.`
      engendreparuv +=
        "<br>Ces produits scalaires sont nuls donc le vecteur $\\vec n$ est orthogonal aux vecteurs $\\vec u$ et $\\vec v$ qui engendrent le plan $\\mathcal{P}$, donc le vecteur $\\vec n$ est normal au plan $\\mathcal{P}$. On en déduit que les plans $\\mathcal{P}$ et $\\mathcal{P}'$ sont parallèles (éventuellement confondus).<br>"

      let pointAappartientAuPlan = ''
      pointAappartientAuPlan = `${texteEnCouleurEtGras('Démontrer que le point A appartient à ce plan.')}<br>`
      pointAappartientAuPlan += `Pour déterminer si le plan $\\mathcal{P'}$ est strictement parallèle ou confondu au plan $\\mathcal{P}$, vérifions si les coordonnées du point $A(${xA}~;${yA}~;${zA})$ satisfont l'équation :<br>`
      pointAappartientAuPlan += ` $\\begin{aligned}${nx}\\times ${ecritureParentheseSiNegatif(xA)}${ecritureAlgebrique(ny)}\\times ${ecritureParentheseSiNegatif(yA)}${ecritureAlgebrique(nz)}\\times ${ecritureParentheseSiNegatif(zA)}${ecritureAlgebrique(d)}&=${nx * xA}${ecritureAlgebrique(ny * yA)}${ecritureAlgebrique(nz * zA)}${ecritureAlgebrique(d)}\\\\
&=${nx * xA + ny * yA + nz * zA}${ecritureAlgebrique(d)}\\\\
&=0\\end{aligned}$.`
      pointAappartientAuPlan += `<br>Le point $A$ appartient donc au plan $\\mathcal{P'}$ et au plan $\\mathcal{P}$.<br>`
      pointAappartientAuPlan +=
        "Les deux plans sont donc confondus et l'équation proposée est bien une équation cartésienne du plan $\\mathcal{P}$."
      const partie1 =
        "Montrer que les plans $\\mathcal{P}'$ et $\\mathcal{P}$ sont parallèles car ils ont un vecteur normal en commun."
      const partie2 =
        "Vérifier que le point $A$ du plan $\\mathcal{P}$ appartient aussi au plan $\\mathcal{P}'$ car ses coordonnées vérifient l'équation cartésienne de $\\mathcal{P}'$."
      texteCorr =
        `Considérons le plan $\\mathcal{P'}$ d'équation cartésienne $${equationPlane}$.<br>Nous allons procéder en deux étapes :<br> ` +
        createList({ items: [partie1, partie2], style: 'nombres' })

      texteCorr += createList({
        items: [engendreparuv, pointAappartientAuPlan],
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
