// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

Claire, éleveuse et productrice de lait fabrique et commercialise du beurre. Elle utilise 8~L de lait pour fabriquer 1~L de crème fraiche. Pour produire 1~kg de beurre, 3~L de cette crème sont nécessaires. L'éleveuse possède 248 vaches. Chaque vache fournit en moyenne 30~L de lait chaque jour.

*1.* La transformation du lait en crème entraîne une réduction du volume. Montrer que cette réduction est de 87,5\u{a0}%.

*2.* Déterminer la masse de beurre, en kilogrammes, que peut espérer fabriquer Claire chaque jour, si elle utilise la totalité du lait produit par ses vaches.

*3.* Claire décide de vendre son beurre en plaquette de 250~g. Chaque plaquette a une forme pouvant être assimilée à un pavé droit dont les dimensions sont 10~cm de longueur, 6,5~cm de largeur et 3,5~cm de hauteur.

#sub[a][Déterminer le volume d'une plaquette de beurre. On exprimera le résultat en cm#super[3].]

#sub[b][On donne la formule permettant de calculer la masse volumique $rho$ du beurre, $rho = display(frac(m, V))$ avec $m$ la masse du beurre et $V$ son volume. \
La masse volumique du lait est de 1,03~kg/L. \
Comparer la masse volumique du beurre avec celle du lait.]

*4.* Pour emballer chaque plaquette de beurre, Claire utilise une feuille rectangulaire de papier alimentaire de dimensions 23~cm et 20~cm.

#sub[a][Montrer qu'il est possible d'emballer une plaquette de beurre dans le papier alimentaire choisi par Claire. Une réponse sous la forme d'un schéma sera acceptée.]

#sub[b][On note $A$ l'aire totale de la surface du pavé droit représentant la plaquette de beurre. Calculer $A$ en cm#super[2].]

#sub[c][Claire pense que l'aire $A$ représente au moins 60\u{a0}% de l'aire de la feuille de papier alimentaire. A-t-elle raison ?]

#grid(
  columns: (1fr, 6.2cm),
  column-gutter: 0.5cm,
  [*5.* Claire fixe le prix du beurre à 2,5~€ la plaquette. Afin de tenir la comptabilité de ses ventes mensuelles de plaquettes de beurre, elle utilise la feuille de calcul ci-contre.],
  align(horizon + right)[#image("crpe_l3_2025_g2_ex2-tableur.png", width: 6.2cm)],
)

#sub[a][Proposer une formule qui peut être saisie dans la cellule B9 pour obtenir le nombre total de plaquettes de beurre vendues en mars 2025. Aucune justification n'est attendue.]

#sub[b][Proposer une formule qui peut être saisie dans la cellule C3 puis recopiée vers le bas pour compléter la colonne C. Aucune justification n'est attendue.]
