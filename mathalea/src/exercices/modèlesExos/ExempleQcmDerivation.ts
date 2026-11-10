import { createQcmFromJson } from "../beta/qcmUtils"

export const uuid = 'deriv'
export const titre = 'QCM Dérivation'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

const qcmData = {
  titre: 'Calcul de dérivées - Fonctions usuelles',
  consigne:
    "Pour chaque fonction, déterminez l'expression de sa fonction dérivée.",
  options: {
    vertical: true,
    ordered: false,
    lastChoice: 8,
  },
  questions: [
    {
      enonce: "Soit $f(x) = 2x + 2$. Que vaut $f'(2)$ ?",
      reponses: ['$2$', '$6$', '$4$', '$0$'],
      corrections: [
        "Correct ! La dérivée d'une fonction affine $f(x) = ax + b$ est $f'(x) = a$. Donc $f'(x) = 2$ et $f'(2) = 2$.",
        "Erreur : vous avez peut-être calculé $f(2) = 2 \\times 2 + 2 = 6$, mais on demande $f'(2)$.",
        'Erreur : vous avez peut-être calculé $2 \\times 2 = 4$, mais la dérivée ne dépend pas de la valeur de $x$.',
        "Erreur : la dérivée d'une fonction affine n'est pas nulle (sauf si $a = 0$).",
      ],
    },
    {
      enonce: 'Quelle est la dérivée de $f(x) = \\frac{-x + 2}{2}$ ?',
      reponses: [
        "$f'(x) = -\\frac{1}{2}$",
        "$f'(x) = \\frac{1}{2}$",
        "$f'(x) = -x$",
        "$f'(x) = -1$",
      ],
      corrections: [
        "Correct ! $f(x) = \\frac{-x + 2}{2} = -\\frac{1}{2}x + 1$, donc $f'(x) = -\\frac{1}{2}$.",
        'Erreur de signe : la dérivée de $-\\frac{1}{2}x$ est $-\\frac{1}{2}$, pas $\\frac{1}{2}$.',
        "Erreur : vous n'avez pas pris en compte le coefficient $\\frac{1}{2}$.",
        'Erreur : vous avez oublié le facteur $\\frac{1}{2}$.',
      ],
    },
    {
      enonce: 'Quelle est la dérivée de $g(x) = \\frac{5}{9x}$ ?',
      reponses: [
        "$g'(x) = -\\frac{5}{9x^2}$",
        "$g'(x) = \\frac{5}{9x^2}$",
        "$g'(x) = -\\frac{5}{9}$",
        "$g'(x) = \\frac{1}{9x^2}$",
      ],
      corrections: [
        "Correct ! $g(x) = \\frac{5}{9} \\times \\frac{1}{x}$ et $(\\frac{1}{x})' = -\\frac{1}{x^2}$, donc $g'(x) = \\frac{5}{9} \\times (-\\frac{1}{x^2}) = -\\frac{5}{9x^2}$.",
        'Erreur de signe : la dérivée de $\\frac{1}{x}$ est $-\\frac{1}{x^2}$, pas $\\frac{1}{x^2}$.',
        'Erreur : vous avez oublié le terme en $x^2$ au dénominateur.',
        'Erreur : vous avez oublié le coefficient $5$.',
      ],
    },
    {
      enonce: 'Quelle est la dérivée de $h(x) = \\frac{1}{x}$ ?',
      reponses: [
        "$h'(x) = -\\frac{1}{x^2}$",
        "$h'(x) = \\frac{1}{x^2}$",
        "$h'(x) = -\\frac{1}{x}$",
        "$h'(x) = 0$",
      ],
      corrections: [
        "Correct ! C'est une formule de base : $(\\frac{1}{x})' = -\\frac{1}{x^2}$.",
        "Erreur de signe : n'oubliez pas le signe moins.",
        "Erreur : l'exposant au dénominateur doit être $2$, pas $1$.",
        "Erreur : la dérivée de $\\frac{1}{x}$ n'est pas nulle.",
      ],
    },
    {
      enonce: 'Quelle est la dérivée de $f(x) = x - 3$ ?',
      reponses: [
        "$f'(x) = 1$",
        "$f'(x) = x$",
        "$f'(x) = -3$",
        "$f'(x) = x - 3$",
      ],
      corrections: [
        "Correct ! La dérivée de $x$ est $1$ et la dérivée d'une constante est $0$, donc $f'(x) = 1 - 0 = 1$.",
        'Erreur : la dérivée de $x$ est $1$, pas $x$.',
        "Erreur : la dérivée d'une constante est $0$, pas la constante elle-même.",
        "Erreur : vous n'avez pas dérivé la fonction.",
      ],
    },
    {
      enonce: 'Quelle est la dérivée de $g(x) = -8x^2 - 8$ ?',
      reponses: [
        "$g'(x) = -16x$",
        "$g'(x) = -8x$",
        "$g'(x) = -16x - 8$",
        "$g'(x) = -8x^2$",
      ],
      corrections: [
        "Correct ! $(x^2)' = 2x$, donc $(-8x^2)' = -8 \\times 2x = -16x$ et $(-8)' = 0$.",
        "Erreur : vous avez oublié de multiplier par l'exposant $2$.",
        "Erreur : la dérivée d'une constante est $0$, pas la constante elle-même.",
        "Erreur : vous n'avez pas appliqué la règle de dérivation des puissances.",
      ],
    },
    {
      enonce: 'Quelle est la dérivée de $h(x) = 9x^3 + 8x^2 - 6x - 4$ ?',
      reponses: [
        "$h'(x) = 27x^2 + 16x - 6$",
        "$h'(x) = 9x^2 + 8x - 6$",
        "$h'(x) = 27x^2 + 16x - 6 - 4$",
        "$h'(x) = 3x^2 + 2x - 1$",
      ],
      corrections: [
        "Correct ! $(x^3)' = 3x^2$, $(x^2)' = 2x$, $(x)' = 1$ et $(constante)' = 0$. Donc $h'(x) = 9 \\times 3x^2 + 8 \\times 2x - 6 \\times 1 - 0 = 27x^2 + 16x - 6$.",
        'Erreur : vous avez oublié de multiplier par les exposants.',
        "Erreur : la dérivée d'une constante est $0$.",
        'Erreur : vous avez oublié les coefficients initiaux.',
      ],
    },
    {
      enonce:
        'Quelle est la dérivée de $f(x) = 5\\sqrt{x} - 5x^2 + 5x$ sur $\\mathbb{R}_+^*$ ?',
      reponses: [
        "$f'(x) = \\frac{5}{2\\sqrt{x}} - 10x + 5$",
        "$f'(x) = \\frac{5}{\\sqrt{x}} - 10x + 5$",
        "$f'(x) = \\frac{5}{2\\sqrt{x}} - 5x + 5$",
        "$f'(x) = 5\\sqrt{x} - 10x + 5$",
      ],
      corrections: [
        "Correct ! $(\\sqrt{x})' = \\frac{1}{2\\sqrt{x}}$, donc $(5\\sqrt{x})' = \\frac{5}{2\\sqrt{x}}$, $(-5x^2)' = -10x$ et $(5x)' = 5$.",
        "Erreur : $(\\sqrt{x})' = \\frac{1}{2\\sqrt{x}}$, pas $\\frac{1}{\\sqrt{x}}$.",
        "Erreur : $(-5x^2)' = -10x$, pas $-5x$.",
        "Erreur : vous n'avez pas dérivé le terme $\\sqrt{x}$.",
      ],
    },
    {
      enonce:
        'Quelle est la dérivée de $f(x) = 4x^2 - \\frac{3}{x}$ sur $\\mathbb{R}^*$ ?',
      reponses: [
        "$f'(x) = 8x + \\frac{3}{x^2}$",
        "$f'(x) = 8x - \\frac{3}{x^2}$",
        "$f'(x) = 4x + \\frac{3}{x^2}$",
        "$f'(x) = 8x - \\frac{3}{x}$",
      ],
      corrections: [
        "Correct ! $(4x^2)' = 8x$ et $(-\\frac{3}{x})' = -3 \\times (-\\frac{1}{x^2}) = \\frac{3}{x^2}$.",
        "Erreur de signe : $(-\\frac{3}{x})' = \\frac{3}{x^2}$, pas $-\\frac{3}{x^2}$.",
        "Erreur : $(4x^2)' = 8x$, pas $4x$.",
        "Erreur : vous n'avez pas correctement dérivé $\\frac{1}{x}$.",
      ],
    },
    {
      enonce:
        "Pour $h(x) = \\frac{3x + 3}{8x + 3}$, quelle est l'expression de $h'(x)$ ?",
      reponses: [
        "$h'(x) = \\frac{-15}{(8x + 3)^2}$",
        "$h'(x) = \\frac{15}{(8x + 3)^2}$",
        "$h'(x) = \\frac{-15}{8x + 3}$",
        "$h'(x) = \\frac{3 \\times 8 - 3 \\times 8}{(8x + 3)^2} = 0$",
      ],
      corrections: [
        "Correct ! En appliquant $(\\frac{u}{v})' = \\frac{u'v - uv'}{v^2}$ avec $u = 3x + 3$, $u' = 3$, $v = 8x + 3$, $v' = 8$ : $h'(x) = \\frac{3(8x + 3) - (3x + 3) \\times 8}{(8x + 3)^2} = \\frac{24x + 9 - 24x - 24}{(8x + 3)^2} = \\frac{-15}{(8x + 3)^2}$.",
        'Erreur de signe : le numérateur donne $9 - 24 = -15$, pas $15$.',
        'Erreur : vous avez oublié de mettre le dénominateur au carré dans la formule du quotient.',
        'Erreur de calcul : $3(8x + 3) - (3x + 3) \\times 8 = 24x + 9 - 24x - 24 = -15 \\neq 0$.',
      ],
    },
  ],
}

/**
 * Exercice QCM sur le calcul de dérivées
 * Basé sur les exercices 1AN10-1, 1AN14-1, 1AN14-3, 1AN14-4, 1AN14-6
 *
 * Questions couvrant :
 * - Définition de la dérivée
 * - Dérivées des fonctions usuelles
 * - Dérivées de fonctions composées
 * - Dérivées de quotients
 */
const ExerciceQcmDerivation = createQcmFromJson(qcmData)

export default ExerciceQcmDerivation
