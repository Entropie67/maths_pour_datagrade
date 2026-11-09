# Ajouter ou corriger des annales

Les annales (DNB, bac, E3C, CRPE…) saisies en LaTeX par l'APMEP sont découpées
exercice par exercice pour être proposées dans MathALÉA. La procédure utilise :

- `decoupageAnnales.py`, dans le dépôt
  <https://forge.apps.education.fr/coopmaths/decoupageAnnales>, qui découpe et
  compile les sujets ;
- `tasks/dicosDnbBacE3c/dicosManage.py`, dans ce dépôt, qui ajoute les
  exercices découpés aux dictionnaires de MathALÉA.

Python 3 et Node.js (la version du projet) sont nécessaires. Sous macOS, installer aussi `poppler` et
`imagemagick` (`brew install poppler imagemagick`).

| Objectif | Étapes |
| --- | --- |
| Ajouter de nouvelles annales | 1, 2, 3, 4 |
| Corriger une annale existante | 1 (depuis le dépôt de la série), 2, 3 |
| Modifier les étiquettes | 5 |

## 1. Récupérer les sources

- **Nouvelles annales** : télécharger sur le site de l'APMEP chaque sujet et
  chaque corrigé séparément (pas le fichier qui les regroupe). S'il existe
  plusieurs corrigés d'un même sujet, n'en garder qu'un.
- **Correction d'une annale** : récupérer le sujet dans le dépôt de la série
  (voir étape 3), dans `Archives/<année>/` ou dans un dossier du type
  `2024-Sources` ou `2024-APMEP`, puis le corriger sans toucher au préambule.

## 2. Découper

Placer les fichiers `.tex` et leurs images dans le dossier
`sujets_corrections_tex` d'un clone local de `decoupageAnnales`, puis, depuis ce
clone :

```sh
python3 decoupageAnnales.py
```

Le script s'arrête à la première erreur et l'explique. Traiter les fichiers
deux par deux (sujet et corrigé) évite de tout relancer après chaque
correction.

### Nom du fichier

Le nom doit indiquer le diplôme, le centre, le mois et l'année, et pour le bac
le numéro de sujet. Le script liste les valeurs acceptées :

- centre et diplôme : choisir une valeur de la liste affichée ;
- mois : en lettres, jamais en chiffres (`02 06` serait ambigu) ;
- sujet de bac : `J1`, `J2`, `sujet1` ou `sujet2`.

### Annexes, images, découpage

- **Annexe** : l'annexe d'un exercice doit être placée juste après cet
  exercice dans le fichier source, sans le mot « annexe », pour être découpée
  avec lui.
- **Image manquante** : la copier dans `sujets_corrections_tex`.
- **Fichier non découpé** : les exercices ne sont pas introduits comme
  d'habitude. Modifier le fichier source, ou ajouter cette introduction à
  `compil.py`.

### Compilation LaTeX

Chaque exercice découpé est compilé avec un préambule commun. Les erreurs les
plus fréquentes sont un paquet ou une commande utilisés par le sujet mais
absents de `preambule/preambule.tex`. Les y ajouter en vérifiant l'effet sur
les autres annales, puis reporter la modification dans
`src/lib/latex/preambuleTex.ts` de MathALÉA, qui ne charge les paquets que si
nécessaire.

Si un exercice découpé ne compile pas, le compiler seul depuis
`exercices_corrections_tex_autonome/`, corriger l'erreur dans le sujet
complet, puis relancer le découpage sur cette seule annale.

## 3. Publier les fichiers découpés

Copier les dossiers produits dans le clone du dépôt de la série :

- <https://forge.apps.education.fr/coopmaths/dnb>
- <https://forge.apps.education.fr/coopmaths/bac>
- <https://forge.apps.education.fr/coopmaths/bac-sti2d>
- <https://forge.apps.education.fr/coopmaths/bac-stl>
- <https://forge.apps.education.fr/coopmaths/e3c>
- <https://forge.apps.education.fr/coopmaths/crpe>

