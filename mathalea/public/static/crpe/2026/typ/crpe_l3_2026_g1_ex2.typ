#import "@preview/ctz-euclide:0.3.0": *

// Étape n : une ligne de n carreaux, puis deux lignes de n-1 carreaux
// sous les carreaux de droite, soit 3n - 2 carreaux au total.
#let etape(n) = ctz-canvas(length: 0.5cm, {
  for i in range(n) {
    cetz.draw.rect((i, 0), (i + 1, 1), fill: gray.lighten(40%), stroke: blue.darken(30%) + 0.6pt)
  }
  for i in range(1, n) {
    for j in (1, 2) {
      cetz.draw.rect((i, -j), (i + 1, -j + 1), fill: gray.lighten(40%), stroke: blue.darken(30%) + 0.6pt)
    }
  }
})

Les premières étapes d'un motif évolutif sont représentées ci-dessous :

#align(center)[
  #table(
    columns: (1fr, 1fr, 1fr, 1fr),
    align: (left + top, left + top, left + top, left + top),
    inset: 8pt,
    [Étape 1 \ #v(0.4cm) #align(center)[#etape(1)]],
    [Étape 2 : \ #v(0.4cm) #align(center)[#etape(2)]],
    [Étape 3 : \ #v(0.4cm) #align(center)[#etape(3)]],
    [Étape 4 : \ #v(0.4cm) #align(center)[#etape(4)]],
  )
]

*1.* Décrire comment on peut passer du motif d'une étape au motif de l'étape suivante.

*2.* Déterminer ainsi le nombre de carreaux composant le motif de l'étape 5 et celui de l'étape 20.

#grid(
  columns: (1fr, 5.5cm),
  column-gutter: 0.5cm,
  [*3.* Dans la feuille de calcul représentée ci-contre, quelle formule, à étirer vers le bas, peut-on entrer en cellule B3 afin d'automatiser le calcul du nombre de carreaux ?],
  align(horizon + right)[#image("crpe_l3_2026_g1_ex2-tableur.png", width: 5.5cm)],
)

*4.* Exprimer, en fonction de $n$, le nombre de carreaux composant le motif de l'étape $n$.

*5.* Le motif évolutif est-il composé d'exactement 100 carreaux à l'une de ses étapes ? Est-il composé d'exactement 2000 carreaux à l'une de ses étapes ?
