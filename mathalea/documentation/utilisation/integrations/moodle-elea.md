# Utilisation avec Moodle/ELEA

MathALÉA peut être intégré dans Moodle/ELEA principalement avec deux formats.

## Gift

L'export Gift permet d'importer des questions dans un test Moodle. Il convient lorsque l'objectif est d'utiliser le moteur de quiz Moodle.

Deux variantes sont proposées dans l'onglet Gift du bouton Moodle.

### Gift (Quiz)

Chaque exercice sélectionné devient une question du test. La note de la question est la proportion de bonnes réponses de l'exercice.

### Gift (Course aux nombres)

Tous les exercices sélectionnés sont réunis dans **une seule** question du test, présentée sous la forme d'une Course aux nombres chronométrée. La note de la question est le total des points obtenus rapporté au nombre de questions de la course.

Réglages disponibles dans l'onglet : titre et sous-titre affichés à l'élève, durée en minutes (ou course sans chronomètre), accès aux corrections à la fin de la course, et type d'aléatoire.

Une fois le test terminé, la copie de l'élève est réaffichée avec les corrections, les réponses données et le temps mis.

Deux limites tiennent au fonctionnement de Moodle :

- Moodle n'accepte qu'un jeu figé de notes partielles (100 %, 90 %, 83,33 %, 80 %, 75 %…). Le score de la course est arrondi à la valeur la plus proche : pour un nombre de questions qui ne tombe pas sur cette liste (7 questions par exemple), la note est approchée.
- La course est chronométrée par la page de l'élève, pas par Moodle : le temps mis est enregistré avec la copie, mais quitter la page en cours de course revient à la recommencer.

## Marque-page magique

Le marque-page magique, disponible dans l'onglet du même nom du bouton Moodle,
permet d'ajouter directement les exercices sélectionnés dans un test Moodle/ELEA,
dans leur ordre de sélection. Chaque exercice devient une question dont le nom
dans la banque contient sa référence et son titre.

Dans Moodle, ouvrir le sélecteur « Ajouter une question », puis activer le
marque-page. Le menu « Type d'aléatoire » propose deux modes :

- Par défaut, l'énoncé change à chaque nouvelle tentative du test et diffère pour
  chaque élève. Il reste identique lors d'une actualisation de la page pendant la
  tentative.
- L'énoncé change à chaque actualisation de la page, comme dans l'ancien
  marque-page.

Sélectionner les exercices, puis appuyer sur « Ajouter ». Les questions sont
ajoutées à la fin du test. Le réglage d'aléatoire s'applique à toutes les questions
de cet ajout. Le marque-page permet aussi de créer une activité Scorm depuis le
sélecteur d'ajout d'activité.

## Scorm

L'export Scorm permet d'ajouter une activité MathALÉA complète dans un cours Moodle.

Procédure générale :

1. Sélectionner les exercices dans MathALÉA.
2. Utiliser le bouton Moodle.
3. Choisir l'onglet d'export Scorm.
4. Télécharger le fichier.
5. Créer une activité Scorm dans Moodle ou déposer le fichier dans le cours en mode édition.

Comme pour le Gift, deux vues sont proposées :

- Vue classique : chaque exercice sélectionné devient un élément de l'activité. L'option « Afficher le titre » permet de masquer le titre et la référence des exercices.
- Vue Course aux nombres : tous les exercices sont réunis dans un seul élément, présenté sous la forme d'une Course aux nombres, avec les mêmes réglages que le Gift (titre, sous-titre, durée ou course sans chronomètre, accès aux corrections).

L'aléatoire se règle dans les deux vues : soit l'énoncé change à chaque nouvelle tentative et diffère d'un élève à l'autre, soit tous les élèves ont l'énoncé actuel.

Point de réglage important : dans l'activité Scorm, vérifier la méthode d'évaluation dans la section des notes. Pour plusieurs exercices, la note moyenne ou totale doit correspondre à l'usage attendu.

## Plein écran

Dans les deux formats, l'exercice s'affiche dans un cadre inséré dans la page de Moodle, souvent étroit sur téléphone. Un bouton plein écran est proposé à l'élève à côté des boutons de zoom (vue élève) ou du bouton de mode sombre (vue Course aux nombres). Un nouvel appui sur ce bouton, ou la touche <kbd>Échap</kbd>, revient à l'affichage normal.

Selon la configuration de Moodle et du navigateur, le plein écran est soit celui du navigateur, soit un agrandissement à la taille de la fenêtre. Les réponses déjà saisies sont conservées dans les deux cas.

## Choisir le format

- Gift (Quiz) : intégration dans un test Moodle, une question par exercice.
- Gift (Course aux nombres) : une seule question de test, course chronométrée sur tous les exercices.
- Scorm : activité complète, suivi des tentatives et rapports Scorm, en vue classique ou Course aux nombres.

Les apps (comme « Défi tables ») remontent leur meilleur score à Moodle, mais pas le détail de la partie : seule la note est conservée.
