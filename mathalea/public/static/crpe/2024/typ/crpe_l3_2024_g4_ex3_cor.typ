// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

#import "@preview/cetz:0.4.2": canvas, draw

*1.* Les touches a, b et c permettent de tracer un segment de 20 pas vers la droite (a), vers la gauche (b) et vers le haut (c). Seule la proposition 3 comporte un tracé vers le bas : elle ne peut donc pas être réalisée avec les touches a, b et c.

La proposition 3 ne peut pas être réalisée par un enchaînement de touches a, b et c.

*2.* Une instruction de 20 pas correspond à 2~cm sur la figure (puisque 1~cm représente 10 pas). L'enchaînement c c c a a c c b b se traduit donc ainsi, à partir du point de départ :

- c c c : on monte de 6~cm ;
- a a : on va vers la droite de 4~cm ;
- c c : on monte de 4~cm ;
- b b : on va vers la gauche de 4~cm.

#align(center)[
  #canvas(length: 1cm, {
    draw.line((0, 0), (0, 6), (4, 6), (4, 10), (0, 10), stroke: 1.2pt + blue)
    draw.circle((0, 0), radius: 0.12, fill: red, stroke: none)
    draw.content((-0.6, -0.5), [#text(size: 9pt)[Départ]])
  })
]

*3.* Nommons $A B C D$ le rectangle à construire, avec $A B = C D = 80$ pas et $A C = B D = 100$ pas. Dans le triangle $A B C$ rectangle en $B$, on applique le théorème de Pythagore, en mesurant les longueurs en pas :

$ A B^2 + B C^2 = A C^2 $

$ 80^2 + B C^2 = 100^2 $

$ B C^2 = 100^2 - 80^2 = 10000 - 6400 = 3600 $

$ B C = sqrt(3600) = 60 $

On doit donc tracer un rectangle de longueur 80 pas et de largeur 60 pas. Par exemple, on peut suivre le parcours suivant : 4 fois la touche a (80 pas vers la droite), 3 fois la touche c (60 pas vers le haut), 4 fois la touche b (80 pas vers la gauche) et 3 fois la touche d (60 pas vers le bas).

Pour tracer un rectangle de longueur 80 pas et de diagonale 100 pas, on peut proposer l'enchaînement : a a a a c c c b b b b d d d.

#align(center)[
  #canvas(length: 1cm, {
    draw.rect((0, 0), (8, 6), stroke: 1pt + purple)
    draw.content((4, -0.7), [#text(size: 9pt)[80 pas]])
    draw.content((8.9, 3), [#text(size: 9pt)[60 pas]])
    draw.line((0, 0), (8, 6), stroke: (dash: "dashed", paint: gray))
    draw.content((4.4, 3.8), [#text(size: 9pt)[100 pas]])
  })
]
