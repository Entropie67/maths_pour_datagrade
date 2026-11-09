// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*1.* On remplit le tableau pas à pas, en calculant d'abord les effectifs que l'énoncé permet de trouver directement.

- Élèves qui pratiquent un sport : 40~% de 300 élèves, soit $"0,4" times 300 "élèves" = 120$ élèves. On l'écrit dans la case « Effectif total » de la ligne « Pratiquent un sport ».
- Élèves qui pratiquent un instrument : 75 élèves (case « Effectif total » de la colonne « instrument »).
- Élèves qui pratiquent un instrument *et* un sport : 60~% de 75 élèves, soit $"0,6" times 75 "élèves" = 45$ élèves.

On complète ensuite le reste du tableau avec des soustractions (chaque ligne et chaque colonne a pour somme son total) :

- sport mais pas d'instrument : $120 - 45 = 75$ ;
- instrument mais pas de sport : $75 - 45 = 30$ ;
- ni sport ni instrument : on calcule d'abord le nombre d'élèves qui ne font pas de sport,\ $300 - 120 = 180$, puis $180 - 30 = 150$ ;
- ne pratiquent pas d'instrument : $300 - 75 = 225$ (on vérifie : $75 + 150 = 225$).

#align(center)[
  #table(
    columns: (577fr, 522fr, 521fr, 231fr),
    rows: (2.8em, 1.7em, 1.7em, 1.7em),
    align: (left + bottom, center + bottom, center + bottom, center + bottom),
    inset: (x: 4pt, y: 3pt),
    table.cell(align: left + top)[],
    table.cell(align: left + top)[Pratiquent un instrument de musique],
    table.cell(align: left + top)[Ne pratiquent pas un instrument de musique],
    table.cell(align: left + top)[Effectif total],
    [Pratiquent un sport], [45], [75], [120],
    [Ne pratiquent pas un sport], [30], [150], [180],
    [Effectif total], [75], [225], [300],
  )
]

*2.* Il y a 300 élèves, tous ont la même chance d'être choisis. La probabilité est donc le nombre d'élèves qui pratiquent au moins une activité, divisé par 300.

Le plus simple est de passer par les élèves qui ne pratiquent *aucune* activité : il y en a 150.\ Donc $300 - 150 = 150$ élèves pratiquent au moins une activité (on retrouve aussi $45 + 75 + 30 = 150$).

$ P = frac(150, 300) = frac(1, 2) = "0,5". $

La probabilité est $display(frac(1, 2))$, soit 50~%.

*3.* On ne s'intéresse plus qu'aux 120 élèves qui pratiquent un sport : ce sont les cas possibles. Parmi eux, 45 pratiquent aussi un instrument : ce sont les cas favorables.

$ P = frac(45, 120) = frac(45 div 15, 120 div 15) = frac(3, 8). $

(On simplifie en divisant le numérateur et le dénominateur par 15, leur plus grand diviseur commun ; $display(frac(3, 8))$ ne peut plus être simplifiée.)

La probabilité cherchée est donc $display(frac(3, 8))$.
