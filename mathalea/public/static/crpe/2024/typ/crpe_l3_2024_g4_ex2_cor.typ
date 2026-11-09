// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

On dresse le tableau des points obtenus pour les 36 issues possibles, toutes équiprobables (dés non truqués) :

#align(center)[
  #table(
    columns: 7,
    align: center + horizon,
    inset: 5pt,
    stroke: 0.5pt,
    fill: (x, y) => if x == 0 or y == 0 { luma(220) },
    [dé 1 \\ dé 2], [1], [2], [3], [4], [5], [6],
    [1], [1000], [50], [50], [50], [50], [50],
    [2], [50], [200], [50], [50], [50], [50],
    [3], [50], [50], [300], [50], [50], [50],
    [4], [50], [50], [50], [400], [50], [50],
    [5], [50], [50], [50], [50], [500], [50],
    [6], [50], [50], [50], [50], [50], [600],
  )
]

*1.* Pour terminer la partie en un seul lancer, il faut obtenir une paire de 1. Il n'y a qu'une issue menant à cette éventualité sur un total de 36 résultats possibles :

$ P_1 = "nombre de cas favorables" / "nombre de cas possibles" = 1 / 36 $

La probabilité de terminer le jeu au premier lancer est de $display(frac(1, 36))$.

*2.*
#sub("a", [Le nombre de points possibles à obtenir lors d'un lancer peut être de 50, 200, 300, 400, 500, 600 ou 1 000. La seule façon d'obtenir 650 points en deux lancers est d'obtenir 50 points à un des deux lancers (un couple qui n'est pas une paire) et 600 points à l'autre (une paire de 6).

Pour obtenir 650 points en deux lancers, l'élève doit donc obtenir une paire de 6 à l'un des deux lancers et ne pas obtenir de paire à l'autre lancer.])

#sub("b", [Pour terminer le jeu au troisième lancer, il faut obtenir au moins 1 000 points. L'élève ayant déjà 650 points, il lui faut au minimum 350 points.

Quatre issues mènent à ce résultat : une paire de 1 (1 000 points), une paire de 4 (400 points), une paire de 5 (500 points) ou une paire de 6 (600 points).

$ P_2 = "nombre de cas favorables" / "nombre de cas possibles" = 4 / 36 = 1 / 9 $

La probabilité de terminer le jeu au troisième lancer est de $display(frac(1, 9))$.])
