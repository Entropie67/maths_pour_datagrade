#import "@preview/blockst:0.2.1": scratch

+ Quelle est la mesure, en degrés, d'un angle droit ?

+ Voici une série de quatre notes : 8 ; 10 ; 11 ; 11.

  Quelle est la moyenne de cette série ?

  #table(
    columns: 4,
    align: center,
    stroke: 0.6pt,
    [*A.* 9,5], [*B.* 10], [*C.* 10,5], [*D.* 11],
  )

+ Dans un collège de 800 élèves, 25 % des élèves portent des lunettes.

  Combien d'élèves portent des lunettes ?

+ Le graphique ci-dessous donne l'évolution de la température (en degrés Celsius) en fonction de l'horaire (en heures).

  #image("images/dnb_2026_01_sujet0va_automatismes-graphique.png")

  #v(2pt)

  Entre 8 h et 16 h, de combien de degrés la température a-t-elle augmenté ?

+ Une voiture roule à 90 km/h. Combien de temps met-elle pour parcourir 45 km ?

  #table(
    columns: 4,
    align: center,
    stroke: 0.6pt,
    [*A.* 15 min], [*B.* 30 min], [*C.* 45 min], [*D.* 1 h],
  )

+ #grid(
    columns: (1fr, 1fr),
    gutter: 12pt,
    [
      Donner le périmètre du losange $A B C D$ représenté ci-contre.
    ],
    [
     #ctz-canvas({
      import cetz.draw: *
      ctz-init()
      ctz-def-points(
        A: (0.2, 2.3),
        B: (2.5, 0.3),
        C: (4.8, 2.3),
        D: (2.5, 4.3),
      )
      ctz-draw-line("A", "B", "C", "D", "A")
      ctz-draw-text(0.5, 4, $3 "cm"$, anchor: "west")
      ctz-draw-labels("A", "B", "C", "D",
        A: (pos: "left"),
        B: (pos: "below"),
        C: (pos: "right"),
        D: (pos: "above"),
      )
   })
    ],
  )

+ Pour résoudre l'équation $4x - 3 = 0$, on effectue le calcul :

  #table(
    columns: 4,
    align: center,
    stroke: 0.6pt,
    [*A.* $x = (20) / (4) + 3$], [*B.* $x = (20 - 4) + 3$], [*C.* $x = 20 times 4 + 3$], [*D.* $x = (20 + 3) / (4)$],
  )

+ #grid(
    columns: (1fr, 1fr),
    gutter: 12pt,
    [
      Sur la figure ci-contre, les droites $(D E)$ et $(A C)$ sont parallèles.

      Écrire une égalité de rapports permettant de déterminer la longueur $A B$.
    ],
    [
      #box(width: 5.3cm, height: 4.3cm)[
        #place(dx: 0cm, dy: 0cm,
          polygon(fill: none, stroke: 0.6pt, (0.6cm, 4.2cm), (5.0cm, 3.7cm), (0.7cm, 0.9cm)))
        #place(dx: 0cm, dy: 0cm,
          line(start: (0.65cm, 3.1cm), end: (3.67cm, 2.8cm), stroke: 0.6pt))
        #place(dx: 0.15cm, dy: 4.25cm)[$A$]
        #place(dx: 5.1cm, dy: 3.8cm)[$C$]
        #place(dx: 0.5cm, dy: 0.55cm)[$B$]
        #place(dx: 0.15cm, dy: 2.75cm)[$D$]
        #place(dx: 3.77cm, dy: 2.45cm)[$E$]
        #place(dx: 2.8cm, dy: 4.1cm)[6]
        #place(dx: 2.2cm, dy: 3cm)[4]
        #place(dx: 2.4cm, dy: 1.6cm)[4,5]
      ]
    ],
  )

+ #grid(
    columns: (1fr, 1fr),
    gutter: 12pt,
    [
      On considère l'algorithme suivant :

      Quel résultat obtient-on si on choisit 1 comme nombre de départ ?
    ],
    [
      #scratch(scale: 80%, language: "fr", "quand le drapeau vert est cliqué
      demander [Choisir un nombre] et attendre ::sensing
      mettre [variable v] à (réponse) ::variables
      mettre [résultat v] à ((8) * (variable)) ::variables
      mettre [résultat v] à ((résultat) + (10)) ::variables
      mettre [résultat v] à ((résultat) / (2)) ::variables
      dire (regrouper [J'obtiens comme résultat] et (résultat)) ::looks")
    ],
  )