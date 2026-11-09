# Démarrer dans le dépôt

Cette page va de l'installation au lancement local de MathALÉA. Elle introduit
uniquement les commandes de terminal et de Git nécessaires pour commencer.

## Prérequis

Installez Node.js, Git et un éditeur, dans cet ordre.

Si vous réinstallez le dossier pour partir d'un répertoire complètement nettoyé (suite à des erreurs), la réinstallation de l'editeur est facultative.

### Node.js

Version `>=22.13`, qui fournit Corepack (nécessaire à `pnpm`, voir plus bas).

- **Windows et macOS** : téléchargez la version LTS sur
  [nodejs.org](https://nodejs.org/en) et lancez l'installeur.
- **Linux** (distributions basées sur Debian comme Ubuntu) :

  ```sh
  sudo apt update
  sudo apt install -y curl
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt install -y nodejs
  ```

### Git

- **Windows** : téléchargez l'installeur sur
  [git-scm.com](https://git-scm.com/downloads).
- **macOS** : ouvrez un terminal (LaunchPad puis rechercher « Terminal »),
  installez [Homebrew](https://brew.sh/) si besoin, puis :

  ```sh
  brew install git
  ```

- **Linux** :

  ```sh
  sudo apt-get install git
  ```

Puis, sur toutes les plateformes, configurez votre nom et votre email :

```sh
git config --global user.name "Mon Prénom"
git config --global user.email "mon.email@example.com"
```

### Éditeur

Un éditeur prenant en charge TypeScript, par exemple
[Visual Studio Code](https://code.visualstudio.com/Download) (ou
[VSCodium](https://vscodium.com), une version sans télémétrie Microsoft). La
suite de cette page utilise des commandes de terminal ; la configuration de
l'éditeur lui-même est décrite dans
[Configurer son éditeur](configurer-son-editeur.md).

Le dépôt déclare sa version de pnpm dans `package.json` : inutile de
l'installer séparément, `corepack enable` (voir plus bas) suffit. Le store de
dépendances est configuré dans `pnpm-workspace.yaml` et ne demande aucune
option de commande supplémentaire.

## Se repérer dans un terminal

Un terminal exécute les commandes dans un dossier courant :

```sh
pwd
ls
cd chemin/vers/un/dossier
```

- `pwd` affiche le dossier courant ;
- `ls` affiche son contenu ;
- `cd` change de dossier.

Toutes les commandes suivantes doivent être lancées depuis la racine du dépôt,
le dossier qui contient `package.json`.

## Récupérer le projet

Sous Windows, la commande `corepack enable` doit s'exécuter dans une console lancée en tant qu'administrateur.

```sh
git clone https://forge.apps.education.fr/coopmaths/mathalea.git
cd mathalea
corepack enable
pnpm install
```

`git clone` crée une copie locale du dépôt. `pnpm install` installe les
versions de `pnpm-lock.yaml` sans le modifier. Si ce fichier n'est pas cohérent
avec `package.json`, l'installation échoue ; voir
[les règles de mise à jour des dépendances](../maintenance-moteur/contribution/workflows.md#build-et-dépendances).

Vérifiez l'environnement :

```sh
node --version
pnpm --version
git status
```

## Lancer MathALÉA

```sh
pnpm dev
```

Ouvrez ensuite <http://localhost:5173/alea/>. Le terminal reste occupé par le
serveur ; utilisez `Ctrl+C` pour l'arrêter.

Si le port est déjà pris, arrêtez l'autre serveur ou utilisez l'URL indiquée par
Vite.

## Créer une branche

Une branche isole votre modification :

```sh
git switch main
git pull
git switch -c nom-court-de-la-modification
```

Pendant le travail :

```sh
git status
git diff
```

- `git status` liste les fichiers modifiés ;
- `git diff` affiche les changements non indexés.

Ne lancez pas de commande Git que vous ne comprenez pas sur un dépôt contenant
des modifications non sauvegardées.

## Comprendre les fichiers TypeScript

La majorité des exercices sont des fichiers `.ts` dans `src/exercices/`.
TypeScript ajoute des types à JavaScript afin de détecter des erreurs avant
l'exécution.

Dans un exercice, vous rencontrerez surtout :

```ts
import Exercice from '../Exercice'

export const titre = 'Un titre'

export default class MonExercice extends Exercice {
  constructor() {
    super()
  }
}
```

- `import` rend disponible du code défini ailleurs ;
- `export` rend une valeur utilisable par MathALÉA ;
- `class ... extends Exercice` crée un type d'exercice à partir du moteur ;
- `constructor()` initialise ses réglages ;
- `super()` initialise d'abord la classe `Exercice`.

La page [Créer un exercice](creer-un-exercice.md) reprend chaque élément dans un
exemple complet.

## En cas de problème

1. Vérifiez que vous êtes à la racine avec `pwd` et `ls`.
2. Vérifiez les versions avec `node --version` et `pnpm --version`.
3. Relancez `pnpm install` si un module manque.
4. Consultez `git status` avant toute réinstallation ou suppression.

Si la page reste bloquée sur l'animation du dé MathALÉA après un redémarrage de
Vite, ouvrez la console ou l'onglet Réseau du navigateur. Une erreur du type
`504 (Outdated Optimize Dep)` ou `Outdated Optimize Dep` indique souvent que le
navigateur demande une dépendance pré-bundlée que le serveur Vite considère
périmée. Les dépendances servies depuis `node_modules/.vite/deps` sont mises en
cache très longtemps côté navigateur ; le problème peut donc ne toucher qu'un
poste ou qu'un profil navigateur.

Dans ce cas, commencez par ouvrir la page dans une fenêtre de navigation privée.
Si elle démarre correctement, supprimez les données du site `localhost:5173`
dans le navigateur habituel, ou gardez les DevTools ouverts avec l'option réseau
`Disable cache` pendant le développement. Il n'est alors pas nécessaire de
supprimer `node_modules/.vite` à chaque relance.

Pour diagnostiquer :

```sh
node --version
pnpm --version
node ./node_modules/vite/bin/vite.js --version
```

Après un changement de version Node ou pnpm, relancez `pnpm install`, puis
démarrez Vite avec une réoptimisation explicite :

```sh
pnpm dev -- --force
```

Les workflows Git, build et CI plus avancés sont décrits dans
[Contribuer au moteur](../maintenance-moteur/contribution/workflows.md).
