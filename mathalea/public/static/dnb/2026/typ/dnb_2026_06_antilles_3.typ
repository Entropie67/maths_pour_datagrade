Un centre de loisirs organise pour les jeunes d'une commune des activités pendant les vacances.

Pour s'inscrire dans ce centre de loisirs, plusieurs tarifs sont proposés :
- Tarif A : on paie 5,50 € par demi-journée passée dans le centre de loisirs ;
- Tarif B : on paie un abonnement annuel de 15 € puis 3,50 € pour chaque demi-journée passée dans le centre ;
- Tarif C : on paie un forfait annuel de 64 € donnant accès à autant de demi-journées que l'on veut.

+ Quel est le prix pour 12 demi-journées avec le tarif B ?
+ On désigne par $x$ le nombre de demi-journées passées dans le centre de loisirs.

  On considère les trois fonctions $f$, $g$, et $h$ suivantes :

  $ f : x |-> 15 + 3,5 x #h(1.5em) g : x |-> 64 #h(1.5em) h : x |-> 5,5 x $

  Sans justifier, associer chacune de ces fonctions au tarif qu'elle représente.
+ Le graphique ci-dessous représente les fonctions $f$, $g$, et $h$.

  Sans justifier, associer à chaque représentation graphique $(d_1)$, $(d_2)$ et $(d_3)$ la fonction $f$, $g$ ou $h$ correspondante.

  #align(center)[
    #let sx(x) = x * 1cm
    #let sy(y) = (84 - y) * 0.11cm
    #box(width: 11.6cm, height: 10cm)[
      #for i in range(0, 12) [
        #place(dx: sx(i), dy: 0cm, line(start: (0cm, 0cm), end: (0cm, sy(0)), stroke: 0.3pt + gray))
      ]
      #for j in range(0, 9) [
        #place(dx: 0cm, dy: sy(j * 10), line(start: (0cm, 0cm), end: (sx(11.4), 0cm), stroke: 0.3pt + gray))
      ]
      #place(dx: 0cm, dy: 0cm, line(start: (sx(0), sy(0)), end: (sx(11.4), sy(0)), stroke: 1pt))
      #place(dx: 0cm, dy: 0cm, line(start: (sx(0), sy(0)), end: (sx(0), sy(84)), stroke: 1pt))
      #for i in range(1, 12) [
        #place(dx: sx(i) - 0.1cm, dy: sy(0) + 0.1cm)[#text(size: 7pt)[#i]]
      ]
      #for j in range(1, 9) [
        #place(dx: sx(0) - 0.75cm, dy: sy(j * 10) - 0.15cm)[#text(size: 7pt)[#(j * 10)]]
      ]
      #place(dx: 0cm, dy: 0cm, line(start: (sx(0), sy(15)), end: (sx(11.4), sy(54.9)), stroke: 1pt + red))
      #place(dx: 0cm, dy: 0cm, line(start: (sx(0), sy(64)), end: (sx(11.4), sy(64)), stroke: 1pt + teal))
      #place(dx: 0cm, dy: 0cm, line(start: (sx(0), sy(0)), end: (sx(11.4), sy(62.7)), stroke: 1pt + blue))
      #place(dx: sx(4.6) - 0.2cm, dy: sy(30.96) - 0.4cm)[#text(fill: red, size: 8pt)[$(d_1)$]]
      #place(dx: sx(4.6) - 0.2cm, dy: sy(64) - 0.4cm)[#text(fill: teal, size: 8pt)[$(d_2)$]]
      #place(dx: sx(4.6) - 0.2cm, dy: sy(25.08) + 0.15cm)[#text(fill: blue, size: 8pt)[$(d_3)$]]
      #place(dx: sx(0) + 0.15cm, dy: sy(84) - 0.1cm)[#text(size: 8pt)[Prix en €]]
      #place(dx: sx(11.4) - 2.7cm, dy: sy(0) + 0.5cm)[#text(size: 7pt)[Nombre de demi-journées]]
    ]
  ]
+ La droite $(d_1)$ représente-t-elle une situation de proportionnalité ?

  _Détailler la réponse en précisant la démarche._
+ Lire graphiquement le nombre de demi-journées à partir duquel le tarif B devient plus avantageux que le tarif A. Aucune justification n'est demandée.
+ On a réalisé dans un tableur le tableau de valeurs correspondant au tarif B suivant le nombre de demi-journées de présence.

  #table(
    columns: (0.6cm, 4.2cm) + (0.65cm,) * 16,
    align: center,
    stroke: 0.6pt,
    inset: 3pt,
    text(size: 7pt)[], text(size: 7pt)[A], text(size: 7pt)[B], text(size: 7pt)[C], text(size: 7pt)[D], text(size: 7pt)[E], text(size: 7pt)[F], text(size: 7pt)[G], text(size: 7pt)[H], text(size: 7pt)[I], text(size: 7pt)[J], text(size: 7pt)[K], text(size: 7pt)[L], text(size: 7pt)[M], text(size: 7pt)[N], text(size: 7pt)[O], text(size: 7pt)[P], text(size: 7pt)[Q],
    text(size: 7pt)[1], text(size: 7pt)[Nombre de demi-journées d'activités], text(size: 7pt)[1], text(size: 7pt)[2], text(size: 7pt)[3], text(size: 7pt)[4], text(size: 7pt)[5], text(size: 7pt)[6], text(size: 7pt)[7], text(size: 7pt)[8], text(size: 7pt)[9], text(size: 7pt)[10], text(size: 7pt)[11], text(size: 7pt)[12], text(size: 7pt)[13], text(size: 7pt)[14], text(size: 7pt)[15], text(size: 7pt)[16],
    text(size: 7pt)[2], text(size: 7pt)[Tarif B en €], text(size: 7pt)[18,5], text(size: 7pt)[22], text(size: 7pt)[25,5], text(size: 7pt)[29], text(size: 7pt)[32,5], text(size: 7pt)[36], text(size: 7pt)[39,5], text(size: 7pt)[43], text(size: 7pt)[46,5], text(size: 7pt)[50], text(size: 7pt)[53,5], text(size: 7pt)[57], text(size: 7pt)[60,5], text(size: 7pt)[64], text(size: 7pt)[67,5], text(size: 7pt)[71],
  )

  #enum(
    numbering: "a.",
    [Parmi les trois formules proposées ci-dessous, recopier celle qui a été saisie dans la cellule *B2*, puis étirée vers la droite pour compléter le tableau.

    #table(
      columns: 3,
      align: center,
      stroke: 0.6pt,
      [=15+3,5#sym.ast.op$x$], [=15+3,5#sym.ast.op\1], [=15+3,5#sym.ast.op\B1],
    )],
    [En utilisant le tableau de valeurs ci-dessus, déterminer le nombre de demi-journées à partir duquel le tarif C devient plus avantageux que le tarif B. Aucune justification n'est demandée.],
  )
