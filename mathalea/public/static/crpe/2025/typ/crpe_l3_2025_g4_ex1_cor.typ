// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*Partie A*

*1.* Le triangle $A B C$ est rectangle en $B$. D'après le théorème de Pythagore :
$ A C^2 = A B^2 + B C^2 = 140^2 + 105^2 = "19 600" + "11 025" = "30 625". $
Donc $A C = sqrt("30 625") = 175$ m.

*2.* Dans le triangle $A B C$, le point $E$ est sur la droite $(A B)$, le point $D$ est sur la droite $(B C)$ et les droites $(E D)$ et $(A C)$ sont parallèles. D'après le théorème de Thalès :
$ frac(B E, B A) = frac(B D, B C) = frac(E D, A C). $
On utilise les deux premiers rapports : $frac(B E, 140) = frac(75, 105)$, donc
$ B E = frac(140 times 75, 105) = frac("10 500", 105) = 100 " m". $
On a bien $B E = 100$ m.

*3.* #h(0em)

#sub[a][Le triangle $A B C$ est rectangle en $B$ : son aire est
$ frac(A B times B C, 2) = frac(140 times 105, 2) = "7 350" " m"^2. $]

#sub[b][Le quadrilatère $A E D C$ est le triangle $A B C$ auquel on enlève le triangle $B E D$, rectangle en $B$, avec $B E = 100$ m et $B D = 75$ m :
$ "aire"(B E D) = frac(100 times 75, 2) = "3 750" " m"^2. $
Donc
$ "aire"(A E D C) = "7 350" - "3 750" = "3 600" " m"^2. $]

#sub[c][Le demi-disque a pour diamètre $[D C]$ avec $D C = B C - B D = 105 - 75 = 30$ m, donc pour rayon 15 m. Son aire est
$ frac(pi times 15^2, 2) = frac(225 pi, 2) = "112,5" pi " m"^2. $
L'aire de la zone de jeu est la somme de l'aire du quadrilatère et de celle du demi-disque :
$ "3 600" + "112,5" pi " m"^2 approx "3 953,4" " m"^2. $
La valeur exacte est $"3 600" + "112,5" pi$ m#super[2], soit environ *3 953 m#super[2]*.]

*Partie B*

*1.* Les deux équipes parcourent la même distance : la plus rapide est celle qui met le moins de temps pour parcourir 1 km.

- Équipe 1 : à 11 km/h, elle parcourt 11 km en 60 min, donc 1 km en $frac(60, 11) approx "5,45"$ min. Or $"0,45 min" approx 27 " s"$ : elle met environ 5 min 27 s par km.
- Équipe 2 : elle met 6 min 10 s par km.

Comme 5 min 27 s $<$ 6 min 10 s, l'équipe 1 est la plus rapide.

(Autre méthode : l'équipe 2 parcourt 1 km en $6 times 60 + 10 = 370$ s, soit une vitesse de
$ frac("3 600", 370) approx "9,7" "km/h", $
inférieure à 11 km/h.)

*2.* #h(0em)

#sub[a][Dans la colonne C (balise X), les temps connus sont 5,2 (équipe 1), 3,2 (équipe 2) et 4,5 (équipe 3). L'équipe 2 a le temps le plus court : 3,2 min. L'étendue est la différence entre la plus grande et la plus petite valeur : $"max" - "3,2" = "2,9"$, donc $"max" = "3,2" + "2,9" = "6,1"$.

Le temps de l'équipe 4 est supérieur à ceux des trois autres équipes (le maximum est 6,1, alors que les autres valeurs sont inférieures à 5,2) : l'équipe 4 a mis *6,1 minutes* pour l'aller-retour vers la balise X.]

#sub[b][Dans la colonne B, la moyenne des quatre temps est
$ frac("4,1" + "5,5" + "4,9" + "4,5", 4) = frac(19, 4) = "4,75 min". $
Or $"0,75 min" = "0,75" times 60 " s" = 45 " s"$.

Le temps moyen est de *4 min 45 s*.]

#sub[c][Dans la cellule B6, on calcule la moyenne des valeurs de B2 à B5 :
#align(center)[#raw("=MOYENNE(B2:B5)")]
Puis on recopie vers la droite : en C6, la formule devient #raw("=MOYENNE(C2:C5)"), etc.]

*Partie C*

*1.* Le cône de sommet $S$ a pour base le disque de rayon $O C = 10$ cm, donc d'aire $pi times 10^2 = 100 pi$ cm#super[2], et pour hauteur $O S = 15$ cm :
$ V = frac(1, 3) times 100 pi times 15 = 500 pi " cm"^3. $

*2.* Le petit cône a pour hauteur $S A = 3$ cm et le grand cône a pour hauteur $S O = 15$ cm. Le coefficient de réduction est
$ k = frac(S A, S O) = frac(3, 15) = frac(1, 5). $

*3.* Quand les longueurs sont multipliées par $k$, les volumes sont multipliés par $k^3$. Le volume du petit cône est donc
$ V' = k^3 times V = (frac(1, 5))^3 times 500 pi = frac(500 pi, 125) = 4 pi " cm"^3. $

*4.* La balise est le grand cône privé du petit cône :
$ V_"balise" = 500 pi - 4 pi = 496 pi " cm"^3 approx "1 558,2" " cm"^3. $
Le volume exact de la balise est $496 pi$ cm#super[3], soit environ *1 558 cm#super[3]*.
