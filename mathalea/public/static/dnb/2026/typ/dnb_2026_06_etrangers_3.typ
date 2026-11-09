#import "@preview/blockst:0.2.1": scratch

Voici deux programmes de calcul :

#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  [
    #align(center)[*Programme A*]

    #align(center)[
      #box(width: 6cm, height: 4.2cm)[
        #place(dx: 1.9cm, dy: 0cm)[#box(stroke: 0.6pt, inset: 4pt)[Choisir un nombre]]
        #place(dx: 0cm, dy: 1.1cm)[#box(stroke: 0.6pt, inset: 4pt)[Ajouter 6]]
        #place(dx: 3.9cm, dy: 1.1cm)[#box(stroke: 0.6pt, inset: 4pt)[Soustraire 4]]
        #place(dx: 0.6cm, dy: 2.3cm)[Multiplier les]
        #place(dx: 0.1cm, dy: 2.7cm)[deux nombres obtenus]
        #place(dx: 1cm, dy: 3.5cm)[#box(stroke: 0.6pt, width: 4cm, height: 0.7cm)[]]
        #place(dx: 0cm, dy: 0.6cm,
          line(start: (2.4cm, 0cm), end: (1.1cm, 0.5cm), stroke: 0.6pt))
        #place(dx: 0cm, dy: 0.6cm,
          line(start: (3.6cm, 0cm), end: (4.7cm, 0.5cm), stroke: 0.6pt))
        #place(dx: 0cm, dy: 1.9cm,
          line(start: (1cm, 0cm), end: (2cm, 0.4cm), stroke: 0.6pt))
        #place(dx: 0cm, dy: 1.9cm,
          line(start: (4.7cm, 0cm), end: (3.6cm, 0.4cm), stroke: 0.6pt))
      ]
    ]
  ],
  [
    #align(center)[*Programme B*]

    - Choisir un nombre.
    - Calculer le carré de ce nombre.
    - Soustraire 9.
  ],
)

+ On choisit 1 comme nombre de départ. Vérifier que le résultat obtenu avec le programme A est $-21$.
+ On choisit 10 comme nombre de départ. Calculer le résultat obtenu avec le programme B.
+ Donner tous les nombres de départ possibles qui permettent d'obtenir 16 avec le programme B.
+ *(Question algorithmique)*

  #grid(
    columns: (0.4fr, 0.6fr),
    gutter: 12pt,
    [
      Le programme ci-contre a été conçu avec le logiciel Scratch.

      Recopier et compléter sur la copie les lignes 3, 4 et 5 pour qu'il affiche le résultat obtenu avec le programme A lorsqu'un nombre de départ est saisi.

      #text(style: "italic")[Aucune justification n'est attendue.]
    ],
    [
      #scratch(line-numbers: true, language: "fr", "quand le drapeau vert est cliqué
demander [choisir un nombre] et attendre ::sensing
mettre [Valeur 1 v] à ((réponse) + ()) ::variables
mettre [Valeur 2 v] à ((réponse) - ()) ::variables
mettre [Résultat v] à () * () ::variables
dire (regrouper [Le résultat du programme A est] et (Résultat)) ::looks")
    ],
  )
+ On choisit $x$ comme nombre de départ. Montrer que le résultat obtenu avec le programme A est $x^2 + 2 x - 24$.
+ On cherche quel nombre de départ choisir pour que les programmes A et B donnent le même résultat. Écrire une équation permettant d'obtenir ce nombre de départ, puis la résoudre.
