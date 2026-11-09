#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  [
    Sur la figure ci-contre, qui n'est pas représentée en vraie grandeur :
    - $A$ est le point d'intersection des droites $(B E)$ et $(T M)$ ;
    - le triangle $A B M$ est rectangle en $A$ ;
    - $A T = 2,2$ m ; $M T = 7,7$ m ;
    - $A E = 1,92$ m et $M B = 7,3$ m.
  ],
  [
    #box(width: 9cm, height: 8.2cm, clip: true)[
      #let sx(x) = x + 3cm
      #let sy(y) = 5.8cm - y
      #place(dx: 0cm, dy: 0cm,
        polygon(fill: none, stroke: 0.6pt,
          (sx(0cm), sy(5cm)), (sx(-2.3cm), sy(0cm)), (sx(0cm), sy(-2cm)), (sx(5.4cm), sy(0cm))))
      #place(dx: 0cm, dy: 0cm, line(start: (sx(-2.3cm), sy(0cm)), end: (sx(5.4cm), sy(0cm)), stroke: 0.6pt))
      #place(dx: 0cm, dy: 0cm, line(start: (sx(0cm), sy(-2cm)), end: (sx(0cm), sy(5cm)), stroke: 0.6pt))
      #place(dx: sx(0cm), dy: sy(0.3cm), rect(width: 0.3cm, height: 0.3cm, fill: none, stroke: 0.6pt))
      #place(dx: sx(0cm) - 0.1cm, dy: sy(5cm) - 0.5cm)[$B$]
      #place(dx: sx(-2.3cm) - 0.4cm, dy: sy(0cm) - 0.15cm)[$T$]
      #place(dx: sx(0cm) - 0.1cm, dy: sy(-2cm) + 0.1cm)[$E$]
      #place(dx: sx(0cm) - 0.5cm, dy: sy(0cm) + 0.1cm)[$A$]
      #place(dx: sx(5.4cm) + 0.15cm, dy: sy(0cm) - 0.15cm)[$M$]
    ]
  ],
)

+ Justifier que $A M = 5,5$ m.
+ Montrer que la longueur $A B$ est égale à $4,8$ m.
+ Calculer la mesure de l'angle $hat(A B M)$. Donner la valeur arrondie au degré.
+ Montrer que les droites $(T E)$ et $(B M)$ sont parallèles.

  _Détailler la réponse en précisant la démarche._
+ Le triangle $A B M$ est l'image du triangle $A E T$ par une homothétie de centre $A$.

  Choisir le rapport de cette homothétie parmi les propositions suivantes. Aucune justification n'est demandée.

  #table(
    columns: 3,
    align: center,
    stroke: 0.6pt,
    [*Proposition 1*], [*Proposition 2*], [*Proposition 3*],
    [2,5], [$-0,4$], [$-2,5$],
  )
