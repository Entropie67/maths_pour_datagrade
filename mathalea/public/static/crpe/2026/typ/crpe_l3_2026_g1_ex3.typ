#import "@preview/ctz-euclide:0.3.0": *

// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

// Point à la distance r du centre, dans la direction d
#let pol(r, d) = (r * calc.cos(d), r * calc.sin(d))

#text(weight: "bold")[Des pentagones]

*1.* Nous allons dans un premier temps nous intéresser à un pentagone régulier de centre O tel que décrit ci-dessous.

#align(center)[
  #ctz-canvas(length: 1cm, {
    ctz-init()

    ctz-def-points(
      O: (0, 0),
      A: (0, 3),
      B: (2.853, 0.927),
      C: (1.763, -2.427),
      D: (-1.763, -2.427),
      E: (-2.853, 0.927),
    )
    ctz-def-circle("Cercle", "O", through: "A")
    ctz-draw("Cercle", stroke: black + 0.8pt)
    ctz-def-polygon("Pent", "A", "B", "C", "D", "E")
    ctz-draw("Pent", stroke: black + 1pt)

    // Côtés de même longueur : codage ||
    for side in (("A", "B"), ("B", "C"), ("C", "D"), ("D", "E"), ("E", "A")) {
      ctz-draw-mark-segment(side.at(0), side.at(1), mark: 2)
    }

    for p in ("A", "B", "C", "D", "E") {
      ctz-draw-segment("O", p, stroke: black + 0.6pt)
    }

    // Cinq angles au centre égaux : un arc et le codage | pour chacun
    let rayon = 0.6
    let secteurs = ((18deg, 90deg), (-54deg, 18deg), (-126deg, -54deg), (162deg, 234deg), (90deg, 162deg))
    for (debut, fin) in secteurs {
      cetz.draw.arc((0, 0), start: debut, stop: fin, radius: rayon, anchor: "origin", stroke: black + 0.6pt)
      let milieu = (debut + fin) / 2
      cetz.draw.line(pol(rayon - 0.12, milieu), pol(rayon + 0.12, milieu), stroke: black + 0.6pt)
    }

    // Étiquettes des sommets, placées hors du pentagone
    ctz-draw-text(0, 3.35, $A$)
    ctz-draw-text(3.2, 1.1, $B$)
    ctz-draw-text(2.1, -2.8, $C$)
    ctz-draw-text(-2.1, -2.8, $D$)
    ctz-draw-text(-3.2, 1.1, $E$)
    // Centre : étiquette placée au-delà des arcs
    ctz-draw-text(0, -1.0, $O$)
  })
]

#text(size: 9pt, style: "italic")[
  _Rappel :_ Un polygone régulier est un polygone dont tous les côtés ont la même longueur et tous les angles ont la même mesure. Un polygone régulier peut être inscrit dans un cercle, c'est-à-dire qu'il existe un cercle passant par tous les sommets du polygone régulier.
]

#sub("a", [Justifier que l'angle $hat(D O C)$ mesure $72°$.])
#sub("b", [Indiquer la nature du triangle OCD.])
#sub("c", [Déterminer la mesure de l'angle $hat(D C B)$.])
#sub("d", [Déterminer la somme des angles de ce pentagone.])

*2.* On étudie à présent le pentagone JKLMN représenté ci-contre où :

#grid(
  columns: (1fr, 1fr),
  column-gutter: 1cm,
  [
    - $J K = K L = L M = M N = 10$ cm ;
    - $hat(J K L) = hat(L M N) = 90°$ ;
    - $hat(K L M) = hat(M N J) = hat(N J K)$.
  ],
  align(center + horizon)[
    #ctz-canvas(length: 1cm, {
      ctz-init()

      ctz-def-points(
        L: (0, 0),
        K: (-1.732, -1),
        M: (1.732, -1),
        J: (-0.732, -2.732),
        N: (0.732, -2.732),
      )
      ctz-def-polygon("Pent", "J", "K", "L", "M", "N")
      ctz-draw("Pent", stroke: black + 1pt)

      // Côtés de même longueur : codage ||
      for side in (("J", "K"), ("K", "L"), ("L", "M"), ("M", "N")) {
        ctz-draw-mark-segment(side.at(0), side.at(1), mark: 2)
      }

      ctz-draw-mark-right-angle("J", "K", "L")
      ctz-draw-mark-right-angle("L", "M", "N")
      ctz-draw-angle("L", "K", "M", stroke: black + 0.6pt)
      ctz-draw-angle("N", "M", "J", stroke: black + 0.6pt)
      ctz-draw-angle("J", "N", "K", stroke: black + 0.6pt)

      ctz-draw-text(0, 0.35, $L$)
      ctz-draw-text(-2.1, -1, $K$)
      ctz-draw-text(2.1, -1, $M$)
      ctz-draw-text(-1.1, -3.1, $J$)
      ctz-draw-text(1.1, -3.1, $N$)
    })
  ],
)

#sub("a", [Donner la nature des triangles JKL et LMN.])
#sub("b", [En déduire que $J L = L N = sqrt(200)$ cm.])
