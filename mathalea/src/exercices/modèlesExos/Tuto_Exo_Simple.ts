/*
Si vous utilisez VSC, vos devriez voir l'ensemble de ce code en couleur.
EE : Quand j'écris ces lignes, je suis sur fond noir donc j'espère que sur fond blanc, ce sont les mêmes couleurs.
        - vert, ce sont des commentaires précédés de // ou encadrés de /* et de son alter ego
        - violet et bleu foncé, ce sont pour des mots réservés (dont on ne pourra pas se servir comme nom de variables, par exemple)
        - bleu clair, ce sont pour les variables (ou constantes) définies dans ce code.
        - jaune, ce sont pour des noms de fonctions définies dans ce fichier ou dans d'autres fichiers.
        - orange, ce sont des chaines de caractères (type string)
        - blanc/noir, c'est le reste du code.
Si certaines lignes ou certains mots sont soulignés en rouge, c'est que le lintage (voir ci-dessous) fait très bien son travail
*/

/* ************************** LINTAGE ***************************
lintage : c'est un terme barbare pour les padawan qui est moderne et nouveau pour ceux qui n'ont pas pas programmé, comme moi, depuis
des années, avant de revenir sur ce projet, car cela n'existait évidemment pas pour ceux qui ont appris à programmer au XXe siècle.
Le lintage, c'est un processus d'analyse en direct de ton code pour identifier les erreurs de syntaxe, les problèmes de style,
ou les erreurs potentielles. L'objectif principal du lintage est d'améliorer la qualité du code en détectant des problèmes
avant même l'exécution.
Dans ce projet, on utilise EsLint comme outil de lintage associé à VSC.
EsLint est assez fort pour régler tout seul, à l'enregistrement, les problèmes de lintage liés à l'alignement, à l'indentation, aux espaces....
Quand EsLint ne sait pas régler un problème, alors il vous le souligne et c'est à vous de trouver une solution pour le régler.
*/

/** ********************** DEBUT DU CODE  **********************

Une fois que vous avez compris mes propos en commentaire, vous pouvez les supprimer.
Ne conservez pas ces lignes de code inutiles dans votre propre code.

*/

// Le premier import suivant est obligatoire pour créer n'importe quel exercice.
import ExerciceSimple from '../ExerciceSimple'

/*
Les lignes éventuelles suivantes d'import pour utiliser des fonctions venant d'autres fichiers (de ce projet principalement)
Ces lignes d'imports se font automatiquement si VSC est bien configuré. Rien n'est à saisir à la main, cela évite les fautes de frapppe.
Les chemins doivent être relatifs (avec des ...)
Si le lintage (voir définition ci-dessus) souligne des fonctions en rouge,
            - c'est qu'elles ont été mises parce que vous en avez eu besoin à un moment,
            - c'est qu'elles ne servent plus au moment présent où vous regardez ce code,
            - c'est que vous pouvez supprimer cette fonction.
*/

/*
Normalement, sur la ligne suivante d'import, devrait être souligné en rouge par le lintage (voir définition) le mot "randint".
Pourquoi ? Pour la raison précédemment indiquée : cette fonction n'est pas (plus) utilisée dans votre code.
Vous pouvez donc supprimer l'import de la fonction randint,
et comme aucune fonction n'a besoin d'être importé de '../../modules/outils', vous pouvez supprimer toute cette ligne.
Allez-y, faites-le.
*/
// import { randint } from '../../modules/outils'

/*
La ligne suivante (obligatoire) permet de préciser le titre de l'exercice qui sera affiché sur le site MathALÉA.
Pour uniformiser le projet, le titre doit :
        - commencer par un verbe à l'infinitif avec son initiale en majuscule
        - ne doit pas comporter de point final.
*/
export const titre =
  'Mettre le titre souhaité (assez descriptif mais pas trop long)'
/*
Si votre titre contient une apostrophe, alors mettre cette chaîne entre " " et non entre apostrophes.
Ce titre peut être changé à tout moment donc vous pourrez mettre le titre qu'à la fin.
*/

