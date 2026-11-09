// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*Partie A*

Lors de la construction de sa maison, Claire décide de construire une dalle pour sa terrasse. Cette dalle a la forme d'un prisme droit de hauteur 15~cm dont la vue de dessus est donnée par le schéma ci-dessous.

#grid(
  columns: (1fr, 6.8cm),
  column-gutter: 0.4cm,
  align: (left + horizon, center + horizon),
  [
    $A B C D$ est un rectangle de longueur $D C = 10$~m et de largeur $A D = 5$~m.

    Les points $D$, $C$ et $E$ sont alignés.
  ],
  [#image("crpe_l3_2024_g4_ex4-dalle.png", width: 100%)],
)

*1.* Le volume de la dalle est égal à $"9,825"$~$"m"^3$.

#sub("a", [Justifier que l'aire du polygone $A B E D$ est $"65,5"$~$"m"^2$.])
#sub("b", [En déduire la longueur du segment $[C E]$.])

*2.* Claire se fait livrer 12~$"m"^3$ de béton. Elle coule la dalle de sa terrasse et décide d'utiliser le béton restant pour couler la dalle de sa cabane de jardin. Cette dalle a la forme d'un pavé droit de longueur 5~m et de largeur 3~m. Peut-elle obtenir une dalle dont la hauteur est 15~cm ?

*Partie B*

L'entreprise TOUBETON vend le mètre cube de béton au prix de 130~€ HT (_Hors Taxe_). Elle facture 58~€ les frais de livraison par camion-toupie. Un camion-toupie a une contenance maximale de 7~$"m"^3$.

Afin d'établir les factures, l'entreprise utilise la feuille de calcul d'un tableur ci-dessous.

#align(center)[#image("crpe_l3_2024_g4_ex4-tableur.png", width: 13cm)]

*1.* Le taux de la TVA sur le béton est de 20~%. Déterminer une formule à saisir en `C2` pour obtenir le prix TTC qui s'actualise automatiquement en cas de changement du prix HT.

_On rappelle que le prix TTC s'obtient en ajoutant le montant de la TVA au prix HT._

*2.* Déterminer une formule saisie dans la cellule `E2` puis recopiée vers le bas pour obtenir le tableau complété par le prix total.

*3.* Pour une livraison de 3~$"m"^3$ de béton, que représentent, en pourcentage, les frais de livraison par rapport au prix total ? Donner l'arrondi à l'unité.

*4.* On rappelle que la contenance maximale du camion-toupie transportant le béton est de 7~$"m"^3$. Quel sera le prix total payé par Claire pour se faire livrer les 12~$"m"^3$ de béton ?

*Partie C*

_Dans cette partie, les pourcentages seront arrondis à l'unité si nécessaire._

*1.* Pour terminer ses travaux de maçonnerie, Claire achète un mélange composé de 120~kg de sable et de 180~kg de gravier. Quelle est la proportion de sable dans ce mélange ? Exprimer le résultat en pourcentage.

*2.* La granulosité souhaitée par Claire impose 55~% de sable dans le mélange. Quelle quantité de sable doit-elle ajouter ?

*3.* Pour obtenir un béton de qualité, il est conseillé d'ajouter 250~kg de ciment par tonne de mélange (sable et gravier). Le ciment est vendu par sacs de 35~kg, au prix de 7,75~€ le sac. Quel sera le prix payé par Claire pour son ciment ?
