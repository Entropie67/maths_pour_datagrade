// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

#grid(
  columns: (1fr, 9cm),
  column-gutter: 0.4cm,
  align: (left + horizon, center + horizon),
  [
    Un géoplan est une planche carrée qui comporte des picots espacés régulièrement autour desquels peuvent être accrochés des élastiques de longueurs variées.

    Un enseignant propose à des élèves d'une classe de CM d'utiliser un géoplan dans le but de réaliser des figures géométriques.
  ],
  [#image("crpe_l3_2024_g1_ex5-geoplan.png", width: 100%)],
)

*Partie A*

L'enseignant donne la consigne suivante à un groupe d'élèves : « Vous réaliserez le tour du géoplan en formant des carrés les plus petits possible. Utilisez un élastique différent pour la construction de chaque carré. Ces carrés seront ainsi placés au plus près des bords du géoplan. »

#grid(
  columns: (1fr, 6.4cm),
  column-gutter: 0.4cm,
  align: (left + horizon, center + horizon),
  [Sur l'image ci-contre, l'élève a commencé en construisant les trois premiers carrés du tour du géoplan.],
  [#image("crpe_l3_2024_g1_ex5-carres.png", width: 100%)],
)

*1.* Montrer que l'élève doit construire 12 carrés pour réaliser le tour d'un géoplan de 25 picots.

*2.* Déterminer le nombre de carrés nécessaires pour réaliser le tour d'un géoplan de 81 picots.

*3.* On note $n$ un entier naturel supérieur ou égal à 2. Justifier que le nombre de carrés nécessaires pour réaliser le tour d'un géoplan de $n^2$ picots est donné par l'expression $4 n - 8$.

*4.* On dispose d'un nombre d'élastiques permettant de construire 107 carrés pour réaliser le tour d'un géoplan. Déterminer le nombre maximal de picots de ce géoplan. Justifier la réponse.

*Partie B*

L'enseignant propose ensuite aux élèves de réaliser librement une figure géométrique sur un géoplan de 25 picots.

#grid(
  columns: (1fr, 4.6cm),
  column-gutter: 0.4cm,
  align: (left + horizon, center + horizon),
  [
    Sur le géoplan, deux picots contigus horizontalement ou verticalement sont séparés de 3~cm.

    Un élève a réalisé la figure ci-contre.

    On négligera l'épaisseur des picots pour répondre aux questions suivantes.
  ],
  [#image("crpe_l3_2024_g1_ex5-figure.png", width: 100%)],
)

*1.* Construire la figure réalisée par l'élève en vraie grandeur.

*2.*
#sub("a", [Déterminer l'aire en $"cm"^2$ de cette figure.])
#sub("b", [Déterminer la valeur exacte du périmètre de cette figure.])

#grid(
  columns: (1fr, 5.2cm),
  column-gutter: 0.4cm,
  align: (left + top, center + horizon),
  [
    *3.* Un programme réalisé sur le logiciel « Scratch » permet de construire la figure ci-dessous :

    #align(center)[#image("crpe_l3_2024_g1_ex5-figure-scratch.png", width: 5.4cm)]

    En prenant 3~cm pour 70 pas, déterminer les valeurs à attribuer aux lettres A, B et C pour que le script proposé ci-contre permette de construire cette figure. On prendra une valeur approchée à l'unité pour B.

    _Le point de départ de la figure a pour coordonnées $(-140 ; 140)$. On rappelle que « s'orienter à 90 » permet de s'orienter vers la droite._
  ],
  [#image("crpe_l3_2024_g1_ex5-script.png", width: 100%)],
)