Y placer aussi les sources de `sujets_corrections_tex` dans le dossier
d'archives de l'année. Ces dépôts se modifient directement sur leur branche
principale, sans merge request.

## 4. Enrichir le dictionnaire

Dans un clone local de MathALÉA, copier le dossier de l'année produit à
l'étape 2 dans `tasks/dicosDnbBacE3c/<type>/` (`dnb`, `bac`, `sti2d`…), puis :

```sh
cd tasks/dicosDnbBacE3c
python3 dicosManage.py
```

Choisir le dictionnaire à compléter. Le script ajoute les références absentes
(`dnb_2024_07_metropole_2`…) et ne modifie pas les entrées existantes, ce qui
préserve les étiquettes ajoutées à la main.

Le script complète le fichier `src/json/dictionnaire*.ts` de la série, puis le
reformate avec le Prettier du dépôt. Il s'arrête sans rien modifier si le
fichier ne se termine pas par l'accolade fermante de l'objet exporté.

Supprimer ensuite les sujets copiés dans `tasks/dicosDnbBacE3c` : ils ne
doivent pas être committés dans MathALÉA.

### Déclarer les nouvelles sessions et vérifier la génération

`dicosManage.py` complète aussi `src/json/referentielStaticFRSessions.json`
depuis les métadonnées du dictionnaire sélectionné, y compris celles des
entrées déjà présentes. Depuis l'allègement du référentiel FR, cette table
est nécessaire pour reconstruire les métadonnées des annales. Elle se trouve
dans le dépôt MathALÉA, pas dans les dépôts de fichiers découpés.

Pour chaque nouvelle session d'examen, le script ajoute une entrée dans l'objet
`sessions` de ce fichier. La clé est l'uuid sans son dernier segment : les
exercices `dnb_2026_09_metropole_1`, `dnb_2026_09_metropole_2` et
`dnb_2026_09_metropole_automatismes` partagent ainsi une seule entrée :

```json
"dnb_2026_09_metropole": {
  "annee": "2026",
  "mois": "Septembre",
  "lieu": "Métropole",
  "typeExercice": "dnb"
}
```

Le script reprend exactement les métadonnées du dictionnaire, y compris `jour`
et `filiere` lorsqu'ils sont présents. Il complète les exceptions de
numérotation (`numeroOverrides`) et les métadonnées distinctes d'exercices
partageant une nouvelle clé de session (`entryOverrides`). Les entrées
existantes de la table sont conservées. En cas de conflit, il signale l'uuid
concerné et n'écrit pas la table : vérifier alors le dictionnaire et la table.
FlashBAC n'est pas concerné par le référentiel statique FR.

Une session déjà déclarée ne nécessite pas une nouvelle entrée pour chaque
exercice ajouté. Une correction des fichiers LaTeX ou des étiquettes ne
nécessite pas de modifier cette table. Les ajouts manuels aux dictionnaires
doivent aussi déclarer leurs nouvelles sessions, ou être suivis d'une
exécution de la moulinette sur le dictionnaire concerné.

Depuis la racine de MathALÉA, lancer ensuite `pnpm makeJson` avant de pousser.
Cette commande vérifie la table et génère les référentiels ; elle ne complète
pas automatiquement les sessions manquantes. Committer les modifications du
dictionnaire et de la table ensemble. Pour les exceptions de numérotation ou
de métadonnées, voir la
[procédure détaillée des référentiels](../architecture/menu-exercices.md#allègement-de-referentielstaticfrjson--champs-déduits-de-luuid).

Les tests de la synchronisation utilisent la bibliothèque standard Python :

```sh
python3 -m unittest discover -s tests/python -p 'test_dicos_manage.py'
```

## 5. Modifier les étiquettes

Les étiquettes facilitent la recherche. Modifier la liste `tags` de l'annale
dans le dictionnaire de sa série : `src/json/dictionnaireDNB.ts`,
`src/json/dictionnaireBAC.ts`, `src/json/dictionnaireSTI2D.ts`… Le
commentaire en tête de chaque dictionnaire liste les étiquettes en usage :
les réutiliser plutôt que d'en créer de proches.
