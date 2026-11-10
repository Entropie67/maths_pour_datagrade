On considère le *programme A* suivant :

#let txA(x) = (x + 2.1) * 1cm
#let tyA(y) = (6.9 - y) * 1cm
#let flowbox(tx, ty, cx, cy, body) = place(dx: tx(cx) - 1.8cm, dy: ty(cy) - 0.45cm,
  rect(width: 3.6cm, height: 0.9cm, radius: 3pt, stroke: 0.6pt, fill: white)[
    #align(center + horizon)[#text(size: 9pt)[#body]]
  ])
#let flowline(tx, ty, x1, y1, x2, y2) = place(dx: 0cm, dy: 0cm,
  line(start: (tx(x1), ty(y1)), end: (tx(x2), ty(y2)), stroke: 0.6pt))

#align(center)[
  #box(width: 10.5cm, height: 7.7cm)[
    #flowline(txA, tyA, 3, 6, 0, 4.5)
    #flowline(txA, tyA, 3, 6, 6, 4.5)
    #flowline(txA, tyA, 0, 4.5, 0, 3)
    #flowline(txA, tyA, 0, 3, 3, 1.5)
    #flowline(txA, tyA, 6, 4.5, 3, 1.5)
    #flowline(txA, tyA, 3, 1.5, 3, 0)
    #flowbox(txA, tyA, 3, 6)[Choisir un nombre]
    #flowbox(txA, tyA, 0, 4.5)[Calculer son carré]
    #flowbox(txA, tyA, 6, 4.5)[Multiplier par 7]
    #flowbox(txA, tyA, 0, 3)[Multiplier par 3]
    #flowbox(txA, tyA, 3, 1.5)[Additionner les deux nombres]
    #flowbox(txA, tyA, 3, 0)[Soustraire 6]
  ]
]

+ Appliquer le *programme A* au nombre 5.
+ On utilise un tableur pour trouver les résultats correspondants à quelques nombres comme l'indique le tableau ci-contre.

  Parmi les quatre formules ci-dessous, recopier celle qui a été saisie dans la cellule `B2`, puis étirée vers le bas afin de calculer les résultats donnés par le programme A.

  _Aucune justification n'est attendue._

  #table(
    columns: 2, align: center, stroke: 0.6pt,
    [`= 3 * A2 * 2 + 7 * A2 - 6`], [`= 3 * 1 * 1 + 7 * 1 - 6`],
    [`= 3 * A2 * A2 + 7 * A2 - 6`], [`= 3 * A2 * 2 - 7 * A2 + 6`],
  )

  #align(center)[
    #table(
      columns: 3, align: center, stroke: 0.6pt,
      [], [A], [B],
      [1], [Nombre de départ], [Résultat du programme A],
      [2], [$-3,5$], [$6,25$],
      [3], [$-3$], [$0$],
      [4], [$-2,5$], [$-4,75$],
      [5], [$-2$], [$-8$],
      [6], [$-1,5$], [$-9,75$],
      [7], [$-1$], [$-10$],
      [8], [$-0,5$], [$-8,75$],
      [9], [$0$], [$-6$],
      [10], [$0,5$], [$-1,75$],
      [11], [$1$], [$4$],
      [12], [$1,5$], [$11,25$],
      [13], [$2$], [$20$],
    )
  ]
+ À l'aide du tableur, donner une valeur pour laquelle le *programme A* donne 0.

  _Aucune justification n'est attendue._
+ Si on note $x$ le nombre de départ, donner une expression littérale du programme A en fonction de $x$.

On considère maintenant le *programme B* suivant :

#let txB(x) = (x + 2.1) * 1cm
#let tyB(y) = (5.9 - y) * 1cm

#align(center)[
  #box(width: 10.5cm, height: 6.7cm)[
    #flowline(txB, tyB, 3, 5, 0, 3.5)
    #flowline(txB, tyB, 3, 5, 6, 2.75)
    #flowline(txB, tyB, 0, 3.5, 0, 2)
    #flowline(txB, tyB, 0, 2, 3, 0.5)
    #flowline(txB, tyB, 6, 2.75, 3, 0.5)
    #flowbox(txB, tyB, 3, 5)[Choisir un nombre]
    #flowbox(txB, tyB, 0, 3.5)[Multiplier par 3]
    #flowbox(txB, tyB, 6, 2.75)[Additionner 3]
    #flowbox(txB, tyB, 0, 2)[Soustraire 2]
    #flowbox(txB, tyB, 3, 0.5)[Multiplier les deux nombres]
  ]
]

#enum(
  start: 5,
  numbering: "1.",
  [Appliquer le *programme B* au nombre 5.],
  [Si on note $x$ le nombre de départ, donner une expression littérale du *programme B* en fonction de $x$.],
  [Mathis affirme que, quel que soit le nombre qu'il choisit, il trouvera le même résultat avec le *programme A* et le *programme B*. A-t-il raison ? Justifier.],
  [Résoudre l'équation $(3x - 2)(x + 3) = 0$.],
)

  En déduire les valeurs de $x$ pour lesquelles les programmes A et B donnent 0.
