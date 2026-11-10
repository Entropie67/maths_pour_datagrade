import { shuffle } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import Exercice from '../Exercice'

/**
 * @author Stéphane Guyon
 */
export const uuid = '81ed3'
export const refs = {
  'fr-fr': ['TSG1-10'],
  'fr-ch': [],
}
export const titre = 'Répondre à des affirmations Bac sur le dénombrement'
export const dateDePublication = '09/06/2026'

type AffirmationItem = {
  enonce: string
  correction: string
}

function correctionAvecConclusion(correction: string): string {
  const estVraie = correction.startsWith('Vraie.<br>')
  const estFausse = correction.startsWith('Fausse.<br>')
  if (!estVraie && !estFausse) return correction

  const corps = correction.replace(/^(Vraie|Fausse)\.<br>/, '')
  const verdict = estVraie ? 'vraie' : 'fausse'
  return `${corps}<br><br>Conclusion : l’affirmation est ${texteEnCouleurEtGras(verdict)}.`
}

function enonceAvecConsigne(enonce: string): string {
  const consigne = 'Déterminer si l’affirmation suivante est vraie ou fausse : '
  const positionConsigne = enonce.indexOf(consigne)
  if (positionConsigne === -1) return enonce

  const contexte = enonce.slice(0, positionConsigne)
  const affirmation = enonce
    .slice(positionConsigne + consigne.length)
    .replace(/^([a-zàâäéèêëîïôöùûüç])/iu, (lettre) =>
      lettre.toLocaleUpperCase('fr-FR'),
    )

  return `${contexte}<br><br>${texteEnCouleurEtGras('Déterminer si l’affirmation suivante est vraie ou fausse :', 'black')}<br>${affirmation}`
}

