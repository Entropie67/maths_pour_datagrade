// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*Partie A*

*1.* Le choix d'une échelle constitue une situation de proportionnalité : chaque mesure réelle est multipliée par un même coefficient pour obtenir la mesure sur le plan. Ici, 5~m correspondent à 1~cm sur le plan, soit un coefficient de $1 / 500$ (car $5 "m" = 500 "cm"$).

On peut récapituler les mesures dans un tableau de proportionnalité :

#align(center)[
  #table(
    columns: 5,
    align: (left + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
    inset: 5pt,
    stroke: 0.5pt,
    [Mesure réelle en m], [5], [$P A = 28$], [$A R = 10$], [$P S = 35$],
    [Mesure réelle en cm], [500], [2800], [1000], [3500],
    [Mesure sur le plan en cm], [1], ["5,6"], [2], [7],
  )
]

Le plan est donc construit avec $P A = "5,6"$~cm, $A R = 2$~cm, $P S = 7$~cm, $P R = "7,6"$~cm (car $P R = 28 + 10 = 38$~m), $A S = "4,2"$~cm et $R C = "5,7"$~cm. Le point $C$ se place à $P C = "9,5"$~cm (voir question 3).

*2.* Dans le triangle $P A S$ rectangle en $A$, on applique le théorème de Pythagore :

$ P S^2 = P A^2 + A S^2 $

$ A S^2 = 35^2 - 28^2 = 1225 - 784 = 441 $

$ A S = sqrt(441) = 21 $

On a bien $A S = 21$~m.

*3.* Les droites $(A S)$ et $(R C)$ sont perpendiculaires à la même droite $(P R)$ : elles sont donc parallèles. Les points $P$, $A$, $R$ d'une part et $P$, $S$, $C$ d'autre part sont alignés dans cet ordre. On peut appliquer le théorème de Thalès :

$ (P A) / (P R) = (P S) / (P C) = (A S) / (R C) $

Avec $P R = P A + A R = 28 + 10 = 38$~m :

$ 28 / 38 = 21 / (R C) $

$ R C = (21 times 38) / 28 = "28,5" $

On obtient $R C = "28,5"$~m.

*4.* Le quadrilatère $R A S C$ possède deux côtés parallèles, $[A S]$ et $[R C]$ : c'est un trapèze de hauteur $A R = 10$~m, car $(A R)$ est perpendiculaire à ces deux côtés. Son aire vaut :

$ cal(A)_(R A S C) = ((A S + R C) times A R) / 2 = ((21 + "28,5") times 10) / 2 = "247,5" $

L'aire du quadrilatère $R A S C$ est bien de 247,5~$"m"^2$.

*Partie B*

*1.* Pour deux couches de résine, il faut prévoir des pots pour recouvrir $2 times "247,5" = 495$~$"m"^2$ de béton. Un pot permet de recouvrir 56~$"m"^2$, donc $495 / 56 approx "8,84"$ : il faudra presque 9 pots.

La commune devra acheter 9 pots de résine pour recouvrir la zone bétonnée.

*2.* Soit $n$ le nombre de pots de résine achetés auprès du fournisseur.

#sub("a", [Le fournisseur A facture la résine et la pose par pot. Un pot acheté revient à 215,75~€, donc $f(n) = "215,75" n$.])

#sub("b", [Le fournisseur B facture le pot de résine 138,50~€ et la pose 600~€, quel que soit le nombre de pots achetés. Donc $g(n) = "138,5" n + 600$.])

*3.*
#sub("a", [On suppose que les deux courbes tracées sur le graphique correspondent chacune à l'une des fonctions $f$ et $g$. L'axe des abscisses représente le nombre de pots achetés, et l'axe des ordonnées le prix payé.

- La fonction $f$ est linéaire : sa représentation est une droite passant par l'origine, il s'agit de la courbe $C_1$ (en pointillés).
- La fonction $g$ est affine et non linéaire : sa représentation est une droite ne passant pas par l'origine, il s'agit de la courbe $C_2$.

Pour l'achat de 9 pots, la courbe représentative de $g$ ($C_2$) est en dessous de celle de $f$ ($C_1$). On lit aussi sur le graphique que l'image de 9 par $g$ vaut environ 1 850.

Il est donc préférable d'acheter chez le fournisseur B, et le tarif sera d'environ 1~850~€.])

#sub("b", [On calcule l'image de 9 par la fonction $g$ :

$ g(9) = "138,5" times 9 + 600 = "1246,5" + 600 = "1846,5" $

Les travaux coûteront 1~846,5~€ chez le fournisseur B.])

*Partie C*

*1.* Le fournisseur C facture le pot de résine 104,65~€ et la pose 995,75~€, quel que soit le nombre de pots achetés. Si $h$ est la fonction qui, au nombre de pots $n$, associe le prix payé en euros, on a $h(n) = "104,65" n + "995,75"$.

Dans la cellule `C2`, on peut donc saisir la formule `=104,65*A2+995,75`.

*2.* Les fonctions $g$ et $h$ sont toutes les deux croissantes, car leur coefficient directeur est positif. Il suffit donc de repérer le premier nombre de pots pour lequel le coût du fournisseur C devient inférieur au coût du fournisseur B. Pour 11 pots, le fournisseur B coûte 2~123,5~€ contre 2~146,9~€ pour C ; pour 12 pots, C coûte 2~251,55~€ contre 2~262~€ pour B.

À partir de 12 pots, l'offre du fournisseur C est plus intéressante que celle du fournisseur B.

*3.* Il faut résoudre l'inéquation $h(n) < g(n)$ :

$ "104,65" n + "995,75" < "138,5" n + 600 $

$ "995,75" - 600 < "138,5" n - "104,65" n $

$ "395,75" < "33,85" n $

$ n > "395,75" / "33,85" approx "11,69" $

Comme $n$ est un nombre entier, il doit être supérieur ou égal à 12. On retrouve bien le résultat précédent : c'est à partir de 12 pots que l'offre du fournisseur C est plus intéressante que celle du fournisseur B.
