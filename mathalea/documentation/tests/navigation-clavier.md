# Navigation au clavier

## Préparer Safari sur macOS

Dans Safari, activer **Réglages > Avancés > Appuyer sur Tab pour mettre en
surbrillance chaque élément d'une page web**. Sans ce réglage, Safari peut
ignorer les boutons lors d'une tabulation. Apple documente également le
raccourci **Option + Tab** et l'influence du réglage macOS **Clavier >
Navigation au clavier** dans ses
[raccourcis Safari](https://support.apple.com/fr-fr/guide/safari/cpsh003/mac).
Consigner ces réglages et les versions de Safari et macOS lors d'un audit.

Ne pas ajouter de `tabindex` positif ni détourner Tab pour contourner ce
comportement du navigateur. Un bouton HTML natif activé participe à la
navigation séquentielle et gère Entrée et Espace sans gestionnaire clavier
supplémentaire.

## Vérifier les réponses sans souris

Effectuer ce contrôle dans les vues prof et élève, avec une vérification
globale puis question par question. Inclure des champs MathLive, des champs
texte et un QCM dans l'échantillon.

1. Charger une série interactive et attendre la fin du rendu : en vue prof,
   le bouton « Vérifier » reste désactivé pendant la préparation de l'exercice.
2. Depuis le début de la page, utiliser Tab pour atteindre les champs et les
   boutons, puis Maj + Tab pour parcourir le chemin inverse.
3. Saisir les réponses au clavier. Vérifier que l'on peut sortir des champs
   MathLive et de leur clavier virtuel sans rester piégé.
4. Atteindre « Vérifier » et constater un contour de focus visible, en thème
   clair et sombre. `src/app.css` définit ce contour pour les boutons natifs
   avec `:focus-visible`, y compris en couleurs forcées.
5. Activer le bouton avec Entrée, puis refaire le scénario avec Espace.
   Vérifier que la correction et le score apparaissent comme après un clic.
6. Poursuivre la navigation après la validation et contrôler l'ordre du focus,
   notamment lorsque le bouton disparaît ou que les champs sont verrouillés.

Les boutons principaux sont définis dans `ExerciceMathaleaVueProf.svelte` et
`ExerciceMathaleaVueEleve.svelte` ; le bouton par question est défini dans
`presentationalComponents/Question.svelte`. Ce sont des éléments `<button>`
natifs. `setMathfield.ts` gère l'ouverture et la fermeture du clavier virtuel.

Ce contrôle ciblé contribue à l'examen des critères
[7.3 (contrôle au clavier), 10.7 (focus visible), 12.8 (ordre de tabulation) et
12.9 (absence de piège au clavier) du RGAA](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/).
Il ne constitue pas un audit de conformité de l'application entière : les
autres composants interactifs et la restitution par les technologies
d'assistance doivent aussi être évalués.
