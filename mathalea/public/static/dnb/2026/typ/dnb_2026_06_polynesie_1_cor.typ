*Partie A*

+ #enum(
    numbering: "a.",
    [D'après la figure, on a : #h(0.5em) $A B = 3 x + 1$.

    Avec $x = 10$, cela donne : #h(0.5em) $A B = 3 times 10 + 1 = 31$.

    La longueur $A B$ vaut donc 31.],
    [De même, on a : #h(0.5em) $A D = x - 2 = 10 - 2 = 8$.

    Comme $A B C D$ est un rectangle, ses côtés opposés sont de même longueur, donc :

    $cal(P)_(A B C D) = 2(A B + A D) = 2 times (31 + 8) = 2 times 39 = 78$.

    Le périmètre de $A B C D$ est bien de 78, pour $x = 10$.],
  )
+ En généralisant : #h(0.5em)
  $cal(P)_(A B C D) = 2(A B + A D) = 2 times (3 x + 1 + x - 2) = 2 times (4 x - 1) = 8 x - 2$.

  Le périmètre de $A B C D$ est bien donné par l'expression #h(0.5em) $8 x - 2$.

*Partie B*

+ Si on choisit $x = 7$ :
  - le périmètre de $A B C D$ est : #h(0.5em) $8 times 7 - 2 = 56 - 2 = 54$ ;
  - le périmètre de $I J K$ est : #h(0.5em) $6 times 7 + 9 = 42 + 9 = 51$.

  Comme les deux périmètres ne sont pas égaux, le programme va afficher «~Les deux périmètres ne sont pas égaux~» pendant 2 secondes.
+ #enum(
    numbering: "a.",
    [Dans la cellule `B2`, on veut afficher le périmètre de $A B C D$, donné par l'expression $8 x - 2$, en utilisant la valeur $x$ qui est renseignée dans la cellule `A2`.

    La formule correcte est donc : #h(0.5em) `=8*A2-2`.

    Pourquoi les autres propositions sont fausses :
    - `=8*5-2` #h(0.5em) renvoie la valeur correcte pour la cellule `B2`, mais renverra toujours 38 quand on l'étirera vers le bas, car le `5` ne sera pas modifié ;
    - `=8*B2-2` #h(0.5em) provoquera une erreur : c'est ce que l'on appelle une référence circulaire. La valeur de la cellule `B2` se fait à partir de la cellule `B2` : ça tourne en rond.
    - `=8*A1-2` #h(0.5em) provoquera une erreur : dans la cellule `A1`, il y a la lettre $x$, mais du coup, ce n'est pas un nombre que le tableur peut multiplier par 8.],
    [Nour a constaté que pour $x = 5$ le périmètre de $A B C D$ est *inférieur* à celui de $I J K$, par contre, pour $x = 6$, le périmètre de $A B C D$ est *supérieur* à celui de $I J K$.

    Elle se dit donc que les courbes représentant les périmètres en fonction de $x$ doivent se croiser, entre l'abscisse 5 et l'abscisse 6.],
  )
+ Résolvons l'équation :

  $ 8 x - 2 &= 6 x + 9 \
    8 x - 6 x &= 9 + 2 \
    2 x &= 11 \
    x &= 11/2 $

  L'équation a une seule solution : #h(0.5em) $11/2 = 5,5$.

  C'est pour $x = 5,5$ que les deux figures ont le même périmètre.
