#import "@preview/ctz-euclide:0.3.0": *

*1.* On repère le lutin par sa position et son orientation. Avec $a = 40$ et l'échelle « 1 cm pour 10 pas », on a $a = 4$ cm et $a sqrt(2) = 4 sqrt(2) approx "5,66"$ cm.

Le lutin part de $O = (0 ; 0)$, orienté vers la droite, et avance de 4 cm jusqu'au point $E$. Il tourne de $135°$ vers la gauche et avance de $4 sqrt(2) approx "5,66"$ cm : il arrive au point $F$ situé à 4 cm au-dessus de $O$, car $4 sqrt(2)$ est la longueur de la diagonale d'un carré de côté 4 cm. Il tourne encore de $135°$ vers la gauche et avance de 4 cm : il revient en $O$.

La figure obtenue est donc le triangle $O E F$, rectangle isocèle en $O$, avec $O E = O F = 4$ cm. On le construit ainsi :
- tracer le segment $[O E]$ de 4 cm ;
- construire la perpendiculaire à $(O E)$ passant par $O$ : tracer un cercle de centre $O$ qui coupe la droite $(O E)$ en $M$ et $N$, puis, avec le compas, deux arcs de même rayon (plus grand que $O M$) centrés en $M$ et en $N$, qui se coupent en $Q$ ; la droite $(O Q)$ est perpendiculaire à $(O E)$ ;
- reporter au compas la longueur 4 cm sur cette perpendiculaire à partir de $O$ pour placer $F$ ;
- tracer le segment $[E F]$.

#align(center)[
  #ctz-canvas(length: 0.8cm, {
    let s = black + 0.8pt
    let c = black + 0.4pt
    // Traits de construction
    cetz.draw.line((-1.8, 0), (4.6, 0), stroke: c)
    cetz.draw.line((0, 1.6), (0, 4.3), stroke: (paint: black, thickness: 0.4pt, dash: "dashed"))
    cetz.draw.arc((0, 0), start: 0deg, stop: 180deg, radius: 1.2, anchor: "origin", stroke: c)
    cetz.draw.arc((-1.2, 0), start: 35deg, stop: 70deg, radius: 2, anchor: "origin", stroke: c)
    cetz.draw.arc((1.2, 0), start: 110deg, stop: 145deg, radius: 2, anchor: "origin", stroke: c)
    cetz.draw.arc((0, 0), start: 65deg, stop: 105deg, radius: 4, anchor: "origin", stroke: c)
    // Triangle OEF
    cetz.draw.line((0, 0), (4, 0), (0, 4), close: true, stroke: s)
    cetz.draw.line((0, 0.25), (0.25, 0.25), (0.25, 0), stroke: s)
    ctz-draw-text(-0.3, -0.3, $O$)
    ctz-draw-text(4.3, -0.3, $E$)
    ctz-draw-text(-0.3, 4.15, $F$)
    ctz-draw-text(-1.4, -0.3, $M$)
    ctz-draw-text(1.4, -0.3, $N$)
    ctz-draw-text(0.3, 1.8, $Q$)
    ctz-draw-text(2.8, -0.45, [4 cm])
    ctz-draw-text(-0.8, 3.1, [4 cm])
  })
]

*2.* Au départ, le lutin est orienté à 90 (vers la droite). Il tourne deux fois de 135° vers la gauche, soit $2 times 135° = 270°$ vers la gauche. Une rotation de 270° vers la gauche équivaut à 90° vers la droite : $90 - 270 = -180$, c'est-à-dire l'orientation 180.

À la fin du programme, le lutin est orienté à *180*, c'est-à-dire vers le bas.

*3.* On suit le lutin dans chaque programme. Dans les trois programmes, le début d'un tour de boucle est le même : le lutin trace un triangle rectangle isocèle de côté $a$, en revenant à son point de départ et orienté vers le bas (question 2).

- *Programme B :* la boucle est répétée 4 fois et ne contient que le tracé du triangle. À chaque tour, le lutin repart de $O$ avec une orientation tournée de $270°$ vers la gauche par rapport au tour précédent, c'est-à-dire de $90°$ vers la droite. Les quatre triangles ont le même sommet d'angle droit $O$ et sont obtenus les uns à partir des autres par des rotations de $90°$ autour de $O$ : ils forment un carré posé sur sa pointe dont les diagonales sont tracées. C'est la *figure 1*.

- *Programme A :* après chaque triangle, le lutin est en $O$ orienté vers le bas. Il tourne de $90°$ vers la gauche : il est alors orienté vers la droite. Puis il avance de $a + 10$ pas, en laissant une trace, et arrive en un point situé à $a + 10$ pas à droite de $O$. Chaque tour recommence donc, dans la même orientation, un triangle identique décalé vers la droite. On obtient quatre triangles de même taille alignés, reliés par un trait horizontal. C'est la *figure 3*.

- *Programme C :* après chaque triangle, le lutin tourne de $90°$ vers la gauche : il est de nouveau orienté vers la droite, à son point de départ $O$. Puis il ajoute 10 à $a$ et recommence. Chaque tour trace un triangle de même forme et de même orientation, de même sommet d'angle droit $O$, mais plus grand de 10 pas sur chaque côté de l'angle droit : on obtient des triangles emboîtés les uns dans les autres. C'est la *figure 4*.

Programme A $->$ figure 3 ; programme B $->$ figure 1 ; programme C $->$ figure 4.
