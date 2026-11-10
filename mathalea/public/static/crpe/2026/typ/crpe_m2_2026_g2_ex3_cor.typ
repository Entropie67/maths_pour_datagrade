*Partie A*

*1.* Le dé cubique a 6 résultats possibles (chiffre des dizaines) et le dé tétraédrique en a 4 (chiffre des unités). À chaque résultat du premier dé on peut associer chacun des 4 résultats du second : il y a $6 times 4 = 24$ issues, qui ont toutes la même probabilité (les dés sont équilibrés).

Il y a donc 24 issues (les nombres 11, 12, 13, 14, 21, ..., 64).

*2.* *a.* L'événement A « obtenir un nombre supérieur ou égal à 30 » est réalisé quand le chiffre des dizaines est 3, 4, 5 ou 6. Il y a 4 dizaines possibles et 4 unités possibles : $4 times 4 = 16$ issues (de 31 à 64).
$ P(A) = frac(16, 24) = frac(2, 3). $

*b.* L'événement B « obtenir un multiple de 3 » : un nombre est multiple de 3 si la somme de ses chiffres est un multiple de 3. On cherche, pour chaque chiffre des unités $u$ (de 1 à 4), les chiffres des dizaines $d$ (de 1 à 6) tels que $d + u$ soit un multiple de 3 :

- $u = 1$ : $d = 2$ ou $5$ (nombres 21 et 51) ;
- $u = 2$ : $d = 1$ ou $4$ (nombres 12 et 42) ;
- $u = 3$ : $d = 3$ ou $6$ (nombres 33 et 63) ;
- $u = 4$ : $d = 2$ ou $5$ (nombres 24 et 54).

Les nombres multiples de 3 sont : 12, 21, 24, 33, 42, 51, 54, 63. Il y en a 8.
$ P(B) = frac(8, 24) = frac(1, 3). $

*Partie B*

*1.* Les produits possibles sont des entiers compris entre $1 times 1 = 1$ et $6 times 4 = 24$. Un événement impossible est par exemple « obtenir un produit égal à 25 » (ou un produit égal à 0, ou un produit égal à 7).

*2.* L'événement C : « obtenir un nombre pair multiple de 3 » est un multiple de 6 (un nombre à la fois pair et multiple de 3). On cherche les produits égaux à 6, 12, 18 ou 24. On dresse le tableau des produits (dé cubique en lignes, dé tétraédrique en colonnes) :

#align(center)[
  #table(
    columns: 5,
    align: center + horizon,
    inset: 6pt,
    fill: (x, y) => if x == 0 or y == 0 { gray.lighten(70%) } else { none },
    [$times$], [1], [2], [3], [4],
    [1], [1], [2], [3], [4],
    [2], [2], [4], [6], [8],
    [3], [3], [6], [9], [12],
    [4], [4], [8], [12], [16],
    [5], [5], [10], [15], [20],
    [6], [6], [12], [18], [24],
  )
]

On compte les cases dont le produit est un multiple de 6 :

- le produit 6 apparaît 3 fois ($2 times 3$, $3 times 2$, $6 times 1$) ;
- le produit 12 apparaît 3 fois ($3 times 4$, $4 times 3$, $6 times 2$) ;
- le produit 18 apparaît 1 fois ($6 times 3$) ;
- le produit 24 apparaît 1 fois ($6 times 4$).

Il y a donc $3 + 3 + 1 + 1 = 8$ issues favorables sur 24.
$ P(C) = frac(8, 24) = frac(1, 3). $
