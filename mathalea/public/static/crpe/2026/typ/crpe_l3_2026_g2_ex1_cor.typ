*1.* Chaque dé peut donner 1, 2, 3 ou 4. On cherche la plus petite et la plus grande somme possibles, puis on vérifie que toutes les valeurs intermédiaires sont atteintes.

- Plus petite somme : $1 + 1 = 2$.
- Plus grande somme : $4 + 4 = 8$.

Toutes les sommes entre 2 et 8 sont possibles :

#align(center)[
  #table(
    columns: 7,
    align: center + horizon,
    inset: 6pt,
    [$2 = 1 + 1$], [$3 = 1 + 2$], [$4 = 1 + 3$], [$5 = 1 + 4$], [$6 = 2 + 4$], [$7 = 3 + 4$], [$8 = 4 + 4$],
  )
]

Les sommes possibles sont donc $2$, $3$, $4$, $5$, $6$, $7$ et $8$ : il y a bien *7 sommes possibles*.

*2.* Pour calculer des probabilités, on dresse le tableau de toutes les issues. Le premier dé donne la ligne et le second dé la colonne :

#align(center)[
  #table(
    columns: 6,
    align: center + horizon,
    inset: 6pt,
    fill: (x, y) => if x == 0 or y == 0 { gray.lighten(70%) } else { none },
    [+], [1], [2], [3], [4],
    [1], [2], [3], [4], [5],
    [2], [3], [4], [5], [6],
    [3], [4], [5], [6], [7],
    [4], [5], [6], [7], [8],
  )
]

Il y a $4 times 4 = 16$ issues possibles, qui ont toutes la même probabilité (les dés sont équilibrés). La somme 2 n'apparaît qu'une seule fois (avec $1 + 1$) :

$ P("somme égale à 2") = frac(1, 16). $

Or $display(frac(1, 16)) != display(frac(1, 7))$. *Non*, la probabilité d'obtenir une somme égale à 2 n'est pas $display(frac(1, 7))$. (Les 7 sommes possibles ne sont pas équiprobables : on ne peut pas faire « 1 cas sur 7 ».)

*3.* D'après le tableau :

- la somme 5 apparaît 4 fois, donc $P(5) = display(frac(4, 16)) = display(frac(1, 4))$ ;
- la somme 6 apparaît 3 fois, donc $P(6) = display(frac(3, 16))$.

On compare les deux fractions avec le même dénominateur : $display(frac(1, 4)) = display(frac(4, 16))$ et $4 > 3$, donc $display(frac(4, 16)) > display(frac(3, 16))$.

Oui, obtenir une somme égale à 5 (probabilité $display(frac(1, 4))$) est plus probable qu'obtenir une somme égale à 6 (probabilité $display(frac(3, 16))$).
