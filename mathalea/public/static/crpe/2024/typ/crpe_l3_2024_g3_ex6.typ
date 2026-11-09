// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

On rappelle les formules suivantes :

#align(center)[
  #table(
    columns: (1fr, 1fr),
    align: center + horizon,
    inset: 8pt,
    stroke: 0.5pt,
    [Volume d'un cône de révolution :\ $display(frac(1, 3)) times$ Aire de la base $times$ Hauteur],
    [Volume d'un cylindre :\ Aire de la base $times$ Hauteur],
  )
]

#grid(
  columns: (1fr, 4.4cm),
  column-gutter: 0.4cm,
  align: (left + horizon, center + horizon),
  [
    Une classe de CM1 compte 24 élèves. Leur enseignant souhaite leur faire construire des saupoudreurs et les remplir de poudre de stevia, un édulcorant naturel sans calorie.

    Les saupoudreurs sont constitués d'un cylindre surmonté d'un cône. Les dimensions sont indiquées sur la figure ci-contre.

    *1.* Déterminer le volume exact du cône en $"cm"^3$.

    *2.* Déterminer le volume exact du cylindre en $"cm"^3$.

    *3.* Démontrer que la génératrice $[S A]$ du cône mesure 5~cm.

    *4.* Quelle quantité de stevia est nécessaire pour l'ensemble de la classe ? Arrondir le résultat au litre.
  ],
  [#image("crpe_l3_2024_g3_ex6-saupoudreur.png", width: 100%)],
)

#v(0.3cm)

*5.* Afin de réaliser un patron de cône, l'enseignant dessine le croquis ci-dessous (croquis 1) où $alpha$ est l'angle au centre du cercle de centre $S$ et de rayon 5~cm qui intercepte l'arc d'extrémités $A$ et $A'$.

#align(center)[#image("crpe_l3_2024_g3_ex6-croquis1.png", width: 13cm)]

#sub("a", [Déterminer la longueur de l'arc de cercle d'extrémités $A$ et $A'$. Justifier la réponse.])
#sub("b", [En déduire la mesure de l'angle $alpha$ au degré près.

On rappelle que la longueur de l'arc de cercle d'extrémités $A$ et $A'$ est proportionnelle à l'angle au centre $alpha$, et on pourra s'aider du tableau ci-dessous :

#align(center)[
  #table(
    columns: (4.6cm, 4.6cm),
    align: center + horizon,
    inset: 6pt,
    stroke: 0.5pt,
    [Angle au centre en degré qui intercepte l'arc d'extrémités $A$ et $A'$.], [Longueur de l'arc d'extrémités $A$ et $A'$ en cm.],
    [$alpha$], [],
    [$360$], [],
  )
]])

*6.* Construire, à l'échelle $display(frac(1, 2))$, le patron du saupoudreur.
