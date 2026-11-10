+ On passe d'un volume de lessive en cm#super[3] à son poids en grammes en multipliant par 1,5, donc 1 600 cm#super[3] de lessive ont une masse de $1 600 times 1,5 = 2 400$ (g).

  En ajoutant la masse du paquet vide, on arrive à une masse de $2 400 + 200 = 2 600$ (g) ou 2,6 (kg).
+ #enum(
    numbering: "a.",
    [On a vu que le produit par 1,5 fait passer d'un volume de lessive à sa masse ; ensuite l'ajout de 200 correspond au poids du paquet vide ; donc $f(x) = 1,5x + 200$ représente la masse d'un paquet de lessive contenant $x$ cm#super[3] de lessive.],
    [
      #box(width: 9cm, height: 11.5cm, clip: true)[
        #let ox = 0.95cm
        #let oyb = 11.1cm
        #for i in range(0, 11) {
          place(dx: ox + i*0.75cm, dy: oyb - 10.5cm, line(start: (0cm, 0cm), end: (0cm, 10.5cm), stroke: 0.2pt + gray))
        }
        #for j in range(0, 15) {
          place(dx: ox, dy: oyb - j*0.75cm, line(start: (0cm, 0cm), end: (7.5cm, 0cm), stroke: 0.2pt + gray))
        }
        #place(dx: ox, dy: oyb - 10.5cm, line(start: (0cm, 0cm), end: (0cm, 10.5cm), stroke: 1pt))
        #place(dx: ox, dy: oyb, line(start: (0cm, 0cm), end: (7.5cm, 0cm), stroke: 1pt))
        #place(dx: ox, dy: oyb - 0.75cm, line(start: (0cm, 0cm), end: (6.5cm, -9.75cm), stroke: 1pt + red))
        #place(dx: ox, dy: oyb - 8.625cm, line(start: (0cm, 0cm), end: (5.25cm, 0cm), stroke: (paint: black, thickness: 0.5pt, dash: "dashed")))
        #place(dx: ox + 5.25cm, dy: oyb - 8.625cm, line(start: (0cm, 0cm), end: (0cm, 8.625cm), stroke: (paint: black, thickness: 0.5pt, dash: "dashed")))
        #place(dx: ox + 4.9cm, dy: oyb + 0.1cm)[#text(fill: red, size: 7pt)[1 400]]
        #place(dx: 0.05cm, dy: oyb - 8.85cm)[#text(fill: blue, size: 7pt)[2 300]]
        #place(dx: ox + 4.6cm, dy: oyb - 0.35cm)[#text(size: 7pt)[volume de lessive (cm#super[3])]]
        #place(dx: ox + 0.1cm, dy: oyb - 10.35cm)[#text(size: 7pt)[masse de la lessive (g)]]
      ]
    ],
  )
+ #enum(
    numbering: "a.",
    [],
    [Il faut trouver le volume $x$ tel que $f(x) = 1,5x + 200 = 2 300$ soit en ajoutant $-200$ à chaque membre :

    $1,5x = 2 100$ et enfin $x = (2 100) / (1,5) = 1 400$ (g) ou encore 1,4 kg de lessive.],
    [Le volume d'un pavé s'obtient en calculant le produit des trois nombres correspondant à la longueur, la largeur et la hauteur, ici :

    $V = 12 times 8 times 15 = 96 times 15 = 1 440$ (cm#super[3]).

    Comme $1 440 > 1 400$ ce paquet pourra contenir la lessive.],
  )
