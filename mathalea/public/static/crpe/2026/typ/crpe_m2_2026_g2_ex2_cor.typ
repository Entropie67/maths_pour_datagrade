*1.* Une minute vaut 60 secondes. La durée en secondes est « minutes × 60 + secondes ». Pour la ligne 3 : $4 times 60 + 30 = 270$ (c'est bien la valeur affichée). On saisit en D3 :

#align(center)[#raw("=B3*60+C3")]

puis on étire vers le bas.

*2.* *a.* La vitesse moyenne en m/s est la distance en mètres divisée par la durée en secondes : en G3, c'est F3 divisé par D3.
$ frac(600, 270) = frac(20, 9) approx "2,22" " m/s". $

La cellule G3 contient donc environ *2,22*.

*b.* Pour passer des m/s aux km/h, on multiplie par $3 600 div 1 000 = "3,6"$ (en 1 heure il y a 3 600 s, et 1 km = 1 000 m). La valeur exacte de la vitesse en m/s est $display(frac(20, 9))$, donc
$ frac(20, 9) times "3,6" = frac(20, 9) times frac(18, 5) = frac(360, 45) = 8. $

La cellule H3 contient donc exactement *8* (km/h).

(Vérification : 600 m en 270 s, soit 0,6 km en $display(frac(270, 3 600)) = "0,075"$ h, et $"0,6" div "0,075" = 8$ km/h ✓.)

*3.* Un tour mesure $600 div 3 = 200$ m (le tableau donne 600 m pour 3 tours). Huit tours font donc $8 times 200 = 1 600$ m $= "1,6"$ km.

La durée est la distance divisée par la vitesse :
$ t = frac("1,6", "9,8") " h" = frac(8, 49) " h" approx "0,1633 h". $
Pour la convertir en minutes, on multiplie par 60 : $display(frac(8, 49)) times 60 approx "9,796"$ min. On convertit la partie décimale en secondes : $"0,796" times 60 approx "47,8"$ s, soit 48 s.

La durée est d'environ *9 min 48 s*.

*4.* *a.* On calcule la moyenne en pondérant chaque vitesse par son effectif. L'effectif total est $2 + 5 + 8 + 12 + 13 + 10 + 7 + 3 = 60$ élèves.

$ "somme" = 2 times "2,35" + 5 times "2,4" + 8 times "2,43" + 12 times "2,5" + 13 times "2,54" + 10 times "2,67" + 7 times "2,78" + 3 times "2,9" $
$ = "4,7" + 12 + "19,44" + 30 + "33,02" + "26,7" + "19,46" + "8,7" = "154,02". $
$ "moyenne" = "154,02" div 60 = "2,567". $

La vitesse moyenne est de *2,567 m/s*, soit environ 2,57 m/s.

*b.* Il y a 60 élèves : la médiane est entre la 30e et la 31e valeur (rangées dans l'ordre croissant). On cumule les effectifs :

#align(center)[
  #table(
    columns: (2.8cm, ..range(8).map(_ => 1fr)),
    align: center + horizon,
    inset: 5pt,
    [Vitesse (m/s)], [2,35], [2,4], [2,43], [2,5], [2,54], [2,67], [2,78], [2,9],
    [Effectif cumulé], [2], [7], [15], [27], [40], [50], [57], [60],
  )
]

Les 28e à 40e valeurs valent toutes 2,54. Donc les 30e et 31e valeurs valent 2,54 : la médiane est *2,54 m/s*.

*Interprétation :* la moitié des élèves de cycle 3 ont couru à une vitesse inférieure ou égale à 2,54 m/s, et l'autre moitié à une vitesse supérieure ou égale à 2,54 m/s.
