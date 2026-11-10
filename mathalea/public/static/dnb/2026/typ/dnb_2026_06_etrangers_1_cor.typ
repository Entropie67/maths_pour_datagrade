+ #ctz-canvas(length: 0.75cm, {
      import cetz.draw: *
      ctz-init()
      ctz-def-points(
        A: (0, 0),
        B: (6.4, 0),
        M: (9.6, 0),
        C: (6.4, 4.8),
        N: (9.6, 7.2),
      )
      // droite (AN), prolongée au-delà de A et de N, avec flèches aux deux bouts
      ctz-draw(segment: ((-0.64, -0.48), (10.64, 7.98)),
        stroke: black + 1.3pt, mark: (start: ">", end: ">"))
      // droite de base (AM)
      ctz-draw(segment: ("A", "M"), stroke: black + 1pt)
      // segment [MN]
      ctz-draw(segment: ("M", "N"), stroke: black + 1pt)
      // segment vertical (CB)
      ctz-draw(segment: ("C", "B"), stroke: black + 1pt)
      // angle droit en B
      ctz-draw-mark-right-angle("C", "B", "A", size: 0.4)
      // mesure de 8 cm le long de (AC), légèrement décalée
      ctz-draw-measure-segment("A", "C", label: [8 cm], offset: 0.6, side: "left")
      // mesures de 6,4 cm et 3,2 cm sous la base
      ctz-draw-measure-segment("A", "B", label: [6,4 cm], offset: 1.0, side: "below")
      ctz-draw-measure-segment("B", "M", label: [3,2 cm], offset: 1.0, side: "below")
      // labels sans croix
      ctz-draw-labels("A", "B", "C", "M", "N",
        A: (pos: "below left"),
        B: (pos: "above right"),
        C: (pos: "above"),
        M: (pos: "right"),
        N: (pos: "right"),
      )
   })

  Commencer par tracer le segment $[A M]$ (9,6 cm) avec le point $B$ intercalé à 6,4 cm de $A$.

  Puis tracer les deux perpendiculaires en $B$ et $M$.

  Laisser apparent un bel arc de cercle centré sur $A$ et de rayon 8.

  À l'intersection avec la perpendiculaire en $B$, on place le point $C$.

  On peut ensuite tracer la droite $(A C)$ et placer $N$ à l'intersection avec la perpendiculaire en $M$.
+ $A B C$ est un triangle rectangle en $B$, selon le théorème de Pythagore, $A C^2 = A B^2 + B C^2$.

  Donc $B C^2 = 8^2 - 6,4^2 = 23,04$ et $B C = sqrt((23,04)) = 4,8$.

  La longueur $B C$ mesure 4,8 cm.
+ $(B C)$ et $(M N)$ sont toutes deux perpendiculaires à $(A M)$.

  Comme deux droites perpendiculaires à une même troisième droite sont parallèles entre elles, $(B C)$ et $(M N)$ sont parallèles.
+ - Les points $A$, $B$ et $M$ sont alignés ;
  - les points $A$, $C$ et $N$ sont alignés ;
  - $(B C)$ et $(M N)$ sont parallèles.

  Donc, selon le théorème de Thalès, #h(0.5em) $(A B) / (A M) = (A C) / (A N) = (B C) / (M N)$

  On peut donc calculer : #h(0.5em) $M N = (B C times A M) / (A B) = 7,2$ #h(0.5em) et #h(0.5em) $A N = (A C times A M) / (A B) = 12$.

  Les longueurs $M N$ et $A N$ sont respectivement 7,2 cm et 12 cm.
+ Le périmètre du triangle $A B C$ est de $6,4 + 4,8 + 8 = 19,2$ cm.

  Comme $A$, $C$ et $N$ sont alignés, $C N = 4$ cm.

  Donc le périmètre de $B M N C$ est égal à $3,2 + 7,2 + 4 + 4,8 = 19,2$ cm.

  Les deux figures ont le même périmètre et celui-ci est de 19,2 cm.
