#import "@preview/ctz-euclide:0.3.0": *

Dans le cadre d'un projet « Éducation au Développement Durable », l'équipe pédagogique d'une école conçoit le plan d'un parterre rectangulaire de 8 m de long sur 6 m de large. Au centre de ce parterre est envisagé la réalisation d'un bassin circulaire de 3 m de diamètre. Le reste de la surface du parterre rectangulaire sera ensemencé de fleurs.

#align(center)[
  #ctz-canvas(length: 0.9cm, {
    // Parterre 8 m × 6 m (une unité = 1 m), bassin de diamètre 3 m au centre
    cetz.draw.rect((0, 0), (8, 6), stroke: black + 0.8pt)
    cetz.draw.circle((4, 3), radius: 1.5, stroke: black + 0.8pt)
  })
]

#align(center)[_Le schéma ci-dessus n'est pas à l'échelle._]

*1.* Calculer l'aire totale du parterre rectangulaire, exprimée en m².

*2.* Calculer l'aire, exprimée en m², de la surface à ensemencer. Le résultat sera arrondi au dixième.

*3.* Un sac de graines de fleurs permet de couvrir 15 m². Combien de sacs, au minimum, l'école doit-elle prévoir pour couvrir la partie du parterre à ensemencer ?

*4.* Les enseignants souhaitent représenter ce parterre sur un plan à l'échelle $1 / 50$. Quelles sont les dimensions, en centimètre, du rectangle sur le plan ?
