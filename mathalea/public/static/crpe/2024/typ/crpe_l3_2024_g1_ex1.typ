// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

Un enseignant d'une classe de CM1 dans la commune de Rennes fait construire aux élèves un pluviomètre pour relever les quantités de précipitations pendant les dix mois de l'année scolaire. Les élèves doivent amener une bouteille d'eau en plastique pour cette réalisation.

*Partie A*

#grid(
  columns: (1fr, 6.3cm),
  column-gutter: 0.4cm,
  align: (left + top, center + horizon),
  [
    Pour réaliser son pluviomètre, Jules, un élève de la classe, coupe la bouteille comme l'indique la figure ci-contre. Il construit ensuite un axe gradué en partant du fond du pluviomètre avec des graduations d'unité 1~cm.

    Dans les questions 1 et 2, on assimile le pluviomètre de Jules à un cylindre de diamètre 8,4~cm et de hauteur 15~cm.

    On rappelle que le volume d'un cylindre d'aire de base $B$ et de hauteur $h$ est égal à $B h$.

    *1.* Jules souhaite découper une étiquette rectangulaire de largeur 2~cm qui fasse le tour du pluviomètre pour écrire son prénom. Déterminer une valeur approchée par excès au millimètre près de la longueur minimale de cette étiquette.
  ],
  [#image("crpe_l3_2024_g1_ex1-bouteille.png", width: 100%)],
)

*2.* Déterminer la valeur exacte, puis une valeur arrondie au centilitre du volume en litres du pluviomètre.

*3.* Inès a oublié sa bouteille. Jules lui propose de lui donner la partie haute de sa bouteille, en plaçant le bouchon en bas pour former son pluviomètre.

Les trois courbes ci-dessous représentent le volume d'eau recueilli en $"cm"^3$ en fonction de la hauteur d'eau mesurée en cm. Identifier la courbe qui correspond au pluviomètre de Jules et celle qui correspond au pluviomètre d'Inès. Aucune justification n'est attendue.

#align(center)[#image("crpe_l3_2024_g1_ex1-courbes.png", width: 16cm)]

#v(0.3cm)

*Partie B*

L'ensemble de la classe utilise un pluviomètre similaire à celui élaboré par Jules. En fin d'année scolaire, les élèves font le bilan des relevés effectués chaque mois.

Dans le cadre d'un projet visant à comparer les différents climats en France, la même expérience est menée dans une école de la commune de Lyon.

#table(
  columns: (1fr, 1fr),
  stroke: 0.5pt,
  inset: 6pt,
  align: left + top,
  [*Document 1*],
  [*Document 2*],
  [
    Relevés mensuels de précipitations dans le pluviomètre de Jules durant l'année scolaire 2022/2023 à Rennes.

    #v(0.3cm)

    #align(center)[
      #table(
        columns: (3.2cm, 2.6cm),
        stroke: 0.5pt,
        inset: 3pt,
        align: center + horizon,
        fill: (x, y) => if y == 0 { luma(220) },
        [*Mois*], [*Hauteur d'eau (mm)*],
        [Septembre], [65],
        [Octobre], [103],
        [Novembre], [24],
        [Décembre], [122],
        [Janvier], [53],
        [Février], [44],
        [Mars], [19],
        [Avril], [27],
        [Mai], [57],
        [Juin], [134],
      )
    ]
  ],
  [
    Bilan des relevés mensuels de précipitations dans un pluviomètre de l'école lyonnaise pour les dix mois de l'année scolaire 2022/2023.

    Résultats mensuels de septembre 2022 à juin 2023.

    Moyenne : 70,6~mm\
    Médiane : 58~mm\
    Hauteur minimale : 18~mm\
    Hauteur maximale : 179~mm\
    Les valeurs relevées sont toutes différentes.
  ],
)

#v(0.3cm)

*1.* Parmi ces deux villes, déterminer celle qui a connu les plus fortes précipitations mensuelles en moyenne durant les dix mois de l'année scolaire 2022-2023.

*2.* Calculer et comparer les étendues des précipitations mensuelles à Rennes et à Lyon durant cette période.

*3.* L'affirmation suivante est-elle exacte ? Justifier.\
« Dans la commune de Lyon, il y a 5 mois de l'année scolaire 2022-2023 pendant lesquels les précipitations mensuelles ont été supérieures ou égales à 70,6~mm. »
