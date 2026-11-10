// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

Le directeur d'une école primaire organise un tournoi sportif pour les élèves de CE2 et de CM1 des écoles de la ville. Au total, on compte 72 élèves de CE2 et 108 élèves de CM1 répartis dans quatre écoles.

*Partie A*

Le directeur souhaite que les équipes soient composées selon les règles suivantes :
- le nombre d'élèves de CE2 doit être identique dans toutes les équipes ;
- le nombre d'élèves de CM1 doit être identique dans toutes les équipes.

*1.* Le directeur envisage dans un premier temps de constituer 14 équipes avec un maximum d'élèves des deux niveaux (sans nécessairement sélectionner tous les élèves).

#sub("a", [Donner la composition de chaque équipe.])
#sub("b", [Dans ces conditions, combien d'élèves ne participeront pas au tournoi ?])

*2.* Le directeur change d'avis : il souhaite que tous les élèves puissent participer. Pour cela, il cherche à déterminer le nombre d'équipes adéquat.

#sub("a", [Peut-il constituer 8 équipes ? Justifier.])
#sub("b", [Décomposer 72 et 108 en produit de facteurs premiers.])
#sub("c", [En déduire la liste des diviseurs communs à 72 et 108.])
#sub("d", [Quel nombre d'équipes maximal le directeur peut-il constituer ? Préciser alors la composition de chaque équipe.])

*Partie B*

Le tableau ci-dessous indique la répartition des élèves de CE2 et de CM1 qui participent au tournoi selon leur école de scolarisation :

#align(center)[
  #table(
    columns: (auto, 1fr, 1fr, 1fr, 1fr),
    align: (left + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
    inset: 5pt,
    stroke: 0.5pt,
    [], [*École Aimé Césaire*], [*École Irène Joliot-Curie*], [*École Lucie Aubrac*], [*École Victor Hugo*],
    [*Effectif en CE2*], [20], [22], [14], [16],
    [*Effectif en CM1*], [24], [19], [34], [31],
  )
]

*1.* Parmi les élèves de l'école Irène Joliot-Curie qui participent au tournoi, quelle est la proportion d'élèves de CE2 ? Donner le résultat en pourcentage arrondi à l'unité.

*2.* Calculer le nombre moyen d'élèves en classe de CM1 sur l'ensemble des quatre écoles.

*3.* On choisit un élève au hasard parmi tous les élèves qui participent au tournoi. Quelle est la probabilité qu'il soit en CM1 ?

*4.* On choisit un élève au hasard parmi les élèves de CE2 qui participent au tournoi. Quelle est la probabilité qu'il soit scolarisé à l'école Aimé Césaire ? Donner le résultat sous la forme d'une fraction irréductible.
