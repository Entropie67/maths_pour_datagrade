# Partager son travail avec Git

Cette page va de la création d'une branche à la demande de fusion (merge
request) sur la forge, puis couvre les situations Git les plus fréquentes.
Elle prolonge [Démarrer dans le dépôt](demarrage.md).

Toutes ces opérations peuvent aussi se faire depuis l'onglet « Contrôle de code
source » de VSCode ou une interface graphique : les deux approches se mélangent
sans problème. Les commandes ont l'avantage d'afficher des messages précis, ce
qui facilite l'entraide.

## Vocabulaire

- **`main`** : la branche principale, protégée. Personne n'y pousse
  directement.
- **branche** : une copie de travail isolée, créée à partir de `main`.
- **commit** : un enregistrement des modifications, avec un message.
- **push** : l'envoi de ses commits sur la forge.
- **pull** : la récupération des commits des autres.
- **merge request** (MR) : la demande d'intégrer sa branche dans `main`, relue
  par un autre membre.

Pour obtenir des droits d'écriture sur le dépôt, créer un compte sur
<https://forge.apps.education.fr/> et le communiquer à
<contact@coopmaths.fr>.

## Le cycle complet

### 1. Partir d'un `main` à jour

```sh
git switch main
git pull
pnpm install
```

`pnpm install` installe les éventuelles nouvelles dépendances.

### 2. Créer sa branche

Nommer la branche `Prenom-Reference-Precision` :

```sh
git switch -c Camille-5P12-Ratios
```

### 3. Enregistrer son travail

```sh
git status
git add src/exercices/5e/5P12.ts
git commit -m "ex: Ajout de 5P12 (ratios)"
```

`git add` est nécessaire pour un nouveau fichier ; `git commit -am "…"` suffit
ensuite pour les fichiers déjà suivis. Faire un commit à chaque étape
cohérente.

Le message commence de préférence par un préfixe suivi de deux-points :

| Préfixe  | Usage                                      |
| -------- | ------------------------------------------ |
| `ex:`    | ajout d'un exercice                        |
| `fix:`   | correction d'un bug                        |
| `feat:`  | nouvelle fonctionnalité                    |
| `chore:` | modification du moteur ou de l'outillage   |
| `docs:`  | documentation                              |
| `style:` | amélioration visuelle ou typographique     |
| `perf:`  | performances                               |

Quand le commit porte sur un ou plusieurs exercices, placer leurs références
entre parenthèses après le préfixe : `fix(6M2B): …`,
`feat(3A11, 3A10-3): …`. Le scope peut aussi être une fonction partagée
(`fix(estDansIntervalle): …`) ou un ensemble d'exercices (`fix(annales 1A-A01): …`).

Avant le commit, lancer les vérifications décrites dans
[Valider un exercice](valider-un-exercice.md).

### 4. Envoyer sa branche

```sh
git push -u origin Camille-5P12-Ratios
```

Les `git push` suivants n'ont plus besoin d'arguments. Git affiche un lien pour
créer la merge request.

### 5. Ouvrir la merge request

Sur la forge, créer une merge request de sa branche vers `main`. Décrire ce qui
change et comment le vérifier. La CI lance les tests
([Tests et CI](../../tests/README.md)) ; un relecteur fusionne la branche quand
tout est vert.

Une fois la branche fusionnée, elle peut être supprimée en local :

```sh
git switch main
git pull
git branch -d Camille-5P12-Ratios
```

## Situations fréquentes

### Mettre sa branche à jour avec `main`

```sh
git switch main
git pull
git switch ma-branche
git merge main
```

S'il y a un conflit, voir [Résoudre un conflit](#résoudre-un-conflit).

### Quelqu'un a poussé sur ma branche

```sh
git pull
```

Si Git indique qu'aucune branche distante n'est suivie :
`git pull origin ma-branche`.

### Changer de branche sans être prêt à committer

Git refuse de changer de branche si des modifications non enregistrées seraient
écrasées. Soit on les committe, soit on les met de côté :

```sh
git stash push -m "travail en cours"
git switch autre-branche
# …
git switch ma-branche
git stash pop
```

`git stash list` affiche les modifications mises de côté.

### J'ai committé sur `main` par erreur

```sh
git switch -c nouvelle-branche   # garde les commits sur une nouvelle branche
git switch main
git reset --hard origin/main     # remet main dans l'état de la forge
```

`git reset --hard` efface les modifications non committées : vérifier
`git status` avant.

### Retrouver une branche supprimée

```sh
git reflog
git switch -c branche-retrouvee <sha>
```

`git reflog` liste les positions successives du dépôt ; choisir le `sha` qui
précède la suppression.

### Repartir d'une branche propre

Quand une branche est trop abîmée : copier ailleurs les fichiers utiles, créer
une nouvelle branche depuis un `main` à jour, y replacer les fichiers, puis
supprimer l'ancienne branche avec `git branch -D ancienne-branche`.

### Tester une fusion sans risque

```sh
git switch -c essai-fusion
git merge main
git switch ma-branche
git branch -D essai-fusion
```

### Faire le ménage

```sh
git fetch --prune                     # oublie les branches distantes supprimées
git branch --merged main              # branches locales déjà fusionnées
git branch -d nom-de-branche
```

## Résoudre un conflit

Un conflit survient quand la même zone d'un fichier a été modifiée des deux
côtés. Git marque la zone :

```text
<<<<<<< HEAD
version de ma branche
=======
version de main
>>>>>>> main
```

1. Ouvrir chaque fichier listé par `git status` (VSCode propose « Accepter la
   modification actuelle / entrante / les deux »).
2. Garder le bon contenu et supprimer les marqueurs.
3. `git add fichier` pour chaque fichier résolu.
4. `git commit` pour terminer la fusion.

Si Git ouvre un éditeur pour le message de fusion, ce n'est pas une erreur :
enregistrer et quitter (dans nano, `Ctrl+X` ; dans vim, `:wq`).

En cas de doute, `git merge --abort` annule la fusion en cours. On peut aussi
ouvrir la merge request telle quelle et demander de l'aide.

## Revenir après une absence

```sh
git switch main
git pull
pnpm install
git switch -c Prenom-Reference-Precision
```

Vérifier aussi que la version de Node.js correspond à celle demandée dans
[Démarrer dans le dépôt](demarrage.md#prérequis).

## Tickets

Les demandes et bugs sont suivis dans les tickets (issues) de la forge. Le
tableau des tickets permet de les ranger par catégorie (labels) par
glisser-déposer, de les attribuer et de s'y abonner. Mentionner le numéro du
ticket dans la merge request (`#1234`) relie les deux.

## Pour aller plus loin

- [Learn Git Branching](https://learngitbranching.js.org/?locale=fr_FR), cours
  interactif en français ;
- le [livre Pro Git](https://git-scm.com/book/fr/v2) en français ;
- [Workflows de contribution au moteur](../maintenance-moteur/contribution/workflows.md) ;
- [Dépannage](../maintenance-moteur/contribution/depannage.md).
