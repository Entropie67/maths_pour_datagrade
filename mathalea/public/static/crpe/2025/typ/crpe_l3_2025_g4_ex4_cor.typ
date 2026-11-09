// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*1.* On ne peut pas l'affirmer. Le nombre 54 % est une *fréquence* observée sur une simulation de 100 lancers : elle varie d'une simulation à l'autre et n'est qu'une estimation de la probabilité. La probabilité que le dé A gagne est un nombre théorique, qu'on calcule en étudiant toutes les issues possibles (question 2) : on y trouvera que le dé A gagne avec une probabilité d'environ 44 %, assez loin de 54 %.

*2.* #h(0em)

#sub[a][Les faces du dé A portent les nombres 2, 2, 6, 6, 7, 7 et celles du dé B les nombres 3, 3, 4, 4, 8, 8. Sur chaque dé, chacun des trois nombres est inscrit sur 2 faces sur 6 : il sort avec la probabilité $frac(1, 3)$. Les $3 times 3 = 9$ couples de nombres sont donc équiprobables (probabilité $frac(1, 9)$ chacun). On indique, pour chaque couple, le dé qui a le plus grand nombre :

#align(center)[
  #table(
    columns: (3.2cm, 2.2cm, 2.2cm, 2.2cm),
    align: center + horizon,
    inset: 5pt,
    table.header([*Dé A $arrow.b$ / Dé B $arrow.r$*], [*3*], [*4*], [*8*]),
    [*2*], [B], [B], [B],
    [*6*], [A], [A], [B],
    [*7*], [A], [A], [B],
  )
]
]

#sub[b][Le dé B l'emporte dans 5 cases sur les 9 cases du tableau (3 sur la ligne du 2, 1 sur la ligne du 6, 1 sur la ligne du 7). Les 9 issues étant équiprobables,
$ P("B gagne") = frac(5, 9). $
(Le dé A gagne dans les 4 autres cases : $P("A gagne") = frac(4, 9) approx "0,44"$. Les deux dés ne peuvent pas faire égalité, car aucun nombre n'est commun aux deux dés.)]
