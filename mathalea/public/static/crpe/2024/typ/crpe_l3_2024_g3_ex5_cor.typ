// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*1.* Avec le nombre $-3$ choisi au départ :

- programme A : on élève au carré, $(-3)^2 = 9$, puis on soustrait le quadruple du nombre choisi, $9 - (4 times (-3)) = 9 + 12 = 21$ ;
- programme B : on calcule $(-3) - 9 = -12$ d'un côté et $(-3) + 3 = 0$ de l'autre, puis on multiplie : $-12 times 0 = 0$.

Si l'on choisit $-3$ comme nombre de départ, on obtient 21 avec le programme A et 0 avec le programme B.

*2.* Soit $x$ le nombre choisi. Avec le programme B, on obtient $(x - 9)$ d'un côté et $(x + 3)$ de l'autre, puis :

$ (x - 9)(x + 3) = x times x + x times 3 - 9 times x - 9 times 3 $

$ = x^2 + 3 x - 9 x - 27 = x^2 - 6 x - 27 $

Avec $x$ comme nombre initial, le programme B donne bien $x^2 - 6 x - 27$.

*3.* Avec le programme A, on élève $x$ au carré puis on soustrait son quadruple : on obtient $x^2 - 4 x$.

Les nombres $x$ qui donnent le même résultat avec les deux programmes vérifient :

$ x^2 - 4 x = x^2 - 6 x - 27 $

En retranchant $x^2$ aux deux membres :

$ -4 x = -6 x - 27 $

$ 2 x = -27 $

$ x = -27 / 2 $

Le nombre $-27 / 2$ donne le même résultat avec les deux programmes.
