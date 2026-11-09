#import "@preview/ctz-euclide:0.3.0": *

// Motif tracé sur un quadrillage de 4 colonnes et 5 lignes (1 carreau = 1 cm = 10 pixels)
#let quadrillage(chemin) = ctz-canvas(length: 1cm, {
  for i in range(5) {
    cetz.draw.line((i, 0), (i, 5), stroke: gray + 0.5pt)
  }
  for j in range(6) {
    cetz.draw.line((0, j), (4, j), stroke: gray + 0.5pt)
  }
  cetz.draw.line(..chemin, close: true, stroke: black + 1.6pt)
  cetz.draw.line((2, 0.3), (2, 0.95), mark: (end: ">", fill: black), stroke: black + 0.8pt)
  ctz-draw-text(2, 0.1, [départ])
})

*1.* On suit le lutin pas à pas. Il part du point de départ, orienté vers la droite, et 10 pixels correspondent à 1 carreau.

- « avancer de 10 » : 1 carreau vers la droite ;
- « tourner à gauche de 90° », « avancer de 30 » : 3 carreaux vers le haut ;
- « tourner à gauche de 90° », « avancer de 20 » : 2 carreaux vers la gauche ;
- dans le bloc « répéter 2 fois » : « tourner à gauche de 90° » puis « avancer de 10 », deux fois de suite : 1 carreau vers le bas, puis (après un nouveau quart de tour à gauche) 1 carreau vers la droite ;
- « tourner à droite de 90° », « avancer de 20 » : le lutin est orienté vers le bas et avance de 2 carreaux, jusqu'au point de départ.

#align(center)[
  #quadrillage(((2, 1), (3, 1), (3, 4), (1, 4), (1, 3), (2, 3)))
]

*2.* Le motif souhaité se lit sur le quadrillage de l'énoncé. En partant du point de départ, son contour est : 1 carreau vers la droite, 3 vers le haut, 1 vers la gauche, 1 vers le bas, 1 vers la gauche, 1 vers le bas, 1 vers la droite, puis 1 vers le bas pour revenir au départ. On compare avec les scripts.

- *Apolline :* son motif (question 1) a un contour de 6 côtés seulement : ce n'est pas le motif souhaité. Son script ne convient pas.
- *Kylian :* après « avancer de 10 », « tourner à gauche », « avancer de 30 », il répète deux fois « tourner à gauche, avancer de 10, tourner à gauche, avancer de 10, tourner à gauche, avancer de 10 ». Le premier passage fait aller le lutin 1 carreau vers la gauche, 1 vers le bas puis 1 vers la droite : il revient sur le côté droit du motif et le deuxième passage repasse sur des segments déjà tracés. Le contour n'est pas le bon. Son script ne convient pas.
- *Sakhina :* après « avancer de 10 », « tourner à gauche », « avancer de 30 », elle répète deux fois « tourner à gauche, avancer de 10, tourner à gauche, avancer de 10, tourner à droite, avancer de 10 ». Premier passage : 1 carreau vers la gauche, 1 vers le bas, puis 1 vers la gauche. Deuxième passage : 1 carreau vers le bas, 1 vers la droite, puis 1 vers le bas : le lutin revient au point de départ. Le dernier « tourner à gauche de 90° » le remet orienté vers la droite, comme au début. Le tracé obtenu est le motif demandé :

#align(center)[
  #quadrillage(((2, 1), (3, 1), (3, 4), (2, 4), (2, 3), (1, 3), (1, 2), (2, 2)))
]

Seul le script de *Sakhina* permet d'obtenir le motif souhaité.

*3.* Le motif 1 est au-dessus du point $A$ ; les motifs 2, 3 et 4 sont à droite, en dessous et à gauche de $A$ : chaque motif se déduit du précédent en le faisant « tourner » autour du point $A$, qui reste fixe, d'un quart de tour dans le sens des aiguilles d'une montre. La transformation est une rotation.

C'est la *rotation de centre $A$ et d'angle $90°$ dans le sens des aiguilles d'une montre* (sens horaire).
