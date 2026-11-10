*Dans cet exercice, les parties A et B sont indépendantes.*

=== Partie A

#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  [
    On a tracé ci-contre la courbe représentative de la fonction qui donne le volume d'une boule en cm#super[3] en fonction de son rayon en cm.

    + Déterminer graphiquement l'image de 3,6 par cette fonction.
    + Le volume d'une boule est égal à 660 cm#super[3].

      Lire graphiquement son rayon.
  ],
  [
    #box(width: 9.5cm, height: 8.3cm)[
      #for r in range(1, 9) {
        place(line(start: (1.2cm + r * 1cm, 0.5cm), end: (1.2cm + r * 1cm, 7.5cm), stroke: 0.3pt + gray))
      }
      #for v in range(100, 801, step: 100) {
        place(line(start: (1.2cm, 7.5cm - 0.008139535 * v * 1cm), end: (9.2cm, 7.5cm - 0.008139535 * v * 1cm), stroke: 0.3pt + gray))
      }

      #place(line(start: (1.2cm, 7.5cm), end: (9.4cm, 7.5cm), stroke: 1pt))
      #place(line(start: (1.2cm, 7.5cm), end: (1.2cm, 0.3cm), stroke: 1pt))

      #let pts = ((0, 0), (0.5, 0.524), (1.0, 4.189), (1.5, 14.137), (2.0, 33.510), (2.5, 65.450), (3.0, 113.097), (3.5, 179.594), (4.0, 268.083), (4.5, 381.704), (5.0, 523.599), (5.5, 696.910), (5.9, 860))
      #for i in range(pts.len() - 1) {
        let p1 = pts.at(i)
        let p2 = pts.at(i + 1)
        place(line(
          start: (1.2cm + p1.at(0) * 1cm, 7.5cm - 0.008139535 * p1.at(1) * 1cm),
          end: (1.2cm + p2.at(0) * 1cm, 7.5cm - 0.008139535 * p2.at(1) * 1cm),
          stroke: 1.2pt + red,
        ))
      }

      #for r in range(1, 9) {
        place(dx: 1.2cm + r * 1cm - 0.1cm, dy: 7.6cm)[#text(size: 7pt)[#r]]
      }
      #for v in range(100, 801, step: 100) {
        place(dx: 0.05cm, dy: 7.5cm - 0.008139535 * v * 1cm - 0.12cm)[#text(size: 6.5pt)[#v]]
      }
      #place(dx: 0.9cm, dy: 7.55cm)[#text(size: 7pt)[0]]
      #place(dx: 6.7cm, dy: 7.9cm)[#text(size: 7.5pt)[Rayon en cm]]
      #place(dx: 1.4cm, dy: 0.25cm)[#text(size: 7.5pt)[Volume en cm#super[3]]]
    ]
  ],
)

=== Partie B

On souhaite fabriquer avec une imprimante 3D, des boules pleines en plastique, de rayon de $2,5$ cm.

+ Montrer que le volume d'une boule, arrondi à l'unité, est égal à $65$ cm#super[3].

  _On rappelle que le volume $V$ d'une boule de rayon $R$ est donné par la formule :_

  $ V = 4/3 times pi times R^3 $
+ Pour utiliser cette imprimante, on dispose d'une bobine de $1000$ cm#super[3] de plastique.

  Combien de boules peut-on fabriquer au maximum ?
+ Sachant que la masse volumique de ce plastique est égale à $0,9$ g/cm#super[3], calculer la masse d'une boule.