/*
Les lignes suivantes permettent de préciser des infos utiles que pous nous :
       - la date de création de cet exercice
       - la date de son éventuelle dernière modification importante.
Ces informations n'apparaîssent pas sur le site mais les exercices créés ou modifiés depuis moins d'un mois sont listés dans
le menu sur le site MathALÉA et taggués avec 'New' ou 'MAJ'.
Cela permet de montrer que le site est vivant et permet de suivre nos nouveautés.
*/
export const dateDePublication = '01/01/2001'
export const dateDeModifImportante = '29/12/2034'

/*
Les lignes suivantes concernent l'interactivité et sont facultatives si vous n'utilisez pas l'interactivité
La première ligne indique que l'exercice est interactif.
La seconde ligne indique que l'interactivité concerne un champ de réponse, l'interactivité la plus fréquente dans MathALÉA.
Les autres types d'interactivité seront vus dans une formation de niveau supérieur.
*/
export const interactifReady = true

/*
Les lignes suivantes concernent le référencement de l'exercice et sont obligatoires.
Chaque uuid doit être différent d'un exercice à l'autre. Lors du pnpm start, il indique un nouvel uuid valide possible qu'on peut utiliser.
Le refs correspond au nom de l'exercice dans le référentiel français et dans le référentiel suisse.
Selon que c'est une CAN ou un exercice plus classique, les référentiels ne sont pas les mêmes.
*/
export const uuid = 'AchangerOBLIGATOIREMENT'
export const refs = {
  'fr-fr': [], // A changer obligatoirement, ne rien mettre si on ne veut pas que cet exercice soit référencé, donc trouvable dans le menu de gauche de MathALÉA
  'fr-ch': [],
}

// Les lignes suivantes, bien qu'entre commentaires, sont obligatoires pour décrire l'exercice et nommer son auteur.
/**
 * Ici, on décrit rapidement l'enjeu pédagogique de l'exercice
 * @author Ici, on indique l'auteur de l'exercice
 */

