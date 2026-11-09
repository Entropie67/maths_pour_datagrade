import Decimal from 'decimal.js'
import { grille, seyes } from '../../lib/2d/Grille'
import { vide2d } from '../../lib/2d/Vide2d'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import operation from '../../modules/operations'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDeModifImportante = '08/04/2026'
export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

export const titre = 'Poser des multiplications de nombres décimaux'

/**
 * Multiplication de deux nombres décimaux
 *
 * * xxx * xx,x chiffres inférieurs à 5
 * * xx,x * x,x
 * * x,xx * x0x
 * * 0,xx * x,x
 * @author Rémi Angot
 * Éric Elter : Mise en place de la correction avec la pose d'entiers (08/04/2026)
 */

export const uuid = '52939'

export const refs = {
  'fr-fr': ['6N2E-1'],
  'fr-2016': ['6C30'],
  'fr-ch': ['9R1NO7B-2', '9R2NO7B-2', '9R3NO7B-2', 'PRQNO06A-5'],
}
export default class MultiplierDecimaux extends Exercice {
  constructor() {
    super()
    this.consigne = 'Poser et effectuer les calculs suivants.'
    this.besoinFormulaireCaseACocher = ['La correction pose des entiers']
    this.spacing = 2
    this.nbQuestions = 4
    this.sup = true
    this.sup2 = 3
    this.besoinFormulaire2Numerique = [
      'Type de cahier',
      3,
      ' 1 : Cahier à petits carreaux\n 2 : Cahier à gros carreaux (Seyes)\n 3 : Feuille blanche',
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [1, 2, 3, 4]
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"

    let grilletxt
    if (this.sup2 < 3) {
      const g = this.sup2 < 3 ? grille(0, 0, 5, 8, 'gray', 0.7) : vide2d()
      const carreaux = this.sup2 === 2 ? seyes(0, 0, 5, 8) : vide2d()
      const sc = this.sup2 === 2 ? 0.8 : 0.5
      const params = {
        xmin: 0,
        ymin: 0,
        xmax: 5,
        ymax: 8,
        pixelsParCm: 20,
        scale: sc,
      }
      grilletxt = '<br>' + mathalea2d(params, g, carreaux)
    } else {
      grilletxt = ''
    }

    let typesDeQuestions, reponse
    for (
      let i = 0, texte, texteCorr, cpt = 0, a, b, c;
      i < this.nbQuestions && cpt < 50;
    ) {
      let facteuraEntier, facteurbEntier, puissanceDe10Poura, puissanceDe10Pourb
      typesDeQuestions = listeTypeDeQuestions[i]
      switch (typesDeQuestions) {
        case 1: // xxx * xx,x chiffres inférieurs à 5
          a = new Decimal(
            randint(2, 5) * 100 + randint(2, 5) * 10 + randint(2, 5),
          )
          c = new Decimal(randint(2, 5)).div(10)
          b = new Decimal(randint(2, 5)).add(c)
          facteuraEntier = a
          puissanceDe10Poura = 1
          facteurbEntier = new Decimal(b).mul(10)
          puissanceDe10Pourb = 10
          break
        case 2: // xx,x * x,x
          c = new Decimal(randint(2, 9)).div(10)
          a = new Decimal(randint(2, 9) * 10 + randint(2, 9)).add(c)
          c = new Decimal(randint(6, 9)).div(10)
          b = new Decimal(randint(6, 9)).add(c)
          facteuraEntier = new Decimal(a).mul(10)
          puissanceDe10Poura = 10
          facteurbEntier = new Decimal(b).mul(10)
          puissanceDe10Pourb = 10
          break
        case 3: // x,xx * x0x
          c = new Decimal(randint(2, 9))
            .div(10)
            .add(new Decimal(randint(2, 9)).div(100))
          a = new Decimal(randint(2, 9)).add(c).add(c)
          b = new Decimal(randint(2, 9) * 100 + randint(2, 9))
          facteuraEntier = new Decimal(a).mul(100)
          puissanceDe10Poura = 100
          facteurbEntier = b
          puissanceDe10Pourb = 1
          break
        case 4: // 0,xx * x,x
        default:
          c = new Decimal(randint(2, 9)).div(10)
          a = new Decimal(randint(2, 9)).div(100).add(c)
          c = new Decimal(randint(2, 9)).div(10)
          b = new Decimal(randint(2, 9)).add(c)
          facteuraEntier = new Decimal(a).mul(100)
          puissanceDe10Poura = 100
          facteurbEntier = new Decimal(b).mul(10)
          puissanceDe10Pourb = 10
          break
      }

      texte = `$${texNombre(a)} \\times ${texNombre(b)}$`
      texte += grilletxt
      reponse = new Decimal(a).mul(b)
      switch (this.sup) {
        case false:
          texteCorr = operation({
            operande1: a.toNumber(),
            operande2: b.toNumber(),
            type: 'multiplication',
            display: 'inline',
            options: { solution: true, colore: orangeMathalea },
          })
          texteCorr += context.isHtml ? '' : '\\hspace*{30mm}'
          texteCorr += operation({
            operande1: b.toNumber(),
            operande2: a.toNumber(),
            type: 'multiplication',
            display: 'inline',
            options: { solution: true, colore: orangeMathalea },
          })
          texteCorr += `<br>Donc $${texNombre(a)} \\times ${texNombre(b)}=${miseEnEvidence(texNombre(reponse.toNumber()))}$.`
          break
        default: {
          texteCorr = operation({
            operande1: facteuraEntier.toNumber(),
            operande2: facteurbEntier.toNumber(),
            type: 'multiplication',
            display: 'inline',
            options: { solution: true, colore: bleuMathalea },
          })
          texteCorr += context.isHtml ? '' : '\\hspace*{30mm}'
          texteCorr += `On obtient que : $${texNombre(facteuraEntier.toNumber())} \\times ${facteurbEntier.toNumber()}=${texNombre(facteuraEntier.mul(facteurbEntier).toNumber())}$.<br><br>`
          texteCorr += `Or `
          if (puissanceDe10Poura !== 1)
            texteCorr += `$${texNombre(a.toNumber())}=\\dfrac{${texNombre(facteuraEntier.toNumber())}}{${puissanceDe10Poura}}=${texNombre(facteuraEntier.toNumber())} \\times  ${texNombre(1 / puissanceDe10Poura)}$`
          texteCorr +=
            puissanceDe10Pourb === 1
              ? '.<br>'
              : puissanceDe10Poura !== 1
                ? ' et '
                : ''
          const calcul = `${texNombre(a.toNumber())} \\times ${texNombre(b.toNumber())}`
          if (puissanceDe10Pourb !== 1)
            texteCorr += `$${texNombre(b.toNumber())}=\\dfrac{${facteurbEntier.toNumber()}}{${puissanceDe10Pourb}}=${facteurbEntier.toNumber()} \\times  ${texNombre(1 / puissanceDe10Pourb)}$.<br>`
          texteCorr += `Et donc :<br> $\\begin{aligned}\\phantom{Et donc :}
       ${calcul}&=`
          texteCorr +=
            puissanceDe10Poura !== 1 && puissanceDe10Pourb !== 1
              ? `\\dfrac{${facteuraEntier.toNumber()}}{${puissanceDe10Poura}} \\times \\dfrac{${facteurbEntier.toNumber()}}{${puissanceDe10Pourb}}\\\\
          ${calcul}&=${facteuraEntier.toNumber()} \\times \\dfrac{1}{${puissanceDe10Poura}} \\times ${facteurbEntier.toNumber()} \\times \\dfrac{1}{${puissanceDe10Pourb}}
          =${facteuraEntier.toNumber()} \\times ${texNombre(1 / puissanceDe10Pourb)} \\times ${facteurbEntier.toNumber()} \\times ${texNombre(1 / puissanceDe10Pourb)}\\\\
          ${calcul}&=\\left(${facteuraEntier.toNumber()} \\times ${facteurbEntier.toNumber()}\\right) \\times \\left(\\dfrac{1}{${puissanceDe10Poura}} \\times \\dfrac{1}{${puissanceDe10Pourb}}\\right)
          =\\left(${facteuraEntier.toNumber()} \\times ${facteurbEntier.toNumber()}\\right) \\times \\left(${texNombre(1 / puissanceDe10Poura)} \\times ${texNombre(1 / puissanceDe10Pourb)}\\right)\\\\
          ${calcul}&=${texNombre(facteuraEntier.mul(facteurbEntier).toNumber())} \\times \\dfrac{1}{${texNombre(puissanceDe10Poura * puissanceDe10Pourb)}}
          =${texNombre(facteuraEntier.mul(facteurbEntier).toNumber())} \\times ${texNombre(1 / (puissanceDe10Poura * puissanceDe10Pourb))}\\\\
          `
              : puissanceDe10Poura !== 1
                ? `\\dfrac{${texNombre(facteuraEntier.toNumber())}}{${puissanceDe10Poura}} \\times ${facteurbEntier.toNumber()}\\\\
          ${calcul}&=${texNombre(facteuraEntier.toNumber())} \\times \\dfrac{1}{${puissanceDe10Poura}} \\times ${facteurbEntier.toNumber()}
          =${texNombre(facteuraEntier.toNumber())} \\times ${texNombre(1 / puissanceDe10Pourb)} \\times ${facteurbEntier.toNumber()}\\\\
          ${calcul}&=\\left(${texNombre(facteuraEntier.toNumber())} \\times ${facteurbEntier.toNumber()}\\right) \\times \\dfrac{1}{${puissanceDe10Poura}}
          =\\left(${texNombre(facteuraEntier.toNumber())} \\times ${facteurbEntier.toNumber()}\\right) \\times ${texNombre(1 / puissanceDe10Poura)}\\\\
          ${calcul}&=${texNombre(facteuraEntier.mul(facteurbEntier).toNumber())} \\times \\dfrac{1}{${texNombre(puissanceDe10Poura * puissanceDe10Pourb)}}
          =${texNombre(facteuraEntier.mul(facteurbEntier).toNumber())} \\times ${texNombre(1 / (puissanceDe10Poura * puissanceDe10Pourb))}\\\\
          `
                : `${facteuraEntier.toNumber()} \\times \\dfrac{${facteurbEntier.toNumber()}}{${puissanceDe10Pourb}}\\\\
          ${calcul}&=${facteuraEntier.toNumber()} \\times ${facteurbEntier.toNumber()} \\times \\dfrac{1}{${puissanceDe10Pourb}}
          =${facteuraEntier.toNumber()} \\times ${facteurbEntier.toNumber()} \\times ${texNombre(1 / puissanceDe10Pourb)}\\\\
          ${calcul}&=${texNombre(facteuraEntier.mul(facteurbEntier).toNumber())} \\times \\dfrac{1}{${texNombre(puissanceDe10Poura * puissanceDe10Pourb)}}
          =${texNombre(facteuraEntier.mul(facteurbEntier).toNumber())} \\times ${texNombre(1 / (puissanceDe10Poura * puissanceDe10Pourb))}\\\\
          `

          texteCorr += `${calcul}&=\\dfrac{${texNombre(facteuraEntier.mul(facteurbEntier).toNumber())}}{${texNombre(puissanceDe10Poura * puissanceDe10Pourb)}}
          =${miseEnEvidence(texNombre(reponse.toNumber()))}\\\\
          \\end{aligned}$`
          break
        }
      }
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
        texteAvant: '$~=$',
      })

      handleAnswers(this, i, { reponse: { value: reponse } })

      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
