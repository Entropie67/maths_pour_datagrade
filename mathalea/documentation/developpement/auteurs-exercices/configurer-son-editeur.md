# Configurer son éditeur et déboguer

Le dépôt est prévu pour Visual Studio Code (ou VSCodium). Cette page décrit la
configuration fournie par le dépôt, puis les outils pour comprendre un
exercice qui ne se comporte pas comme prévu.

## Ouvrir le dépôt dans VSCode

Ouvrir le dossier racine du dépôt (celui qui contient `package.json`). Au
premier lancement, VSCode propose :

- de faire confiance aux auteurs du dossier : accepter, sinon les extensions ne
  s'exécutent pas ;
- d'installer les extensions recommandées : accepter.

Le terminal intégré s'ouvre avec ``Ctrl+` `` (toutes plateformes) ou
`Ctrl+J` / `Cmd+J`.

### Windows et PowerShell

Si PowerShell refuse d'exécuter `pnpm` (« l'exécution de scripts est
désactivée »), choisir **Command Prompt** comme terminal par défaut : flèche à
côté du `+` du terminal, puis « Select Default Profile ». On peut aussi
autoriser les scripts pour son seul compte :

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### S'authentifier sur la forge

L'extension **GitLab Workflow** (recommandée par le dépôt) permet de pousser et
de suivre les merge requests depuis VSCode : palette de commandes, puis
`GitLab: Authenticate`, instance `https://forge.apps.education.fr/`, et un
jeton d'accès personnel créé sur la forge. On peut aussi cloner en SSH après
avoir ajouté sa clé publique dans les préférences de son compte forge.

## Configuration fournie par le dépôt

Le dossier `.vscode/` est versionné.

`.vscode/extensions.json` recommande :

| Extension                  | Rôle                                         |
| -------------------------- | -------------------------------------------- |
| ESLint                     | signale les erreurs et corrige à la sauvegarde |
| Prettier                   | formate les fichiers                         |
| Svelte for VS Code         | coloration et vérification des `.svelte`     |
| Tailwind CSS IntelliSense  | complétion des classes Tailwind              |
| GitLab Workflow            | forge, merge requests, pipelines             |
| GitLens, Git Graph         | historique et branches                       |
| French Language Pack       | interface en français                        |

`.vscode/settings.json` active notamment :

- le formatage à la sauvegarde avec Prettier pour TypeScript, JavaScript,
  Svelte, JSON, CSS et HTML ;
- les corrections ESLint et le tri des imports à la sauvegarde ;
- des imports relatifs, mis à jour automatiquement quand un fichier est
  déplacé ;
- la validation ESLint des fichiers `.svelte`.

Il n'y a donc rien à régler à la main. En ligne de commande, `pnpm format`
formate `src`, `tasks` et `tests` avec Prettier ; `pnpm lint` corrige les
exercices avec ESLint.

## Raccourcis utiles

| Action                                  | Windows / Linux  | macOS           |
| --------------------------------------- | ---------------- | --------------- |
| Palette de commandes                    | `Ctrl+Maj+P`     | `Cmd+Maj+P`     |
| Ouvrir un fichier par son nom           | `Ctrl+P`         | `Cmd+P`         |
| Rechercher dans tout le projet          | `Ctrl+Maj+F`     | `Cmd+Maj+F`     |
| Aller à la définition                   | `F12`            | `F12`           |
| Renommer un symbole partout             | `F2`             | `F2`            |
| Sélectionner l'occurrence suivante      | `Ctrl+D`         | `Cmd+D`         |
| Replier / déplier tout le fichier       | `Ctrl+K Ctrl+0` / `Ctrl+K Ctrl+J` | `Cmd+K Cmd+0` / `Cmd+K Cmd+J` |

## Déboguer

### Lire les réponses attendues

En local, ajouter `&triche` à l'URL de MathALÉA
(`http://localhost:5173/alea/?uuid=…&triche`) : la console du navigateur
affiche les réponses attendues de chaque question interactive.

### Relire énoncé et correction

En local, ajouter `&cor` à l'URL (`http://localhost:5173/alea/?uuid=…&cor`) :
tous les exercices s'affichent avec leur correction, sans cliquer sur le bouton
de chaque exercice. Le paramètre est ignoré hors `localhost`, et les exercices
interactifs gardent leur comportement habituel (correction après vérification).

### Points d'arrêt dans le navigateur

Vite sert les sources TypeScript avec leurs source maps : dans les outils de
développement du navigateur (`F12`), onglet Sources, ouvrir le fichier de
l'exercice (`Ctrl+P` / `Cmd+P`), cliquer sur un numéro de ligne pour poser un
point d'arrêt, puis régénérer l'exercice. On inspecte alors les variables et
on avance pas à pas.

L'instruction `debugger` dans le code a le même effet quand les outils de
développement sont ouverts ; ne pas la committer.

### Points d'arrêt dans VSCode

Le dépôt ne fournit pas de `launch.json`. Pour déboguer MathALÉA depuis VSCode,
créer `.vscode/launch.json` en local avec une configuration Chrome pointant sur
le serveur de développement :

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "MathALÉA",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173/alea/",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

Lancer `pnpm dev`, puis `F5`. Les commandes de pas à pas : `F5` continuer,
`F10` pas principal, `F11` entrer dans la fonction, `Maj+F11` en sortir,
`Maj+F5` arrêter.

Pour les tests unitaires, l'extension Vitest permet de lancer et de déboguer
un test depuis l'éditeur.

### `console.log`

`console.log(maFonction())` affiche `undefined` si la fonction ne renvoie rien,
même si elle fonctionne : ce n'est pas un bug. Retirer les `console.log` avant
de committer.

### Signalements d'erreurs

En production, les erreurs des utilisateurs sont envoyées à Bugsnag
(`src/bugsnag.ts`), avec les paramètres des exercices et l'URL. Hors
production (`localhost` ou une adresse IP, `staging.*`, l'adresse technique du
conteneur `*.scw.cloud`, voir `isProductionSite()`), rien n'est envoyé :
`notify()` affiche une notification et détaille l'erreur dans la console. Un
exercice peut appeler `window.notify(message, metadatas)` pour signaler une
situation anormale.

Pour les erreurs d'installation, de dépendances ou de Git, voir
[Dépannage](../maintenance-moteur/contribution/depannage.md).
