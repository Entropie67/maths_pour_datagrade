# Dépannage

Messages d'erreur fréquents lors de l'installation, de la mise à jour des
dépendances ou de l'utilisation de Git, et marche à suivre.

Pour une page bloquée sur l'animation du dé après un redémarrage de Vite
(`Outdated Optimize Dep`), voir
[Démarrer dans le dépôt](../../auteurs-exercices/demarrage.md#en-cas-de-problème).

## Git

| Message ou situation | Cause | Solution |
| --- | --- | --- |
| Un éditeur s'ouvre avec « Merge branch … » | Git demande un message pour le commit de fusion | Ce n'est pas une erreur : enregistrer et quitter (`Ctrl+X` dans nano, `:wq` dans vim). |
| « Your local changes to the following files would be overwritten by checkout » | Des modifications non committées seraient perdues en changeant de branche | Committer, ou `git stash push -m "…"` puis `git stash pop` au retour. |
| « There is no tracking information for the current branch » | La branche locale ne suit pas de branche distante | `git pull origin nom-de-branche`, ou `git push -u origin nom-de-branche` au premier envoi. |
| « Need to specify how to reconcile divergent branches » | Les branches locale et distante ont chacune des commits absents de l'autre, sans stratégie de pull configurée | Sur une branche partagée, `git pull --no-rebase origin nom-de-branche` choisit une fusion qui conserve les deux historiques. Résoudre les éventuels conflits avant de pousser. `git pull --rebase` réécrit les commits locaux ; `--ff-only` refuse cette divergence. |
| Conflit dans une merge request | `main` a modifié les mêmes lignes | Fusionner `main` dans sa branche et résoudre en local : voir [Résoudre un conflit](../../auteurs-exercices/partager-son-travail.md#résoudre-un-conflit). |

## Installation

| Message ou situation | Solution |
| --- | --- |
| Erreur de certificat pendant `pnpm install` sous Linux | `sudo apt-get install --reinstall ca-certificates`, puis relancer `pnpm install`. |
| `pnpm` introuvable | Activer Corepack (`corepack enable`), fourni avec Node.js ; la version de pnpm est fixée par `packageManager` dans `package.json`. |
| Module introuvable au lancement de `pnpm dev` | `pnpm install` ; souvent nécessaire après un `git pull`. |
| Erreur après un changement de version de Node.js | `pnpm install`, puis `pnpm dev -- --force`. |

## Erreur liée aux dépendances

Pour une erreur incompréhensible qui semble venir d'une dépendance, essayer
dans l'ordre, en passant à l'étape suivante si le problème persiste :

1. `pnpm install` ;
2. supprimer `node_modules`, puis `pnpm install` (plus long) ;
3. si `pnpm-lock.yaml` a changé sans raison, le restaurer avec
   `git restore pnpm-lock.yaml`, puis relancer `pnpm install`.

`pnpm install` utilise toujours le lockfile sans le modifier. S'il signale une
incohérence avec `package.json`, récupérer les deux fichiers du même commit ;
pour une modification voulue des dépendances, voir
[les workflows de contribution](workflows.md#build-et-dépendances).

Si l'erreur persiste, elle vient du code ou d'une nouvelle version d'une
dépendance. Revenir à un commit qui fonctionne (`git switch --detach <sha>`
puis `pnpm install --frozen-lockfile`), comparer les `pnpm-lock.yaml` des deux
versions et, si besoin, fixer la version fautive dans `package.json`.

Le store pnpm du dépôt est décrit dans
[Workflows de contribution](workflows.md#store-pnpm).

## Tester une version locale d'une dépendance

Pour développer en même temps MathALÉA et une de ses dépendances maintenues
par l'association (apigeom par exemple), depuis la racine de MathALÉA :

```sh
pnpm link ../chemin/vers/apigeom
pnpm dev
```

Les modifications du paquet local sont alors prises en compte par Vite. Pour
revenir à la version publiée :

```sh
pnpm unlink apigeom
pnpm install
```

Vérifier `git status` avant de committer : ne pas committer les modifications
de `package.json`, `pnpm-workspace.yaml` ou `pnpm-lock.yaml` introduites par
`pnpm link`.

## Exercice qui plante

1. Ouvrir la console du navigateur : l'erreur indique souvent le fichier et la
   ligne.
2. En local, les appels à `notify()` affichent une notification et les
   paramètres de l'exercice dans la console (voir
   [Signalements d'erreurs](../../auteurs-exercices/configurer-son-editeur.md#signalements-derreurs)).
3. Reproduire avec la même graine : l'URL contient `alea=…`.
4. Poser un point d'arrêt (voir
   [Déboguer](../../auteurs-exercices/configurer-son-editeur.md#déboguer)).
