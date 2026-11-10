// Sous-question : lettre en gras, indentée sous le numéro
#let sub(lettre, corps) = pad(left: 1.2em)[*#lettre.* #corps]

*1.*

#sub("a", [Le pentagone est régulier : ses cinq côtés ont la même longueur et le point O est à égale distance de ses cinq sommets (c'est le centre du cercle qui passe par A, B, C, D et E). Les cinq triangles OAB, OBC, OCD, ODE et OEA ont donc leurs trois côtés de même longueur deux à deux : ils sont superposables. Leurs angles au centre sont donc tous égaux.

Ces cinq angles remplissent un tour complet autour de O, c'est-à-dire $360°$. Chacun mesure donc
$ hat(D O C) = 360° div 5 = 72°. $])

#sub("b", [Les points C et D sont sur le cercle de centre O, donc $O C = O D$ (ce sont deux rayons du même cercle). Le triangle OCD a deux côtés de même longueur : *il est isocèle en O*.

(Il n'est pas équilatéral, car son angle en O mesure $72°$ et non $60°$.)])

#sub("c", [Dans le triangle isocèle OCD, les deux angles à la base sont égaux. La somme des angles d'un triangle vaut $180°$, donc
$ hat(O C D) = hat(O D C) = (180° - 72°) div 2 = 108° div 2 = 54°. $
Par symétrie, le triangle OBC est lui aussi isocèle en O avec le même angle au centre : $hat(O C B) = 54°$. L'angle $hat(D C B)$ est formé des deux angles $hat(D C O)$ et $hat(O C B)$ :
$ hat(D C B) = 54° + 54° = 108°. $])

#sub("d", [Le pentagone est régulier : ses cinq angles ont la même mesure, $108°$. La somme de ses angles vaut
$ 5 times 108° = 540°. $

(On peut le vérifier en découpant le pentagone en trois triangles : $3 times 180° = 540°$.)])

*2.*

#sub("a", [- Le triangle JKL a deux côtés de même longueur, $J K = K L = 10$ cm, et un angle droit en K : c'est un *triangle rectangle isocèle en K*.
- Le triangle LMN a deux côtés de même longueur, $L M = M N = 10$ cm, et un angle droit en M : c'est un *triangle rectangle isocèle en M*.])

#sub("b", [Dans le triangle JKL, rectangle en K, le côté $[J L]$ est l'hypoténuse (le côté opposé à l'angle droit). D'après le théorème de Pythagore :
$ J L^2 = J K^2 + K L^2 = 10^2 + 10^2 = 100 + 100 = 200. $
Comme $J L$ est une longueur (un nombre positif), $J L = sqrt(200)$ cm.

On fait de même dans le triangle LMN, rectangle en M :
$ L N^2 = L M^2 + M N^2 = 10^2 + 10^2 = 200, $
donc $L N = sqrt(200)$ cm.

On a bien montré que $J L = L N = sqrt(200)$ cm.])
