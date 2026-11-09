// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

#box(stroke: 0.6pt, inset: 8pt, width: 100%)[
  *_Rappels_*

  Le volume d'un cylindre d'aire de base $B$ et de hauteur $h$ est égal à $B h$.

  Le volume d'une boule de rayon $R$ est égal à $display(frac(4, 3)) pi R^3$.
]

#v(0.2cm)

Le cuisinier d'une cantine confectionne des gâteaux pour les 210 élèves d'une école primaire.

*1.* Le cuisinier prépare la pâte et la place dans un saladier en forme de demi-sphère de diamètre 42~cm. Ce saladier est entièrement rempli.

#sub("a", [Vérifier que l'arrondi à l'unité du volume de pâte en $"cm"^3$ contenu dans le saladier est égal à 19~396~$"cm"^3$.])
#sub("b", [Exprimer ce volume en litre et en donner l'arrondi au dixième.])

*2.* Le cuisinier envisage d'utiliser des moules tous identiques, de forme cylindrique de 3~cm de rayon et de 5~cm de hauteur. Le cuisinier les remplira de pâte aux trois quarts de leur hauteur.

Quel nombre maximal de moules peut-il remplir en utilisant toute la pâte ?

*3.*
#sub("a", [Le cuisinier change d'avis et choisit d'autres moules. Ces moules ont la forme de pavé droit de dimensions 4~cm de largeur, 6~cm de longueur et 5~cm de hauteur.

À quelle hauteur doit-il les remplir pour faire 210 gâteaux identiques en utilisant toute la pâte ? Donner la valeur arrondie au millimètre.])
#sub("b", [Lorsque la pâte cuit, la hauteur du gâteau augmente de 15~%. Quelle sera la hauteur, arrondie au millimètre, de chaque gâteau après cuisson ?])
