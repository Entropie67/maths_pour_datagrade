#import "@preview/blockst:0.2.1": scratch

On considère le programme de calcul ci-dessous.

#align(center)[
  #box(stroke: 0.6pt, inset: 10pt, width: 55%)[
    #align(center)[*Programme A*]
    - Choisir un nombre
    - Soustraire 2
    - Multiplier par 5
    - Ajouter le triple du nombre de départ
  ]
]

+ Vérifier qu'en choisissant 1 comme nombre de départ, on obtient $-2$ avec ce programme de calcul.
+ On note $x$ le nombre choisi au départ.
  #enum(
    numbering: "a.",
    [Montrer que le résultat du programme est $8 x - 10$.],
    [Quel nombre de départ faut-il choisir pour que le résultat du programme soit égal à 0 ?],
  )
+ #text(style: "italic")[Question d'algorithmique]
  #enum(
    numbering: "a.",
    [On considère ci-dessous le programme de calcul B, réalisé avec le logiciel «~Scratch~».

    #align(center)[
      *Programme B*

      #scratch(language: "fr", "quand le drapeau vert est cliqué
demander [choisir un nombre] et attendre ::sensing
mettre [résultat v] à ((4) * (réponse)) ::variables
mettre [résultat v] à ((résultat) - (5)) ::variables
mettre [résultat v] à ((2) * (résultat)) ::variables
dire (résultat) ::looks")
    ]

    En appliquant ce programme de calcul au nombre 1, quel résultat final obtient-on ?],
    [Montrer que le résultat du programme A est toujours le même que celui du programme B quel que soit le nombre choisi au départ.],
  )
