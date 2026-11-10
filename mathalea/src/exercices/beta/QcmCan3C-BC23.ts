import { createQcmFromJson } from './qcmUtils'

// Export des métadonnées requises
export const uuid = '3cbc33'
export const titre = 'QCM CAN 3e - BC23'
export const dateDePublication = '3/7/2025'
export const refs = [
  {
    'fr-fr': [],
    'fr-ch': [],
  },
]
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
const qcmData = {
  titre: 'QCM - CAN 3e (BC23)',
  consigne: 'Choisissez la bonne réponse parmi les propositions suivantes.',
  options: {
    vertical: false,
    ordered: false,
    lastChoice: 8,
  },
  questions: [
    {
      enonce: 'Donner le tiers de $3^{34}$.',
      reponses: ['$3^{33}$', '$3^{11}$', '$\\frac{3^{34}}{3}$', '$3^{31}$'],
      corrections: [
        'Correct ! Le tiers de $3^{34}$ se calcule par $3^{34} \\div 3 = \\frac{3^{34}}{3} = 3^{34-1} = 3^{33}$',
        "Erreur : vous avez divisé l'exposant par 3 au lieu de soustraire 1. $\\frac{3^{34}}{3} = 3^{34-1}$",
        "Cette expression n'est pas simplifiée. Il faut utiliser la propriété $\\frac{a^m}{a^n} = a^{m-n}$",
        "Erreur : vous avez soustrait 3 à l'exposant au lieu de 1. $\\frac{3^{34}}{3^1} = 3^{34-1}$",
      ],
    },
    {
      enonce: 'Calculer la moyenne des nombres : $13,7$ ; $22,5$ ; $5,8$',
      reponses: ['$14$', '$42$', '$13,7$', '$14,33$'],
      corrections: [
        'Correct ! Moyenne = $\\frac{13,7 + 22,5 + 5,8}{3} = \\frac{42}{3} = 14$',
        'Erreur : vous avez oublié de diviser par le nombre de valeurs. $42 \\div 3 = 14$',
        'Erreur : ceci est seulement la première valeur, pas la moyenne des trois',
        'Erreur : vous avez divisé par le mauvais nombre ou fait une erreur de calcul',
      ],
    },
    {
      enonce: 'Rendre la fraction $\\frac{6}{8}$ irréductible.',
      reponses: [
        '$\\frac{3}{4}$',
        '$\\frac{6}{8}$',
        '$\\frac{12}{16}$',
        '$\\frac{2}{3}$',
      ],
      corrections: [
        'Correct ! $\\frac{6}{8} = \\frac{3 \\times 2}{4 \\times 2} = \\frac{3}{4}$ (on divise par le PGCD qui est 2)',
        "Erreur : cette fraction n'est pas irréductible, elle peut être simplifiée par 2",
        'Erreur : vous avez multiplié au lieu de diviser. Pour simplifier, il faut diviser par le PGCD',
        "Erreur : ce n'est pas égal à $\\frac{6}{8}$. Vérifiez : $2 \\times 8 = 16 \\neq 3 \\times 6 = 18$",
      ],
    },
    {
      enonce:
        "Calculer sous la forme d'une fraction irréductible : $1 + \\frac{1}{7}$",
      reponses: [
        '$\\frac{8}{7}$',
        '$\\frac{2}{7}$',
        '$\\frac{1}{8}$',
        '$\\frac{7}{8}$',
      ],
      corrections: [
        'Correct ! $1 + \\frac{1}{7} = \\frac{7}{7} + \\frac{1}{7} = \\frac{8}{7}$',
        'Erreur : vous avez additionné les numérateurs sans tenir compte du dénominateur de 1',
        'Erreur : vous avez inversé le résultat. $1 + \\frac{1}{7} > 1$, donc ne peut pas égaler $\\frac{1}{8}$',
        "Erreur : vérifiez votre calcul. Il faut mettre 1 sous la forme $\\frac{7}{7}$ avant d'additionner",
      ],
    },
    {
      enonce:
        'Calculer sous forme décimale $B = 4,5 \\times 10^1 + 5,5 \\times 10^3$',
      reponses: ['$5\\,545$', '$10$', '$5\\,050$', '$55\\,45$'],
      corrections: [
        'Correct ! $B = 4,5 \\times 10 + 5,5 \\times 1000 = 45 + 5500 = 5545$',
        'Erreur : vous avez additionné les coefficients sans tenir compte des puissances de 10',
        'Erreur : vous avez mal calculé une des multiplications. $5,5 \\times 10^3 = 5500$, pas 5000',
        'Erreur : vous avez confondu les puissances. $10^1 = 10$ et $10^3 = 1000$',
      ],
    },
  ],
}

// Création de l'exercice QCM à partir du JSON
const ExerciceQcmCan3C = createQcmFromJson(qcmData)

export default ExerciceQcmCan3C
