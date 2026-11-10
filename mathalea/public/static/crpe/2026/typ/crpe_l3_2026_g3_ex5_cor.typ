*1.*

*a.* On applique le programme A à $display(frac(1, 3))$ :

- Choisir un nombre : $display(frac(1, 3))$ ;
- Lui soustraire 2 : $display(frac(1, 3)) - 2 = display(frac(1, 3)) - display(frac(6, 3)) = -display(frac(5, 3))$ ;
- Prendre le carré du résultat : $(-display(frac(5, 3)))^2 = display(frac(25, 9))$ (un carré est toujours positif, et $(-5)^2 = 25$, $3^2 = 9$).

On obtient $display(frac(25, 9))$.

*b.* Si on part de $x$, le programme A donne $(x - 2)^2$. On cherche un nombre dont le carré est 9 : ce nombre est 3 ou $-3$. Il faut donc que $x - 2 = 3$ ou $x - 2 = -3$.

- $x - 2 = 3$ donne $x = 5$.
- $x - 2 = -3$ donne $x = -1$.

On peut choisir 5 (ou $-1$). Vérification avec 5 : $5 - 2 = 3$, puis $3^2 = 9$ ✓.

*2.*

*a.* On suit le programme B avec un nombre de départ $x$ :

- Choisir un nombre : $x$ ;
- Le multiplier par 3 : $3 x$ ;
- Soustraire 4 : $3 x - 4$ ;
- Multiplier le résultat par le nombre de départ : $(3 x - 4) times x$.

On obtient donc $f(x) = (3 x - 4) x = 3 x^2 - 4 x$.

*b.* On cherche les nombres $x$ tels que $f(x) = 0$, c'est-à-dire $(3 x - 4) times x = 0$. Or un produit de deux facteurs est nul si, et seulement si, l'un des facteurs est nul :

- soit $x = 0$ ;
- soit $3 x - 4 = 0$, donc $3 x = 4$, donc $x = display(frac(4, 3))$.

Les nombres de départ sont $0$ et $display(frac(4, 3))$.

*c.* On cherche les nombres $x$ pour lesquels les deux programmes donnent le même résultat :
$ (x - 2)^2 = (3 x - 4) x. $

On développe chaque membre : $(x - 2)^2 = x^2 - 4 x + 4$ (identité remarquable $(a - b)^2 = a^2 - 2 a b + b^2$) et $(3 x - 4) x = 3 x^2 - 4 x$. L'équation devient
$ x^2 - 4 x + 4 = 3 x^2 - 4 x. $
On ajoute $4 x$ aux deux membres : $x^2 + 4 = 3 x^2$. On retranche $x^2$ : $4 = 2 x^2$. On divise par 2 : $x^2 = 2$.

Un nombre dont le carré est 2 est $sqrt(2)$ ou $-sqrt(2)$.

Les deux programmes donnent le même résultat pour $x = sqrt(2)$ et pour $x = -sqrt(2)$ (le résultat est alors $(sqrt(2) - 2)^2 = 6 - 4 sqrt(2)$ pour le premier).
