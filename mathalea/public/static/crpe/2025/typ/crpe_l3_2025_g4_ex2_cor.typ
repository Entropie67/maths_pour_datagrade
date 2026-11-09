// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*1.* #h(0em)

#sub[a][Il y a $1 + 5 + 1 + 1 + 1 + 2 + 1 + 1 = 13$ benjamins. Pour calculer la médiane, on range les 13 distances dans l'ordre croissant. Comme 13 est impair, la médiane est la $7^"e"$ valeur (il y en a 6 avant et 6 après). On cumule les effectifs :

#align(center)[
  #table(
    columns: (3.2cm, ..range(8).map(_ => 1.2cm)),
    align: (left + horizon, ..range(8).map(_ => center + horizon)),
    inset: 4pt,
    [Distance (m)], [1 900], [2 100], [2 300], [2 500], [2 700], [2 900], [3 100], [3 200],
    [Effectif], [1], [5], [1], [1], [1], [2], [1], [1],
    [Effectif cumulé], [1], [6], [7], [8], [9], [11], [12], [13],
  )
]

La $7^"e"$ valeur est 2 300 : la médiane est *2 300 m*.

Interprétation : au moins la moitié des benjamins ont parcouru 2 300 m ou moins, et au moins la moitié en ont parcouru 2 300 ou plus.]

#sub[b][Il y a $13 + (0 + 2 + 3 + 2 + 3 + 2 + 2 + 0) = 13 + 14 = 27$ enfants. On calcule la somme de toutes les distances, avec les effectifs totaux de chaque distance (benjamins + benjamines) : 1 900 m pour 1 enfant, 2 100 m pour 7, 2 300 m pour 4, 2 500 m pour 3, 2 700 m pour 4, 2 900 m pour 4, 3 100 m pour 3 et 3 200 m pour 1.
$ "Somme" &= "1 900" + 7 times "2 100" + 4 times "2 300" + 3 times "2 500" \
&quad + 4 times "2 700" + 4 times "2 900" + 3 times "3 100" + "3 200" \
&= "68 200". $
La distance moyenne est
$ frac("68 200", 27) approx "2 525,9". $
La distance moyenne parcourue est d'environ *2 526 m*.]

#sub[c][On regarde chaque enfant dans le tableau des indices de forme.

- Benjamins (garçons) : « bon » de 2 400 à 3 000 m : 2 500 (1), 2 700 (1) et 2 900 (2), soit 4 garçons ; « très bon » (plus de 3 000 m) : 3 100 (1) et 3 200 (1), soit 2 garçons. Au total 6 garçons.
- Benjamines (filles) : « bon » de 2 200 à 2 800 m : 2 300 (3), 2 500 (2) et 2 700 (3), soit 8 filles ; « très bon » (plus de 2 800 m) : 2 900 (2) et 3 100 (2), soit 4 filles. Au total 12 filles.

Il y a $6 + 12 = 18$ enfants « bon » ou « très bon » sur 27, soit une proportion de
$ frac(18, 27) = frac(2, 3) approx "0,667" = "66,7" % . $
Environ *67 %* des enfants ont un indice de forme « bon » ou « très bon ».]

*2.* #h(0em)

#sub[a][On additionne les hauteurs des barres du diagramme : $2 + 1 + 4 + 3 + 4 + 6 + 5 + 2 = 27$. Il y a 27 enfants, comme au premier test : oui, *tous les benjamins et benjamines du club ont effectué ce second test*.]

#sub[b][L'étendue est la différence entre la plus grande et la plus petite valeur : $"3 200" - "1 900" = "1 300"$ m.]

#sub[c][Le taux d'évolution est $frac("valeur finale" - "valeur initiale", "valeur initiale")$ :
$ frac("2 693" - "2 526", "2 526") = frac(167, "2 526") approx "0,0661" = "6,61" %. $
La distance moyenne a augmenté d'environ *6,6 %*.]

*3.* #h(0em)

#sub[a][Il faut d'abord convertir la distance en kilomètres : 2 800 m $= "2,8"$ km. Alors
$ "VO"_2 "max" = "22,351" times "2,8" - "11,288" = "62,5828" - "11,288" = "51,2948". $
La $"VO"_2$ max est d'environ *51,3 mL/min/kg*.]

#sub[b][On cherche $D$ tel que $"22,351" times D - "11,288" = 47$ :
$ "22,351" times D &= 47 + "11,288" = "58,288" \
D &= frac("58,288", "22,351") approx "2,6078" . $
Il faut parcourir environ 2,6078 km, soit environ *2 608 m*.]
