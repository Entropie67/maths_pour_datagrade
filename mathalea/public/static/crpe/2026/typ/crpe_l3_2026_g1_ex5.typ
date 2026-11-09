#import "@preview/ctz-euclide:0.3.0": *

// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

Sur l'axe gradué ci-dessous d'origine O, le point U a pour abscisse 1.

#align(center)[
  #ctz-canvas(length: 4.5cm, {
    ctz-init()

    // Axe sans flèche, épais
    cetz.draw.line((-0.5, 0), (1.75, 0), stroke: black + 1.5pt)

    // Graduations fines, une par huitième d'unité
    for k in range(-4, 15) {
      let x = k / 8
      cetz.draw.line((x, -0.035), (x, 0.035), stroke: black + 0.6pt)
    }

    // Noms des points au-dessus, abscisses en dessous, au plus près de l'axe
    ctz-draw-text(0, 0.14, $O$)
    ctz-draw-text(0.5, 0.14, $A$)
    ctz-draw-text(1, 0.14, $U$)
    ctz-draw-text(11 / 8, 0.14, $B$)
    ctz-draw-text(0, -0.14, $0$)
    ctz-draw-text(0.5, -0.14, $a$)
    ctz-draw-text(1, -0.14, $1$)
    ctz-draw-text(11 / 8, -0.14, $b$)
  })
]

*1.* Déterminer les abscisses $a$ et $b$ des points A et B.

*2.*
#sub("a", [Déterminer l'abscisse du milieu du segment [OA].])
#sub("b", [Déterminer l'abscisse du milieu du segment [OB].])

*3.* On considère les points C et D d'abscisses respectives :

#align(center)[$c = "0,45" quad ; quad d = display(frac(4, 3))$.]

Pour chacun des points C et D, proposer une démarche permettant de déterminer, sans l'aide d'une calculatrice, s'il appartient au segment [AB].
