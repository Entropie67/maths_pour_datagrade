# Exporter des cartes vers Mémotest

La vue **Flash-cards** de MathALÉA permet d'exporter les questions et leurs
corrections dans le format JSON attendu par Mémotest.

1. Sélectionner et paramétrer les exercices dans MathALÉA.
2. Ouvrir **Plus d'exports**, puis **Flash-cards**.
3. Vérifier les cartes générées.
4. Cliquer sur **Exporter vers Mémotest**.
5. Dans Mémotest, choisir une ressource de type **Flashcards** et utiliser le
   contenu du fichier JSON téléchargé.

Une carte est créée pour chaque question : l'énoncé et la consigne sont placés
au recto, tandis que la correction correspondante est placée au verso. Les
formules restent en LaTeX dans le fichier ; leur affichage est pris en charge
par MathJax dans Mémotest.

Chaque recto porte également la mention « Généré par Mathaléa », en tout petit,
en italique et dans l'orange MathALÉA.

Les champs `questionSpeech` et `answerSpeech` contiennent une version en texte
brut du recto et du verso pour la synthèse vocale, sans la signature du recto.
Les formules courantes (opérations, fractions, racines et puissances) sont
converties en mots français. Les images utilisent leur description lorsqu'elle
existe ; sinon, une mention invite à consulter l'illustration visuellement.
Les commandes LaTeX non prises en charge sont remplacées par une invitation à
consulter la formule visuellement. Cette lecture ne constitue donc pas une
description complète de tous les exercices, notamment des figures géométriques.

Les exercices exclusivement interactifs ne sont pas exportés. MathALÉA affiche
un avertissement lorsqu'un exercice sélectionné n'est pas compatible avec la
vue Flash-cards.
