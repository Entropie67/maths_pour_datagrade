La figure ci-contre n'est pas représentée en vraie grandeur.

#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  [
    Les points $B$, $A$ et $E$ sont alignés. \
    Les points $C$, $A$ et $D$ sont alignés. \
    Le triangle $A B C$ est rectangle en $B$.

    - $D E = 4,8 "cm"$
    - $A D = 7,3 "cm"$
    - $A E = 5,5 "cm"$
    - $B C = 7,2 "cm"$.
  ],
  [
    #box(width: 5.8cm, height: 7cm)[
      #place(dx: 0cm, dy: 0cm,
        polygon(
          fill: none, stroke: 0.6pt,
          (0.4cm, 4.0cm), (5.4cm, 4.0cm), (5.4cm, 6.8cm), (0.4cm, 0.8cm),
        ))
      #place(dx: 0.4cm, dy: 3.8cm,
        rect(width: 0.2cm, height: 0.2cm, fill: none, stroke: 0.6pt))
      #place(dx: 3.1cm, dy: 3.55cm)[$A$]
      #place(dx: 0cm, dy: 4.15cm)[$B$]
      #place(dx: 5.5cm, dy: 3.55cm)[$E$]
      #place(dx: 5.5cm, dy: 6.75cm)[$D$]
      #place(dx: 0cm, dy: 0.35cm)[$C$]
    ]
  ],
)

+ Montrer que le triangle $A E D$ est un triangle rectangle en $E$.
+ Calculer l'aire du triangle $A E D$.
+ Pourquoi peut-on affirmer que les droites $(B C)$ et $(E D)$ sont parallèles ?
+ Calculer la valeur exacte de la longueur $A B$.
+ On admet que l'angle $hat(A C B)$ mesure environ 49°. En déduire la mesure de l'angle $hat(A D E)$.
