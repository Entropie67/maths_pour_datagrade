Les Jeux Olympiques d'été 2024 se sont déroulés en France. Toutes les épreuves ont eu lieu en métropole sauf l'épreuve de surf qui a eu lieu à Tahiti, en Polynésie française. Camille, qui aime le surf, a eu la chance de se rendre à Tahiti pour assister aux épreuves. L'organisation du voyage lui a permis de mieux connaître les caractéristiques de cette destination lointaine.

+ Sur la carte ci-dessous, les coordonnées géographiques approximatives de Los Angeles sont $(118°"O" ; 35°"N")$.

  Écrire sur la copie, de la même façon et avec la précision permise par la carte, les coordonnées géographiques approximatives de Tahiti.

  #let k = 2.55
  #let txm(x) = (x + 2.9) * k * 1cm
  #let tym(y) = (1.5 - y) * k * 1cm

  #align(center)[
    #image("images/dnb_2026_06_polynesie_3_carte.png")
  ]

  #v(-0.3em)
  #align(center)[#text(size: 7pt, style: "italic")[Carte du monde (méridiens et parallèles espacés de 30°) — figure simplifiée, les contours des continents ne sont pas représentés.]]

+ Camille s'est rendu à Tahiti en avion. Son trajet s'est déroulé en trois étapes :
  - Vol n#super[o] 1 : Paris -- Los Angeles.
  - Un temps d'attente dans l'aéroport.
  - Vol n#super[o] 2 : Los Angeles -- Tahiti.

  La totalité du trajet a duré $22$ h $10$ min en comptant le temps d'attente de $2$ h $20$ min à Los Angeles.

  Calculer la durée, en heure et minute, nécessaire pour effectuer les deux vols, sans prendre en compte le temps d'attente à Los Angeles.

+ Le surfeur australien Jack ROBINSON a gagné la médaille d'argent aux Jeux Olympiques de 2024. Camille s'interroge sur la masse d'argent contenue dans la médaille.

  Voici, ci-dessous, des informations récoltées au sujet de la conception des médailles olympiques.

  #let txc(x) = (x + 3.3) * 1cm
  #let tyc(y) = (1.3 - y) * 1cm
  #let ellptsc(cx, cy, rx, ry, a1, a2, n: 24) = range(n + 1).map(i => {
    let a = a1 + (a2 - a1) * i / n
    (txc(cx + rx * calc.cos(a * 1deg)), tyc(cy + ry * calc.sin(a * 1deg)))
  })

  #table(
    columns: 2, align: left, stroke: 0.6pt,
    [
      *Document 1 :*

      Une médaille olympique peut être modélisée par un cylindre de hauteur $0,92$ cm et de diamètre $8,5$ cm.
    ],
    [
      #align(center)[
        #box(width: 7.4cm, height: 3.3cm)[
          #place(dx: txc(0) - 3cm, dy: tyc(0) - 0.75cm,
            ellipse(width: 6cm, height: 1.5cm, fill: none, stroke: 0.35pt + teal))
          #place(dx: 0cm, dy: 0cm,
            line(start: (txc(-3), tyc(0)), end: (txc(-3), tyc(-0.6)), stroke: 0.35pt + teal))
          #place(dx: 0cm, dy: 0cm,
            line(start: (txc(3), tyc(0)), end: (txc(3), tyc(-0.6)), stroke: 0.35pt + teal))
          #place(dx: 0cm, dy: 0cm, {
            let pts = ellptsc(0, -0.6, 3, 0.75, 180, 360)
            curve(stroke: 0.35pt + teal, curve.move(pts.at(0)), ..pts.slice(1).map(p => curve.line(p)))
          })
          #place(dx: 0cm, dy: 0cm, {
            let pts = ellptsc(0, -0.6, 3, 0.75, 0, 180)
            curve(stroke: (thickness: 0.35pt, paint: teal, dash: "dotted"), curve.move(pts.at(0)), ..pts.slice(1).map(p => curve.line(p)))
          })
          #place(dx: 0cm, dy: 0cm,
            line(start: (txc(-3), tyc(-1.5)), end: (txc(3), tyc(-1.5)), stroke: 0.5pt))
          #place(dx: txc(0) - 0.5cm, dy: tyc(-1.5) + 0.05cm)[#text(size: 7pt)[$8,5$ cm]]
          #place(dx: 0cm, dy: 0cm,
            line(start: (txc(3.225), tyc(-0.6)), end: (txc(3.225), tyc(0)), stroke: 0.5pt))
          #place(dx: txc(3.225) + 0.1cm, dy: tyc(-0.3) - 0.1cm)[#text(size: 7pt)[$0,92$ cm]]
        ]
      ]
    ],
    [
      *Document 2* :

      L'argent est un métal qui a une masse volumique de $10,5$ g/cm#super[3].
    ],
    [
      *Document 3*

      Volume d'un cylindre : #h(0.3em) $pi times R^2 times h$

      où $R$ est le rayon du cylindre et $h$ est la hauteur du cylindre.
    ],
  )

  #v(0.3em)

  #enum(
    numbering: "a.",
    [Montrer que le volume de la médaille, arrondi au dixième, est d'environ $52,2$ cm#super[3].],
    [Calculer la masse d'argent, en gramme (g), de la médaille de Jack ROBINSON aux Jeux Olympiques 2024. Donner l'arrondi à l'unité.],
  )
