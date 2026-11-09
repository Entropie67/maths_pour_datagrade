*1.* *Affirmation 1 : FAUSSE.*

Pour que $M$ soit le milieu de $[A B]$, il faut que $M$ soit sur le segment $[A B]$ *et* à égale distance de $A$ et de $B$. L'égalité $A M = M B$ ne suffit pas : $M$ peut être n'importe quel point de la médiatrice de $[A B]$.

Contre-exemple : $A B = 4$ cm, et $M$ est un point tel que $A M = M B = 3$ cm qui n'est pas sur $[A B]$ (le triangle $A M B$ est isocèle en $M$).

*2.* *Affirmation 2 : FAUSSE.*

Le jeu compte 32 cartes équiprobables. On compte les cartes qui sont un Valet ou un Cœur :

- 8 cartes de Cœur (7, 8, 9, 10, Valet, Dame, Roi, As) ;
- 3 Valets qui ne sont pas des Cœurs (Valet de Trèfle, de Pique et de Carreau).

Le Valet de Cœur est déjà compté parmi les Cœurs : il ne faut pas le compter deux fois. Donc $8 + 3 = 11$ cartes favorables et
$ P = frac(11, 32). $
Or $display(frac(3, 8)) = display(frac(12, 32))$, et $11 != 12$ : l'affirmation est fausse.

*3.* *Affirmation 3 : VRAIE.*

Le point $A$ est à l'intersection des deux droites : son abscisse $x$ vérifie $f(x) = g(x)$, soit
$ -2 x + 3 = 7 x. $
On ajoute $2 x$ aux deux membres : $3 = 9 x$, donc $x = display(frac(3, 9)) = display(frac(1, 3))$. L'ordonnée de $A$ est
$ g(display(frac(1, 3))) = 7 times frac(1, 3) = frac(7, 3). $
(On vérifie avec $f$ : $-2 times display(frac(1, 3)) + 3 = display(frac(-2 + 9, 3)) = display(frac(7, 3))$ ✓.)

*4.* *Affirmation 4 : VRAIE.*

Un nombre entier impair s'écrit $2 k + 1$ avec $k$ entier. Son carré vaut
$ (2 k + 1)^2 = 4 k^2 + 4 k + 1 = 2 (2 k^2 + 2 k) + 1. $
C'est « $2 times$ un entier, plus 1 » : c'est un nombre entier impair.

(Exemples : $3^2 = 9$, $5^2 = 25$, $7^2 = 49$.)

*5.* *Affirmation 5 : VRAIE.*

Si on note $x$ le nombre rentré au départ, le programme calcule : $8 times x$, puis $8 x + 10$, puis $(8 x + 10) div 2 = 4 x + 5$. On cherche $x$ tel que le résultat soit 8 :

- $4 x + 5 = 8$ ;
- $4 x = 3$ (on retranche 5) ;
- $x = display(frac(3, 4)) = "0,75"$ (on divise par 4).

Le nombre rentré au départ est $"0,75"$, qui est un nombre décimal.
