import { propositionsQcm } from '../../lib/interactif/qcm'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Déterminer la limite d’une somme géométrique'
export const dateDePublication = '05/08/2026'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

export const uuid = 'a61e7'
export const refs = {
  'fr-fr': ['TSA1-27', 'TCA1-17'],
  'fr-ch': [],
}

type TypeQuestion =
  | 'raisonEntreZeroEtUn'
  | 'raisonEntreMoinsUnEtZero'
  | 'raisonSuperieureUn'
  | 'raisonEgaleMoinsUn'
  | 'raisonInferieureMoinsUn'

type DonneesQuestion = {
  q: string
  reponse: string
  correction: string
  distracteurProche?: string
}

const raisonsEntreZeroEtUn: Array<[number, number]> = [
  [1, 2],
  [1, 3],
  [2, 3],
  [1, 4],
  [3, 4],
  [2, 5],
  [3, 5],
  [4, 5],
]

const raisonsEntreMoinsUnEtZero: Array<[number, number]> = [
  [-1, 2],
  [-1, 3],
  [-2, 3],
  [-1, 4],
  [-3, 4],
  [-2, 5],
  [-3, 5],
  [-4, 5],
]

function formuleSommeGeometrique(q: string, formeSimplifiee = ''): string {
  return `$\\begin{aligned}
\\phantom{\\iff}&\\quad u_n=1+\\left(${q}\\right)+\\left(${q}\\right)^2+\\cdots+\\left(${q}\\right)^n\\\\
&\\iff\\quad u_n=\\dfrac{1-\\left(${q}\\right)^{n+1}}{1-\\left(${q}\\right)}${
    formeSimplifiee === ''
      ? ''
      : `\\\\
&\\iff\\quad u_n=${formeSimplifiee}`
  }
\\end{aligned}$`
}

function correctionRaisonDeValeurAbsolueInferieureAUn(q: FractionEtendue): {
  reponse: string
  correction: string
  distracteurProche: string
} {
  const limite = new FractionEtendue(q.den, q.den - q.num)
  const reponse = limite.texFractionSimplifiee
  const distracteurProche = new FractionEtendue(
    2 * limite.num + 1,
    2 * limite.den,
  ).texFractionSimplifiee
  return {
    reponse,
    distracteurProche,
    correction: `D’après le cours, si $q\\neq 1$, on sait que $\\displaystyle 1+q+q^2+\\cdots+q^n=\\dfrac{1-q^{n+1}}{1-q}$.<br>On obtient donc ici :<br>${formuleSommeGeometrique(q.texFraction)}<br><br>Comme $${q.texFraction}\\in]-1\\,;\\,1[$, on sait, d’après le cours, que :<br>$\\begin{aligned}
\\phantom{\\iff}&\\quad \\displaystyle \\lim_{n\\to+\\infty}\\left(${q.texFraction}\\right)^{n+1}=0\\\\
&\\iff\\quad \\displaystyle \\lim_{n\\to+\\infty}\\left(1-\\left(${q.texFraction}\\right)^{n+1}\\right)=1.
\\end{aligned}$<br><br>Le dénominateur $1-${q.texFraction}$ est constant et non nul. Par quotient :<br>$\\begin{aligned}
\\displaystyle \\lim_{n\\to+\\infty}u_n
&=\\dfrac{1}{1-\\left(${q.texFraction}\\right)}\\\\
&=\\dfrac{1}{\\dfrac{${q.den - q.num}}{${q.den}}}\\\\
&=\\dfrac{${q.den}}{${q.den - q.num}}\\\\
&=${miseEnEvidence(reponse)}.
\\end{aligned}$`,
  }
}

/**
 * Limites des sommes 1+q+...+q^n selon la valeur de q.
 * @author Stéphane Guyon
 */
