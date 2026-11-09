// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

// Encadré d'un devis : titre sur fond gris, puis les deux lignes de tarif
#let devis(nom, forfait, prix) = block(width: 100%, stroke: 0.6pt)[
  #block(width: 100%, fill: luma(225), stroke: (bottom: 0.6pt), inset: 3pt)[#align(center)[*#nom*]]
  #pad(x: 0.6cm, y: 0.15cm)[Base forfaitaire : #forfait \ #prix]
]

La directrice d'une école primaire prévoit d'organiser un voyage scolaire pour plusieurs classes de son école. L'effectif total de l'école est de 110 élèves. Deux organismes proposent les devis suivants.

#grid(
  columns: (1fr, 1fr),
  column-gutter: 1.5cm,
  devis("Organisme A", [1~500 euros], [100 euros par élève]),
  devis("Organisme B", [2~000 euros], [85 euros par élève]),
)

*1.* Déterminer l'organisme qui propose le devis le plus avantageux financièrement pour 24 élèves.

*2.* Dans cette question, on note $x$ le nombre d'élèves inscrits à ce voyage scolaire. \
Le nombre $x$ est un nombre entier compris entre 1 et 110. \
On note $f$ la fonction qui, au nombre d'élèves inscrits, associe le coût en euros du voyage scolaire si la directrice choisit l'organisme A. \
On note $g$ la fonction qui, au nombre d'élèves inscrits, associe le coût en euros du voyage scolaire si la directrice choisit l'organisme B.

#sub[a][Donner les expressions de $f(x)$ et de $g(x)$.]

#sub[b][Résoudre l'équation $f(x) = "4 300"$ et interpréter la solution dans le contexte de l'exercice.]

#sub[c][Déterminer le nombre minimal d'élèves à partir duquel il est plus avantageux financièrement de choisir l'organisme B.]

*3.* La mairie subventionne ce voyage scolaire à hauteur des $frac(2, 5)$ de son coût total. La coopérative scolaire prendra à sa charge 50\u{a0}% du reste du coût total.

Le reste est à la charge des familles.

#sub[a][Déterminer la proportion que représente la part prise en charge par les familles par rapport au coût total. Donner le résultat sous la forme d'une fraction irréductible.]

#sub[b][La directrice inscrit 44 élèves à ce voyage et choisit l'organisme B. \
Calculer le montant par élève financé par la coopérative. Arrondir le résultat à l'euro.]
