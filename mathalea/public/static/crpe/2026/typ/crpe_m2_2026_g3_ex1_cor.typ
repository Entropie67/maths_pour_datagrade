*1.* Un pays a plus de la moitié de ses médailles en or si le nombre de médailles d'or est strictement supérieur à la moitié du total. On compare, pour chaque pays, l'or (colonne C) et la moitié du total (colonne F) :

- France : 4 or sur 7 médailles, la moitié de 7 est 3,5, et $4 > "3,5"$ : c'est le cas (déjà indiqué dans l'énoncé).
- *Hongrie* : 2 or sur 3 médailles, $2 > "1,5"$ : oui.
- *Suède* : 2 or sur 2 médailles, $2 > 1$ : oui.
- Pour tous les autres pays, le nombre de médailles d'or n'est pas strictement supérieur à la moitié du total : États-Unis ($8 < 14$), Australie ($7 < 9$), Canada ($3 < 4$), Chine ($2 < 6$), Italie ($2 < "2,5"$), Grande-Bretagne ($1 < "2,5"$), Irlande ($1 < "1,5"$) ; Afrique du Sud, Allemagne et Roumanie (1 or sur 2 médailles : $1 = 1$, ce n'est pas strictement supérieur) ; les pays sans médaille d'or n'en ont évidemment pas la moitié.

En plus de la France, les deux pays qui ont plus de la moitié de leurs médailles en or sont la *Hongrie* et la *Suède*.

*2.* Le pourcentage de médailles d'or est le nombre de médailles d'or (colonne C) divisé par le nombre total de médailles (colonne F). On saisit en G2 :

#align(center)[#raw("=C2/F2")]

(la cellule étant au format « pourcentage » ; sinon, on écrit #raw("=C2/F2*100")), puis on étire la formule vers le bas jusqu'en G20.

*3.* Les États-Unis ont remporté 28 médailles sur un total de 105 :
$ frac(28, 105) approx "0,2667" = "26,67" %. $

On obtient donc $p approx$ *26,7*, soit environ 26,7~% des médailles.

*4.* L'Australie a remporté $18$ médailles en tout, dont $8$ d'argent. Le sportif est choisi au hasard parmi les 18 médaillés : les 18 cas sont équiprobables.
$ P = frac(8, 18) = frac(4, 9). $

*5.* Le nombre total de médailles d'or est 35 (case C21). Un quart de 35 vaut $35 div 4 = "8,75"$. Les nageurs américains ont remporté 8 médailles d'or, et $8 < "8,75"$.

On peut aussi calculer la proportion : $display(frac(8, 35)) approx "0,229" < "0,25"$.

Non, le journaliste a tort : les nageurs américains ont remporté moins d'un quart des médailles d'or.
