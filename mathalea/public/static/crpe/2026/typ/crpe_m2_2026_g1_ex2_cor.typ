*Partie A*

Les 500 tickets ont la même chance d'être tirés. La probabilité d'un événement est donc le nombre de tickets qui le réalisent divisé par 500.

*1.* Il y a 2 lots d'une valeur de 50 €, donc 2 tickets favorables :
$ P = frac(2, 500) = frac(1, 250). $

*2.* La mise de départ est de 2 € (prix du ticket). Un lot d'une valeur *strictement supérieure* à 2 € est un lot de 100 €, de 50 €, de 10 € ou de 5 € (les lots de 2 € ne comptent pas, car $2$ n'est pas supérieur à $2$). Le nombre de tickets favorables est
$ 1 + 2 + 5 + 20 = 28. $
$ P = frac(28, 500) = frac(28 div 4, 500 div 4) = frac(7, 125). $

*3.* Le nombre de tickets gagnants est $1 + 2 + 5 + 20 + 50 = 78$. Les autres tickets portent la mention « Perdu » : $500 - 78 = 422$.
$ P = frac(422, 500) = frac(211, 250). $

(On simplifie en divisant en haut et en bas par 2.)

*Partie B*

*1.* On calcule d'abord le nombre d'élèves et le nombre total de tickets vendus.

- Nombre d'élèves : $10 + 4 + 8 + 14 + 12 + 3 = 51$.
- Nombre total de tickets : $4 times 10 + 6 times 4 + 7 times 8 + 10 times 14 + 15 times 12 + 20 times 3$
  $= 40 + 24 + 56 + 140 + 180 + 60 = 500$.

Le nombre moyen de tickets vendus par élève est
$ 500 div 51 approx "9,8" approx 10. $

En moyenne, un élève a vendu environ *10 tickets*. (On retrouve bien les 500 tickets de la tombola.)

*2.*

*a.* La médiane partage la série en deux groupes de même effectif. Il y a 51 élèves : la médiane est la valeur du $26^"e"$ élève ($25$ avant, $25$ après), quand on range les élèves dans l'ordre croissant du nombre de tickets vendus. On cumule les effectifs :

#align(center)[
  #table(
    columns: 7,
    align: center + horizon,
    inset: 5pt,
    [Tickets vendus], [4], [6], [7], [10], [15], [20],
    [Effectif], [10], [4], [8], [14], [12], [3],
    [Effectif cumulé], [10], [14], [22], [36], [48], [51],
  )
]

Le 26e élève se trouve dans le groupe « 10 tickets » (qui va du 23e au 36e élève). La médiane est donc *10 tickets*.

*b.* Interprétation : au moins la moitié des élèves ont vendu 10 tickets ou moins, et au moins la moitié des élèves ont vendu 10 tickets ou plus.
