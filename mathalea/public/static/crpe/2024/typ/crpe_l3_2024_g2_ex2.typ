// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*Partie A*

#grid(
  columns: (1fr, 7.4cm),
  column-gutter: 0.4cm,
  align: (left + horizon, center + horizon),
  [
    Sur le schéma ci-contre, le triangle $P R C$ rectangle en $R$ représente une cour d'école.

    Les points $P$, $A$ et $R$ sont alignés. Les points $P$, $S$ et $C$ sont alignés.

    $P A = 28$~m, $A R = 10$~m, $P S = 35$~m.

    Il est prévu d'aménager sur cette cour :
    - une zone naturelle engazonnée représentée par le triangle $P A S$ rectangle en $A$ ;
    - une zone bétonnée représentée par la partie $R A S C$.

    *1.* Tracer le plan de la cour d'école en choisissant comme échelle 1~cm pour 5~m. Justifier les dimensions utilisées et laisser les traits de construction apparents.

    *2.* Montrer que $A S = 21$~m.

    *3.* Calculer $R C$.

    *4.* Vérifier que l'aire du quadrilatère $R A S C$ est égale à 247,5~$"m"^2$.
  ],
  [#image("crpe_l3_2024_g2_ex2-schema.png", width: 100%)],
)

*Partie B*

La commune souhaite recouvrir la zone bétonnée d'un revêtement en résine. La résine choisie est uniquement vendue en pots. Chaque pot permet de recouvrir 56~$"m"^2$. La commune prévoit d'appliquer deux couches de résine.

*1.* Calculer le nombre de pots nécessaires pour recouvrir la zone bétonnée.

*2.* La commune peut choisir parmi les propositions de deux fournisseurs de résine.

#align(center)[
  #table(
    columns: (1fr, 1fr),
    align: (left + horizon, left + horizon),
    inset: 6pt,
    stroke: 0.5pt,
    [*Fournisseur A*], [*Fournisseur B*],
    [Ce fournisseur facture la résine et la pose de la résine à 215,75~€ le pot de résine.],
    [Chaque pot de résine est vendu 138,50~€. Les frais de pose pour l'ensemble de la commande s'élèvent à 600~€.],
  )
]

#sub("a", [Soit $f$ la fonction qui au nombre $n$ de pots de résine achetés auprès du fournisseur A associe le prix total à payer en euros. Donner l'expression de $f(n)$.])
#sub("b", [Soit $g$ la fonction qui au nombre $n$ de pots de résine achetés auprès du fournisseur B associe le prix total à payer en euros. Donner l'expression de $g(n)$.])

*3.*
#sub("a", [En exploitant le graphique ci-dessous, déterminer le fournisseur le plus intéressant pour la commune ainsi que le coût approximatif correspondant. Expliquer votre démarche.

#align(center)[#image("crpe_l3_2024_g2_ex2-graphique.png", width: 13.5cm)]])
#sub("b", [Calculer le coût exact de ces travaux avec le fournisseur retenu.])

*Partie C*

En prévision d'une éventuelle extension de la zone bétonnée, un troisième fournisseur est sollicité.

#align(center)[
  #table(
    columns: (1fr,),
    align: left + horizon,
    inset: 6pt,
    stroke: 0.5pt,
    [*Fournisseur C*],
    [Chaque pot de résine est vendu 104,65~€. Les frais de pose pour l'ensemble de la commande s'élèvent à 995,75~€.],
  )
]

Pour comparer les propositions des fournisseurs B et C selon le nombre de pots utilisés, la commune exploite la feuille de calcul ci-après :

#align(center)[
  #image("crpe_l3_2024_g2_ex2-tableur.png", width: 7.8cm)

  _Les coûts sont exprimés en euro._
]

*1.* Quelle formule a été saisie en cellule C2 puis étirée pour compléter la colonne C ?

*2.* À l'aide du tableau, déterminer à partir de combien de pots le fournisseur C semble être plus intéressant que le fournisseur B.

*3.* Écrire et résoudre une inéquation qui permet de retrouver ce résultat.
