_Les deux parties de l'exercice sont indépendantes._

=== Partie A

Une confiserie fabrique des bonbons multicolores au goût réglisse. Ces bonbons de longueur totale 15 mm ont la forme de gélules constituées de trois parties : un cylindre et deux demi-boules identiques de rayon $R = 2,5$ mm comme le montre le schéma ci-dessous.

#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  [
    #ctz-canvas(length: 0.75cm, {
  import cetz.draw: *
  ctz-init()

  let r = 1.4
  let hc = 6   // hauteur (visuelle) de la partie cylindrique

  ctz-def-points(
    Lb: (-r, 0), Rb: (r, 0), Ob: (0, 0),
    Lt: (-r, hc), Rt: (r, hc), Ot: (0, hc),
  )

  // demi-sphère du bas
  ctz-draw-semicircle("Lb", "Rb", above: false, stroke: black + 1.2pt)

  // demi-sphère du haut
  ctz-draw-semicircle("Lt", "Rt", above: true, stroke: black + 1.2pt)

  // côtés du cylindre
  ctz-draw(segment: ("Lb", "Lt"), stroke: black + 1.2pt)
  ctz-draw(segment: ("Rb", "Rt"), stroke: black + 1.2pt)

  // ellipses en pointillés (cercles de jonction, vus en perspective)
  ctz-draw(ellipse: ("Ob", r, 0.35, 0deg),
    stroke: (paint: black, dash: "dashed", thickness: 0.9pt))
  ctz-draw(ellipse: ("Ot", r, 0.35, 0deg),
    stroke: (paint: black, dash: "dashed", thickness: 0.9pt))

  // diamètre pointillé de l'ellipse du haut
  ctz-draw(segment: ("Lt", "Rt"),
    stroke: (paint: black, dash: "dashed", thickness: 0.9pt))

  // rayon 2,5 mm (pointillé, flèche vers le centre)
  line((r, hc), (0, hc), mark: (end: ">"),
    stroke: (paint: black, dash: "dashed", thickness: 0.9pt))
  content((r * 0.4, hc + 0.55), [2,5 mm])

  // croix aux centres
  content((0, 0), text(size: 9pt)[×])
  content((0, hc), text(size: 9pt)[×])

  // flèche double "h" (hauteur du cylindre), à gauche
  let xh = -r - 1.4
  line((xh, hc), (xh, 0), mark: (start: ">", end: ">"), stroke: black + 1pt)
  content((xh - 0.6, hc / 2), [$h$])

  // flèche double "15 mm" (longueur totale), à droite
  let xr = r + 1.4
  line((xr, hc + r), (xr, -r), mark: (start: ">", end: ">"), stroke: black + 1pt)
   content((xr + 1, hc / 2), [15 mm])
})

  ],
  [
    *Rappels*

    - Volume d'un cylindre de rayon $R$ et de hauteur $h$ :

      $ V = pi times R^2 times h $
    - Volume d'une boule de rayon $R$ :

      $ V = 4/3 times pi times R^3 $
    - $1$ L $= 1$ dm#super[3]
  ],
)

+ Montrer que la hauteur $h$ du cylindre est égale à $10$ mm.
+ #enum(
    numbering: "a.",
    [Montrer que le volume de la partie cylindrique d'un bonbon est environ égal à $196$ mm#super[3].],
    [Léa affirme que le volume total d'un bonbon est compris entre $260$ et $262$ mm#super[3].

    A-t-elle raison ?],
  )
+ Pour réaliser ces bonbons, la confiserie fabrique un mélange d'ingrédients qui est chauffé puis versé dans des moules en forme de gélule avant d'être refroidi.

  La confiserie fabrique chaque jour $83$ L de mélange.

  Avec cette quantité de mélange, peut-elle produire plus de $300000$ bonbons par jour ?

=== Partie B

Dans un magasin, les bonbons sont vendus en deux formats possibles :

#table(
  columns: (1fr, 1fr),
  align: center,
  stroke: 0.6pt,
  [*Format A*], [*Format B*],
  [
    Sachet de 500 g de bonbons

    7,90 € le sachet
  ],
  [
    Sachet de 250 g de bonbons

    4,30 € le sachet

    *Offre promotionnelle* : pour 3 sachets achetés, le quatrième est à moitié prix.
  ],
)

Léa veut acheter 1 kg de bonbons.

Quel format doit-elle choisir pour payer le moins cher possible ? *Argumenter la réponse en précisant la démarche.*