export default class LimitesSommesGeometriques extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Déterminer, si elle existe, la limite de la suite lorsque $n$ tend vers $+\\infty$.'
        : 'Déterminer, si elle existe, la limite de chacune des suites lorsque $n$ tend vers $+\\infty$.'

    const typesDeQuestions = combinaisonListes<TypeQuestion>(
      [
        'raisonEntreZeroEtUn',
        'raisonEntreMoinsUnEtZero',
        'raisonSuperieureUn',
        'raisonEgaleMoinsUn',
        'raisonInferieureMoinsUn',
      ],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = typesDeQuestions[i]
      let donnees: DonneesQuestion

      switch (type) {
        case 'raisonEntreZeroEtUn':
        case 'raisonEntreMoinsUnEtZero': {
          const [numerateur, denominateur] = choice(
            type === 'raisonEntreZeroEtUn'
              ? raisonsEntreZeroEtUn
              : raisonsEntreMoinsUnEtZero,
          )
          const q = new FractionEtendue(numerateur, denominateur)
          const resultat = correctionRaisonDeValeurAbsolueInferieureAUn(q)
          donnees = {
            q: q.texFraction,
            reponse: resultat.reponse,
            correction: resultat.correction,
            distracteurProche: resultat.distracteurProche,
          }
          break
        }
        case 'raisonSuperieureUn': {
          const q = randint(2, 5)
          donnees = {
            q: String(q),
            reponse: '+\\infty',
            correction: `D’après le cours, si $q\\neq 1$, on sait que $\\displaystyle 1+q+q^2+\\cdots+q^n=\\dfrac{1-q^{n+1}}{1-q}$.<br>On obtient donc ici :<br>${formuleSommeGeometrique(String(q))}<br><br>Comme $${q}>1$, on sait, d’après le cours, que :<br>$\\begin{aligned}
\\phantom{\\iff}&\\quad \\displaystyle \\lim_{n\\to+\\infty}${q}^{n+1}=+\\infty\\\\
&\\iff\\quad \\displaystyle \\lim_{n\\to+\\infty}\\left(1-${q}^{n+1}\\right)=-\\infty.
\\end{aligned}$<br><br>Le dénominateur $1-${q}$ est constant et strictement négatif. Par quotient, $\\displaystyle \\lim_{n\\to+\\infty}u_n=${miseEnEvidence('+\\infty')}$.`,
          }
          break
        }
        case 'raisonEgaleMoinsUn':
          donnees = {
            q: '-1',
            reponse: 'Pas de limite',
            correction: `D’après le cours, si $q\\neq 1$, on sait que $\\displaystyle 1+q+q^2+\\cdots+q^n=\\dfrac{1-q^{n+1}}{1-q}$.<br>On obtient donc ici :<br>${formuleSommeGeometrique('-1', '\\dfrac{1+(-1)^n}{2}')}<br><br>D’après le cours, $(-1)^{2n}=1$ et $(-1)^{2n+1}=-1$. Ainsi :<br>$\\begin{aligned}
u_{2n}&=\\dfrac{1+(-1)^{2n}}{2}=\\dfrac{1+1}{2}=1\\\\
u_{2n+1}&=\\dfrac{1+(-1)^{2n+1}}{2}=\\dfrac{1-1}{2}=0.
\\end{aligned}$<br><br>La suite $(u_n)$ alterne donc entre $1$ et $0$ ; elle n’a pas de limite.`,
          }
          break
        case 'raisonInferieureMoinsUn': {
          const q = -randint(2, 5)
          donnees = {
            q: String(q),
            reponse: 'Pas de limite',
            correction: `D’après le cours, si $q\\neq 1$, on sait que $\\displaystyle 1+q+q^2+\\cdots+q^n=\\dfrac{1-q^{n+1}}{1-q}$.<br>On obtient donc ici :<br>${formuleSommeGeometrique(String(q))}<br><br>Comme $${q}\\in]-\\infty\\,;\\,-1[$, on sait, d’après le cours, que les puissances paires de $${q}$ tendent vers $+\\infty$ et ses puissances impaires vers $-\\infty$. La suite $\\left((${q})^n\\right)$ n’a donc pas de limite.<br><br>Les termes d’indices pairs et impairs de $(u_n)$ ont alors des comportements différents. La suite $(u_n)$ n’a donc pas de limite.`,
          }
          break
        }
      }

      const bonneReponse =
        donnees.reponse === 'Pas de limite'
          ? 'Pas de limite'
          : `$${donnees.reponse}$`
      const distracteurs = [
        ...(donnees.distracteurProche == null
          ? []
          : [`$${donnees.distracteurProche}$`]),
        ...shuffle(['$0$', '$+\\infty$', '$-\\infty$', 'Pas de limite', '$1$']),
      ].filter(
        (proposition, index, liste) =>
          proposition !== bonneReponse && liste.indexOf(proposition) === index,
      )

      this.autoCorrection[i] = {
        enonce: '',
        options: { radio: true, vertical: false, ordered: true },
        propositions: shuffle([
          { texte: bonneReponse, statut: true },
          ...distracteurs
            .slice(0, 3)
            .map((texte) => ({ texte, statut: false })),
        ]),
      }

      const texte = `Soit $q=${donnees.q}$. La suite $(u_n)$ est définie, pour tout entier naturel $n$, par :<br>$u_n=1+q+q^2+\\cdots+q^n$.<br>${propositionsQcm(this, i).texte}`
      const reponseFinale =
        donnees.reponse === 'Pas de limite'
          ? texteEnCouleurEtGras('Pas de limite')
          : `$${miseEnEvidence(donnees.reponse)}$`
      const texteCorr = `${donnees.correction}<br>La bonne réponse est ${reponseFinale}.`

      if (this.questionJamaisPosee(i, donnees.q)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
