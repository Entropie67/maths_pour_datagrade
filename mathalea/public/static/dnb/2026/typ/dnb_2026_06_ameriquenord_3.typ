Dans cet exercice, les deux parties sont indépendantes.

Une entreprise développe une intelligence artificielle (IA) capable de reconnaître des objets sur des images.

*Partie A*

On entraîne l'IA à partir d'une base de données de 50 000 images réparties en 4 catégories : «~Objets du quotidien~», «~Animaux~», «~Véhicules~», «~Autres~».

L'intelligence artificielle est testée pour mesurer sa précision et son efficacité. Les images sont réparties comme suit :

#align(center)[
  #table(
    columns: (0.6cm, 4cm, 4cm),
    align: (center, left, center),
    stroke: 0.6pt,
    fill: (x, y) => if y == 0 { luma(230) } else { none },
    [], [*Type d'image*], [*Nombre d'images*],
    [2], [Objets du quotidien], [28 000],
    [3], [Animaux], [12 000],
    [4], [Véhicules], [8 000],
    [5], [Autres], [?],
  )
]

+ Combien d'images appartiennent à la catégorie «~Autres~» ?
+ Sur l'ensemble des tests, l'intelligence artificielle reconnaît correctement 90 % des «~Objets du quotidien~».

  Calculer le nombre d'images reconnues correctement dans cette catégorie.
+ L'intelligence artificielle reconnaît correctement 5 600 images de la catégorie «~Véhicules~».

  Quel pourcentage de réussite cela représente-t-il dans cette catégorie ?
+ Une image est tirée au hasard dans la base de données.

  Quelle est la probabilité que l'image tirée soit l'image d'un «~Objet du quotidien~» ?

  On donnera le résultat sous la forme d'un nombre décimal.

*Partie B*

L'intelligence artificielle, très utilisée dans le monde entier, nécessite une quantité importante d'électricité. L'énergie consommée peut s'exprimer en wattheures (Wh).

En 2024, sa consommation annuelle est estimée à 82 000 Gigawattheures (GWh).

En comparaison, un collège consomme en moyenne 200 000 kilowattheures (kWh) par an.

#table(
  columns: 1,
  stroke: 0.6pt,
  [*Rappels :*
  - 1 kWh $= 10^3$ Wh
  - 1 GWh $= 10^9$ Wh],
)

#enum(
  start: 5,
  [Convertir la consommation de l'IA et d'un collège en Wh.

  _Exprimer ces résultats sous la forme d'une écriture scientifique._],
  [Combien de collèges pourrait-on alimenter pendant un an avec la consommation électrique de l'intelligence artificielle ?],
  [En France, il y a environ 7 100 collèges. Dans cette question, on suppose que chaque collège a la même consommation d'énergie annuelle moyenne (200 000 kWh).

  Pendant combien d'années environ pourrait-on alimenter tous les collèges français avec la consommation électrique annuelle de cette intelligence artificielle ?],
)
