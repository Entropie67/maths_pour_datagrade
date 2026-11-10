// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*1.* On considère par exemple la fraction $display(frac(1, 3))$. Cette fraction est irréductible et son dénominateur, 3, n'est pas une puissance de 2 ni de 5 : elle n'est donc pas décimale.

L'affirmation 1 est fausse.

*2.* Soit $n$ un nombre entier relatif. Il peut s'écrire $n / 1 = n / 10^0$, qui est une fraction décimale puisque son dénominateur est une puissance de 10 : c'est donc un nombre décimal.

L'affirmation 2 est vraie.

*3.* Soit $n$ un nombre impair, il peut s'écrire $n = 2 p + 1$ où $p$ est un entier. Alors :

$ (2 p + 1)^2 &= (2 p)^2 + 2 times 2 p times 1 + 1^2 \
  &= 4 p^2 + 4 p + 1 \
  &= 2 (2 p^2 + 2 p) + 1 $

Le nombre $2 p^2 + 2 p$ est un entier, donc $(2 p + 1)^2$ est de la forme $2 k + 1$ : il est impair.

L'affirmation 3 est vraie.

*4.* Prenons par exemple $a = 1$ et $b = 1 / 2$. Le produit $a b$ vaut $1 times 1 / 2 = 1 / 2$. Or, $1 / 2$ n'est pas supérieur ou égal à $1$ : c'est un contre-exemple.

L'affirmation 4 est fausse.

*5.* Une augmentation de 15~% correspond à un coefficient multiplicateur de $1 + 15 / 100 = "1,15"$, et une diminution de 15~% à un coefficient de $1 - 15 / 100 = "0,85"$. Une augmentation de 15~% suivie d'une diminution de 15~% correspond alors à un coefficient global de :

$ "1,15" times "0,85" = "0,9775" = 1 - "0,0225" = 1 - "2,25" / 100 $

Ce coefficient correspond à une diminution de 2,25~%, et non à la valeur initiale.

L'affirmation 5 est fausse.
