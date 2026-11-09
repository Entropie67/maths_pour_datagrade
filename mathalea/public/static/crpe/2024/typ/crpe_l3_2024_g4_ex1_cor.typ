// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*1.* Résumons dans un tableau les données du diagramme en barres, complété par les effectifs cumulés croissants (E.C.C.) :

#align(center)[
  #table(
    columns: 8,
    align: center + horizon,
    inset: 5pt,
    stroke: 0.5pt,
    fill: (x, y) => if x == 0 or y == 0 { luma(220) },
    [Salaires (€)], [1200], [1400], [1600], [1800], [2000], [2300], [3200],
    [Effectifs], [11], [4], [7], [5], [2], [1], [1],
    [E.C.C.], [11], [15], [22], [27], [29], [30], [31],
  )
]

L'effectif des employés est de 31 : la médiane est la valeur centrale, c'est-à-dire la 16$""^e$ valeur. Dans le tableau, la 16$""^e$ valeur est égale à 1 600~€ (la 12$""^e$ à la 22$""^e$ valeur valent toutes 1 600~€).

L'affirmation 1 est fausse : le salaire médian est de 1 600~€.

*2.* Un nombre décimal est un nombre qui peut s'écrire sous la forme d'une fraction décimale. Choisissons, par exemple, les nombres décimaux $1 / 10$ et $3 / 10$. Leur quotient vaut :

$ (1 / 10) / (3 / 10) = 1 / cancel(10) times cancel(10) / 3 = 1 / 3 $

$1 / 3$ n'est pas un nombre décimal, puisque son dénominateur 3 n'est pas une puissance de 2 ni de 5.

L'affirmation 2 est fausse.

*3.* Paul mange deux cinquièmes du paquet de 40 gâteaux, il reste donc trois cinquièmes. Il donne trois huitièmes de ce qu'il reste à sa sœur :

$ 3 / 8 times 3 / 5 = 9 / 40 $

Sachant qu'il y avait 40 gâteaux au départ :

$ 9 / 40 times 40 = 9 $

Paul a donné 9 gâteaux à sa sœur, et non 15.

L'affirmation 3 est fausse.

*4.* Si on effectue la division euclidienne de $a$ par 13, le reste est 9 : $a = 13 q_1 + 9$, où $q_1$ est un entier. De même, $b = 13 q_2 + 4$, où $q_2$ est un entier. En sommant :

$ a + b = (13 q_1 + 9) + (13 q_2 + 4) = 13 q_1 + 13 q_2 + 13 = 13 (q_1 + q_2 + 1) = 13 k $

où $k = q_1 + q_2 + 1$ est un entier. Donc $a + b$ est bien divisible par 13.

L'affirmation 4 est vraie.

*5.* Soit $f$ une fonction linéaire : il existe un réel $a$ tel que $f(x) = a x$. Pour deux nombres $x_1$ et $x_2$ :

$ f(x_1 + x_2) = a (x_1 + x_2) = a x_1 + a x_2 = f(x_1) + f(x_2) $

$f(x_1) + f(x_2)$ correspond bien à la somme des images de $x_1$ et $x_2$ par $f$.

L'affirmation 5 est vraie.
