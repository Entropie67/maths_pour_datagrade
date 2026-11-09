On considère les fonctions $f$ et $g$ suivantes :

$ f: & x arrow.bar.long 4x + 3 \
  g: & x arrow.bar.long 6x $

Leurs représentations graphiques $(d_1)$ et $(d_2)$ sont tracées ci-dessous :

+ Parmi ces deux fonctions, laquelle représente une situation de proportionnalité ?
+ Calculer l'image de 0 par la fonction $g$.
+ Déterminer l'antécédent de $0$ par la fonction $f$.

  #align(center)[
    #box(width: 11.9cm, height: 7.12cm)[
      // grille légère
      #for x in range(-1, 6) {
        place(dx: (x + 1.5) * 1.7cm, dy: 0cm, line(start: (0cm, 0cm), end: (0cm, 7.12cm), stroke: 0.3pt + gray))
      }
      #for i in range(0, 11) {
        let y = i * 2
        place(dx: 0cm, dy: 7.1175cm - (y + 1.9) * 0.325cm, line(start: (0cm, 0cm), end: (11.9cm, 0cm), stroke: 0.3pt + gray))
      }
      // axes
      #place(dx: 0cm, dy: 6.5cm, line(start: (0cm, 0cm), end: (11.9cm, 0cm), stroke: 0.8pt))
      #place(dx: 11.7cm, dy: 6.4cm, line(start: (0cm, 0cm), end: (0.2cm, 0.1cm), stroke: 0.8pt))
      #place(dx: 11.7cm, dy: 6.6cm, line(start: (0cm, 0cm), end: (0.2cm, -0.1cm), stroke: 0.8pt))
      #place(dx: 2.55cm, dy: 0cm, line(start: (0cm, 7.1175cm), end: (0cm, 0cm), stroke: 0.8pt))
      #place(dx: 2.45cm, dy: 0.2cm, line(start: (0cm, 0cm), end: (0.1cm, -0.2cm), stroke: 0.8pt))
      #place(dx: 2.65cm, dy: 0.2cm, line(start: (0cm, 0cm), end: (-0.1cm, -0.2cm), stroke: 0.8pt))
      // graduations
      #for x in range(-1, 6) {
        place(dx: (x + 1.5) * 1.7cm - 0.1cm, dy: 6.6cm)[#text(size: 7pt)[#x]]
      }
      #for i in range(1, 11) {
        let y = i * 2
        place(dx: 2.1cm, dy: 7.1175cm - (y + 1.9) * 0.325cm - 0.1cm)[#text(size: 7pt)[#y]]
      }
      // droite (d1) : g(x) = 6x, en bleu
      #place(dx: 0cm, dy: 0cm,
        line(start: (2.01cm, 7.12cm), end: (8.22cm, 0cm), stroke: 1pt + blue))
      // droite (d2) : f(x) = 4x + 3, en rouge
      #place(dx: 0cm, dy: 0cm,
        line(start: (0.47cm, 7.12cm), end: (9.78cm, 0cm), stroke: 1pt + red))
      // étiquettes des droites
      #place(dx: 7.1cm, dy: 0.3cm)[#text(fill: blue)[$(d_1)$]]
      #place(dx: 8.9cm, dy: 0.85cm)[#text(fill: red)[$(d_2)$]]
    ]
  ]

+ Associer à chaque droite la fonction qu'elle représente. Justifier la réponse.
+ Déterminer graphiquement les coordonnées du point d'intersection des droites $(d_1)$ et $(d_2)$.
