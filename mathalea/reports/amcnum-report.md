# Rapport AMCNum - Analyse Runtime

Analyse runtime des exercices qui exportent `amcReady = true` et `amcType = AMCNum`.

**Tags:**
- `autoCorrectionAMC-manquante-ou-incomplete`: autoCorrectionAMC n'est pas remplie avec la structure attendue {reponse: {valeur, param}}
- `autoCorrection-html-absente`: autoCorrection HTML n'est pas remplie
- `erreur-runtime`: erreur lors de l'instanciation ou exécution
- `class-export-manquante`: pas d'export default

| Numéro | Fichier | Tags | Notifications bugsnag |
| --- | --- | --- | --- |
| 1 | [src/exercices/3e/3G42.js](../src/exercices/3e/3G42.js) |  | extractAMCValue a reçu une réponse de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. / inferNumericValueForAMC a reçu une valeur de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. |
| 2 | [src/exercices/4e/4C10.ts](../src/exercices/4e/4C10.ts) |  | extractAMCValue a reçu une réponse de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. / inferNumericValueForAMC a reçu une valeur de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. |
| 3 | [src/exercices/5e/5M11.js](../src/exercices/5e/5M11.js) |  | extractAMCValue a reçu une réponse de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. / inferNumericValueForAMC a reçu une valeur de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. |
| 4 | [src/exercices/6e/6M2C.js](../src/exercices/6e/6M2C.js) |  | extractAMCValue a reçu une réponse de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. / inferNumericValueForAMC a reçu une valeur de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. |
| 5 | [src/exercices/6e/6N1F-1.ts](../src/exercices/6e/6N1F-1.ts) | [autoCorrectionAMC-manquante-ou-incomplete] |  |
| 6 | [src/exercices/6e/6N2E-1.ts](../src/exercices/6e/6N2E-1.ts) |  | extractAMCValue a reçu une réponse de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. / inferNumericValueForAMC a reçu une valeur de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. |
| 7 | [src/exercices/6e/6P3D.ts](../src/exercices/6e/6P3D.ts) |  | extractAMCValue a reçu une réponse de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. / inferNumericValueForAMC a reçu une valeur de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. |
| 8 | [src/exercices/can/1e/can1P03.ts](../src/exercices/can/1e/can1P03.ts) |  | extractAMCValue a reçu une réponse de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. / inferNumericValueForAMC a reçu une valeur de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. |
| 9 | [src/exercices/can/1e/can1P05.ts](../src/exercices/can/1e/can1P05.ts) |  | extractAMCValue a reçu une réponse de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. / inferNumericValueForAMC a reçu une valeur de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. |
| 10 | [src/exercices/can/1e/can1P06.ts](../src/exercices/can/1e/can1P06.ts) |  | extractAMCValue a reçu une réponse de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. / inferNumericValueForAMC a reçu une valeur de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. |
| 11 | [src/exercices/can/1e/can1P07.ts](../src/exercices/can/1e/can1P07.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 12 | [src/exercices/can/1e/can1P08.ts](../src/exercices/can/1e/can1P08.ts) |  | extractAMCValue a reçu une réponse de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. / inferNumericValueForAMC a reçu une valeur de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. |
| 13 | [src/exercices/can/2e/can2G01.ts](../src/exercices/can/2e/can2G01.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 14 | [src/exercices/can/2e/can2P01.ts](../src/exercices/can/2e/can2P01.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 15 | [src/exercices/can/3e/can3C03.ts](../src/exercices/can/3e/can3C03.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 16 | [src/exercices/can/3e/can3C04.ts](../src/exercices/can/3e/can3C04.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 17 | [src/exercices/can/3e/can3C14.ts](../src/exercices/can/3e/can3C14.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 18 | [src/exercices/can/3e/can3C22.ts](../src/exercices/can/3e/can3C22.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 19 | [src/exercices/can/4e/can4C02.ts](../src/exercices/can/4e/can4C02.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 20 | [src/exercices/can/4e/can4C03.ts](../src/exercices/can/4e/can4C03.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 21 | [src/exercices/can/4e/can4C05.ts](../src/exercices/can/4e/can4C05.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 22 | [src/exercices/can/4e/can4C07.ts](../src/exercices/can/4e/can4C07.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 23 | [src/exercices/can/4e/can4C10.ts](../src/exercices/can/4e/can4C10.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 24 | [src/exercices/can/4e/can4C12.ts](../src/exercices/can/4e/can4C12.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 25 | [src/exercices/can/4e/can4C16.ts](../src/exercices/can/4e/can4C16.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 26 | [src/exercices/can/4e/can4L05.ts](../src/exercices/can/4e/can4L05.ts) | [autoCorrectionAMC-manquante-ou-incomplete] |  |
| 27 | [src/exercices/can/5e/can5a-CoopMaths.js](../src/exercices/can/5e/can5a-CoopMaths.js) |  | extractAMCValue a reçu une réponse de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. / inferNumericValueForAMC a reçu une valeur de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. |
| 28 | [src/exercices/can/5e/can5C22.ts](../src/exercices/can/5e/can5C22.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 29 | [src/exercices/can/5e/can5C35.ts](../src/exercices/can/5e/can5C35.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 30 | [src/exercices/can/5e/can5C36.ts](../src/exercices/can/5e/can5C36.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 31 | [src/exercices/can/5e/can5P07.ts](../src/exercices/can/5e/can5P07.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 32 | [src/exercices/can/5e/can5P08.ts](../src/exercices/can/5e/can5P08.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 33 | [src/exercices/can/6e/can6a-CoopMaths.js](../src/exercices/can/6e/can6a-CoopMaths.js) |  | extractAMCValue a reçu une réponse de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. / inferNumericValueForAMC a reçu une valeur de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire. |
| 34 | [src/exercices/can/6e/can6C46.ts](../src/exercices/can/6e/can6C46.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 35 | [src/exercices/can/6e/can6C56.ts](../src/exercices/can/6e/can6C56.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 36 | [src/exercices/can/6e/can6C57.ts](../src/exercices/can/6e/can6C57.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 37 | [src/exercices/can/6e/can6C58.ts](../src/exercices/can/6e/can6C58.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
| 38 | [src/exercices/can/6e/can6C60.ts](../src/exercices/can/6e/can6C60.ts) |  | Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction ! |
