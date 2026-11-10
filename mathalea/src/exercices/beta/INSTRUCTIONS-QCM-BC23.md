# Instructions pour créer un bon QCM à partir du document BC23

## Structure des distracteurs recommandée :

1. **Bonne réponse** : Toujours en première position dans le JSON
2. **Distracteur plausible 1** : Résultat d'une erreur de calcul commune
3. **Distracteur plausible 2** : Résultat d'une erreur de méthode/raisonnement
4. **Distracteur évident** : Réponse manifestement fausse pour rassurer les élèves

## Exemples de types de distracteurs selon le domaine :

### Mathématiques :

- **Erreur de signe** : si la réponse est 5, proposer -5
- **Erreur d'opération** : si c'est 2×3=6, proposer 2+3=5
- **Erreur d'ordre de grandeur** : si c'est 0,25, proposer 2,5
- **Confusion de formules** : aire vs périmètre
- **Erreur de priorité** : (2+3)×4=20 vs 2+3×4=14

### Géométrie :

- **Confusion d'unités** : cm vs cm² vs cm³
- **Erreur de formule** : πr² vs 2πr vs πd
- **Erreur de mesure** : côté vs diagonale vs rayon
- **Confusion de théorèmes** : Pythagore vs Thalès

### Algèbre :

- **Erreur de développement** : (a+b)² = a²+b² au lieu de a²+2ab+b²
- **Erreur de factorisation**
- **Confusion avec les exposants** : (a²)³ = a⁵ au lieu de a⁶
- **Erreur dans les équations** : oublier de changer le signe

### Fonctions :

- **Confusion image/antécédent**
- **Erreur sur les variations**
- **Confusion dérivée/primitive**

## Conseils pour les corrections :

### Pour la bonne réponse :

- Donner une justification claire et complète
- Montrer la méthode correcte étape par étape
- Mentionner les points clés à retenir

### Pour chaque distracteur :

- Identifier l'erreur type qui mène à cette réponse
- Expliquer pourquoi cette approche est incorrecte
- Donner un conseil pour éviter cette erreur
- Utiliser des phrases comme :
  - "Erreur : vous avez probablement..."
  - "Attention : il ne faut pas confondre..."
  - "Piège : cette réponse correspond à..."

## Exemple concret :

**Question :** Quelle est la dérivée de f(x) = 3x² + 2x - 1 ?

**Réponses :**

1. f'(x) = 6x + 2 ✓ (bonne réponse)
2. f'(x) = 6x² + 2x (erreur : pas de baisse de degré)
3. f'(x) = 3x + 2 (erreur : coefficient mal calculé)
4. f'(x) = 6x + 2x - 1 (erreur : constante non dérivée)

**Corrections :**

1. "Correct ! La dérivée de ax^n est nax^(n-1), donc 3x² → 6x, 2x → 2, -1 → 0"
2. "Erreur : vous avez oublié de diminuer les exposants. La dérivée de x² est 2x, pas 2x²"
3. "Erreur : le coefficient 3 doit être multiplié par l'exposant 2, ce qui donne 6x"
4. "Erreur : la dérivée d'une constante est toujours 0, il faut supprimer le -1"

## Format JSON attendu :

```json
{
  "titre": "Titre descriptif du QCM",
  "consigne": "Instruction claire pour l'élève",
  "questions": [
    {
      "enonce": "Énoncé avec LaTeX si nécessaire : $formule$",
      "reponses": [
        "Bonne réponse en premier",
        "Distracteur 1",
        "Distracteur 2",
        "Distracteur 3"
      ],
      "corrections": [
        "Explication de la bonne méthode",
        "Explication de l'erreur 1",
        "Explication de l'erreur 2",
        "Explication de l'erreur 3"
      ]
    }
  ]
}
```

## Utilisation du LaTeX :

- Formules inline : `$x^2 + 1$`
- Fractions : `$\\frac{a}{b}$` (doubler les backslashes)
- Racines : `$\\sqrt{x}$`
- Indices : `$x_{1}$`
- Exposants : `$x^{2}$`

Pour utiliser ce modèle, remplacez la question d'exemple par les vraies questions du document BC23, en adaptant les distracteurs au contexte de chaque question.
