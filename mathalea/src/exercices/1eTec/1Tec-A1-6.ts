import { miseEnEvidence } from '../../lib/outils/embellissements'
import { choice } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const titre = 'Calculer des proportions de proportions'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDeModifImportante = '10/10/2026'
/**
* Modèle d'exercice très simple pour la course aux nombres
* @author Stéphane Guyon et Gilles Mora pour augmenter les cas

* Date de publication
*/
export const uuid = 'f0c23'

export const refs = {
  'fr-fr': ['2I12-1'],
  'fr-ch': ['10CTFA1D-6', '10LCFA1D-6', '10LSFA1D-6'],
}
type Situation = 'association' | 'lycee' | 'election'

/**
 * Fractions simples [numérateur, dénominateur] utilisées pour p1 et p2
 * quand les proportions sont données sous forme de fractions.
 */
const listesFractions: Record<Situation, { p1: number[][]; p2: number[][] }> = {
  association: {
    p1: [
      [1, 2],
      [1, 3],
      [1, 4],
      [2, 5],
      [3, 4],
    ],
    p2: [
      [1, 2],
      [1, 3],
      [2, 3],
      [1, 4],
      [3, 4],
      [1, 5],
      [2, 5],
    ],
  },
  lycee: {
    p1: [
      [1, 3],
      [1, 4],
      [1, 5],
      [3, 10],
    ],
    p2: [
      [1, 2],
      [1, 3],
      [1, 4],
      [2, 5],
      [3, 5],
    ],
  },
  election: {
    p1: [
      [1, 2],
      [3, 5],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
    p2: [
      [1, 2],
      [1, 3],
      [1, 4],
      [1, 5],
      [2, 5],
      [3, 10],
    ],
  },
}

/**
 * Écrit le calcul f1 × f2 détaillé, avec la simplification finale si besoin.
 */
function texProduitFractions(f1: FractionEtendue, f2: FractionEtendue) {
  const brut = new FractionEtendue(f1.num * f2.num, f1.den * f2.den)
  const resultat = brut.simplifie()
  let tex = `${f1.texFraction}\\times ${f2.texFraction}=\\dfrac{${f1.num}\\times ${f2.num}}{${f1.den}\\times ${f2.den}}=${brut.texFraction}`
  if (resultat.den !== brut.den) tex += `=${resultat.texFraction}`
  return tex
}

/**
 * Tire p1 = b % et p2 = c % simples à manipuler de tête : b × c est un multiple
 * de 100 (résultat entier) et c est un multiple de 10.
 * Pour retrouver p2 (versions « Bis »), b vaut 10, 20 ou 50 % : diviser par
 * 0,1, 0,2 ou 0,5 revient à multiplier par 10, 5 ou 2.
 * @returns [b, c]
 */
function valeursSansCalculatrice(
  situation: Situation,
  retrouverP2: boolean,
): [number, number] {
  const listesB: Record<Situation, number[]> = {
    association: [10, 20, 25, 50],
    lycee: [20, 25, 30, 40],
    election: [40, 50, 60, 80],
  }
  const listesC: Record<Situation, number[]> = {
    association: [20, 30, 40, 50],
    lycee: [10, 20, 30, 40, 50, 60, 70],
    election: [10, 20, 30, 40, 50, 60, 70],
  }
  const listesBRetrouverP2: Record<Situation, number[]> = {
    association: [10, 20, 50],
    lycee: [20],
    election: [50],
  }
  const b = choice(
    retrouverP2 ? listesBRetrouverP2[situation] : listesB[situation],
  )
  const c = choice(
    listesC[situation].filter((valeur) => (b * valeur) % 100 === 0),
  )
  return [b, c]
}

export default class ProportiondeProportion extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5

    this.optionsChampTexte = { texteApres: ' %' }
    this.besoinFormulaireCaseACocher = ['Sans calculatrice', false]
    this.sup = false
    this.besoinFormulaire2Numerique = [
      'Forme des proportions',
      3,
      '1 : Pourcentage\n2 : Fraction\n3 : Mélange',
    ]
    this.sup2 = 1
  }

  nouvelleVersion() {
    let a, b, c, d, g, tauxb, tauxc, tauxG
    const cas = choice([
      'association',
      'lycee',
      'lyceeBis',
      'election',
      'associationBis',
      'electionBis',
    ])
    // En mode mélange, la forme est tirée à chaque question
    const forme = Number(this.sup2) === 3 ? choice([1, 2]) : Number(this.sup2)
    if (forme === 2) {
      this.versionFraction(cas)
      if (this.interactif) this.question += '<br>'
      return
    }
    this.optionsChampTexte = { texteApres: ' %' }
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = {}
    switch (
      cas //
    ) {
      case 'association':
        if (this.sup) {
          ;[b, c] = valeursSansCalculatrice('association', false)
          a = randint(20, 50)
          d = randint(2, 15)
          tauxb = b / 100
          tauxc = c / 100
        } else {
          b = randint(3, 80)
          tauxb = b / 100
          a = randint(20, 50)
          c = randint(20, 50)
          tauxc = c / 100
          d = randint(2, 15)
        }
        g = (b * c) / 100
        tauxG = (b * c) / 10000

        this.question = `Dans une association, $${b}\\,\\%$ des adhérents ont plus de $${a}$ ans. 
        Parmi eux, $${c}\\,\\%$ ont plus de $${d}$ années d'ancienneté.<br>
        Quel est le pourcentage d'adhérents de plus de $${a}$ ans ayant plus de $${d}$ années d'ancienneté dans cette association ?<br>`
        this.correction = `La population de référence est celle des membres de l'association.<br>
        La première sous-population est celle des plus de $${a}$ ans,
        qui représente $p_1=${b}\\,\\%$ de la population de référence. <br>
        Dans cette sous-population, on sait que la population de ceux qui ont plus de $${d}$ années d'ancienneté représente $p_2=${c}\\,\\%$.<br>
        <br> D'après le cours, on calcule $p=p_1\\times p_2$, ce qui représente $${b}\\,\\%$ de $${c}\\,\\%$.<br>
      <br>Ainsi, $p=${texNombre(tauxb)}\\times ${texNombre(tauxc)}=${texNombre(tauxG, 4)}$.<br>
      Il y a donc $${miseEnEvidence(texNombre(g, 2))}\\,\\%$ d'adhérents de plus de $${a}$ ans ayant plus de $${d}$ années d'ancienneté.`
        this.reponse = g.toFixed(2)
        break
      case 'associationBis':
        if (this.sup) {
          ;[b, c] = valeursSansCalculatrice('association', true)
          a = randint(35, 50)
          d = randint(3, 15)
          tauxb = b / 100
          tauxc = c / 100
        } else {
          b = randint(3, 80)
          tauxb = b / 100
          a = randint(35, 50)
          c = randint(20, 50)
          tauxc = c / 100
          d = randint(3, 15)
        }
        g = (b * c) / 100
        tauxG = (b * c) / 10000

        this.question = `Dans une association, $${b}\\,\\%$ des adhérents ont plus de $${a}$ ans. 
       On dénombre également dans cette association $${texNombre(g, 2)}\\,\\%$ d'adhérents de plus $${a}$ ans ayant plus de $${d}$ années d'ancienneté.<br>
       Parmi les adhérents de plus de $${a}$ ans, quel est le pourcentage de ceux qui ont plus de $${d}$ années d'ancienneté ?<br> `
        this.correction = `La population de référence est celle des membres de l'association.<br>
        La première sous-population est celle des plus de $${a}$ ans,
        qui représente $p_1=${b}\\,\\%$ de la population de référence. <br>
        Dans cette sous-population, on note $p_2$ la proportion de ceux qui ont plus de $${d}$ années d'ancienneté.<br>
        La proportion $P$ des adhérents de plus $${a}$ ans qui ont plus de $${d}$ ans d'ancienneté est $P=${texNombre(g, 2)}\\,\\%$.<br>
        <br> D'après le cours, on a $P=p_1\\times p_2$, ce qui donne $${texNombre(tauxG, 4)}=${texNombre(tauxb, 2)}\\times p_2$<br>
        <br>Ainsi, $p_2=\\dfrac{${texNombre(tauxG, 4)}}{${texNombre(tauxb, 2)}}=${texNombre(tauxc, 4)}$.<br>
      Il y a donc $${miseEnEvidence(texNombre(c, 2))}\\,\\%$ d'adhérents de plus de $${d}$ ans d'ancienneté parmi les adhérents de plus de $${a}$ ans.`
        this.reponse = c.toString()
        break

      case 'lycee':
        if (this.sup) {
          ;[b, c] = valeursSansCalculatrice('lycee', false)
          a = randint(20, 50)
          tauxb = b / 100
          tauxc = c / 100
        } else {
          b = randint(20, 40)
          tauxb = b / 100
          a = randint(20, 50)
          c = randint(10, 70)
          tauxc = c / 100
        }
        g = (b * c) / 100
        tauxG = (b * c) / 10000
        this.question = `Dans un lycée, $${b}\\,\\%$ des lycéens sont en classe de première. 
            Parmi eux, $${c}\\,\\%$ sont en filière technologique.<br>
            Quel est le pourcentage d'élèves en première technologique de ce lycée ?<br>`
        this.correction = `La population de référence est celle des élèves du lycée.<br>
            La sous-population est celle des élèves de première et d'après l'énoncé, $p_1=${b}\\,\\%$.<br>
             Les élèves de 1ère technologique sont une sous-population des élèves de première, qui représente d'après l'énoncé, $p_2=${c}\\,\\%$. <br>
             <br>Pour connaitre la proportion $p$ des élèves de première technologique par rapport à la population de référence (les élèves du lycée), on calcule $p=p_1\\times p_2$, ce qui revient à calculer $${b}\\,\\%$ de $${c}\\,\\%$.<br>
             <br>Ainsi, $p=${texNombre(b / 100)}\\times ${texNombre(tauxc, 2)}=${texNombre(tauxG, 4)}$.<br>
             Il y a $${miseEnEvidence(texNombre(g, 2))}\\,\\%$ d'élèves de première technologique parmi les élèves du lycée.`
        this.reponse = g.toFixed(2)
        break
      case 'lyceeBis':
        if (this.sup) {
          ;[b, c] = valeursSansCalculatrice('lycee', true)
          a = randint(20, 50)
          tauxb = b / 100
          tauxc = c / 100
        } else {
          b = randint(20, 40)
          tauxb = b / 100
          a = randint(20, 50)
          c = randint(10, 70)
          tauxc = c / 100
        }
        g = (b * c) / 100
        tauxG = (b * c) / 10000
        this.question = `Dans un lycée, $${b}\\,\\%$ des lycéens sont en classe de première et $${texNombre(g, 2)}\\,\\%$ des lycéens sont en première technologique.
              Quel est le pourcentage d'élèves en première technologique parmi les élèves de première du lycée ?<br>`
        this.correction = `La population de référence est celle des élèves du lycée.<br>
              La sous-population est celle des élèves de première et d'après l'énoncé, $p_1=${b}\\,\\%$.<br>
              Dans cette sous-population, on note $p_2$ la proportion des élèves en première technologique.<br>
              La proportion $P$ des élèves en première technologique parmi les élèves du lycée est $P=${texNombre(g, 2)}\\,\\%$.<br>
              <br> D'après le cours, on a $P=p_1\\times p_2$, ce qui donne $${texNombre(tauxG, 4)}=${texNombre(tauxb, 2)}\\times p_2$<br>
              Ainsi, $p_2=\\dfrac{${texNombre(tauxG, 4)}}{${texNombre(tauxb, 2)}}=${texNombre(tauxc, 4)}$.<br>
              Il y a donc $${miseEnEvidence(texNombre(c, 2))}\\,\\%$ des élèves de première en première technologique.`

        this.reponse = c.toString()
        break

      case 'election':
        if (this.sup) {
          ;[b, c] = valeursSansCalculatrice('election', false)
          a = randint(20, 50)
          tauxb = b / 100
          tauxc = c / 100
        } else {
          b = randint(40, 80)
          tauxb = b / 100
          a = randint(20, 50)
          c = randint(10, 70)
          tauxc = c / 100
        }
        g = (b * c) / 100
        tauxG = (b * c) / 10000

        this.question = `Lors d'une élection, la participation (suffrages exprimés) a été de $${b}\\,\\%$ des inscrits.
               Un candidat a obtenu $${c}\\,\\%$ des suffrages exprimés.<br>
                Quel est le pourcentage de voix obtenues par ce candidat par rapport au nombre d' inscrits ?<br>`
        this.correction = `La population de référence est celle des inscrits sur les listes électorales.<br>
                La sous-population est celle des suffrages exprimés et d'après l'énoncé, $p_1=${b}\\,\\%$.<br>
                 Les suffrages du candidat sont une sous-population des suffrages exprimés, qui représentent d'après l'énoncé, $p_2=${c}\\,\\%$. <br>
                 <br>Pour connaitre le pourcentage de voix obtenues par ce candidat par rapport aux nombre d'inscrits, on calcule $p=p_1\\times p_2$, ce qui revient à calculer $${b}\\,\\%$ de $${c}\\,\\%$.<br>
                 <br>Ainsi, $p=${texNombre(tauxb, 2)}\\times ${texNombre(tauxc, 2)}=${texNombre(tauxG, 4)}$.<br>
                Ce candidat a donc obtenu $${miseEnEvidence(texNombre(g, 2))}\\,\\%$ des voix des inscrits.`
        this.reponse = g.toFixed(2)
        break

      case 'electionBis':
        if (this.sup) {
          ;[b, c] = valeursSansCalculatrice('election', true)
          a = randint(20, 50)
          tauxb = b / 100
          tauxc = c / 100
        } else {
          b = randint(40, 80)
          tauxb = b / 100
          a = randint(20, 50)
          c = randint(10, 70)
          tauxc = c / 100
        }
        g = (b * c) / 100
        tauxG = (b * c) / 10000

        this.question = `Lors d'une élection, la participation (suffrages exprimés) a été de $${b}\\,\\%$ des inscrits.
        Un candidat a obtenu $${texNombre(g, 2)}\\,\\%$ de voix parmi les inscrits.<br>
                Quel est le pourcentage de voix obtenues par ce candidat par rapport aux suffrages exprimés ?<br>`
        this.correction = `La population de référence est celle des inscrits sur les listes électorales.<br>
                La sous-population est celle des suffrages exprimés et d'après l'énoncé, $p_1=${b}\\,\\%$.<br>
Dans cette sous-population, on note $p_2$ la proportion des suffrages du candidat.<br>
La proportion $P$ des suffrages du candidat parmi les inscrits est $P=${texNombre(g, 2)}\\,\\%$.<br>
<br>D'après le cours, on a $P=p_1\\times p_2$, ce qui donne $${texNombre(tauxG, 4)}=${texNombre(tauxb, 2)}\\times p_2$<br>
<br>Ainsi, $p_2=\\dfrac{${texNombre(tauxG, 4)}}{${texNombre(tauxb, 2)}}=${texNombre(tauxc, 4)}$.<br>
$${miseEnEvidence(texNombre(c, 2))}\\,\\%$ des suffrages exprimés ont voté pour le candidat.`
        this.reponse = c.toString()
        break
    }
    if (this.interactif) this.question += '<br>'
  }

  versionFraction(cas: string) {
    this.optionsChampTexte = {}
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionIrreductible: true }
    const retrouverP2 = cas.endsWith('Bis')
    const situation = cas.replace('Bis', '') as Situation
    const [n1, d1] = choice(listesFractions[situation].p1)
    const [n2, d2] = choice(listesFractions[situation].p2)
    const p1 = new FractionEtendue(n1, d1)
    const p2 = new FractionEtendue(n2, d2)
    const P = new FractionEtendue(n1 * n2, d1 * d2).simplifie()
    const a = situation === 'association' ? randint(20, 50) : 0
    const d = situation === 'association' ? randint(2, 15) : 0
    const textes = {
      association: {
        enonceP1: `Dans une association, $${p1.texFraction}$ des adhérents ont plus de $${a}$ ans.`,
        enonceP2: `Parmi eux, $${p2.texFraction}$ ont plus de $${d}$ années d'ancienneté.`,
        enonceP: `On dénombre également dans cette association une proportion de $${P.texFraction}$ d'adhérents de plus de $${a}$ ans ayant plus de $${d}$ années d'ancienneté.`,
        questionP: `Quelle est la proportion d'adhérents de plus de $${a}$ ans ayant plus de $${d}$ années d'ancienneté dans cette association ?`,
        questionP2: `Parmi les adhérents de plus de $${a}$ ans, quelle est la proportion de ceux qui ont plus de $${d}$ années d'ancienneté ?`,
        reference: "celle des membres de l'association",
        sousPopulation: `celle des plus de $${a}$ ans`,
        sousSousPopulation: `ceux qui ont plus de $${d}$ années d'ancienneté`,
        deSousSousPopulation: `de ceux qui ont plus de $${d}$ années d'ancienneté`,
        conclusionP: `d'adhérents de plus de $${a}$ ans ayant plus de $${d}$ années d'ancienneté`,
        conclusionP2: `d'adhérents de plus de $${d}$ ans d'ancienneté parmi les adhérents de plus de $${a}$ ans`,
      },
      lycee: {
        enonceP1: `Dans un lycée, $${p1.texFraction}$ des lycéens sont en classe de première.`,
        enonceP2: `Parmi eux, $${p2.texFraction}$ sont en filière technologique.`,
        enonceP: `De plus, $${P.texFraction}$ des lycéens sont en première technologique.`,
        questionP:
          "Quelle est la proportion d'élèves en première technologique parmi les élèves de ce lycée ?",
        questionP2:
          "Quelle est la proportion d'élèves en première technologique parmi les élèves de première du lycée ?",
        reference: 'celle des élèves du lycée',
        sousPopulation: 'celle des élèves de première',
        sousSousPopulation: 'les élèves de première technologique',
        deSousSousPopulation: 'des élèves de première technologique',
        conclusionP:
          "d'élèves de première technologique parmi les élèves du lycée",
        conclusionP2:
          "d'élèves de première technologique parmi les élèves de première",
      },
      election: {
        enonceP1: `Lors d'une élection, la participation (suffrages exprimés) a été de $${p1.texFraction}$ des inscrits.`,
        enonceP2: `Un candidat a obtenu $${p2.texFraction}$ des suffrages exprimés.`,
        enonceP: `Un candidat a obtenu $${P.texFraction}$ des voix des inscrits.`,
        questionP:
          "Quelle est la proportion de voix obtenues par ce candidat par rapport au nombre d'inscrits ?",
        questionP2:
          'Quelle est la proportion de voix obtenues par ce candidat par rapport aux suffrages exprimés ?',
        reference: 'celle des inscrits sur les listes électorales',
        sousPopulation: 'celle des suffrages exprimés',
        sousSousPopulation: 'les suffrages du candidat',
        deSousSousPopulation: 'des suffrages du candidat',
        conclusionP: 'de voix obtenues par le candidat parmi les inscrits',
        conclusionP2:
          'de voix obtenues par le candidat parmi les suffrages exprimés',
      },
    }[situation]
    const consigne =
      "<br>Donner le résultat sous la forme d'une fraction irréductible."
    const debutCorrection = `La population de référence est ${textes.reference}.<br>
    La sous-population est ${textes.sousPopulation}, qui représente $p_1=${p1.texFraction}$ de la population de référence.<br>`
    if (retrouverP2) {
      this.question = `${textes.enonceP1} ${textes.enonceP}<br>${textes.questionP2}${consigne}`
      this.correction = `${debutCorrection}
      Dans cette sous-population, on note $p_2$ la proportion ${textes.deSousSousPopulation}.<br>
      La proportion $P$ ${textes.conclusionP} est $P=${P.texFraction}$.<br>
      D'après le cours, on a $P=p_1\\times p_2$, ce qui donne $${P.texFraction}=${p1.texFraction}\\times p_2$.<br>
      Ainsi, $p_2=${P.texFraction}\\div ${p1.texFraction}=${texProduitFractions(P, p1.inverse())}$.<br>
      La proportion ${textes.conclusionP2} est $${miseEnEvidence(p2.simplifie().texFraction)}$.`
      this.reponse = p2.simplifie()
    } else {
      this.question = `${textes.enonceP1} ${textes.enonceP2}<br>${textes.questionP}${consigne}`
      this.correction = `${debutCorrection}
      Dans cette sous-population, ${textes.sousSousPopulation} représentent $p_2=${p2.texFraction}$.<br>
      D'après le cours, on calcule $p=p_1\\times p_2$.<br>
      Ainsi, $p=${texProduitFractions(p1, p2)}$.<br>
      La proportion ${textes.conclusionP} est $${miseEnEvidence(P.texFraction)}$.`
      this.reponse = P
    }
  }
}
