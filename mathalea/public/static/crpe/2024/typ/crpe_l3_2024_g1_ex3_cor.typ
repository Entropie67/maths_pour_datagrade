// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

#import "@preview/cetz:0.4.2": canvas, draw

*Partie A*

Un agrandissement de facteur 2 signifie qu'il faut multiplier toutes les longueurs par 2. La longueur du côté du carré vaut donc $2 times 19 = 38$~mm.

On a par exemple le patron suivant (les faces opposées 1 et 6, 2 et 5, 3 et 4 ont bien pour somme 7) :

#align(center)[
  #canvas(length: 1.1cm, {
    let carres = (
      (0, 1, "1"), (1, 1, "3"), (2, 1, "6"), (3, 1, "4"),
      (1, 0, "2"), (1, 2, "5"),
    )
    for (x, y, t) in carres {
      draw.rect((x, y), (x + 1, y + 1), stroke: 0.6pt + purple)
      draw.content((x + 0.5, y + 0.5), text(fill: purple)[#t])
    }
  })
]

*Partie B*

*1.* On peut modéliser la situation par un tableau à double entrée. Les dés étant équilibrés, toutes les issues du tableau sont équiprobables.

#align(center)[
  #table(
    columns: 7 * (1fr,),
    align: center + horizon,
    inset: 4pt,
    fill: (x, y) => if x == 0 or y == 0 { luma(220) },
    [], [1], [2], [3], [4], [5], [6],
    [1], [2], [3], [4], [5], [6], [7],
    [2], [3], [4], [5], [6], [7], [8],
    [3], [4], [5], [6], [7], [8], [9],
    [4], [5], [6], [7], [8], [9], [10],
    [5], [6], [7], [8], [9], [10], [11],
    [6], [7], [8], [9], [10], [11], [12],
  )
]

Les résultats possibles de cette expérience aléatoire sont 2 ; 3 ; 4 ; 5 ; 6 ; 7 ; 8 ; 9 ; 10 ; 11 ; 12.

*2.* On note $A$ l'événement « La somme obtenue est égale à 4 ». Il y a 3 issues possibles menant à une somme égale à 4, et 36 issues au total.

$ P(A) = 3 / 36 = 1 / 12 $

La probabilité d'obtenir une somme égale à 4 est de $display(frac(3, 36)) = display(frac(1, 12))$.

*3.* #sub("a", [En observant le tableau, on remarque que la somme qui apparaît le plus souvent est 7. Les issues étant équiprobables, la somme qui a la plus grande probabilité d'apparaître est donc 7.])

#sub("b", [On note $B$ l'événement « La somme obtenue est égale à 7 ». Il y a 6 issues possibles menant à cette somme.

$ P(B) = 6 / 36 = 1 / 6 $

La probabilité d'obtenir une somme égale à 7 est de $display(frac(6, 36)) = display(frac(1, 6))$.])

*Partie C*

On modélise la situation par un tableau. Les dés sont équilibrés, toutes les issues sont équiprobables.

#align(center)[
  #table(
    columns: 7 * (1fr,),
    align: center + horizon,
    inset: 4pt,
    fill: (x, y) => if x == 0 or y == 0 { luma(220) },
    [], [1], [2], [3], [4], [5], [6],
    [1], [0], [1], [2], [3], [4], [5],
    [2], [1], [0], [1], [2], [3], [4],
    [3], [2], [1], [0], [1], [2], [3],
    [4], [3], [2], [1], [0], [1], [2],
    [5], [4], [3], [2], [1], [0], [1],
    [6], [5], [4], [3], [2], [1], [0],
  )
]

On a 36 issues possibles. Pour obtenir une probabilité de $display(frac(1, 6)) = display(frac(6, 36))$, il faut trouver un événement comportant 6 issues.

En observant le tableau, on a deux événements valables : un écart égal à 0 ou un écart égal à 3.

Les événements « l'écart entre les deux nombres est nul » et « l'écart entre les deux nombres vaut 3 » ont une probabilité de $display(frac(1, 6))$.
