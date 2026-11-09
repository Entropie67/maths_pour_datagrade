// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*Partie A*

*1.*
#sub("a", [La distance entre deux plots est égale à $200 div 8 = 25$~m. Lola a fait 4 tours complets, soit $4 times 200 = 800$~m, plus un huitième de tour (1 plot franchi), soit $1 times 25 = 25$~m.

Au total, elle a donc parcouru $800 + 25 = 825$~m. Lola a bien effectué 825~m.])

#sub("b", [Lola a parcouru 825~m en 5 minutes, ce qui correspond à une vitesse de :

$ v = d / t = 825 / 5 = 165 $

La vitesse de Lola a été de 165~m/min.])

*2.* Joris a parcouru 700~m en 5 minutes, soit $"0,7"$~km en $5 / 60$~h. Sa vitesse est donc :

$ v = d / t = "0,7" / (5 / 60) = "8,4" $

La vitesse de Joris a été de 8,4~km/h.

*3.* Lola a parcouru une distance de $825 - 700 = 125$~m de plus que Joris, ce qui correspond à un pourcentage de :

$ p = 125 / 700 approx "0,179" approx "17,9" / 100 $

Lola a parcouru environ 18~% de plus que Joris.

*Partie B*

*1.* Pour calculer les valeurs de la colonne D, il faut multiplier le nombre de tours (colonne B) par 200, et ajouter le nombre de plots franchis (colonne C) multiplié par 25.

Dans la cellule `D2`, on peut entrer la formule `=B2*200+C2*25`.

*2.* Soit $d$ la distance parcourue en mètres, indiquée dans la colonne D. La vitesse se calcule ainsi :

$ v = d / t = (d "m") / (5 / 60 "h") = ("0,001" d "km") / (5 / 60 "h") = "0,012" d $

Dans la cellule `E2`, on peut entrer la formule `=0.012*D2`.

*3.* Les distances sont exprimées en mètres :

$ overline(m) &= (2 times 550 + 1 times 575 + 4 times 625 + dots.h + 2 times 825 + 1 times 850) / (2 + 1 + 4 + 2 + 3 + 6 + 1 + 3 + 2 + 1) \
  &= 17275 / 25 \
  &= 691 $

Les élèves ont parcouru en moyenne 691~m.

*Partie C*

*1.*
#sub("a", [D'après l'énoncé, on a :

$ "longueur du rectangle" / "largeur du rectangle" = 20 / "largeur du rectangle" = 5 / 3 $

$ 5 times "largeur du rectangle" = 3 times 20 $

$ "largeur du rectangle" = (3 times 20) / 5 = 12 $

La largeur de la piste est bien de 12~m.])

#sub("b", [La longueur de la piste $ell$ est composée de deux segments de longueur 20~m et de deux demi-cercles, soit un cercle de diamètre 12~m, donc de rayon 6~m :

$ ell = 2 times 20 + 2 times pi times 6 = 40 + 12 pi approx "77,70" $

La piste a une longueur d'environ 78~m.])

*2.* Soit $L$ la longueur du rectangle en mètres, et $ell$ sa largeur en mètres.

D'une part, $L / ell = 5 / 3$, soit $L = 5 / 3 ell$.

D'autre part, la longueur de la piste est de 200~m :

$ 2 L + (2 times pi times ell) / 2 &= 200 \
  2 times 5 / 3 ell + pi ell &= 200 \
  (10 / 3 + pi) ell &= 200 \
  ell &= 200 / (10 / 3 + pi) approx "30,888" $

Enfin :

$ L = 5 / 3 times 200 / (10 / 3 + pi) approx "51,481" $

La longueur et la largeur de la piste sont respectivement d'environ 51,48~m et 30,89~m.
