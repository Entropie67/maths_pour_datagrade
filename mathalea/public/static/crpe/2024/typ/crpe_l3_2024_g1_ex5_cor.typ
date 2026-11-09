// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*Partie A*

*1.* Le géoplan dispose de 25 picots, soit 5 picots par côté.

Sur un côté, on peut construire 4 carrés ($5 - 1$), puisque 5 picots définissent 4 intervalles. Pour faire le tour du géoplan, il faut disposer 4 carrés sur chaque côté, soit $4 times 4 = 16$ carrés.

En dénombrant ainsi, on compte 2 fois chaque carré des coins du géoplan : il faut donc en retirer 4. Il faut alors $16 - 4 = 12$ carrés.

Il faut construire 12 carrés pour réaliser le tour du géoplan de 25 picots.

*2.* Si le géoplan dispose de 81 picots, il a 9 picots par côté.

Sur un côté, on peut construire 8 carrés ($9 - 1$), puisque 9 picots définissent 8 intervalles. Pour faire le tour du géoplan, il faut disposer 8 carrés sur chaque côté, soit $4 times 8 = 32$ carrés.

En dénombrant ainsi, on compte 2 fois chaque carré des coins du géoplan : il faut donc en retirer 4. Il faut alors $32 - 4 = 28$ carrés.

Il faut construire 28 carrés pour réaliser le tour du géoplan de 81 picots.

*3.* Si le géoplan dispose de $n^2$ picots, il a $n$ picots par côté.

Sur un côté, on peut construire $n - 1$ carrés, puisque $n$ picots définissent $n - 1$ intervalles. Pour faire le tour du géoplan, il faut disposer $n - 1$ carrés sur chaque côté, soit $4 (n - 1) = 4 n - 4$ carrés.

En dénombrant ainsi, on compte 2 fois chaque carré des coins du géoplan : il faut donc en retirer 4. Il faut alors $(4 n - 4) - 4 = 4 n - 8$ carrés.

Il faut construire $4 n - 8$ carrés pour réaliser le tour du géoplan de $n^2$ picots.

*4.* Le nombre de carrés construits doit être inférieur ou égal au nombre d'élastiques. On résout l'inéquation $4 n - 8 lt.eq 107$ :

$ 4 n lt.eq 107 + 8 quad "soit" quad 4 n lt.eq 115 quad "soit" quad n lt.eq 115 / 4 = "28,75" $

Le nombre $n$ étant un entier, il est au maximum égal à 28, et $n^2 = 28^2 = 784$.

Le géoplan doit avoir au maximum 784 picots.

*Partie B*

*1.* La figure obtenue est un trapèze dont les dimensions sont : une grande base de 12~cm, une petite base de 3~cm et une hauteur de 9~cm.

*2.*
#sub("a", [La figure est un trapèze, son aire est donnée par la formule $cal(A) = ((b + B) times h) / 2$, où $b$ est la mesure de la petite base, $B$ celle de la grande base et $h$ sa hauteur :

$ cal(A) = ((3 + 4 times 3) times (3 times 3)) / 2 = (15 times 9) / 2 = "67,5" $

Cette figure a une aire de $"67,5" "cm"^2$.])

#sub("b", [Nommons $A B C D$ ce trapèze, et notons $E$ le pied de la hauteur issue de $C$ :

$ cal(P)_(A B C D) = A B + B C + C D + D A = 9 + 3 + C D + 12 = 24 + C D $

La seule valeur qu'il nous manque, et qu'il faut calculer, est la longueur de $C D$.

Le triangle $D E C$ étant rectangle en $E$ par construction, on peut appliquer le théorème de Pythagore :

$ C D^2 = C E^2 + E D^2 = 9^2 + 9^2 = 81 + 81 = 162 $

$ C D = sqrt(162) = 9 sqrt(2) $

Le périmètre de cette figure est de $24 + 9 sqrt(2)$~cm.])

*3.* On complète la figure avec les données connues, puis au fur et à mesure.

Les picots de Scratch sont espacés de 70 pas. Le point de départ est en $A$, de coordonnées $(-140 ; 140)$ (le centre du repère est au centre du géoplan), et on est orienté vers la droite, donc en direction de $B$.

- En avançant de 210 pas, soit $3 times 70$ pas, on se retrouve en $B$. En tournant à droite de $90°$, on se retrouve orienté vers le bas. En avançant de 70 pas, on se retrouve en $C$.
- Ensuite, il faut tourner à droite afin d'être orienté en direction de $D$. Le triangle $D E C$ est rectangle isocèle en $E$, donc l'angle $hat(E C D)$ vaut $45°$. L'angle recherché est son angle complémentaire : $A = 45$.
- De $C$ à $D$, on a une longueur de $9 sqrt(2) = 3 sqrt(2)$ cm, soit $3 sqrt(2) times 3$ cm. Sachant que 3~cm correspondent à 70 pas, cela fait $3 sqrt(2) times 70 approx "296,96"$ pas, donc $B = 297$.
- Une fois en $D$, on tourne à droite de l'angle supplémentaire de $hat(C D E) = 45°$, soit $135°$, afin d'être orienté en direction de $A$ : $C = 135$.

On attribue donc 45 à A, 297 à B et 135 à C.
