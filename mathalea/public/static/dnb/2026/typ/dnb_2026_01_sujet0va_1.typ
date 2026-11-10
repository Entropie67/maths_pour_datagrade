Dans le cadre d'un projet de labellisation « Éducation au développement durable », un collège réalise deux enquêtes sur une période donnée.

+ La première enquête porte sur le gaspillage alimentaire à la cantine.

  Pendant sept semaines, on relève la masse totale, en kilogramme, d'aliments jetés chaque semaine :

  #table(
    columns: 8,
    align: center,
    stroke: 0.6pt,
    [Semaine], [1], [2], [3], [4], [5], [6], [7],
    [Masse (kg)], [62], [59], [74], [68], [55], [61], [71],
  )

  Ce collège s'est donné comme objectif que la moyenne, par semaine, de déchets alimentaires sur les 7 semaines ne dépasse pas 65 kg.

  Montrer que ce collège a atteint son objectif.

+ La seconde enquête porte sur les déplacements des élèves à vélo entre le domicile et le collège.

  Le diagramme ci-dessous représente, pour chaque distance, l'effectif des élèves qui parcourent cette distance en vélo pour aller au collège. (Les élèves qui n'utilisent pas le vélo pour se rendre au collège parcourent 0 km à vélo.)

#align(center)[
  #cetz.canvas({
    chart.columnchart(
      size: (10, 6),
      (
        ("0", 33),
        ("1", 32),
        ("2", 42),
        ("3", 31),
        ("4", 36),
        ("5", 28),
        ("6", 24),
        ("7", 22),
        ("8", 14),
      ),
      x-label: [Distance parcourue en km],
      y-label: [Effectif],
      y-tick-step: 10,
      bar-style: (fill: rgb("#a91e42"), stroke: black),
    )
  })
]

  #enum(
    numbering: "a.",
    [Déterminer l'effectif total d'élèves de ce collège.],
    [Pour ce collège, l'affirmation « Plus de 30 % des élèves ont parcouru au moins 5 km à vélo pour se rendre au collège » est-elle vraie ?

    *Justifier la réponse en précisant la démarche.*],
  )