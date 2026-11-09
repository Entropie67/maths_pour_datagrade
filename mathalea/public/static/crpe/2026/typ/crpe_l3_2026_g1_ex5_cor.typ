// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*1.* Entre O (abscisse 0) et U (abscisse 1), il y a 8 intervalles de même longueur : chaque graduation représente donc $display(frac(1, 8))$ d'unité.

- Le point A est situé 4 graduations après O : $a = 4 times display(frac(1, 8)) = display(frac(4, 8)) = display(frac(1, 2))$.
- Le point B est situé 11 graduations après O (3 graduations après U) : $b = 11 times display(frac(1, 8)) = display(frac(11, 8))$.

Donc $a = display(frac(1, 2)) = "0,5"$ et $b = display(frac(11, 8)) = "1,375"$.

*2.* L'abscisse du milieu d'un segment est la moitié de la somme des abscisses des extrémités (c'est le nombre « au milieu » des deux).

#sub("a", [Milieu de $[O A]$ : $display(frac(0 + 1/2, 2)) = display(frac(1, 4))$ (la moitié de $display(frac(1, 2))$).

Le milieu de $[O A]$ a donc pour abscisse $display(frac(1, 4)) = "0,25"$.])

#sub("b", [Milieu de $[O B]$ : la moitié de $display(frac(11, 8))$, soit $display(frac(11, 8)) div 2 = display(frac(11, 16))$.

Le milieu de $[O B]$ a donc pour abscisse $display(frac(11, 16)) = "0,6875"$.])

*3.* Le segment $[A B]$ est formé de tous les points dont l'abscisse est comprise entre celle de A et celle de B, c'est-à-dire entre $"0,5"$ et $display(frac(11, 8)) = "1,375"$. Il suffit donc de comparer $c$ et $d$ à ces deux nombres.

*Point C :* $c = "0,45"$. Comme $"0,45" < "0,5"$ (45 centièmes sont moins que 50 centièmes), l'abscisse de C est plus petite que celle de A. *C n'appartient pas à $[A B]$.*

*Point D :* $d = display(frac(4, 3))$.

- On le compare à $a$ : $display(frac(4, 3)) > 1$ et $1 > "0,5"$, donc $d > a$.
- On le compare à $b$ en mettant les deux fractions au même dénominateur, 24 (3 × 8 = 24) :
  $ display(frac(4, 3)) = display(frac(4 times 8, 3 times 8)) = display(frac(32, 24)) quad "et" quad display(frac(11, 8)) = display(frac(11 times 3, 8 times 3)) = display(frac(33, 24)). $
  Comme $32 < 33$, on a $display(frac(4, 3)) < display(frac(11, 8))$, donc $d < b$.

On a donc $a < d < b$ : *D appartient à $[A B]$.*
