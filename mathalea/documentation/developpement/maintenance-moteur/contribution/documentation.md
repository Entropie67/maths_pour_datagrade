# Maintenir la documentation

Ce workflow décrit comment un agent doit répondre à une question de développeur sur la codebase MathALÉA tout en maintenant la documentation durable.

## Objectif

L'agent doit privilégier la documentation existante, vérifier rapidement qu'elle correspond encore au code, puis enrichir `documentation/` quand une réponse révèle une connaissance durable absente ou obsolète.

## Protocole de réponse

1. Chercher d'abord dans [documentation/README.md](../../../README.md), puis ouvrir les pages liées qui semblent couvrir la question.
2. Si une page couvre la question, vérifier rapidement sa cohérence avec la codebase :
   - confirmer l'existence des fichiers cités ;
   - chercher les symboles clés avec `rg` ;
   - vérifier les scripts mentionnés dans `package.json` ;
   - contrôler les tests ou configurations mentionnés quand ils font partie de la réponse.
3. Si la documentation est cohérente avec le code, répondre en citant les pages utilisées et en indiquant que les références code pertinentes ont été vérifiées.
4. Si la documentation est absente, incomplète ou obsolète, explorer la codebase avec `rg` et des lectures ciblées avant de répondre.
5. Si l'information découverte est durable, mettre à jour la page existante la plus pertinente ou créer une nouvelle page sous `documentation/`.

## Quand mettre à jour la documentation

Mettre à jour `documentation/` quand la réponse établit une règle, un comportement, une architecture ou une procédure qui sera utile à d'autres développeurs.

Ne pas documenter :

- une investigation ponctuelle ;
- un état temporaire de branche, de CI ou de poste local ;
- un bug non confirmé ;
- une préférence personnelle ;
- un détail trop fragile, comme une ligne précise sans intérêt durable.

Créer une nouvelle page seulement si aucun document existant ne couvre
naturellement le sujet. Sinon, enrichir la page existante, par exemple
[système d'interactivité](../interactivite/systeme-interactivite.md) pour une
question liée à l'interactivité.

## Format attendu d'une mise à jour

Une mise à jour documentaire doit rester exploitable sans relire toute la codebase. Selon le sujet, inclure :

- le contexte ou le problème couvert ;
- le comportement actuel ;
- les fichiers, modules ou symboles importants ;
- les commandes utiles ;
- les pièges connus ou limites importantes.

La documentation durable reste dans `documentation/`. Les rapports générés et fichiers exportés archivés restent dans `reports/`.

## Exemples

### Question couverte et vérifiée

Si la question porte sur les rapports d'exercices, l'agent lit
[documentation/tests/rapports-exercices.md](../../../tests/rapports-exercices.md),
vérifie les scripts et fichiers cités, puis répond avec la référence
documentaire.

### Question couverte mais obsolète

Si une page cite un script qui n'existe plus dans `package.json`, l'agent vérifie le script actuel, corrige la documentation, puis répond en mentionnant la correction.

### Question non couverte

Si la question porte sur un mécanisme non documenté, l'agent explore la codebase avec `rg`, lit les fichiers pertinents, répond, puis ajoute une section ou une page si le mécanisme est durable.
