// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*1.*
#sub("a", [Le saladier a la forme d'une demi-sphère de diamètre 42~cm, donc de rayon $R = 21$~cm. Son volume est égal à :

$ cal(V)_"saladier" = 1 / 2 times (4 / 3 times pi times R^3) = 1 / 2 times 4 / 3 times pi times 21^3 = 2 / 3 times pi times 9261 = 6174 pi approx "19396,19" $

Dans le saladier, il y a environ 19~396~$"cm"^3$ de pâte à gâteau.])

#sub("b", [Sachant que $1 "dm"^3 = 1 "L"$ et que $1 "cm"^3 = "0,001" "dm"^3$ :

$ 19 396 "cm"^3 = "19,396" "dm"^3 = "19,396" "L" approx "19,4" "L" $

Dans le saladier, il y a environ 19,4~L de pâte à gâteau.])

*2.* Le volume utile d'un moule cylindrique rempli aux trois quarts de sa hauteur se calcule ainsi. La hauteur de pâte est $3 / 4 times 5 = 15 / 4 = "3,75"$~cm. Le volume de pâte dans un moule est donc :

$ cal(V)_"utile" = pi times 3^2 times 15 / 4 = 135 / 4 pi "cm"^3 $

On détermine le nombre de moules que l'on peut remplir avec la pâte :

$ (6174 pi) / (135 / 4 pi) = 2744 / 15 approx "182,93" $

Le cuisinier pourra remplir au maximum 182 moules.

*3.*
#sub("a", [Les nouveaux moules ont la forme d'un pavé droit. On appelle $h_r$ la hauteur en cm à laquelle il faut remplir chaque moule. Le volume de pâte dans un moule est :

$ cal(V)_"pavé" = 6 times 4 times h_r = 24 h_r $

Pour 210 moules remplis à la hauteur $h_r$, il faut utiliser toute la pâte, soit :

$ 210 times 24 h_r = 5040 h_r = 6174 pi $

$ h_r = (6174 pi) / 5040 approx "3,848" $

Ce qui correspond à $"3,848" "cm" = "38,48" "mm"$. Il faut remplir les moules à une hauteur d'environ 38~mm pour en faire 210.])

#sub("b", [Une augmentation de 15~% correspond à un coefficient multiplicateur de $1 + 15 / 100 = "1,15"$. La hauteur après cuisson est alors de :

$ "1,15" times "3,848" approx "4,425" $

Ce qui correspond à $"44,25" "mm"$. Arrondie au millimètre, la hauteur de chaque gâteau après cuisson est de 44~mm (soit environ 4,4~cm). On obtient le même résultat en partant de la hauteur arrondie 38~mm : $"1,15" times 38 = "43,7"$, arrondi à 44~mm.])