const affirmationsDenombrement: AffirmationItem[] = [
  {
    enonce:
      'Le code d’un immeuble est composé de $4$ chiffres, qui peuvent être identiques, suivis de deux lettres distinctes parmi A, B et C.Déterminer si l’affirmation suivante est vraie ou fausse : il existe $20\\ 634$ codes qui contiennent au moins un $0$.',
    correction:
      'Vraie.<br>Il y a $10 \\times 10 \\times 10 \\times 10 \\times 3 \\times 2 = 60\\ 000$ codes possibles.<br>Déterminons le nombre de codes ne contenant pas de $0$ : il y a $9\\times 9 \\times 9 \\times 9 \\times 3 \\times 2 = 39\\ 366$ codes ne contenant pas de $0$.<br>Il y a donc $60\\ 000 -39\\ 366=20\\ 634$ codes contenant au moins un zéro.',
  },
  {
    enonce:
      'Deux équipes de footballeurs de $22$ et $25$ joueurs échangent une poignée de main à la fin d’un match. Chaque joueur d’une équipe serre une seule fois la main de chaque joueur de l’autre équipe.Déterminer si l’affirmation suivante est vraie ou fausse : $47$ poignées de mains ont été échangées.',
    correction:
      'Fausse.<br>Chaque joueur de l’équipe de $22$ joueurs serre $25$ mains ; cela fait donc en tout $22\\times 25 = 550$ poignées de main.',
  },
  {
    enonce:
      'Une course oppose $18$ concurrents. On récompense indistinctement les trois premiers en offrant le même prix à chacun.Déterminer si l’affirmation suivante est vraie ou fausse : il y a $4\\ 896$ possibilités de distribuer ces prix.',
    correction:
      'Fausse.<br>Comme on récompense indistinctement les trois premiers en offrant le même prix à chacun, il faut chercher le nombre d’ensembles à $3$ éléments parmi $18$, soit $\\displaystyle\\binom{18}{3}=816$.',
  },
  {
    enonce:
      'Une association organise une compétition de course de haies qui permettra d’établir un podium, constitué des trois meilleurs sportifs classés dans leur ordre d’arrivée. Sept sportifs participent au tournoi. Jacques est l’un d’entre eux.Déterminer si l’affirmation suivante est vraie ou fausse : il y a $90$ podiums différents dont Jacques fait partie.',
    correction:
      'Vraie.<br>Jacques est sur le podium, donc il a décroché une des $3$ premières places.<br>Si Jacques finit $1^{\\mathrm{er}}$, il y a $6$ possibilités pour le $2^{\\mathrm{e}}$ et $5$ possibilités pour le $3^{\\mathrm{e}}$, soit $30$ podiums.<br>Si Jacques finit $2^{\\mathrm{e}}$, il y a $6$ possibilités pour le $1^{\\mathrm{er}}$ et $5$ possibilités pour le $3^{\\mathrm{e}}$, soit $30$ podiums.<br>Si Jacques finit $3^{\\mathrm{e}}$, il y a $6$ possibilités pour le $1^{\\mathrm{er}}$ et $5$ possibilités pour le $2^{\\mathrm{e}}$, soit $30$ podiums.<br>Il y a donc $90$ podiums différents dont Jacques fait partie.',
  },
  {
    enonce:
      'Une anagramme d’un mot est le résultat d’une permutation des lettres de ce mot. Par exemple, le mot BAC possède $6$ anagrammes : BAC, BCA, ABC, ACB, CAB, CBA.Déterminer si l’affirmation suivante est vraie ou fausse : le mot EULER possède $120$ anagrammes.',
    correction:
      'Fausse.<br>Avec $5$ lettres différentes, le nombre d’anagrammes serait égal à $5! = 120$.<br>Comme EULER possède deux lettres identiques, le nombre d’anagrammes est égal à $\\dfrac{5!}{2!} = \\dfrac{120}{2} = 60$.',
  },
  {
    enonce:
      'Un cube possède $8$ sommets. On s’intéresse au nombre $N$ de segments que l’on peut construire en reliant $2$ sommets distincts quelconques du cube.Déterminer si l’affirmation suivante est vraie ou fausse : $N = \\dfrac{8^2}{2}$.',
    correction:
      'Fausse.<br>Pour former un segment, on doit choisir $2$ sommets distincts parmi ces $8$ sommets. L’ordre n’a pas d’importance : le segment reliant A à B est le même que celui reliant B à A.<br>On utilise donc une combinaison : $\\displaystyle\\binom{8}{2} = \\dfrac{8!}{2!(8-2)!} = \\dfrac{8\\times 7}{2\\times 1}=28$.<br>Il existe $28$ segments pouvant relier deux sommets distincts d’un cube, alors que $\\dfrac{8^2}{2}=32$.',
  },
  {
    enonce:
      'Lorsqu’une personne achète son billet en ligne, un code de validation lui est envoyé par SMS afin qu’elle confirme son achat. Ce code est généré de façon aléatoire et est constitué de $4$ chiffres deux à deux distincts, le premier chiffre étant différent de $0$.Déterminer si l’affirmation suivante est vraie ou fausse : le nombre de codes différents pouvant être générés est $5\\ 040$.',
    correction:
      'Fausse.<br>Le premier chiffre doit être choisi parmi les $9$ chiffres non nuls.<br>Pour le deuxième chiffre, on a $9$ choix possibles, car il doit être différent du premier.<br>Pour le troisième chiffre, on a $8$ choix possibles, et pour le quatrième, $7$ choix possibles.<br>Ainsi, par principe multiplicatif, il existe $9\\times 9\\times 8\\times 7=4\\ 536$ codes différents.',
  },
  {
    enonce:
      'Soient $n$ et $k$ deux entiers naturels non nuls tels que $k \\leqslant n$.Déterminer si l’affirmation suivante est vraie ou fausse : $n \\times\\binom{n-1}{k-1}=k \\times\\binom{n}{k}$.',
    correction:
      'Vraie.<br>On utilise les propriétés $\\dfrac{k}{k!}=\\dfrac{1}{(k-1)!}$ et $n!=n\\times(n-1)!$.<br>D’une part, $\\displaystyle k\\times\\binom{n}{k}=k\\times\\dfrac{n!}{k!\\times(n-k)!}=\\dfrac{n!}{(k-1)!\\times(n-k)!}$.<br>D’autre part, $\\displaystyle\\binom{n-1}{k-1}=\\dfrac{(n-1)!}{(k-1)!\\times((n-1)-(k-1))!}=\\dfrac{(n-1)!}{(k-1)!\\times(n-k)!}$.<br>Donc $\\displaystyle n\\times\\binom{n-1}{k-1}=\\dfrac{n\\times(n-1)!}{(k-1)!\\times(n-k)!}=\\dfrac{n!}{(k-1)!\\times(n-k)!}$.<br>Les deux membres sont donc égaux.',
  },
  {
    enonce:
      'Dans une classe de terminale, il y a $18$ filles et $14$ garçons. On constitue une équipe de volley-ball en choisissant au hasard $3$ filles et $3$ garçons.Déterminer si l’affirmation suivante est vraie ou fausse : il y a $297\\ 024$ possibilités pour former une telle équipe.',
    correction:
      'Vraie.<br>Une équipe est constituée d’un ensemble de $3$ filles et d’un ensemble de $3$ garçons. L’ordre n’intervient pas, donc on utilise des combinaisons.<br>Il y a $\\displaystyle\\binom{18}{3}=816$ façons de choisir les trois filles et $\\displaystyle\\binom{14}{3}=364$ façons de choisir les trois garçons.<br>Par principe multiplicatif, il y a donc $816\\times 364 = 297\\ 024$ équipes différentes possibles.',
  },
  {
    enonce:
      'Soient $E$ et $F$ les ensembles $E = \\{1~;~2~;~3~;~4~;~5~;~6~;~7\\}$ et $F = \\{0~;~1~;~2~;~3~;~4~;~5~;~6~;~7~;~8~;~9\\}$.Déterminer si l’affirmation suivante est vraie ou fausse : il y a davantage de $3$-uplets d’éléments distincts de $E$ que de combinaisons à $4$ éléments de $F$.',
    correction:
      'Fausse.<br>On a $\\mathrm{Card}(E)=7$ et $\\mathrm{Card}(F)=10$.<br>Les $3$-uplets d’éléments distincts de $E$ sont des arrangements de $3$ éléments distincts choisis parmi $7$. Il y en a donc $\\dfrac{7!}{(7-3)!}=\\dfrac{7!}{4!}=7\\times 6\\times 5=210$.<br>Les combinaisons à $4$ éléments de $F$ sont des ensembles de $4$ éléments choisis parmi $10$. Il y en a $\\displaystyle\\binom{10}{4}=\\dfrac{10!}{(10-4)!\\times4!}=210$.<br>Il y a donc exactement le même nombre, et pas davantage, de $3$-uplets d’éléments distincts de $E$ que de combinaisons à $4$ éléments de $F$.',
  },
  {
    enonce:
      'Dans une classe de $24$ élèves, il y a $14$ filles et $10$ garçons.Déterminer si l’affirmation suivante est vraie ou fausse : il est possible de constituer $272$ groupes différents de quatre élèves composés de deux filles et deux garçons.',
    correction:
      'Vraie.<br>Le nombre total de groupes de quatre élèves composés de deux filles et deux garçons est $\\displaystyle\\binom{14}{2}\\times\\binom{10}{2}=4\\ 095$.<br>Comme $272 < 4\\ 095$, il est possible de constituer $272$ groupes différents de quatre élèves composés de deux filles et deux garçons.',
  },
  {
    enonce:
      'Un élève de première générale choisit trois spécialités parmi les douze proposées.Déterminer si l’affirmation suivante est vraie ou fausse : le nombre de combinaisons possibles est $220$.',
    correction:
      'Vraie.<br>On choisit $3$ spécialités parmi $12$, sans tenir compte de l’ordre. Il y a donc $\\displaystyle\\binom{12}{3}=\\dfrac{12!}{3!(12-3)!}=\\dfrac{12\\times11\\times10}{3\\times2\\times1}=220$ combinaisons possibles.',
  },
]

/**
 * Série statique d'affirmations de Bac sur le dénombrement.
 *
 * @author Stéphane Guyon
 */
export default class QcmDenombrementAffirmations extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.nbQuestionsModifiable = true
    this.spacing = 2
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    this.listeQuestions = []
    this.listeCorrections = []

    const nbQuestions = Math.min(
      this.nbQuestions,
      affirmationsDenombrement.length,
    )
    const questions = shuffle(affirmationsDenombrement).slice(0, nbQuestions)

    for (const [index, affirmation] of questions.entries()) {
      this.listeQuestions[index] = enonceAvecConsigne(affirmation.enonce)
      this.listeCorrections[index] = correctionAvecConclusion(
        affirmation.correction,
      )
    }
  }
}
