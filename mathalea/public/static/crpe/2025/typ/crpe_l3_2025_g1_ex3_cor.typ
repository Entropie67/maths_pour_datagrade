// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*Partie A*

*1.* Le volume d'un parallélépipède rectangle est « longueur $times$ largeur $times$ hauteur » :
$ V = 30 times 15 times 3 = "1 350" " m"^3. $
La fosse a un volume de 1~350 m#super[3].

*2.* Une augmentation de 25 % revient à multiplier par $1 + "0,25" = "1,25"$ :
$ "1 350" times "1,25" = "1~687,5". $
(On peut aussi calculer 25 % de 1~350, soit $"0,25" times "1 350" = "337,5"$, puis $"1 350" + "337,5" = "1~687,5"$.)

Le volume de terre à évacuer est de 1~687,5 m#super[3].

*3.* On compte combien de fois 30 m#super[3] « rentrent » dans 1~687,5 m#super[3] :
$ "1~687,5" div 30 = "56,25". $
Avec 56 bennes, on évacue seulement $56 times 30 = "1 680"$ m#super[3] : il reste 7,5 m#super[3] de terre. Il faut donc une benne de plus.

Il faut au minimum *57 bennes*.

*Partie B*

*1.* Le volume d'eau a augmenté de $"564 000" - "562 100" = "1 900"$ litres. Le pourcentage d'augmentation est cette augmentation divisée par le volume de départ :
$ frac("1 900", "562 100") approx "0,003380" = "0,3380" % . $

Le volume d'eau a augmenté d'environ *0,34 %*.

*2.* La piscine est un parallélépipède rectangle de base $25 times "12,5"$ m. Le volume d'eau est de 564~000 L. Or $1 "m"^3 = "1 000"$ L, donc $"564 000"$ L $= 564$ m#super[3].

L'aire de la base est $25 times "12,5" = "312,5"$ m#super[2]. Comme $V = "aire de la base" times "hauteur"$, on obtient
$ "hauteur" = frac(564, "312,5") = "1,8048 m". $

La hauteur de l'eau est d'environ *1,80 m*.

*Partie C*

*1.* L'élève parcourt $16 times 25 = 400$ m en 10 minutes.

- En mètre par minute : $400 div 10 = 40$ m/min.
- En kilomètre par heure : en 1 heure (60 minutes), il parcourt $40 times 60 = "2 400"$ m, soit $2,4$ km.

La vitesse moyenne de cet élève est de 40 m/min, soit 2,4 km/h.

*2.* 10 minutes valent $10 times 60 = 600$ secondes. À 0,6 m/s, l'élève parcourt
$ "0,6" times 600 = 360 " m". $
Une longueur mesure 25 m et $360 div 25 = "14,4"$.

Cet élève a effectué *14 longueurs complètes*.

*3.* *a.* Pour l'élève 1, la distance (en m) est le nombre de longueurs (cellule B2) multiplié par 25. On saisit en B3 la formule
#align(center)[#raw("=B2*25")]
puis on la recopie vers la droite : en C3, elle devient #raw("=C2*25"), etc.

#sub[b][On range les valeurs : 15, 14, 10, 11, 12, 14, 11, 13, 16. Les élèves ayant parcouru 12 longueurs ou plus sont ceux qui ont fait 15, 14, 12, 14, 13 et 16 longueurs : il y en a 6 sur 9.
$ frac(6, 9) = frac(2, 3). $
La proportion est $display(frac(2, 3))$.]

#sub[c][On range les 9 valeurs dans l'ordre croissant :
$ 10 ; 11 ; 11 ; 12 ; 13 ; 14 ; 14 ; 15 ; 16. $
L'effectif est 9, impair : la médiane est la valeur du milieu, la $5^"e"$ valeur (il y en a 4 avant et 4 après). La médiane est *13*.

Interprétation : au moins la moitié des élèves de ce groupe ont effectué 13 longueurs ou moins, et au moins la moitié en ont effectué 13 ou plus.]

#sub[d][La somme des longueurs est $15 + 14 + 10 + 11 + 12 + 14 + 11 + 13 + 16 = 116$. La moyenne est
$ frac(116, 9) approx "12,89". $
Le nombre moyen de longueurs est d'environ *12,9*.]

#sub[e][Avec l'élève absent, il y aurait 10 élèves. Pour avoir une moyenne de 13 longueurs, le total devrait être $10 times 13 = 130$ longueurs. Le total actuel est 116, donc l'élève absent aurait dû effectuer
$ 130 - 116 = 14 $
longueurs.]
