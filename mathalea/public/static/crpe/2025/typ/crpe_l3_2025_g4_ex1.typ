#import "@preview/ctz-euclide:0.3.0": *

// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

// Zone de jeu : quadrilatère AEDC et demi-disque de diamètre [DC] (1 unité = 20 m)
#let zone = ctz-canvas(length: 0.5cm, {
  let (A, E, B) = ((0, 0), (2, 0), (7, 0))
  let (D, C) = ((7, -3.75), (7, -5.25))
  cetz.draw.arc((7, -4.5), start: -90deg, stop: 90deg, radius: 0.75, anchor: "origin", fill: luma(170), stroke: black + 0.6pt)
  cetz.draw.line(A, E, D, C, close: true, fill: luma(170), stroke: black + 0.6pt)
  let tirets = (paint: black, thickness: 0.5pt, dash: "dashed")
  cetz.draw.line(E, B, stroke: tirets)
  cetz.draw.line(B, D, stroke: tirets)
  cetz.draw.line((6.75, 0), (6.75, -0.25), (7, -0.25), stroke: black + 0.5pt)
  ctz-draw-text(-0.3, 0.3, $A$)
  ctz-draw-text(2, 0.35, $E$)
  ctz-draw-text(7.3, 0.3, $B$)
  ctz-draw-text(7.45, -3.4, $D$)
  ctz-draw-text(7.3, -5.6, $C$)
})

#grid(
  columns: (1fr, 4.6cm),
  column-gutter: 0.5cm,
  [
    Les parties A, B et C sont indépendantes.

    Une zone de jeu est modélisée par la partie grisée représentée ci-contre composée du quadrilatère $A E D C$ et du demi-disque de diamètre $[D C]$.

    Le triangle $A B C$ est rectangle en $B$ tel que $A B = 140$ m et $B C = 105$ m. \
    On appelle $D$ le point du segment $[B C]$ tel que $B D = 75$ m. \
    La parallèle à la droite $(A C)$ passant par $D$ coupe la droite $(A B)$ en $E$.
  ],
  align(horizon + right)[#zone],
)

*Partie A : zone de jeu*

*1.* Calculer la longueur du segment $[A C]$ en mètre.

*2.* Démontrer que la longueur du segment $[B E]$ est de 100 m.

*3.*
#sub[a][Calculer l'aire du triangle $A B C$ en m#super[2].]
#sub[b][En déduire l'aire du quadrilatère $A E D C$ en m#super[2].]
#sub[c][Calculer la valeur exacte de l'aire de la zone de jeu et donner la valeur arrondie au m#super[2].]

*Partie B : relais chronométré par équipe*

Une classe de CM2 participe à une course de relais par équipes de quatre élèves : quatre balises W, X, Y et Z sont placées dans la zone de jeu. Toutes les équipes partent du point $B$. La course consiste à réaliser le parcours suivant : le premier élève de l'équipe part du point $B$, rejoint la balise W et revient au point $B$. Il passe alors le relais au deuxième élève de l'équipe, qui rejoint la balise X et revient au point $B$ et ainsi de suite. \
On admet que chaque équipe parcourt la même distance au cours du relais.

*1.* L'équipe 1 a effectué le parcours à la vitesse moyenne de 11~km/h. L'équipe 2 l'a réalisé à une allure de 6~min 10~s par km. Laquelle des deux équipes a été la plus rapide pour finir la course ? Justifier.

*2.* On a recueilli, dans une feuille de calcul, le temps en minutes mis par les équipes pour atteindre chacune des quatre balises à partir du point de départ $B$. Les valeurs des cellules C5 et F5 ont été effacées.

#align(center)[#image("crpe_l3_2025_g4_ex1-tableur.png", width: 14cm)]

#sub[a][L'équipe 2 a été la plus rapide à faire l'aller-retour entre le point $B$ et la balise X. L'étendue des temps pour trouver cette balise est de 2,9 minutes. Calculer le temps mis par l'équipe 4 pour réaliser cet aller-retour.]
#sub[b][Calculer le temps moyen mis par les équipes pour faire l'aller-retour entre le point $B$ et la balise W. Donner la réponse en minute seconde.]
#sub[c][Quelle formule peut être saisie dans la cellule B6 puis recopiée vers la droite pour obtenir la ligne 6 complétée ?]

*Partie C : Étude d'une balise*

#grid(
  columns: (1fr, 5.8cm),
  column-gutter: 0.5cm,
  [
    Un tronc de cône est obtenu en enlevant à un cône sa partie supérieure coupée par un plan.

    Les balises utilisées ont la forme d'un tronc de cône. Elles sont réalisées à partir d'un cône de révolution de sommet $S$, de hauteur $O S = 15$ cm et de base le disque de rayon 10 cm. \
    Ce cône est coupé par un plan parallèle à la base. \
    Ce plan passe par le point $A$ appartenant au segment $[O S]$ tel que $S A = 3$ cm.
  ],
  align(horizon + right)[#image("crpe_l3_2025_g4_ex1-cone.png", width: 5.8cm)],
)

*1.* Calculer le volume exact, en cm#super[3], du cône de sommet $S$, de hauteur $O S$ et de base le disque de rayon $O C$.

On rappelle que : \
Volume d'un cône $= frac(1, 3) times ("aire de la base") times h$ \
où $h$ désigne la hauteur du cône.

*2.* On admet que le cône de sommet $S$ et de hauteur $S A$ est une réduction du cône de sommet $S$ et de hauteur $S O$. Déterminer le coefficient de réduction correspondant.

*3.* Calculer le volume exact du cône de sommet $S$ et de hauteur $S A$ en cm#super[3].

*4.* En déduire le volume exact de la balise en cm#super[3]. Donner sa valeur arrondie au cm#super[3].
