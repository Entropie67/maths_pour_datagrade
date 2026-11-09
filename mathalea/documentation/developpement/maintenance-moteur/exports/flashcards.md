# Vue Flash-cards

La vue Flash-cards (`v=flashcards` dans l'URL) génère des cartes à découper — la question au recto, la réponse au verso — compilées dans le navigateur avec [Typst](https://typst.app/docs/), comme la [vue Typst](typst.md). Elle est accessible depuis « Plus d'exports » sur la page d'accueil, et pensée pour les exercices de course aux nombres (une carte par question).

## Principe

1. Les exercices sont chargés et régénérés comme dans la vue Typst (`buildExercisesList`, graines `alea`, `context.isTypst = true`).
2. Chaque question devient une carte : le recto reprend la consigne de l'exercice (s'il en a une) suivie de la question, le verso la correction correspondante. Les exercices purement interactifs (`typeExercice` contenant `html`) sont signalés dans un bandeau et ignorés.
3. `buildFlashcardsDocument` convertit les contenus avec `htmlToTypst` (mêmes helpers que la fiche : figures SVG embarquées, schémas, QCM) et assemble le document : les planches de rectos et de versos alternent, chaque ligne de versos en ordre inverse (miroir horizontal). Imprimé en recto-verso avec retournement sur les bords longs, chaque réponse tombe ainsi au dos de sa question.
4. La grille des cartes remplit la page (`grid` en pistes `1fr`), traits de découpe en pointillés. Un numéro discret au coin de chaque carte (désactivable) permet de réapparier recto et verso après découpe ; il est placé du côté opposé au verso pour rester au même endroit une fois la carte retournée.
5. Un titre optionnel peut être affiché sur chaque recto et/ou chaque verso (ex. le thème du paquet de cartes) : même texte sur toutes les cartes d'une face, réglages d'ancrage/taille/couleur/opacité communs aux deux faces.

## Réglages

En tête du panneau, `shared/ExportViewLinks.svelte` renvoie vers les trois autres
exports Typst ([Impression](typst.md), **J’ai… qui a… ?** et
[Diaporama PDF](diaporama-pdf.md)) en gardant les exercices en place.

Panneau latéral, persisté dans `localStorage` (`mathaleaFlashcardsView`) : format (A4/A5), orientation, cartes par ligne (1 à 4), lignes par page (1 à 6), taille du texte, polices (texte et maths, mêmes listes que la vue Typst), numérotation des cartes, titre recto/verso.

Le titre (texte affiché sur chaque carte) se saisit dans le panneau de réglages (« Titre recto », « Titre verso ») ; l'icône ⚙️ à côté de « Titre des cartes » ouvre une modale de style — point d'ancrage sur la carte (sélecteur graphique à 6 points : coins et milieux des bords haut/bas), taille, couleur et opacité — commune aux deux faces.

Le code Typst généré est éditable (mode « Code », recompilation débouncée) ; changer un réglage régénère le code (avec avertissement si le code a été modifié à la main). Exports : PDF (compilation typst.ts dans le navigateur) et fichier `.typ`.

## Fichiers

| Fichier                                                      | Rôle                                               |
| ------------------------------------------------------------ | -------------------------------------------------- |
| `src/components/setup/flashcards/Flashcards.svelte`          | La vue : barre d'outils, réglages, aperçu, exports |
| `src/components/setup/flashcards/buildFlashcardsDocument.ts` | Génère le code Typst des planches de cartes        |

La conversion HTML/LaTeX → Typst et la compilation sont partagées avec la vue Typst (`src/components/setup/typst/latexToTypst.ts`, `typstCompiler.ts`).

## Tests

- `src/components/setup/flashcards/buildFlashcardsDocument.test.ts` : structure du document généré (planches, miroir des versos, helpers conditionnels).
