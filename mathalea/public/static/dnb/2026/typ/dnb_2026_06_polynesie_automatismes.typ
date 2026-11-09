*Pour cette première partie, aucune justification n'est demandée et une seule réponse est possible par question. Pour chaque question, reportez son numéro sur votre copie et indiquez votre réponse.*

Une réponse fausse ou l'absence de réponse n'enlève aucun point.

=== Question 1

Déterminer la médiane de la série : $12$ ; $9$ ; $7$ ; $23$ ; $9$ ; $25$ ; $7$.

=== Question 2

Donner la notation scientifique de $0,000457$.

=== Question 3

#let tx3(x) = (x + 0.3) * 1cm
#let ty3(y) = (3.9 - y) * 1cm

#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  [
    Calculer l'aire, en cm#super[2], du triangle ci-contre.
  ],
  [
    #ctz-canvas( {
      import cetz.draw: *
      ctz-init()
      ctz-def-points(A: (0.4, 1.4), B: (4.34, 3), C: (5.4, 0.4))
      ctz-draw-mark-right-angle("A", "B", "C")
      ctz-draw-line("A", "B", "C", "A")
      ctz-draw-text(2, 2.7, $8 "cm"$, anchor:"west")
      ctz-draw-text(5.1, 1.8, $6 "cm"$, anchor:"west")
      ctz-draw-text(2.5, 0.5, $10 "cm"$, anchor:"west")
      ctz-draw-labels("A", "B", "C",
        A: (pos: "left", dist: 0.25),
        B: (pos: "above"),
        C: (pos: "right"),
      )
    })
  ],
)

=== Question 4

Une boîte opaque contient des beignets tous identiques, garnis de confitures différentes :
- 6 beignets sont à l'abricot ;
- 5 beignets sont à la pomme ;
- 4 beignets sont à la framboise.

Déterminer la probabilité de piocher au hasard un beignet à la framboise.

=== Question 5

Un article coûte $800$ €. Son prix baisse de $10$ %.

Calculer le prix, en euro, de l'article après réduction.

=== Question 6

Développer et réduire l'expression $B = 4y(3y - 1)$.

=== Question 7

Recopier la réponse permettant de compléter l'égalité $3,57$ L $=$ #h(0.3em) dots.h.c #h(0.3em) cm#super[3].

=== Question 8

Recopier sur la copie l'image de 4 par la fonction affine $f$ définie par $f(x) = 3x - 5$.

#table(
  columns: 4, align: center, stroke: 0.6pt,
  [*A.* #h(0.3em) 3], [*B.* #h(0.3em) 7], [*C.* #h(0.3em) 12], [*D.* #h(0.3em) 29],
)

=== Question 9

#let tx9(x) = (x * 0.85 + 0.4) * 1cm
#let ty9(y) = (4.0 - y * 0.85) * 1cm

#grid(
  columns: (1.2fr, 1fr),
  gutter: 12pt,
  [
    Le quadrilatère $A B C D$ ci-contre est tracé à main levée.

    À partir des codages donnés, en déduire sa nature parmi les quatre réponses proposées et la recopier sur la copie.
  ],
  [
    #ctz-canvas( {
  import cetz.draw: *
  ctz-init()
  ctz-def-points(A: (0.2, 0.2), B: (4, 0.8), C: (3.8, 4), D: (0, 3.4))
  ctz-def-midpoint("O", "A", "C")
  ctz-draw-mark-segment("A", "O", mark:2)
  ctz-draw-mark-segment("B", "O", mark:2)
  ctz-draw-mark-segment("C", "O", mark:2)
  ctz-draw-mark-segment("D", "O", mark:2)
  ctz-draw-line("A", "B", "C", "D", "A")
  ctz-draw-segment("A", "C")
  ctz-draw-segment("D", "B")
  ctz-draw-labels("A", "B", "C", "D",
    A: (pos: "below left", dist: 0.25),
    B: (pos: "below right"),
    C: (pos: "above right"),
    D: (pos: "above left"),
  )
})
  ],
)

#table(
  columns: 2, align: center, stroke: 0.6pt,
  [*A.* #h(0.3em) Un losange.], [*B.* #h(0.3em) Un rectangle.],
  [*C.* #h(0.3em) Un carré.], [*D.* #h(0.3em) Un parallélogramme.],
)
