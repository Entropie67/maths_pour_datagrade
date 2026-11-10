*1.* On lance trois jetons équilibrés, chacun donne 0 ou 1 avec la même probabilité. Il y a $2 times 2 times 2 = 8$ résultats possibles, tous équiprobables :

#align(center)[
  #table(
    columns: 8,
    align: center,
    inset: 5pt,
    [000], [001], [010], [011], [100], [101], [110], [111],
  )
]

La somme vaut 3 seulement si les trois jetons donnent 1, c'est-à-dire pour le résultat 111. Il y a 1 résultat favorable sur 8.

La probabilité d'obtenir une somme égale à 3 est $display(frac(1, 8))$.

*2.* Jeanne a raison. Chaque jeton ne peut donner que deux résultats (0 ou 1). Avec trois jetons, on ne peut pas avoir trois résultats tous différents deux à deux : au moins deux jetons donnent forcément le même résultat. (On le vérifie dans la liste de la question 1 : chaque résultat contient au moins deux fois le même chiffre.)

*3.* Olivier a tort. Obtenir trois faces identiques, c'est obtenir 000 ou 111 : il y a 2 résultats favorables sur 8, donc une probabilité de
$ frac(2, 8) = frac(1, 4). $
Olivier a donc une chance sur quatre, et non une chance sur deux, d'obtenir trois faces identiques.
