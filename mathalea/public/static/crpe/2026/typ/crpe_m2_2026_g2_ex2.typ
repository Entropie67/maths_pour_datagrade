Une équipe d'enseignants de cycle 3 utilise un tableur pour garder en mémoire les performances des élèves, pour la pratique de la course longue autour d'un stade. Voici la feuille récapitulative des courses effectuées par un élève :

#align(center)[#image("crpe_m2_2026_g2_ex2-tableur.png", width: 16.5cm)]

#pad(left: 1.2em)[
  *1.* Donner une formule qui peut être saisie dans la cellule D3 puis étirée vers le bas pour effectuer automatiquement le calcul de la durée de course en secondes ?

  *2.*

  #pad(left: 1.2em)[
    *a.* Calculer la valeur de la cellule G3 arrondie au centième.

    *b.* Calculer la valeur exacte de la cellule H3.
  ]

  *3.* Un autre élève a effectué 8 tours à une vitesse moyenne de 9,8 km/h.

  Calculer la durée de la course réalisée par l'élève en l'exprimant en minute seconde arrondie à la seconde.

  *4.* Le 11 octobre, dernier jour de l'entraînement, les enseignants ont relevé les vitesses moyennes, arrondies au centième, de chaque élève de cycle 3 dans ce tableau.
]

#align(center)[
  #table(
    columns: (2.6cm, ..range(8).map(_ => 1fr)),
    align: center + horizon,
    inset: 5pt,
    [Vitesse (m/s)], [2,35], [2,4], [2,43], [2,5], [2,54], [2,67], [2,78], [2,9],
    [Effectif], [2], [5], [8], [12], [13], [10], [7], [3],
  )
]

#pad(left: 1.2em)[
  *a.* Calculer la vitesse moyenne en m/s réalisée par un élève de cycle 3 en précisant le calcul effectué.

  *b.* Déterminer la médiane et en donner une interprétation dans le contexte de l'exercice.
]
