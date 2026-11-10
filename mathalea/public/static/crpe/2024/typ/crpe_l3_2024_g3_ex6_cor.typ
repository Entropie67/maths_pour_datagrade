// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

#import "@preview/cetz:0.4.2": canvas, draw

Ce n'est pas précisé dans l'énoncé, ni sur la figure, mais on suppose que $[S O']$ et $[O O']$ sont respectivement la hauteur du cône et celle du cylindre.

*1.* On note $R$ le rayon du cône et $H$ sa hauteur. Le rayon du cône est $R = 3$~cm et sa hauteur $H = 4$~cm :

$ cal(V)_"cône" = 1 / 3 times pi times R^2 times H = 1 / 3 times pi times 3^2 times 4 = 12 pi $

Le cône a un volume de $12 pi$~$"cm"^3$.

*2.* On note $R$ le rayon du cylindre et $h$ sa hauteur. Le rayon est de 3~cm et la hauteur de 8~cm :

$ cal(V)_"cylindre" = pi times R^2 times h = pi times 3^2 times 8 = 72 pi $

Le cylindre a un volume de $72 pi$~$"cm"^3$.

*3.* En supposant que $[S O']$ est la hauteur du cône, le triangle $S O' A$ est rectangle en $O'$. D'après le théorème de Pythagore :

$ S A^2 = S O'^2 + O' A^2 = 4^2 + 3^2 = 16 + 9 = 25 $

$ S A = sqrt(25) = 5 $

La génératrice du cône a pour longueur 5~cm.

*4.* Le volume d'un saupoudreur est :

$ cal(V) = cal(V)_"cône" + cal(V)_"cylindre" = 12 pi + 72 pi = 84 pi $

Pour la classe de 24 élèves, la quantité $q$ de stevia est :

$ q = 24 times 84 pi = 2016 pi approx "6 333" $

soit environ $"6,333" "dm"^3 = "6,333" "L"$. Il faudra donc environ 6~L de stevia pour toute la classe.

*5.*
#sub("a", [La longueur $ell$ de l'arc de cercle d'extrémités $A$ et $A'$ est égale au périmètre du cercle de base du cône, qui est un cercle de rayon 3~cm :

$ ell = 2 times pi times r = 2 times pi times 3 = 6 pi $

L'arc de cercle d'extrémités $A$ et $A'$ a pour longueur $6 pi$~cm.])

#sub("b", [Lorsque l'angle au centre vaut $360°$, $A$ est confondu avec $A'$ et la longueur de l'arc correspond au périmètre du cercle de rayon 5~cm :

$ ell_360 = 2 times pi times 5 = 10 pi $

Le tableau de proportionnalité est donc :

#align(center)[
  #table(
    columns: (4.6cm, 4.6cm),
    align: center + horizon,
    inset: 6pt,
    stroke: 0.5pt,
    [Angle au centre (en degré)], [Longueur de l'arc (en cm)],
    [$alpha$], [$6 pi$],
    [$360$], [$10 pi$],
  )
]

$ alpha = (360 times 6 pi) / (10 pi) = 216 $

L'angle $alpha$ est égal à $216°$.])

*6.* À l'échelle $display(frac(1, 2))$, les longueurs réelles sont divisées par 2, mais les angles restent inchangés. Le patron est donc constitué d'un secteur de rayon 2,5~cm et d'angle $216°$, et d'un disque de rayon 1,5~cm pour la base.

#align(center)[
  #canvas(length: 0.5cm, {
    draw.arc((0, 0), start: 0deg, stop: 216deg, radius: 2.5, anchor: "origin", mode: "PIE", stroke: 0.8pt + purple, fill: purple.lighten(80%))
    draw.circle((7, 0), radius: 1.5, stroke: 0.8pt + purple, fill: purple.lighten(80%))
    draw.content((1.2, -0.6), [#text(size: 9pt)[$alpha = 216°$]])
    draw.content((7, -2.2), [#text(size: 9pt)[Base]])
  })
]
