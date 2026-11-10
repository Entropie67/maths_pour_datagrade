// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

Dans une école de 300 élèves, on a interrogé les élèves sur leurs activités extrascolaires. Voici les résultats :

- 40 % des élèves pratiquent un sport ;
- 75 élèves pratiquent un instrument de musique ;
- Parmi les élèves qui pratiquent un instrument de musique, 60 % pratiquent aussi un sport.

*1.* Recopier et compléter le tableau à double entrée suivant :

#align(center)[
  #table(
    columns: (577fr, 522fr, 521fr, 231fr),
    rows: (2.8em, 1.7em, 1.7em, 1.7em),
    align: (left + bottom, left + bottom, left + bottom, center + bottom),
    inset: (x: 4pt, y: 3pt),
    table.cell(align: left + top)[],
    table.cell(align: left + top)[Pratiquent un instrument de musique],
    table.cell(align: left + top)[Ne pratiquent pas un instrument de musique],
    table.cell(align: left + top)[Effectif total],
    [Pratiquent un sport], [], [], [],
    [Ne pratiquent pas un sport], [], [], [],
    [Effectif total], [], [], [300],
  )
]

*2.* On choisit au hasard un élève. Calculer la probabilité qu'il pratique au moins l'une de ces deux activités.

*3.* On choisit au hasard un élève qui pratique un sport. Calculer la probabilité qu'il pratique aussi un instrument de musique. On donnera la réponse sous forme de fraction irréductible.
