# Utilisation avec Sésathèque

Une Sésathèque peut embarquer MathALÉA dans une iframe avec le paramètre
`recorder=sesatheque`. Ce recorder utilise le protocole d'activité piloté par
la plateforme hôte, commun avec l'intégration FlowMath.

## Création d'une activité

La Sésathèque ouvre la page de configuration avec
`?recorder=sesatheque`. L'enseignant choisit et paramètre ses exercices, puis
utilise le bouton **Valider**. MathALÉA envoie alors à la fenêtre parente :

```js
{
  action: ('mathalea:activityParams', url, exercices, globalOptions)
}
```

La plateforme peut enregistrer l'URL et les paramètres reçus dans sa
ressource.

## Lecture et résultats

La vue élève est ouverte avec `v=eleve&recorder=sesatheque`. Le protocole
utilise des messages `postMessage` :

| Sens                  | Message                              | Rôle                                                        |
| --------------------- | ------------------------------------ | ----------------------------------------------------------- |
| MathALÉA → plateforme | `READY`                              | Le lecteur est prêt à recevoir des commandes.               |
| MathALÉA → plateforme | `mathalea:init` et `mathalea:resize` | Initialisation et hauteur souhaitée de l'iframe.            |
| Plateforme → MathALÉA | `FINISH_ATTEMPT`                     | Valider tous les exercices et terminer la tentative.        |
| MathALÉA → plateforme | `ATTEMPT_FINISHED`                   | Renvoyer le score, le détail des exercices et les réponses. |
| Plateforme → MathALÉA | `REPLAY_ATTEMPT`                     | Réinjecter les réponses d'une tentative enregistrée.        |
| MathALÉA → plateforme | `REPLAY_COMPLETED`                   | Confirmer la fin du rejeu.                                  |
| MathALÉA → plateforme | `ERROR`                              | Signaler une erreur d'exécution.                            |

`ATTEMPT_FINISHED.payload` contient :

```ts
{
  score: number
  exercicesData: InterfaceResultExercice[]
  totalQuestions: number
  correctAnswers: number
}
```

Le score est compris entre 0 et 1. `exercicesData` peut être conservé pour le
rejeu ultérieur.

## Sécurité

La plateforme hôte doit vérifier à la réception que `event.source` est la
fenêtre de l'iframe MathALÉA et que `event.origin` correspond exactement au
serveur MathALÉA configuré. Elle doit également utiliser cette origine, et non
`*`, comme `targetOrigin` pour les messages qu'elle envoie.
