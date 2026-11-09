// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*1.*
#sub("a", [La transformation qui permet de passer du motif $M$ au motif $M_3$ est la symétrie axiale d'axe la droite $(A B)$.])
#sub("b", [La transformation qui permet de passer du motif $M$ au motif $M_1$ est la rotation de centre $C$ et d'angle $90°$ dans le sens direct.])

*2.*
#sub("a", [Le triangle $A B C$ est rectangle isocèle en $B$ d'après le codage de la figure. Dans un triangle, la somme des mesures des angles est égale à $180°$ :

$ hat(C A B) + hat(A B C) + hat(B C A) = 180° $

$ hat(C A B) + 90° + hat(B C A) = 180° $

$ hat(C A B) + hat(B C A) = 180° - 90° = 90° $

Le triangle étant isocèle en $B$, on a $hat(C A B) = hat(B C A) = 90° / 2 = 45°$.

La mesure de l'angle $hat(C A B)$ est égale à $45°$.])

#sub("b", [Dans le triangle $D A C$, où $hat(D A C) = 41°$, la somme des angles vaut $180°$ :

$ hat(A D C) + hat(A C D) = 180° - 41° = 139° $

Les triangles $A B C$ et $A E D$ sont isométriques, car ils ont tous les deux un angle droit compris entre deux segments de même longueur. Leur troisième côté a donc la même mesure : $A C = A D$.

Le triangle $D A C$ est alors isocèle en $A$, et ses deux angles à la base sont égaux :

$ hat(A D C) = hat(A C D) = 139° / 2 = "69,5"° $

On peut alors mesurer chaque angle intérieur du pentagone :

- $hat(E A B) = hat(E A D) + hat(D A C) + hat(C A B) = 45° + 41° + 45° = 131°$ ;
- $hat(A B C) = hat(D E A) = 90°$ ;
- $hat(C D E) = hat(B C D) = hat(B C A) + hat(A C D) = 45° + "69,5"° = "114,5"°$.

Les cinq angles du pentagone $A B C D E$ sont respectivement de $131°$ ; $90°$ ; $"114,5"°$ ; $"114,5"°$ et $90°$.])

#sub("c", [La somme $S$ des angles du pentagone $A B C D E$ est égale à :

$ S = 131° + 90° + "114,5"° + "114,5"° + 90° = 540° $

La somme des mesures des angles du pentagone $A B C D E$ est égale à $540°$.])

#sub("d", [On se place dans un pentagone simple (non croisé), qui peut être convexe ou non. Tout pentagone simple peut être décomposé en trois triangles. La somme des angles intérieurs de ce pentagone est égale à la somme des angles des trois triangles, soit :

$ 3 times 180° = 540° $

La somme des mesures des angles d'un pentagone simple est égale à $540°$.])
