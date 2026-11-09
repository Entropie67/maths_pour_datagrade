// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

Pour consolider l'addition de deux nombres entiers en début de cycle 2, un enseignant propose à des élèves d'une classe de CP d'utiliser des dés.

*Partie A*

Les dés utilisés par les élèves sont assimilés à des cubes de côté 19~mm dont les faces sont numérotées de 1 à 6. Ils sont conçus de telle sorte que la somme des nombres indiqués sur deux faces opposées est égale à 7.

Construire un agrandissement de coefficient 2 d'un patron d'un tel dé en attribuant un numéro à chacune des faces.

*Partie B*

Le jeu consiste à lancer deux dés et à additionner les nombres obtenus sur les faces supérieures. On considère que ces deux dés sont équilibrés.

*1.* Donner tous les résultats possibles de cette expérience aléatoire.

*2.* Déterminer la probabilité de l'événement : « La somme obtenue est égale à 4 ».

*3.*
#sub("a", [Quelle somme a la plus grande probabilité d'apparaître ?])
#sub("b", [Quelle est cette probabilité ?])

*Partie C*

Plus tard dans l'année, l'enseignant utilise une variante du jeu pour faire calculer des différences. Le jeu consiste désormais à lancer deux dés et à déterminer l'écart entre les deux nombres obtenus sur les faces supérieures, c'est-à-dire la différence entre le plus grand et le plus petit de ces deux nombres.

Dans le contexte de cette variante du jeu, proposer un exemple d'événement dont la probabilité est égale à $display(frac(1, 6))$.
