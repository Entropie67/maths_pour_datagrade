// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

Un entraîneur d'un club sportif organise un test physique pour la catégorie des benjamines et benjamins. Ce test consiste à parcourir la plus grande distance possible en 12 minutes.

L'entraîneur s'appuie sur le tableau ci-dessous pour évaluer la condition physique des enfants.

#align(center)[
  #table(
    columns: (3.2cm, 4.6cm, 4.6cm),
    align: center + horizon,
    inset: 4pt,
    fill: (_, y) => if y == 0 { luma(220) },
    [Indice de forme], [Garçons], [Filles],
    [Insuffisant], [moins de 2~000~m], [moins de 1~800~m],
    [Suffisant], [2~000 à 2~400~m], [1~800 à 2~200~m],
    [Bon], [2~400 à 3~000~m], [2~200 à 2~800~m],
    [Très bon], [plus de 3~000~m], [plus de 2~800~m],
  )
]

*1.* Le tableau ci-dessous donne les performances de l'intégralité des benjamines et benjamins du club.

#align(center)[
  #table(
    columns: (3.4cm, ..range(8).map(_ => 1.35cm)),
    align: (left + horizon, ..range(8).map(_ => center + horizon)),
    inset: 4pt,
    [Distance parcourue (m)], [1~900], [2~100], [2~300], [2~500], [2~700], [2~900], [3~100], [3~200],
    [Effectif benjamins], [1], [5], [1], [1], [1], [2], [1], [1],
    [Effectif benjamines], [0], [2], [3], [2], [3], [2], [2], [0],
  )
]

#sub[a][Déterminer la médiane de la série des distances parcourues par les benjamins. Interpréter la réponse dans le contexte de l'exercice.]
#sub[b][Calculer la distance moyenne parcourue pour l'ensemble de cette catégorie (benjamins et benjamines), arrondie au mètre.]
#sub[c][Déterminer la proportion des enfants ayant un indice de forme « bon » ou « très bon ». On exprimera le résultat en pourcentage, arrondi à l'unité.]

*2.* Après deux mois d'entraînement, les benjamines et benjamins du club effectuent à nouveau ce test. Les résultats sont représentés sur le diagramme suivant.

#align(center)[#image("crpe_l3_2025_g4_ex2-histogramme.png", width: 11cm)]

#sub[a][L'intégralité des benjamines et benjamins du club a-t-elle effectué ce second test ?]
#sub[b][Calculer l'étendue de cette seconde série de résultats.]
#sub[c][Sachant que la distance moyenne parcourue à l'issue de ce second test s'est améliorée pour atteindre 2~693~m (valeur arrondie à l'unité), calculer le taux d'évolution de la distance moyenne parcourue entre les deux tests. On exprimera le résultat sous forme de pourcentage arrondi au dixième.]

*3.* Le test réalisé par l'entraîneur permet d'estimer la quantité maximale d'oxygène que l'organisme peut utiliser par unité de temps. On appelle cette quantité la $"VO"_2$ max. Elle est exprimée en millilitres par minute et par kilogramme (mL/min/kg) et vérifie la formule suivante :

#align(center)[$"VO"_2 "max" = "22,351" times D - "11,288"$]

où $D$ est la distance parcourue (en km) lors du test.

#sub[a][Quelle est la $"VO"_2$ max d'un enfant ayant parcouru 2~800~m ?]
#sub[b][Quelle distance faut-il parcourir pour obtenir une $"VO"_2$ max égale à 47~mL/min/kg ? Arrondir la réponse au mètre.]
