// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

#import "@preview/cetz:0.4.2": canvas, draw

*1.* Le bloc de répétition de « figure de base » est composé d'une première instruction « avancer de longueur pas », qui trace un segment de longueur `longueur` vers la droite, puis d'une seconde instruction qui fait tourner le lutin dans le sens direct d'un angle droit. Ces instructions sont répétées 4 fois : la figure tracée est un quadrilatère ayant 4 côtés égaux et 4 angles droits, c'est donc un carré.

La « figure de base » est un carré de côté `longueur`.

*2.* Le programme principal fonctionne ainsi :

- la variable `longueur` est initialisée à 50 pas, soit 10~mm (1~cm sur la figure) ;
- la première répétition construit un carré de côté 50 pas, soit 1~cm sur la figure, en s'orientant vers la droite ;
- ensuite, le stylo est relevé et le lutin avance de $50 + 200 = 250$ pas, soit 5~cm, toujours vers la droite ;
- la variable `longueur` est alors multipliée par 2, soit 100 pas ;
- la deuxième répétition construit un carré de côté 100 pas, soit 2~cm sur la figure ;
- le stylo est relevé et le lutin avance de $100 + 200 = 300$ pas, puis `longueur` vaut 200 pas : ces dernières instructions n'ont aucune influence sur le tracé.

On obtient donc la figure suivante :

#align(center)[
  #canvas(length: 1cm, {
    draw.rect((0, 0), (1, 1), stroke: 0.8pt + purple)
    draw.content((0.5, 1.35), [#text(size: 9pt)[1~cm]])
    draw.rect((5, 0), (7, 2), stroke: 0.8pt + purple)
    draw.content((6, 2.35), [#text(size: 9pt)[2~cm]])
    draw.line((0, -0.45), (5, -0.45), stroke: 0.8pt)
    draw.content((2.5, -0.8), [#text(size: 9pt)[5~cm]])
  })
]

*3.* #sub("a", [Un triangle équilatéral possède 3 côtés égaux et 3 angles égaux ; la somme des angles d'un triangle étant égale à $180°$, ces angles mesurent $60°$. Scratch utilise des angles orientés : il faut donc tourner de l'angle supplémentaire de $60°$, soit $120°$, dans le sens direct.

Dans le bloc « figure de base », il faut modifier le troisième bloc en mettant 3 répétitions au lieu de 4, et le cinquième bloc en mettant 120 au lieu de 90.])

#sub("b", [Entre le premier et le deuxième triangle, la longueur du côté est multipliée par 2 : c'est un agrandissement de facteur 2. Les aires sont alors multipliées par $2^2 = 4$.

Les aires des deux triangles sont dans un rapport de 4.])
