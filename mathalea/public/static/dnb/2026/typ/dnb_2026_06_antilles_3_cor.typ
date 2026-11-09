+ Avec le tarif B, le prix payé pour douze demi-journées est, en euro :\
  $15 + 3,50 times 12 = 15 + 42 = 57$.
+ - $f(x)$ représente le tarif payé pour $x$ demi-journées avec le tarif B : $f(x) = 3,5 x + 15$.

    Chaque demi-journée $x$ coûte en euro 3,50 donc un total de $3,5 x$, auxquels on ajoute l'abonnement de 15 €.

  - $g(x)$ représente le tarif payé pour $x$ demi-journées avec le tarif C : $g(x) = 64$.

    Le tarif est constant, égal à 64 €, quel que soit le nombre de demi-journées.

  - $h(x)$ représente le tarif payé pour $x$ demi-journées avec le tarif A : $h(x) = 5,5 x$.

    Chaque demi-journée $x$ coûte 5,50 € donc un total de $5,5 x$ € pour $x$ demi-journées.
+ - $d_1$ est une droite dont l'ordonnée à l'origine est 15, donc est la représentation graphique de la fonction affine $f$.
  - $d_2$ est parallèle à l'axe des abscisses, donc représente la fonction constante $g$.
  - $d_3$ est une droite contenant l'origine ; elle représente la fonction linéaire $h$.
+ La droite $(d_1)$ ne représente pas une situation de proportionnalité, puisque la fonction associée n'est pas linéaire. Graphiquement, la droite ne passe pas par l'origine du repère ($f(0) eq.not 0$).
+ On cherche à quel moment le tarif B, représenté par des points de la droite $(d_1)$, devient plus avantageux que le tarif A (représenté par des points de la droite $(d_3)$).

  Plus avantageux, cela veut dire que cela coûte moins cher, pour le même nombre de demi-journées. On cherche donc à partir de quel antécédent les points de la droite $(d_1)$ sont en-dessous des points de la droite $(d_3)$.

  C'est à partir de 8 demi-journées que le tarif B est plus avantageux.

  _Vérification_ :

  - $f(7) = 3,5 times 7 + 15 = 24,5 + 15 = 39,50$ et $h(7) = 5,5 times 7 = 38,50$, donc $f(7) > h(7)$ ;
  - $f(8) = 3,5 times 8 + 15 = 28 + 15 = 43$ et $h(8) = 5,5 times 8 = 44$, donc $f(8) < h(8)$.

  #align(center)[
    #let sx(x) = x * 1cm
    #let sy(y) = (70 - y) * 0.135cm
    #box(width: 11.6cm, height: 10cm)[
      #place(dx: 0cm, dy: 0cm, polygon(
        fill: rgb(255, 230, 150),
        stroke: none,
        (sx(7.5), sy(41.25)),
        (sx(11.4), sy(62.7)),
        (sx(11.4), sy(54.9)),
      ))
      #for i in range(0, 12) [
        #place(dx: sx(i), dy: 0cm, line(start: (0cm, 0cm), end: (0cm, sy(0)), stroke: 0.3pt + gray))
      ]
      #for j in range(0, 8) [
        #place(dx: 0cm, dy: sy(j * 10), line(start: (0cm, 0cm), end: (sx(11.4), 0cm), stroke: 0.3pt + gray))
      ]
      #place(dx: 0cm, dy: 0cm, line(start: (sx(0), sy(0)), end: (sx(11.4), sy(0)), stroke: 1pt))
      #place(dx: 0cm, dy: 0cm, line(start: (sx(0), sy(0)), end: (sx(0), sy(70)), stroke: 1pt))
      #for i in range(1, 12) [
        #place(dx: sx(i) - 0.1cm, dy: sy(0) + 0.1cm)[#text(size: 7pt)[#i]]
      ]
      #for j in range(1, 8) [
        #place(dx: sx(0) - 0.75cm, dy: sy(j * 10) - 0.15cm)[#text(size: 7pt)[#(j * 10)]]
      ]
      #place(dx: sx(7.5), dy: sy(41.25), line(
        start: (0cm, 0cm),
        end: (0cm, sy(0) - sy(41.25)),
        stroke: 1.5pt + rgb(200, 170, 0),
      ))
      #place(dx: 0cm, dy: 0cm, line(start: (sx(0), sy(15)), end: (sx(11.4), sy(54.9)), stroke: 1pt + red))
      #place(dx: 0cm, dy: 0cm, line(start: (sx(0), sy(64)), end: (sx(11.4), sy(64)), stroke: 1pt + teal))
      #place(dx: 0cm, dy: 0cm, line(start: (sx(0), sy(0)), end: (sx(11.4), sy(62.7)), stroke: 1pt + blue))
      #place(dx: sx(4.6) - 0.2cm, dy: sy(30.96) - 0.4cm)[#text(fill: red, size: 8pt)[$(d_1)$]]
      #place(dx: sx(4.6) - 0.2cm, dy: sy(64) - 0.4cm)[#text(fill: teal, size: 8pt)[$(d_2)$]]
      #place(dx: sx(4.6) - 0.2cm, dy: sy(25.08) + 0.15cm)[#text(fill: blue, size: 8pt)[$(d_3)$]]
      #place(dx: sx(0) + 0.15cm, dy: sy(70) - 0.1cm)[#text(size: 8pt)[Prix en €]]
      #place(dx: sx(11.4) - 2.7cm, dy: sy(0) + 0.5cm)[#text(size: 7pt)[Nombre de demi-journées]]
      #place(dx: sx(8.6), dy: sy(58))[#text(size: 6.5pt)[Zone où le tarif B]]
      #place(dx: sx(8.6), dy: sy(56))[#text(size: 6.5pt)[est plus avantageux.]]
    ]
  ]
+ - Parmi les trois formules proposées, on procède par élimination :
    - `=15+3,5*x` ne convient pas, car le tableur ne connait pas $x$ : il faut lui expliquer dans quelle cellule il trouvera la valeur correspondant à ce que l'on veut afficher ;
    - `=15+3,5*1` ne convient pas : le résultat affiché dans la cellule *B3* serait correct, mais on veut que la formule soit correcte _étirée vers la droite_. Si on étire cette formule vers la droite, le calcul sera toujours le même, le 1 ne sera pas remplacé par 2, 3 et ainsi de suite ;
    - `=15+3,5*B1` est donc la bonne formule, par élimination, et parce que c'est bien dans la cellule *B1* que l'on va trouver l'antécédent du tarif que l'on veut calculer.

    La formule à taper est donc : `=15+3,5*B1`.
  - Le tarif C devient plus avantageux à partir de la 14#super[e] demi-journée, le prix devenant supérieur ou égal à 64 (la cellule *P2* contient un nombre plus grand que 64).

    Le tableur indique $64,5$ mais le résultat en euro et cent d'euro est $64,50$.

    _Vérification par le calcul (non demandée)_ :

    $3,5 x + 15 < 64$ revient à $3,5 x < 64 - 15$ ou $3,5 x < 49$ donc $x < 49 / (3,5)$.

    Comme $49 / (3,5) = 490/35 = (7 times 70) / (7 times 5) = 70/5 = 14$, on retrouve bien le résultat : à partir de 14 demi-journées.
