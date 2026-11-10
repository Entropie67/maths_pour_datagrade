+ Quel est le tiers de 18 ?

+ Un film dure $240$ min. Quelle est sa durée en heures ?

+ Les notes obtenues par un élève sont : 8 ; 12 ; 6 ; 19 ; 15

  Que vaut la médiane de cette série de notes ?

+  #cetz.canvas({
  import cetz.draw: *
  scale(0.4)
  // Grille
  grid((0, 0), (20, 6), stroke: 0.3pt + gray)

  // Fonction pour dessiner une croix (×) à une position donnée
  let croix(pos, taille: 0.3) = {
    let (x, y) = pos
    line((x - taille, y - taille), (x + taille, y + taille), stroke: 1.2pt)
    line((x - taille, y + taille), (x + taille, y - taille), stroke: 1.2pt)
  }

  // Droite graduée (axe horizontal)
  line((0, 3), (20, 3), stroke: 1.5pt)

  // Croix aux points 0, 1 et E
  croix((2, 3))
  croix((8, 3))
  croix((18, 3))

  // Étiquettes
  content((2, 2.5), [0], anchor: "north")
  content((8, 2.5), [1], anchor: "north")
  content((18, 3.6), [E], anchor: "south")
})

  Sur cette droite graduée, l'abscisse du point E est

  #table(
    columns: 4,
    align: center,
    stroke: 0.6pt,
    [*A.* $(5) / (4)$], [*B.* $(3) / (2)$], [*C.* $(7) / (4)$], [*D.* $(5) / (2)$],
  )

+ #grid(
    columns: (1fr, 1fr),
    gutter: 12pt,
    [
      Dans le triangle $A B C$, rectangle en $B$, on sait que $hat(A) = 35$°.

      Calculer $hat(C)$.
    ],
    [
    #ctz-canvas(length: 0.9cm, {
      import cetz.draw: *
      ctz-init()
      ctz-def-points(A: (0, 0), B: (5, 0), C: (5, 3.5))
      ctz-draw(line: ("A", "B", "C", "A"), stroke: black + 1pt)
      ctz-draw-mark-right-angle("A", "B", "C", size: 0.35)
      ctz-draw-angle("A", "B", "C", label: $35°$, radius: 0.9,
        stroke: gray, fill: none)
      ctz-draw-angle("C", "A", "B", label: [?], radius: 0.7,
        stroke: gray, fill: none)
      ctz-draw-labels("A", "B", "C",
          A: (pos: "below left"),
          B: (pos: "below right"),
          C: (pos: "above")
        )
    })
    ],
  )

+ #grid(
    columns: (1fr, 1fr),
    gutter: 12pt,
    [
      Dans le triangle $A B C$, rectangle en $A$, quel calcul doit-on effectuer pour déterminer le cosinus de l'angle $hat(A B C)$ ?
    ],
    [
      #ctz-canvas(length: 0.9cm, {
        import cetz.draw: *
        ctz-init()
        ctz-def-points(A: (0, 0), B: (6, 0), C: (0, 3))
        ctz-draw(line: ("A", "B", "C", "A"), stroke: black + 1pt)
        ctz-draw-mark-right-angle("C", "A", "B", size: 0.35)
        ctz-draw-labels("A", "B", "C",
          A: (pos: "below left"),
          B: (pos: "right"),
          C: (pos: "above")
        )
      })
    ],
  )

+ #grid(
    columns: (1fr, 1fr),
    gutter: 12pt,
    [
      Sur la figure ci-contre, dans le triangle $A D E$ les droites $(D E)$ et $(C B)$ sont parallèles.

      Déterminer la longueur $A D$.
    ],
    [
     #ctz-canvas(length: 0.8cm, {
      import cetz.draw: *
      ctz-init()
      ctz-def-points(
        A: (0, 0),
        D: (6.5, 4),
        E: (10, 0),
        C: (2.6, 1.6),
        B: (3.2, 0),
      )
      ctz-draw(segment: ("A", "D"), stroke: black + 1pt)
      ctz-draw(segment: ("A", "E"), stroke: black + 1pt)
      ctz-draw(segment: ("D", "E"), stroke: black + 1pt)
      ctz-draw(segment: ("C", "B"), stroke: black + 1pt)
      content(("A", 50%, "C"), [4 cm], anchor: "south-east", padding: 0.1cm)
      content(("C", 50%, "B"), [2 cm], anchor: "west", padding: 0.2cm)
      content(("D", 50%, "E"), [7 cm], anchor: "west", padding: 0.2cm)
      ctz-draw-labels("A", "B", "C", "D", "E",
          A: (pos: "left"),
          B: (pos: "below"),
          C: (pos: "above"),
          D: (pos: "above"),
          E: (pos: "below")
        )
    })
    ],
  )

+ Dans un collège, 25 % des 300 élèves participent à une olympiade de mathématiques.

  Combien d'élèves ne participent pas à cette olympiade ?

+ #grid(
    columns: (1fr, 1fr),
    gutter: 12pt,
    [
      Une élève souhaite réaliser un programme avec un logiciel de programmation pour dessiner un carré.

      Par quelles valeurs doit-on compléter les lignes 3 et 5 pour obtenir un carré ?
    ],
    [
      #scratch(scale: 80%, language: "fr", "définir [carré] ::custom
      Mettre le stylo en position d'écriture ::pen
      répéter () fois
        avancer de (50) pas
        tourner @turnLeft de () degrés
      fin")
    ],
  )