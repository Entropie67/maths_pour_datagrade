// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*Partie A*

*1.*
#sub("a", [Pour faire les 14 équipes, il faut calculer le nombre maximal d'élèves de CE2 et de CM1 que l'on peut répartir dans chaque équipe.

- Avec les CE2 : $72 = 14 times 5 + 2$, on peut mettre 5 élèves de CE2 dans chaque équipe.
- Avec les CM1 : $108 = 14 times 7 + 10$, on peut mettre 7 élèves de CM1 dans chaque équipe.

Chacune des 14 équipes sera composée de 5 élèves de CE2 et de 7 élèves de CM1.])

#sub("b", [Avec cette composition, 2 élèves de CE2 et 10 élèves de CM1 ne feront pas partie des équipes. Dans ces conditions, 12 élèves ne participeront pas au tournoi.])

*2.*
#sub("a", [On a $72 div 8 = 9$ et $108 div 8 = "13,5"$. Comme 72 est divisible par 8 mais pas 108, on ne peut pas constituer 8 équipes composées de la totalité des élèves de chaque niveau.])

#sub("b", [Décomposition en produit de facteurs premiers :

$ 72 = 2^3 times 3^2 quad "et" quad 108 = 2^2 times 3^3 $])

#sub("c", [Un diviseur commun à 72 et 108 est de la forme $2^alpha times 3^beta$ avec $alpha in {0 ; 1 ; 2}$ et $beta in {0 ; 1 ; 2}$. On obtient tous les diviseurs possibles en faisant varier $alpha$ et $beta$ :

#align(center)[
  #table(
    columns: 4,
    align: center + horizon,
    inset: 5pt,
    stroke: 0.5pt,
    fill: (x, y) => if x == 0 or y == 0 { luma(220) },
    [], [$3^0$], [$3^1$], [$3^2$],
    [$2^0$], [1], [3], [9],
    [$2^1$], [2], [6], [18],
    [$2^2$], [4], [12], [36],
  )
]

Les diviseurs communs à 72 et 108 sont 1 ; 2 ; 3 ; 4 ; 6 ; 9 ; 12 ; 18 et 36.])

#sub("d", [Le plus grand diviseur commun à 72 et 108 est 36. Le directeur pourra donc constituer au maximum 36 équipes. Or, $72 div 36 = 2$ et $108 div 36 = 3$.

Le directeur pourra constituer au maximum 36 équipes, composées chacune de 2 élèves de CE2 et de 3 élèves de CM1.])

*Partie B*

*1.* Il y a 22 élèves de CE2 de l'école Irène Joliot-Curie qui participent au tournoi, sur un total de $22 + 19 = 41$ élèves.

$ p_1 = 22 / 41 approx "0,54" = 54 / 100 $

Environ 54~% des élèves de l'école Irène Joliot-Curie qui participent au tournoi sont en CE2.

*2.* Le nombre moyen d'élèves de CM1 par école est :

$ overline(m) = (24 + 19 + 34 + 31) / 4 = 108 / 4 = 27 $

Il y a en moyenne 27 élèves par classe de CM1.

*3.* Au total, il y a $72 + 108 = 180$ élèves qui participent au tournoi, dont 108 sont en CM1. On est dans une situation d'équiprobabilité :

$ P_3 = "nombre de cas favorables" / "nombre de cas possibles" = 108 / 180 = "0,6" $

La probabilité de choisir un élève de CM1 est de 0,6.

*4.* Il y a 72 élèves de CE2 dont 20 élèves de l'école Aimé Césaire. On est dans une situation d'équiprobabilité :

$ P_4 = 20 / 72 = 5 / 18 $

La probabilité de choisir un élève de l'école Aimé Césaire est de $display(frac(5, 18))$.
