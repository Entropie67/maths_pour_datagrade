// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*Partie A*

*1.*
#sub("a", [Le volume $cal(V)_"dalle"$ du prisme est donné par la formule : aire de la base $times$ hauteur du prisme. On a alors :

$ cal(A)_(A B E D) times "0,15" = "9,825" $

$ cal(A)_(A B E D) = "9,825" / "0,15" = "65,5" $

L'aire du polygone $A B E D$ est de 65,5~$"m"^2$.])

#sub("b", [Le polygone $A B E D$ est un trapèze rectangle constitué du rectangle $A B C D$ de longueur 10~m et de largeur 5~m, et du triangle rectangle $B C E$ de base $[C E]$ et de hauteur $[B C]$ de 5~m.

$ cal(A)_(A B C D) + cal(A)_(B C E) = cal(A)_(A B E D) $

$ 10 times 5 + (C E times 5) / 2 = "65,5" $

$ 50 + (C E times 5) / 2 = "65,5" $

$ (C E times 5) / 2 = "65,5" - 50 = "15,5" $

$ C E times 5 = 2 times "15,5" = 31 $

$ C E = 31 / 5 = "6,2" $

Le segment $[C E]$ mesure 6,2~m.])

*2.* Sur les 12~$"m"^3$ de béton achetés, Claire en a utilisé 9,825~$"m"^3$ pour sa terrasse. Il lui en reste donc $12 - "9,825" = "2,175"$~$"m"^3$.

On calcule le volume de béton nécessaire pour une dalle en forme de pavé droit de 5~m de long, 3~m de large et 0,15~m de hauteur :

$ cal(V) = L times ell times h = 5 times 3 times "0,15" = "2,25" $

Comme $"2,25" > "2,175"$, Claire n'aura pas assez de béton pour construire une dalle de 15~cm de hauteur.

*Partie B*

*1.* Une augmentation de 20~% correspond à un coefficient multiplicateur de $1 + 20 / 100 = 1 + "0,2" = "1,2"$.

Dans la cellule `C2`, on peut entrer la formule `=1.2*B2`.

*2.* Le prix total est calculé en faisant le produit de la quantité de béton achetée (en mètres cubes) par le prix du mètre cube TTC, auquel on ajoute le prix de la livraison.

Dans la cellule `E2`, on peut entrer la formule `=A2*C2+D2`.

*3.* D'après le tableur, le tarif payé pour un achat de 3~$"m"^3$ de béton est de 526~€, dont 58~€ de livraison :

$ p = 58 / 526 approx "0,1103" approx 11 / 100 $

Pour une livraison de 3~$"m"^3$, les frais de livraison représentent environ 11~% du prix total payé.

*4.* Le camion-toupie a une contenance de 7~$"m"^3$ : pour se faire livrer 12~$"m"^3$, Claire aura besoin de deux camions-toupie. Elle paiera donc deux fois les frais de livraison, en plus du prix d'achat des 12~$"m"^3$ de béton TTC :

$ "Prix pour 12 m"^3 = 12 times 156 + 2 times 58 = 1872 + 116 = 1988 $

Claire devra payer 1~988~€ pour l'achat et la livraison de 12~$"m"^3$.

*Partie C*

*1.* La proportion $p_1$ de sable dans le mélange est :

$ p_1 = 120 / (120 + 180) = 120 / 300 = "0,4" = 40 / 100 $

Il y a 40~% de sable dans le mélange.

*2.* Soit $m$ la masse, en kilogramme, de sable nécessaire pour obtenir une proportion de 55~% :

$ m / (m + 180) = 55 / 100 $

$ 100 m = 55 (m + 180) = 55 m + 9900 $

$ 45 m = 9900 $

$ m = 9900 / 45 = 220 $

Il faudrait 220~kg de sable dans le mélange. Claire disposant déjà de 120~kg de sable, il lui en manque 100~kg.

Claire doit ajouter 100~kg de sable afin d'obtenir la granulosité souhaitée.

*3.* D'après la question précédente, le mélange contient 220~kg de sable et 180~kg de gravier, soit $220 + 180 = 400$~kg de mélange.

Il est conseillé d'ajouter 250~kg de ciment par tonne de mélange, soit 25~kg pour 100~kg de mélange. Pour 400~kg de mélange, il faut donc $4 times 25 = 100$~kg de ciment.

Le ciment est vendu par sacs de 35~kg : $100 / 35 approx "2,86"$, Claire devra donc acheter 3 sacs de ciment.

Le prix payé pour les trois sacs vaut :

$ 3 times "7,75" = "23,25" $

Claire devra débourser 23,25~€ pour le ciment.
