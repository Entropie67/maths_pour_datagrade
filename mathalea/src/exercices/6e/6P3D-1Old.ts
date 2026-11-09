import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Utiliser la proportionnalité'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

export const dateDePublication = '02/05/2025'
export const dateDeModifImportante = '02/05/2025'

/**
 *
 * @author Mickael Guironnet
 */
export const uuid = '51d14'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}
export default class ProblemesDeProportionnalité extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.consigne =
      'On considère que les situations suivantes sont des situations de proportionnalité. Compléter.'
    this.sup = 1
    this.sup2 = 4
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      '1 : Valeurs entières\n2 : Une décimale\n3 : Deux décimales',
    ]
    this.besoinFormulaire2Texte = [
      'Type de questions',
      `Nombres séparés par des tirets :
  1 : Passage à l'unité
  2 : Recherche d'une quantité
  3 : Recherche du nombre de cartons
  4 : Mélange`,
    ]
  }

  nouvelleVersion() {
    const typesDeQuestions = gestionnaireFormulaireTexte({
      max: 3,
      defaut: 1,
      melange: 4,
      nbQuestions: this.nbQuestions,
      saisie: this.sup2,
    })
    typesDeQuestions.forEach((value, index, arr) => {
      if (value === 2) {
        arr[index] = randint(0, 1) < 1 ? 21 : 22
        // 21 pour la multiplciation et 22 pour la division
      } else if (value === 3) {
        arr[index] = randint(0, 1) < 1 ? 31 : 32
        // 31 pour la multiplciation et 32 pour la division
      }
    })
    const n = this.sup - 1
    const fois = [2, 3, 4, 5, 10]
    const foisUsed: number[] = []
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const f = choice(fois, foisUsed) // On choisit un nombre de fois aléatoire
      const quantite =
        randint(2, 10) * 10 +
        randint(1, 9) +
        (n > 0 ? randint(1, 9) * 0.1 : 0) +
        (n > 1 ? randint(1, 9) * 0.01 : 0)
      const cartons = randint(2, 10)
      const unites = ['€', 'kg', 'L']
      switch (
        typesDeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 1: {
          const unité = choice(unites)
          texte = this.createArray(
            `$${f}$ cartons`,
            '$\\rightarrow$',
            `$${texNombre(f * quantite)}~\\text{${unité}}$`,
            `$${1}$ carton`,
            '$\\rightarrow$',
            this.interactif && !context.isAmc
              ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
                  texteApres: ` ${unité}`,
                })
              : '....',
          )
          texteCorr = `$${f}~\\text{cartons} \\div ${f} = 1~\\text{carton}$<br>`
          texteCorr += `$${texNombre(quantite * f)} \\text{ ${unité}} \\div ${f} = ${texNombre(quantite)} \\text{ ${unité}}$<br>`
          texteCorr +=
            'Donc le résultat est ' +
            `$${miseEnEvidence(texNombre(quantite))}$ ${unité}.`
          if (context.isAmc)
            handleAnswers(
              this,
              i,
              { reponse: { value: quantite } },
              { formatInteractif: 'mathlive' },
            )
          else handleAnswers(this, i, { reponse: { value: quantite } })
          break
        }
        case 21: {
          const unité = choice(unites)
          texte = this.createArray(
            `$${cartons}$ cartons`,
            '$\\rightarrow$',
            `$${texNombre(quantite)}~\\text{${unité}}$`,
            `$${cartons * f}$ cartons`,
            '$\\rightarrow$',
            this.interactif && !context.isAmc
              ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
                  texteApres: ` ${unité}`,
                })
              : '....',
          )
          texteCorr = `$${cartons}~\\text{cartons} \\times ${f} = ${cartons * f}~\\text{cartons}$<br>`
          texteCorr += `$${texNombre(quantite)}~\\text{${unité}} \\times ${f} = ${texNombre(quantite * f)}~\\text{${unité}}$<br>`
          texteCorr +=
            'Donc le résultat est ' +
            `$${miseEnEvidence(texNombre(quantite * f))}$ ${unité}.`
          if (context.isAmc)
            handleAnswers(
              this,
              i,
              { reponse: { value: quantite * f } },
              { formatInteractif: 'mathlive' },
            )
          else handleAnswers(this, i, { reponse: { value: quantite * f } })
          break
        }
        case 22: {
          const unité = choice(unites)
          texte = this.createArray(
            `$${cartons * f}$ cartons`,
            '$\\rightarrow$',
            `$${texNombre(quantite * f)}~\\text{${unité}}$`,
            `$${cartons}$ cartons`,
            '$\\rightarrow$',
            this.interactif && !context.isAmc
              ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
                  texteApres: ` ${unité}`,
                })
              : '....',
          )
          texteCorr = `$${cartons * f}~\\text{cartons} \\div ${f} = ${cartons}~\\text{cartons}$<br>`
          texteCorr += `$${texNombre(quantite * f)}~\\text{${unité}} \\div ${f} = ${texNombre(quantite)}~\\text{${unité}}$<br>`
          texteCorr +=
            'Donc le résultat est ' +
            `$${miseEnEvidence(texNombre(quantite))}$ ${unité}.`
          if (context.isAmc)
            handleAnswers(
              this,
              i,
              { reponse: { value: quantite } },
              { formatInteractif: 'mathlive' },
            )
          else handleAnswers(this, i, { reponse: { value: quantite } })
          break
        }
        case 31: {
          const unité = choice(unites)
          texte = this.createArray(
            `$${cartons}$ cartons`,
            '$\\rightarrow$',
            `$${texNombre(quantite)}~\\text{${unité}}$`,
            this.interactif && !context.isAmc
              ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
                  texteApres: ' cartons',
                })
              : '....',
            '$\\rightarrow$',
            `$${texNombre(quantite * f)} \\text{ ${unité}}$`,
          )
          texteCorr = `$${texNombre(quantite)}~\\text{${unité}} \\times ${f} = ${texNombre(quantite * f)}~\\text{${unité}}$<br>`
          texteCorr += `$${cartons}~\\text{cartons} \\times ${f} = ${cartons * f}~\\text{cartons}$<br>`
          texteCorr +=
            'Donc le résultat est ' +
            `$${miseEnEvidence(cartons * f)}$ cartons.`
          if (context.isAmc)
            handleAnswers(
              this,
              i,
              { reponse: { value: cartons * f } },
              { formatInteractif: 'mathlive' },
            )
          else handleAnswers(this, i, { reponse: { value: cartons * f } })
          break
        }
        case 32: {
          const unité = choice(unites)
          texte = this.createArray(
            `$${cartons * f}$ cartons`,
            '$\\rightarrow$',
            `$${texNombre(quantite * f)}~\\text{${unité}}$`,
            this.interactif && !context.isAmc
              ? ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
                  texteApres: ' cartons',
                })
              : '....',
            '$\\rightarrow$',
            `$${texNombre(quantite)} \\text{ ${unité}}$`,
          )
          texteCorr = `$${texNombre(quantite * f)}~\\text{${unité}} \\div ${f} = ${texNombre(quantite)}~\\text{${unité}}$<br>`
          texteCorr += `$${cartons * f}~\\text{cartons} \\div ${f} = ${cartons}~\\text{cartons}$<br>`
          texteCorr +=
            'Donc le résultat est ' + `$${miseEnEvidence(cartons)}$ cartons.`
          if (context.isAmc)
            handleAnswers(
              this,
              i,
              { reponse: { value: cartons } },
              { formatInteractif: 'mathlive' },
            )
          else handleAnswers(this, i, { reponse: { value: cartons } })
          break
        }
      }
      if (this.questionJamaisPosee(i, cartons, f)) {
        // Si la question n'a jamais été posée, on en crée une autre
        foisUsed.push(f) // On enlève le nombre de fois utilisé pour ne pas le réutiliser
        if (foisUsed.length === fois.length) foisUsed.splice(0, foisUsed.length) // Si tous les nombres de fois ont été utilisés, on les réinitialise
        this.listeQuestions[i] = texte ?? ''
        this.listeCorrections[i] = texteCorr ?? ''
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }

  createArray(
    cel11: string,
    cel12: string,
    cel13: string,
    cel21: string,
    cel22: string,
    cel23: string,
  ): string {
    if (context.isHtml) {
      const texte = `<span style="display: inline-grid; grid-template-columns: auto auto auto; gap: 0.5em;">
               <span class='mt-auto mb-auto'> ${cel11} </span><span class='mt-auto mb-auto'> ${cel12}</span><span class='mt-auto mb-auto'>  ${cel13}</span>
               <span class='mt-auto mb-auto'> ${cel21} </span><span class='mt-auto mb-auto'> ${cel22}</span><span class='mt-auto mb-auto'>  ${cel23}</span>
                </span>`
      return texte
    } else {
      const texte = `\\begin{tabular}[t]{ccc}
                       ${cel11} & ${cel12} & ${cel13} \\\\
                       ${cel21} & ${cel22} & ${cel23} \\\\
                       \\end{tabular}`
      return texte
    }
  }
}