/*
 Les 3 lignes suivantes sont obligatoires.
 NomExercice est le nom de l'exercice et doit répondre aux conditions suivantes :
      - NomExercice doit porter un nom parlant qui décrit l'exercice
      - NomExercice doit porter un nom unique (vérifier qu'aucun autre exercice porte ce nom)
      - NomExercice doit commencer par une majuscule et être écrit en CamelCase
*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    // Inutile de comprendre. Le moteur fonctionne ainsi.
    super() // Inutile de comprendre. Le moteur fonctionne ainsi.

    /*
    Les lignes suivantes concernent la configuration de l'exercice.
$    Le this indique que ces paramétrages sont liés à l'objet Exercice.
    Pour comprendre le principe général du codage des exos sur MathALÉA, je vous indique, maintenant, comment
    coder un exercice "simple" de type CAN ou pas.
    */
    this.typeExercice = 'simple' // Ligne obligatoire pour les CAN. Les CAN sont tous du type "simple" (en opposition à ...... ? )
    this.nbQuestions = 1 // Ligne obligatoire ? Indique le nombre de questions affiché à l'ouverture de l'exercice
    this.spacing = 1.5 // Indique l'espace entre les lignes dans un exercice. C'est 1 par défaut, si cette ligne est absente.
    this.spacingCorr = 1.5 // Indique l'espace entre les lignes dans la correction d'un exercice. C'est 1 par défaut, si cette ligne est absente.
    // Il doit sans doute exister d'autres paramètres. Voir la classe Exercice si vous êtes curieux.

    /*
    Ces lignes concernent l'interactivité.
    Conseil : Laisser ainsi pour l'instant. Coder l'exercice sans interactivité et rajouter l'interactivité quand l'exercice HTML ou PDF sera fonctionnel.
    Conseil : Donc, ne pas décommenter tout de suite.
    this.formatChampTexte = KeyboardType.clavierDeBase // Format du champ de réponse + type de clavier virtuel de l'exercice.
    this.optionsChampTexte = { texteAvant: 'Pour écrire quelque chose avant le champ de réponse', texteApres: "ben, là, c'est après" }
    // Type de fonction de comparaison utilisée. Voir documentation/developpement/auteurs-exercices/complements/options-de-comparaison.md
    this.optionsDeComparaison = { fractionEgale: true } // Option possible de la fonction de comparaison utilisée
  */
  }

  /*
  Maintenant que le paramétrage est effectué (on pourra toujours y revenir si le besoin se fait sentir),
  le code de l'exercice propre à chacun en dessous par cette première ligne.
  Ici, le code est évidemment différent d'un exercice à l'autre mais on y retrouve quelques principes expliqués au fur et à mesure.
  */

  nouvelleVersion() {
    // Ligne obligatoire et identique pour tous les exercices.
    const a = 5
    const b = 6
    this.question = a + '+' + b // this.question contient le texte visible en HTML et en PDF (LaTeX).
    /*
    La ligne précédente est équivalente à la suivante.
    Dans la suivante, vous verrez une seule chaine de caractères dans lesquelles les variables, pour qu'elles soient interprétées,
    sont mises entre accolades et précédées par un $.
    Commentez-l'une, commentez l'autre pour voir que c'est pareil.
    Je vous invite à ne conserver qu'une seule de ces deux lignes. Supprimez-en une. Conservez celle que vous préférez. À vous de faire.
    */
    this.question = `${a}+${b}`
    this.correction = `${a}+${b}=${a + b}` // this.correction contient le texte visible en HTML et en PDF (LaTeX) dans la correction.

    /*
    Si ce n'est pas déjà fait, créez une branche, changez le nom de l'exercice, changez le nom de ce fichier.
    Si vous n'avez changé l'uuid de votre exercice, faites-le et allez observer cet exercice sur l'interface web : http://localhost:5173/alea/
    Vérifiez que cela fonctionne.
    Avant cela, sur le terminal, il faudra avoir lancé la commande pnpm start (qui permet aussi de récupérer un nouvel uuid)
    À vous de faire.
    */

    /*
    L'exemple ci-dessus n'est en fait pas correct car on n'aura pas toujours des petits entiers.
    Redonner à a, la valeur 4.17 et à b, la valeur 2500.
    Regarder le résultat sur l'interface.

    Le résultat n'est pas correct car :
        - la virgule n'est pas au bon format
        - l'espace entre les classes (milliers...) est absent
        - TOUS les nombres doivent être au format Latex (Katex)

    Pour cela, on va utiliser une fonction texNombre().
    Cette super fonction permet de transformer un nombre en une chaîne de caractères au format Latex avec les bonnes conventions (virgule, espace)
    Décommenter les deuux lignes suivantes pour voir la différence.
    this.question += `<br>$${texNombre(a)}+${texNombre(b)}$`
    this.correction += `$${texNombre(a)} + ${texNombre(b)} = ${texNombre(a + b)}$`
    */

    /*
    Un dernier point délicat est la prise en compte du calcul avec des décimaux
    Remplacer par a par 0.1 + 0.2.
    Et décommenter la ligne suivante :
    this.question += '<br>a vaut ' + a + ` bien qu'il affiche $${texNombre(a)}$`
    Si vous ne voyez pas le pb, c'est que vous ne faites pas ce que je demande.
    */

    /*
    Pour régler le problème, on va utiliser la class Decimal qui gère parfaitement les décimaux.
    Ajouter les 2 lignes suivantes à votre code et regarder la différence.
    a = new Decimal(0.1).add(0.2)
    this.question += '<br>a vaut ' + a + ` et son affichage correspond bien au $${texNombre(a)}$`

    Tous les "mots" à utiliser avec la classe Decimal sont dans documentation/developpement/auteurs-exercices/mathematiques/gerer-les-decimaux.md
    */

    /*
    Si on veut rendre cet exercice comme CAN, il suffit juste de décommenter ces lignes.
    this.canEnonce = texte
    this.canReponseACompleter = '$\\ldots$ et $\\ldots$'
    Pour vérifier que cela fonctionne, aller vérifier la sortie PDF version CAN
    */

    /*
    Dernier point : la solution dans la correction doit être en gras et orange.
    Il faut utiliser la fonction miseEnEvidence(). Je vous laisse chercher pour son usage?
    */

    /*
    Point ultime : l'interactivité. Je n'ai pas le temps d'écrire.
    */
  } // Fermeture de nouvelleVersion{}
} // Fermeture de l'exercice
