// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

Cet exercice comporte deux parties indépendantes.

On donnera les résultats sous la forme de fraction irréductible.

*Partie A*

Un sac opaque contient trois cartes indiscernables au toucher numérotées 3, 4 et 5.

#align(center)[#image("crpe_l3_2024_g3_ex1-cartes.png", width: 6.4cm)]

*1.* On souhaite former des nombres de trois chiffres à l'aide de ces cartes. L'expérience consiste à tirer successivement trois cartes sans les remettre dans le sac après chaque tirage. Le chiffre des centaines correspond à la première carte tirée, le chiffre des dizaines à la deuxième et le chiffre des unités à la dernière.

#sub("a", [Énoncer tous les résultats possibles lorsque l'on réalise cette expérience.])
#sub("b", [Quelle est la probabilité d'obtenir un nombre pair ?])
#sub("c", [Quelle est la probabilité de ne pas obtenir un multiple de 5 ?])
#sub("d", [Quelle est la probabilité d'obtenir un nombre divisible par 3 ?])

*2.* On souhaite désormais former un nombre à deux chiffres. On tire au hasard une première carte pour obtenir le chiffre des dizaines. On remet cette carte dans le sac et on tire au hasard une seconde carte pour obtenir le chiffre des unités.

#sub("a", [Quelle est la probabilité d'obtenir un nombre dont les deux chiffres sont identiques ?])
#sub("b", [Quelle est la probabilité d'obtenir un multiple de 9 ?])
#sub("c", [Quelle est la probabilité d'obtenir un nombre inférieur ou égal à 40 ?])

*Partie B*

Un sac opaque contient des boules bleues, des boules rouges et des boules jaunes indiscernables au toucher. Il y a deux fois moins de boules jaunes que de boules rouges.

On sait que la proportion des boules rouges dans le sac est de $display(frac(1, 4))$.

On tire une boule au hasard.

*1.* Quelle est la probabilité que la boule tirée soit de couleur jaune ?

*2.* Quelle est la probabilité que la boule tirée soit de couleur bleue ?

*3.* Déterminer la composition du sac sachant qu'il y a 7 boules jaunes.
