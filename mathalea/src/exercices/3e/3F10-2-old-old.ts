import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '29/08/2021'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const titre =
  'Calculer des images (et antécédents) dans diverses fonctions'

/**
 * Répondre à des questions sur les fonctions.
 * @author Jean-claude Lhote
 */
export const uuid = 'ba520'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class CalculsImagesFonctions extends Exercice {
  fonctions: string
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 : Fonction linéaire\n2 : Fonction affine \n3 : Polynôme de degré 2 \n4 : Fonction rationnelle \n5 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Image ou antécédent',
      3,
      "1 : Calcul d'image\n2 : Calcul d'antécédent (uniquement pour linéaire et affine)\n3 : Mélange",
    ]
    this.besoinFormulaire3Numerique = [
      'Niveau de difficulté',
      5,
      '1 : Que des entiers positifs\n2 : Que des entiers négatifs\n3 : Avec des entiers relatifs\n4 : Avec des fractions positives dans les coefficients (uniquement pour linéaire et affine)\n5 : Avec des antécédents tous négatifs (pas de fraction)\n6 : Mélange',
    ]

    this.sup = 2
    this.sup2 = 1
    this.sup3 = 1
    this.spacing = 2
    this.nbQuestions = 3
    this.fonctions = 'toutesLesFonctions'
  }

  nouvelleVersion() {
    const listeTypeDeQuestions =
      this.fonctions === 'affinesOuLineaires'
        ? gestionnaireFormulaireTexte({
            saisie: this.sup,
            min: 1,
            max: 2,
            defaut: 3,
            melange: 3,
            nbQuestions: this.nbQuestions,
            listeOfCase: ['linéaire', 'affine'],
          })
        : this.fonctions === 'polynomialesOuRationnelles'
          ? gestionnaireFormulaireTexte({
              saisie: this.sup,
              min: 1,
              max: 2,
              defaut: 3,
              melange: 3,
              nbQuestions: this.nbQuestions,
              listeOfCase: ['polynôme', 'fraction'],
            })
          : gestionnaireFormulaireTexte({
              saisie: this.sup,
              min: 1,
              max: 4,
              defaut: 5,
              melange: 5,
              nbQuestions: this.nbQuestions,
              listeOfCase: ['linéaire', 'affine', 'polynôme', 'fraction'],
            })

    let sousChoix
    if (this.sup2 === 1) {
      // Pour paramétrer plus finement le type de question pour les questions
      if (this.sup3 !== 4) {
        sousChoix = combinaisonListes([0], this.nbQuestions)
      } else {
        sousChoix = combinaisonListes([1], this.nbQuestions)
      }
    } else if (this.sup2 === 2) {
      // Que pour les fonctions affines et linéaires
      if (this.sup3 < 4 || this.sup3 === 5) {
        sousChoix = combinaisonListes([2, 3], this.nbQuestions)
      } else if (this.sup3 === 4) {
        sousChoix = combinaisonListes([4], this.nbQuestions)
      } else {
        sousChoix = combinaisonListes([2, 3, 4], this.nbQuestions)
      }
    } else {
      // Que pour les fonctions non affines
      if (this.sup3 < 4 || this.sup3 === 5) {
        sousChoix = combinaisonListes([0, 2, 3], this.nbQuestions)
      } else if (this.sup3 === 4) {
        sousChoix = combinaisonListes([1, 4], this.nbQuestions)
      } else {
        sousChoix = combinaisonListes([0, 1, 2, 3, 4], this.nbQuestions)
      }
    }
    for (
      let i = 0,
        texte,
        texteCorr,
        x,
        y,
        m,
        n,
        enonce,
        correction,
        reponses = [],
        tagImage,
        ant,
        img,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // on ne choisit que des nombres compris entre 1 et 20
      texte = ''
      texteCorr = ''
      if (this.sup3 > 3 && this.fonctions === 'polynomialesOuRationnelles')
        this.sup3++
      if (this.sup3 === 1) {
        x = randint(2, 9)
        y = randint(-9, 9, [x, 0])
        n = choice([2, 4, 5])
        m = randint(2, 6, [n, n * 2, n * 3])
      } else if (this.sup3 === 2) {
        x = randint(-9, -2)
        y = randint(-9, 9, [x, 0])
        n = choice([2, 4, 5])
        m = randint(2, 6, [n, n * 2, n * 3])
      } else if (this.sup3 === 3) {
        x = randint(-9, 9, [0, 1, -1])
        y = randint(-9, 9, [x, 0])
        n = choice([2, 4, 5])
        m = randint(2, 6, [n, n * 2, n * 3]) * choice([-1, 1])
      } else {
        if (this.sup3 === 4) {
          x = randint(2, 9)
        } else {
          x = randint(-9, 9, [0, 1, -1])
        }
        y = randint(-9, 9, [x, 0])
        n = choice([2, 4, 5])
        m = randint(2, 6, [n, n * 2, n * 3]) * choice([-1, 1])
      }
      if (this.sup3 === 5) {
        x = -Math.abs(x)
      }
      const frac = fraction(m, n).texFSD
      const fracInv = fraction(n, m).ecritureParentheseSiNegatif
      tagImage = true
      switch (listeTypeDeQuestions[i]) {
        case 'linéaire':
          switch (sousChoix[i]) {
            case 0:
              enonce = `Soit $f: x \\longmapsto ${m}x$. <br> Quelle est l'image de $${x}$ ?<br>`
              correction = `$f(x)=${m}x$ donc ici on a : $f(${x})=${m} \\times ${ecritureParentheseSiNegatif(x)}=${m * x}$`
              reponses[i] = m * x
              ant = x
              tagImage = true
              break
            case 1:
              enonce = `Soit $f$ la fonction définie par $f(x)=${frac}x$. <br> Quelle est l'image de $${n * x}$ ?<br>`
              correction = `$f(x)=${frac}x$ donc ici on a : $f(${n * x})=${frac} \\times ${ecritureParentheseSiNegatif(n * x)}=\\dfrac{${m * x * n}}{${n}}=${m * x}$`
              ant = n * x
              tagImage = true
              reponses[i] = m * x
              break
            case 2:
              enonce = `Soit $f$ la fonction qui, à $x$, associe $${m}x$. <br> Quel est l'antécédent de $${m * x}$ ?<br>`
              correction = `$f(x)=${m}x$ donc ici on a : $${m}x=${m * x}$<br> soit $x=\\dfrac{${m * x}}{${m}}=${x}$`
              reponses[i] = x
              img = m * x
              tagImage = false
              break
            case 3:
              enonce = `Soit $f: x \\longmapsto ${-m}x$. <br> Quel est l'antécédent de $${m * x}$ ?<br>`
              correction = `$f(x)=${-m}x$ donc ici on a : $${-m}x=${m * x}$<br> soit $x=\\dfrac{${-m * x}}{${m}}=${-x}$`
              img = m * x
              reponses[i] = -x
              tagImage = false
              break
            case 4:
              enonce = `Soit $f$ la fonction telle que $f(x)=${frac}x$. <br> Quel est l'antécédent de $${m * x}$ ?<br>`
              correction = `$f(x)=${frac}x$ donc ici on a : $${frac}x=${m * x}$<br> soit $x=${m * x}\\times ${fracInv}=${x * n}$`
              img = m * x
              reponses[i] = n * x
              tagImage = false
              break
          }
          handleAnswers(this, i, { reponse: { value: reponses[i] } })
          break
        case 'affine':
          switch (sousChoix[i]) {
            case 0:
              enonce = `Soit $f: x \\longmapsto ${m}x+${n}$. <br> Quelle est l'image de $${x}$ ?<br>`
              correction = `$f(x)=${m}x+${n}$ donc ici on a : $f(${x})=${m}\\times ${ecritureParentheseSiNegatif(x)}+${n}=${m * x}+${n}=${m * x + n}$`
              ant = x
              reponses[i] = m * x + n
              break
            case 1:
              enonce = `Soit $f$ la fonction définie par $f(x)=${frac}x${ecritureAlgebrique(y)}$. <br> Quelle est l'image de $${n * x}$ ?<br>`
              correction = `$f(x)=${frac}x${ecritureAlgebrique(y)}$ donc ici on a : $f(${n * x})=${frac}\\times ${ecritureParentheseSiNegatif(n * x)}${ecritureAlgebrique(y)}=${m * x}${ecritureAlgebrique(y)}=${m * x + y}$`
              ant = n * x
              reponses[i] = m * x + y
              break
            case 2:
              enonce = `Soit $f$ la fonction qui, à $x$, associe $${m}x+${n}$. <br> Quel est l'antécédent de $${m * x + n}$ ?<br>`
              correction = `$f(x)=${m}x+${n}$ donc ici on a : $${m}x+${n}=${m * x + n}$ <br>Soit $${m}x=${m * x + n}-${n}=${m * x}$ d'où $x=\\dfrac{${m * x}}{${m}}=${x}$`
              img = m * x + n
              reponses[i] = x
              tagImage = false
              break
            case 3:
              enonce = `Soit $f: x \\longmapsto ${-m}x${ecritureAlgebrique(y)}$. <br> Quel est l'antécédent de $${m * x + y}$ ?<br>`
              correction = `$f(x)=${-m}x${ecritureAlgebrique(y)}$ donc ici on a : $${-m}x${ecritureAlgebrique(y)}=${m * x + y}$ <br>Soit $x=\\dfrac{(${m * x + y}${ecritureAlgebrique(-y)})}{${-m}}=${-x}$`
              img = m * x + y
              reponses[i] = -x
              tagImage = false
              break
            case 4:
              enonce = `Soit $f$ la fonction telle que $f(x)=${frac}x${ecritureAlgebrique(y)}$. <br> Quel est l'antécédent de $${m * x + y}$ ?<br>`
              correction = `$f(x)=${frac}x${ecritureAlgebrique(y)}$ donc ici on a : $${frac}x${ecritureAlgebrique(y)}=${m * x + y}$<br>Soit $x=(${m * x + y}${ecritureAlgebrique(-y)})\\times ${fracInv}=${m * x}\\times ${fracInv}=${n * x}$`
              img = m * x + y
              reponses[i] = n * x
              tagImage = false
              break
          }
          handleAnswers(this, i, { reponse: { value: reponses[i] } })
          break
        case 'polynôme':
          ant = x
          sousChoix[i] = randint(0, 4)
          switch (sousChoix[i]) {
            case 0:
              enonce = `Soit $f: x \\longmapsto x^2+${m}x+${n}$. <br> Quelle est l'image de $${x}$ ?<br>`
              correction = `$f(x)=x^2+${m}x+${n}$ donc ici on a : $f(${x})=${ecritureParentheseSiNegatif(x)}^2+${m}\\times ${ecritureParentheseSiNegatif(x)}+${n}=${x * x}${ecritureAlgebrique(m * x)}+${n}=${x ** 2 + m * x + n}$`
              reponses[i] = x ** 2 + m * x + n
              break

            case 1:
              enonce = `Soit $f(x)=x^2-${m}x+${n}$. <br> Quelle est l'image de $${x}$ ?<br>`
              correction = `$f(x)=x^2-${m}x+${n}$ donc ici on a : $f(${x})=${ecritureParentheseSiNegatif(x)}^2-${m}\\times ${ecritureParentheseSiNegatif(x)}+${n}=${x * x}${ecritureAlgebrique(-m * x)}+${n}=${x ** 2 - m * x + n}$`
              reponses[i] = x ** 2 - m * x + n
              break

            case 2:
              enonce = `Soit $f$ la fonction qui, à $x$, associe $${m}x^2+${n}x$. <br> Quelle est l'image de $${x}$ ?<br>`
              correction = `$f(x)=${m}x^2+${n}x$ donc ici on a : $f(${x})=${m}\\times${ecritureParentheseSiNegatif(x)}^2+${n}\\times ${ecritureParentheseSiNegatif(x)}=${m}\\times ${x * x}${ecritureAlgebrique(n * x)}=${m * x ** 2 + n * x}$`
              reponses[i] = m * x ** 2 + n * x
              break
            case 3:
              enonce = `Soit $f: x \\longmapsto ${m}x^2+${n}x${ecritureAlgebrique(y)}$. <br> Quelle est l'image de $${x}$ ?<br>`
              correction = `$f(x)=${m}x^2+${n}x${ecritureAlgebrique(y)}$ donc ici on a : $f(${x})=${m}\\times${ecritureParentheseSiNegatif(x)}^2+${n}\\times ${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(y)}=${m}\\times ${x * x}${ecritureAlgebrique(n * x)}${ecritureAlgebrique(y)}=${m * x ** 2 + n * x + y}$`
              reponses[i] = m * x ** 2 + n * x + y
              break
            case 4:
              enonce = `Soit $f(x)=${m}x^2-${n}x${ecritureAlgebrique(y)}$. <br> Quelle est l'image de $${x}$ ?<br>`
              correction = `$f(x)=${m}x^2-${n}x${ecritureAlgebrique(y)}$ donc ici on a : $f(${x})=${m}\\times${ecritureParentheseSiNegatif(x)}^2-${n}\\times ${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(y)}=${m}\\times ${x * x}${ecritureAlgebrique(-n * x)}${ecritureAlgebrique(y)}=${m * x ** 2 - n * x + y}$`
              reponses[i] = m * x ** 2 - n * x + y
              break
          }
          handleAnswers(this, i, { reponse: { value: reponses[i] } })
          break
        case 'fraction':
          ant = x
          // switch (sousChoix[i] % 4) {
          sousChoix[i] = randint(0, 3)
          switch (sousChoix[i]) {
            case 0: {
              if (n !== x)
                m = n - x // n différent de 0 donc m + x différent de zéro
              else m = n ** 2 - x // idem
              enonce = `Soit $f$ la fonction qui, à $x$, associe $\\dfrac{x}{x${ecritureAlgebrique(m)}}$. <br> Quelle est l'image de $${x}$ ?<br>`
              correction = `$f(x)=\\dfrac{x}{x${ecritureAlgebrique(m)}}$ donc ici on a : $f(${x})=\\dfrac{${x}}{${x}${ecritureAlgebrique(m)}}=\\dfrac{${x}}{${x + m}}`
              const repFraction = new FractionEtendue(x, x + m)
              correction +=
                repFraction.estEntiere || !repFraction.estIrreductible
                  ? `=${repFraction.texFractionSimplifiee}$`
                  : '$'
              reponses[i] = repFraction
              break
            }
            case 1: {
              if (n !== x)
                m = n - x // n différent de 0 donc m + x différent de zéro
              else m = n ** 2 - x
              enonce = `Soit $f$ telle que $f(x)=\\dfrac{${m}x}{x${ecritureAlgebrique(m)}}$. <br> Quelle est l'image de $${x}$ ?<br>`
              correction = `$f(x)=\\dfrac{${rienSi1(m)}x}{x${ecritureAlgebrique(m)}}$ donc ici on a : $f(${x})=\\dfrac{${m}\\times ${ecritureParentheseSiNegatif(x)}}{${x}${ecritureAlgebrique(m)}}=\\dfrac{${m * x}}{${x}${ecritureAlgebrique(m)}}=\\dfrac{${m * x}}{${x + m}}`
              /*               reponses[i] = new FractionEtendue(m * x, x + m)
              correction += reponses[i].estEntiere ? `=${reponses[i].simplifie().texFraction}$` : '$'
 */
              const repFraction = new FractionEtendue(m * x, x + m)
              correction +=
                repFraction.estEntiere || !repFraction.estIrreductible
                  ? `=${repFraction.texFractionSimplifiee}$`
                  : '$'
              reponses[i] = repFraction
              break
            }
            case 2: {
              if (n !== x)
                m = n - x // // n différent de 0 donc m + x différent de zéro et x différent de zéro
              else m = n ** 2 - x
              enonce = `Soit $f$ telle que $f(x)=\\dfrac{${m}x^2+${n}x}{x^2${ecritureAlgebrique(m)}x}$. <br> Quelle est l'image de $${x}$ ?<br>`
              correction = `$f(x)=\\dfrac{${rienSi1(m)}x^2+${n}x}{x^2${ecritureAlgebrique(m)}x}$ donc ici on a : $f(${x})=\\dfrac{${m}\\times ${ecritureParentheseSiNegatif(x)}^2+${n}\\times ${ecritureParentheseSiNegatif(x)}}{${ecritureParentheseSiNegatif(x)}^2${ecritureAlgebrique(m)}\\times ${ecritureParentheseSiNegatif(x)}}=\\dfrac{${m * x ** 2}${ecritureAlgebrique(n * x)}}{${x ** 2}${ecritureAlgebrique(m * x)}}=\\dfrac{${m * x ** 2 + n * x}}{${x ** 2 + m * x}}`
              const repFraction = new FractionEtendue(
                m * x ** 2 + n * x,
                x ** 2 + m * x,
              )
              correction += `=${repFraction.texFractionSimplifiee}$`
              reponses[i] = repFraction
              break
            }
            case 3: {
              if (n !== x && n !== 2 * x)
                m = n - x // x - m = 2x - n donc différent de zéro
              else if (n ** 2 !== 2 * x)
                m = n ** 2 - x // x-m = 2x - n**2 donc différent de zéro
              else m = n + x // x-m = n donc différent de zéro
              enonce = `Soit $f: x \\longmapsto \\dfrac{x${ecritureAlgebrique(-m)}}{x^2${ecritureAlgebrique(-2 * m)}x+${m * m}}$. <br> Quelle est l'image de $${x}$ ?<br>`
              correction = `$f(x)=\\dfrac{x${ecritureAlgebrique(-m)}}{x^2${ecritureAlgebrique(-2 * m)}x+${m * m}}$`
              correction += `donc ici on a : $f(${x})= \\dfrac{${x}${ecritureAlgebrique(-m)}}{${ecritureParentheseSiNegatif(x)}^2${ecritureAlgebrique(-2 * m)}\\times ${ecritureParentheseSiNegatif(x)}+${m * m}}`
              correction += `=\\dfrac{${x - m}}{${x ** 2}${ecritureAlgebrique(-2 * m * x)}+${m * m}}=\\dfrac{${x - m}}{${x ** 2 - 2 * m * x + m * m}}`
              /* reponses[i] = new FractionEtendue(1, x - m)
            correction += `=${reponses[i].texFSD}$` */
              const repFraction = new FractionEtendue(1, x - m)
              correction += `=${repFraction.texFractionSimplifiee}$`
              reponses[i] = repFraction
              break
            }
          }
          handleAnswers(this, i, {
            reponse: {
              value: reponses[i],
              options: { fractionEgale: true },
            },
          })
          break
      }
      correction += '.'
      if (this.interactif) {
        if (tagImage) {
          texte =
            enonce +
            ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              {
                texteAvant: `$f(${ant})=$`,
              },
            )
        } else {
          texte =
            enonce +
            ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFraction,
              {
                texteAvant: '$f($',
                texteApres: `$)=${img}$`,
              },
            )
        }
      } else {
        texte = enonce
      }

      if (tagImage) {
        texteCorr =
          correction +
          '<br>' +
          `$f(${ant})=${miseEnEvidence(reponses[i] instanceof FractionEtendue ? (reponses[i] as FractionEtendue).simplifie().texFSD : texNombre(reponses[i], 5))}$`
      } else {
        texteCorr =
          correction +
          '<br>' +
          `$f(${miseEnEvidence(reponses[i] instanceof FractionEtendue ? (reponses[i] as FractionEtendue).simplifie().texFSD : texNombre(reponses[i], 5))})=${img}$`
      }
      if (
        this.questionJamaisPosee(
          i,
          listeTypeDeQuestions[i],
          x,
          y,
          sousChoix[i],
          m,
          n,
        )
      ) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte ?? ''
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
