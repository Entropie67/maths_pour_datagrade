+ - On choisit 5 ;
  - d'une part, le carré de 5 est : #h(0.5em) $5^2 = 25$ ;

    puis, en multipliant ceci par 3 : #h(0.5em) $3 times 25 = 75$ ;
  - d'autre part, en multipliant 5 par 7 : #h(0.5em) $5 times 7 = 35$ ;
  - on additionne les deux nombres : #h(0.5em) $75 + 35 = 110$ ;
  - Finalement, on soustrait 6 : #h(0.5em) $110 - 6 = 104$.

  Le *programme A*, appliqué à 5, donne donc 104.
+ On veut dans `B2` le résultat du *programme A*, appliqué au nombre qui est dans la cellule `A2` :
  - On choisit `A2` ;
  - d'une part, le carré de `A2` est `A2` multiplié par lui même : #h(0.5em) `A2*A2` ;

    puis, en multipliant ceci par 3 : #h(0.5em) `3*A2*A2` ;
  - d'autre part, en multipliant `A2` par 7 : #h(0.5em) $7 * "A2"$ ;
  - on additionne les deux nombres : #h(0.5em) `3 * A2 * A2 + 7 * A2` ;
  - Finalement, on soustrait 6 : #h(0.5em) `3 * A2 * A2 + 7 * A2 - 6` ;

  Le *programme A* sera appliqué par la formule : `3 * A2 * A2 + 7 * A2 - 6`.
+ À l'aide du tableur, on constate que lorsqu'on prend $-3$ comme nombre de départ (cellule `A3`), on obtient 0 (cellule `B3`).
+ - On choisit $x$ ;
  - d'une part, le carré de $x$ est : #h(0.5em) $x^2$ ;

    puis, en multipliant ceci par 3 : #h(0.5em) $3 x^2$ ;
  - d'autre part, en multipliant $x$ par 7 : #h(0.5em) $7 x$ ;
  - on additionne les deux nombres : #h(0.5em) $3 x^2 + 7 x$ ;
  - Finalement, on soustrait 6 : #h(0.5em) $3 x^2 + 7 x - 6$.

  Avec $x$ comme nombre de départ, une expression littérale du *programme A* en fonction de $x$ est : #h(0.5em) $3 x^2 + 7 x - 6$
+ - On choisit 5 ;
  - d'une part, en multipliant 5 par 3 : #h(0.5em) $3 times 5 = 15$,

    puis, en soustrayant 2 : #h(0.5em) $15 - 2 = 13$ ;
  - d'autre part, en ajoutant 3 à 5 : #h(0.5em) $5 + 3 = 8$ ;
  - on multiplie les deux nombres : #h(0.5em) $13 times 8 = 104$ ;

  En appliquant le *programme B* à 5, on obtient aussi 104.
+ - On choisit $x$ ;
  - d'une part, en multipliant $x$ par 3 : #h(0.5em) $3 x$,

    puis, en soustrayant 2 : #h(0.5em) $3 x - 2$ ;
  - d'autre part, en ajoutant 3 à $x$ : #h(0.5em) $x + 3$ ;
  - on multiplie les deux nombres : #h(0.5em) $(3 x - 2)(x + 3)$ ;

  En appliquant le *programme B* à $x$, on obtient l'expression : #h(0.5em) $(3 x - 2)(x + 3)$.
+ Trouvons la forme développée réduite de l'expression littérale du *programme B* :

  $ (3 x - 2) times (x + 3) &= 3 x times x + 3 x times 3 + (-2) times x + (-2) times 3 \
    &= 3 x^2 + 9 x - 2 x - 6 \
    &= 3 x^2 + 7 x - 6 $

  On retrouve la même expression que le *programme A*, donc Mathis a raison.
+ Résolvons :

  $(3 x - 2)(x + 3) = 0$

  Un produit est nul si et seulement si l'un de ses facteurs est nul ; donc :

  $3 x - 2 = 0$ #h(0.5em) ou #h(0.5em) $x + 3 = 0$

  $3 x = 2$ #h(0.5em) ou #h(0.5em) $x = -3$

  $x = 2/3$ #h(0.5em) ou #h(0.5em) $x = -3$

  Donc l'équation a deux solutions, son ensemble des solutions est : #h(0.5em) $cal(S) = { -3 ; 2/3 }$.

  Ainsi les valeurs de $x$ pour lesquelles les *programmes A* et *B* donnent 0 sont $-3$ et $2/3$.
