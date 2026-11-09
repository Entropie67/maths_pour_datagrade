#import "@preview/ctz-euclide:0.3.0": *

Pour chacune des affirmations suivantes, dire si elle est vraie ou fausse en justifiant la réponse.

*Affirmation 1 :* $display(22/25)$ est un nombre décimal.

*Affirmation 2 :* Le prix d'un pull a subi une augmentation de 50 % puis une baisse de 40 %, il a donc subi une augmentation de 10 %.

*Affirmation 3 :* Le nombre de dizaines de $6727$ est $112$ fois plus grand que son nombre de milliers.

*Affirmation 4 :* Ajouter $13$ dixièmes à $"25,606"$ donne $"25,736"$.

*Affirmation 5 :* Il existe au moins un nombre entier vérifiant les critères suivants :
- Le chiffre de ses unités est supérieur ou égal à 4 ;
- Son chiffre des dizaines est supérieur ou égal à 3 ;
- Le produit de ces deux chiffres est égal au nombre de centaines.

*Affirmation 6 :* Le triangle $A B C$ représenté schématiquement ci-dessous n'est pas rectangle.

#align(center)[
  #ctz-canvas(length: 1cm, {
    // Triangle schématique (non à l'échelle) : B à l'origine, angle en B non droit
    let B = (0, 0)
    let A = (2.9, 0.65)
    let C = (0.6, -1.4)
    cetz.draw.line(B, A, stroke: black + 0.8pt)
    cetz.draw.line(B, C, stroke: black + 0.8pt)
    cetz.draw.line(A, C, stroke: black + 0.8pt)
    ctz-draw-text(3.15, 0.85, $A$)
    ctz-draw-text(-0.25, 0.1, $B$)
    ctz-draw-text(0.35, -1.75, $C$)
    ctz-draw-text(1.45, 0.8, [24 cm])
    ctz-draw-text(-0.35, -0.7, [18 cm])
    ctz-draw-text(2.1, -0.75, [30 cm])
  })
]
