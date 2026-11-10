// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*1.* Dans cette configuration, $P$ est sur le segment $[A B]$ et sur la droite $(I J)$. Les droites $(A I)$ et $(B J)$ sont toutes deux perpendiculaires à $(I J)$, donc elles sont parallèles. Les triangles $A I P$ et $B J P$ ont leurs côtés proportionnels (théorème de Thalès) :
$ frac(I P, J P) = frac(A I, B J) = frac(30, 46). $
Comme $P$ est entre $I$ et $J$, on a $J P = 120 - I P = 120 - x$. Donc
$ frac(x, 120 - x) = frac(30, 46). $
Par produit en croix : $46 x = 30 (120 - x)$, soit $46 x = "3 600" - 30 x$, puis $76 x = "3 600"$ et
$ x = frac("3 600", 76) approx "47,37". $

Le segment $[I P]$ mesure environ *47 m*.

*2.* #sub[a][Le triangle $A I P$ est rectangle en $I$, avec $I A = 30$ et $I P = x$. D'après le théorème de Pythagore :
$ A P^2 = I A^2 + I P^2 = 30^2 + x^2 = x^2 + 900. $
Le triangle $B J P$ est rectangle en $J$, avec $J B = 46$ et $J P = 120 - x$ :
$ P B^2 = J B^2 + J P^2 = 46^2 + (120 - x)^2 = (120 - x)^2 + "2 116". $]

#sub[b][Le pont est à égale distance des deux maisons : $A P = P B$, donc $A P^2 = P B^2$ :
$ x^2 + 900 = (120 - x)^2 + "2 116". $
On développe : $(120 - x)^2 = "14 400" - 240 x + x^2$. L'équation devient
$ x^2 + 900 = x^2 - 240 x + "16 516". $
Les $x^2$ se simplifient : $900 = "16 516" - 240 x$, donc $240 x = "15 616"$ et
$ x = frac("15 616", 240) approx "65,07". $
Arrondie au mètre, la longueur $I P$ est égale à *65 m*.]

*3.* #sub[a][Avec $x = frac("15 616", 240) approx "65,07"$, on a $A P^2 = x^2 + 900 approx "5 133,7"$, donc $A P approx "71,65"$ m, et $P B = A P$. Le trajet d'Alice mesure
$ A P + P B approx 2 times "71,65" = "143,3 m". $
Sa vitesse est de 4,5 km/h, soit $"4 500"$ m en 60 min, c'est-à-dire $"4 500" div 60 = 75$ m/min. Le temps de trajet est
$ frac("143,3", 75) approx "1,911 min". $
Or $"0,911 min" = "0,911" times 60 " s" approx 55 " s"$.

Alice met environ *1 min 55 s* (soit 115 s).]

#sub[b][Le trajet de Bob mesure aussi $B P + P A approx "143,3"$ m, parcourus en 57 s. Sa vitesse est
$ frac("143,3", 57) approx "2,51 m/s". $
Pour passer des m/s aux km/h, on multiplie par 3,6 : $"2,51" times "3,6" approx "9,05"$.

Bob court à environ *9 km/h*.]
