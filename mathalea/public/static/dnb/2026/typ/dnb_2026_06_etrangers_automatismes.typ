Pour chaque question, recopier sur la copie son numéro et la réponse correspondante.

Pour cette partie, aucune justification n'est demandée.

Pour les questions à choix multiple, une seule réponse est exacte.

=== Question 1

Voici la série des températures minimales relevées à Strasbourg lors des cinq premiers jours de février : 0 °C ; $-1$ °C ; $3$ °C ; $7$ °C ; $1$ °C.

Déterminer la médiane de cette série.

#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  [
    *Question 2*

    Quelle est l'image du motif n°4 par la translation qui transforme le motif n°2 en n°6 ?
  ],
  [
    #let tx(x) = x * 1.2cm
    #let ty(y) = (3.5 - y) * 1cm
    #let motif-pts = ((0, 0), (0.7, 0.35), (1.1, 0), (1.8, 1), (1.4, 1.35), (0.7, 1))
    #let motif-at(ox, oy) = polygon(
      fill: none, stroke: 0.6pt,
      ..motif-pts.map(p => (tx(p.at(0) + ox), ty(p.at(1) + oy))),
    )
    #box(width: 6.6cm, height: 3.5cm)[
      #place(dx: 0cm, dy: 0cm, motif-at(0, 0))
      #place(dx: 0cm, dy: 0cm, motif-at(1.1, 0))
      #place(dx: 0cm, dy: 0cm, motif-at(2.2, 0))
      #place(dx: 0cm, dy: 0cm, motif-at(0.7, 1))
      #place(dx: 0cm, dy: 0cm, motif-at(1.8, 1))
      #place(dx: 0cm, dy: 0cm, motif-at(2.9, 1))
      #place(dx: 0cm, dy: 0cm, motif-at(1.4, 2))
      #place(dx: 0cm, dy: 0cm, motif-at(2.5, 2))
      #place(dx: 0cm, dy: 0cm, motif-at(3.6, 2))
      #place(dx: tx(1) - 0.15cm, dy: ty(0.7) - 0.15cm)[#text(size: 9pt)[n°7]]
      #place(dx: tx(2.1) - 0.15cm, dy: ty(0.7) - 0.15cm)[#text(size: 9pt)[n°8]]
      #place(dx: tx(3.2) - 0.15cm, dy: ty(0.7) - 0.15cm)[#text(size: 9pt)[n°9]]
      #place(dx: tx(1.8) - 0.15cm, dy: ty(1.7) - 0.15cm)[#text(size: 9pt)[n°4]]
      #place(dx: tx(2.9) - 0.15cm, dy: ty(1.7) - 0.15cm)[#text(size: 9pt)[n°5]]
      #place(dx: tx(4.0) - 0.15cm, dy: ty(1.7) - 0.15cm)[#text(size: 9pt)[n°6]]
      #place(dx: tx(2.6) - 0.5cm, dy: ty(2.7) - 0.15cm)[#text(size: 9pt)[n°1]]
      #place(dx: tx(3.7) - 0.5cm, dy: ty(2.7) - 0.15cm)[#text(size: 9pt)[n°2]]
      #place(dx: tx(4.8) - 0.5cm, dy: ty(2.7) - 0.15cm)[#text(size: 9pt)[n°3]]
    ]
  ],
)

=== Question 3

Une boîte opaque contient 3 boules rouges et 5 boules vertes identiques et indiscernables au toucher. On pioche une boule au hasard.

Quelle est la probabilité qu'elle soit rouge ?

#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  [
    *Question 4*

    Recopier sur la copie et compléter avec des longueurs des côtés du triangle $J L K$ pour que l'égalité ci-dessous soit vraie.

    $ cos(hat(L K J)) = (dots.h.c) / (dots.h.c) $
  ],
  [
      #ctz-canvas({
        import cetz.draw: *
        ctz-init()
        ctz-def-points(J: (0, 0), K: (4.2, -0.5), L: (2, 1.5))
        ctz-def-polygon("jkl", "J", "K", "L")
        ctz-draw("jkl", stroke: black)
        ctz-draw-angle("K", "L", "J")
        ctz-draw-mark-right-angle("J", "L", "K", size: 0.3)
        ctz-draw-labels("J", "L", "K",
          J: "below left",
          K: "below right",
          L: "above")
        })
  ],
)

=== Question 5

La distance entre la Terre et Mars est environ égale à $311200000$ kilomètres.

Donner la notation scientifique de $311200000$.

=== Question 6

Charlie a effectué un trajet en vélo en 2 h 30 min à une vitesse moyenne de 40 km/h.

Calculer la distance, en km, parcourue par Charlie.

=== Question 7

Recopier sur la copie la forme factorisée de l'expression $5x + 5$.

#table(
  columns: 4, align: center, stroke: 0.6pt,
  [$5(x+1)$], [$5(x+5)$], [$10x$], [$25x$],
)

=== Question 8

Un article coûte 80 €. Son prix baisse de 10 %. Recopier sur la copie le calcul permettant de trouver le prix final de l'article.

#table(
  columns: 4, align: center, stroke: 0.6pt,
  [$80 - 10$], [$80 - 10/100$], [$80 - 10/100 times 80$], [$(80 - 10/100) times 80$],
)

=== Question 9

Le graphique suivant donne la hauteur d'eau dans le port de Quiberon le 23 juillet 2025.

#align(center)[
  #import "@preview/lilaq:0.6.0" as lq
  #let x = (13,14.5,17,19,20)
  #let y = (2.7,4,4.7,4,3.2)
  #lq.diagram(
    lq.plot(x, y, smooth: true, mark:none),
    title: [Hauteur d'eau dans le port de Quiberon \ 23 juillet 2025],
    xlim: (12,20),
    ylim: (2,5),
    xlabel: [Heure (en h)],
    ylabel: [Hauteur d'eau (en m)],
    width: 8cm,
    xaxis: (tick-distance: 1, subticks: 1),
    yaxis: (tick-distance: 1, subticks: 1),
    grid: (stroke:0.5pt + luma(80%),stroke-sub: 0.5pt + luma(80%))
)
]

Avec la précision permise par le graphique, recopier sur la copie la durée pendant laquelle la hauteur d'eau dans le port a été supérieure à 4 m.

#table(
  columns: 4, align: center, stroke: 0.6pt,
  [2 h 30 min], [4 h 30 min], [5 h 30 min], [7 h],
)


