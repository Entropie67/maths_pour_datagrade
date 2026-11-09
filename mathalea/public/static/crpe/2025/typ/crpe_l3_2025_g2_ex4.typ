#import "@preview/ctz-euclide:0.3.0": *

// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

// Codage || au milieu du segment [ab]
#let codage(a, b) = {
  let m = ((a.at(0) + b.at(0)) / 2, (a.at(1) + b.at(1)) / 2)
  let dx = b.at(0) - a.at(0)
  let dy = b.at(1) - a.at(1)
  let l = calc.sqrt(dx * dx + dy * dy)
  let (ux, uy) = (dx / l, dy / l)
  for s in (-0.05, 0.05) {
    let c = (m.at(0) + ux * s, m.at(1) + uy * s)
    cetz.draw.line((c.at(0) + uy * 0.1, c.at(1) - ux * 0.1), (c.at(0) - uy * 0.1, c.at(1) + ux * 0.1), stroke: 0.6pt)
  }
}

// Schéma du quartier : ruisseau (IJ), maisons A et B, pont en P (abscisse xp)
#let quartier(xp, trait: false, egal: false) = ctz-canvas(length: 0.62cm, {
  let (I, J) = ((0, 0), (8, 0))
  let (A, B) = ((0, 1.5), (8, -2.4))
  let P = (xp, 0)
  cetz.draw.line((-0.6, 0), (8.6, 0), stroke: black + 0.6pt)
  cetz.draw.line(I, A, stroke: black + 0.6pt)
  cetz.draw.line(J, B, stroke: black + 0.6pt)
  cetz.draw.line((0, 0.22), (0.22, 0.22), (0.22, 0), stroke: black + 0.6pt)
  cetz.draw.line((7.78, 0), (7.78, -0.22), (8, -0.22), stroke: black + 0.6pt)
  if trait {
    cetz.draw.line(A, B, stroke: black + 0.6pt)
  }
  if egal {
    cetz.draw.line(A, P, stroke: black + 0.6pt)
    cetz.draw.line(P, B, stroke: black + 0.6pt)
    codage(A, P)
    codage(P, B)
  }
  ctz-draw-text(0, 1.8, $A$)
  ctz-draw-text(0, -0.35, $I$)
  ctz-draw-text(8, 0.35, $J$)
  ctz-draw-text(8.15, -2.7, $B$)
  ctz-draw-text(xp + 0.3, 0.3, $P$)
})

Alice et Bob vivent dans deux maisons situées de part et d'autre d'un ruisseau. Ils décident de construire un pont sur le ruisseau pour se rendre d'une maison à l'autre. Pour placer le pont, ils hésitent entre les deux possibilités.

La figure ci-dessous représente le schéma qu'Alice et Bob ont réalisé de leur quartier. Les points $A$ et $B$ représentent leurs maisons respectives, la droite $(I J)$ représente le ruisseau et le point $P$ la position du pont. Sur ce schéma et dans tout l'exercice, on considère le ruisseau rectiligne et sa largeur négligeable.

On sait que $I J = 120$ m, $I A = 30$ m et $J B = 46$ m. On note $x$ la longueur, en mètre, du segment $[I P]$.

#align(center)[#quartier(2.4)]

*1.* *Première possibilité :* le pont sera placé à l'intersection du segment reliant les deux maisons et du segment représentant le ruisseau. La figure 1 ci-dessous (qui n'est pas à l'échelle) représente la modélisation de cette première possibilité.

#align(center)[*Figure 1* #h(0.5cm) #quartier(3.08, trait: true)]

Déterminer la longueur du segment $[I P]$ dans cette configuration. On donnera le résultat arrondi au mètre.

*2.* *Deuxième possibilité :* le pont sera placé sur le ruisseau à égale distance des deux maisons. La figure 2 ci-dessous (qui n'est pas à l'échelle) représente la modélisation de cette seconde possibilité.

#align(center)[*Figure 2* #h(0.5cm) #quartier(4.3, egal: true)]

#sub[a][Déterminer $A P^2$ et $P B^2$ en fonction de $x$.]

#sub[b][En déduire que la longueur du segment $[I P]$, arrondie au mètre, est égale à 65 m.]

*3.* Le pont est construit selon la seconde possibilité.

#sub[a][Alice part de chez elle pour se rendre chez Bob en suivant le chemin $[A P]$ puis $[P B]$. Elle marche à une vitesse moyenne de 4,5~km/h. Combien de temps met-elle pour parcourir ce trajet ? Donner le résultat en minutes et secondes, arrondi à la seconde.]

#sub[b][Bob part de chez lui en courant pour se rendre chez Alice en suivant le chemin $[B P]$ puis $[P A]$. Il met 57~s pour parcourir ce trajet. Déterminer sa vitesse en km/h. Arrondir le résultat à l'unité.]
