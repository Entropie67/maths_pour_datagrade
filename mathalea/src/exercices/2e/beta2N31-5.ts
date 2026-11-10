import { miseEnEvidence } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { egalOuApprox } from '../../lib/outils/ecritures'
import { arrondi } from '../../lib/outils/nombres'
import { decimalToScientifique, texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const uuid = 'a1d0b'
export const titre = 'Calculer avec des nombres en notation scientifique'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '18/02/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
// export const dateDeModifImportante = '24/10/2021' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
/**
 * Calculer avec des nombres en notation scientifique
 * @author Matthieu Devillers
 * 2N32-1
 */
export default class CalculerAvecEcritureScientifique extends Exercice {
  constructor() {
    super()

    this.correctionDetailleeDisponible = true
    this.spacingCorr = context.isHtml ? 3 : 2
    if (!context.isHtml) {
      this.correctionDetaillee = false
    }
    this.consigne =
      'Calculer, en détaillant les étapes, puis exprimer le résultat sous forme scientifique. <br>'
    this.consigne +=
      'En cas de besoin, on arrondira la mantisse au centième près.'
    this.nbCols = 2
    this.nbColsCorr = 2
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.nbQuestions = 3
    this.sup = 1
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      '1 : Produit\n 2 : Quotient\n 3 : Quotient de produits\n 4 : Mélange des cas précédents',
    ]
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles = []
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = [1] // Produit
    } else if (this.sup === 2) {
      typesDeQuestionsDisponibles = [2] // Quotient
    } else if (this.sup === 3) {
      typesDeQuestionsDisponibles = [3] // Quotient de produits
    } else {
      typesDeQuestionsDisponibles = [1, 2, 3]
    } // Mélange des cas précédents
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typesDeQuestions = listeTypeDeQuestions[i]
      let n = 0
      const a: number[] = []
      const b: number[] = []
      const c: number[] = []
      const prod: number[][] = []
      let texte = ''
      let texteCorr = ''
      let reponse = ''
      let somme: number = 0
      while (n < 4) {
        c[n] = randint(-30, 30, [-1, 0, 1]) // initialise les exposants entiers relatifs
        b[n] = randint(11, 99) / 10 // initialise les mantisses entières ou avec un chiffre des dixièmes non nul.
        a[n] = randint(1, 9) + randint(0, 9) / 10 + randint(1, 9) / 10 / 10 // initialise les mantises avec chiffre des centièmes non nul
        if (randint(1, 2) === 1) {
          ;[a[n], b[n]] = [b[n], a[n]]
        }
        // prod[n] ne contient pas le produit mais le tableau issu de decimalToScientifique.
        // ça évite de la rappeler à chaque fois qu'on a besoin de la mantisse ou de son exposant.
        prod[n] = decimalToScientifique(arrondi(a[n] * b[n], 3))
        n++
      }
      texte = ''
      switch (typesDeQuestions) {
        case 1:
          texte = `$ ${texNombre(a[0])} \\times 10^{${texNombre(c[0])}} \\times ${texNombre(b[0])} \\times 10^{${texNombre(c[1])}} $\n` // a.10^n x b.10^m = ?
          somme = c[1] + c[0]
          if (this.correctionDetaillee) {
            texteCorr = `${context.isHtml ? '<br>' : ''}$\\begin{aligned}${texNombre(a[0])} \\times 10^{${texNombre(c[0])}} \\times ${texNombre(b[0])} \\times 10^{${texNombre(c[1])}} &= \\left ( ${texNombre(a[0])} \\times   ${texNombre(b[0])} \\right ) \\times \\left ( 10^{${texNombre(c[1])}} \\times 10^{${texNombre(c[0])}} \\right )\\\\\n`
            texteCorr += `&= ${texNombre(a[0] * b[0], 3)} \\times 10^{${texNombre(somme)}}\\\\\n`
            if (prod[0][1] !== 0) {
              // On ajoute ces lignes seulement si l'exposant du produit est différent de zéro
              texteCorr += `&= ${texNombre(prod[0][0])} \\times 10^{${prod[0][1]}} \\times 10^{${somme}}\\\\\n`
              texteCorr += `&= ${texNombre(prod[0][0])} \\times 10^{${prod[0][1] + somme}}\\\\\n`
            }
            // La ligne suivante est une concaténation conditionnelle : si il n'y a pas d'arrondi à faire on termine le calcul sinon on ajoute une ligne pour l'approximation
            texteCorr +=
              egalOuApprox(prod[0][0], 2) === '='
                ? '\\\\\n\\end{aligned}$<br>'
                : `&\\approx ${miseEnEvidence(`${texNombre(arrondi(prod[0][0], 2))} \\times 10^{${prod[0][1] + somme}}`)}\\\\\n\\end{aligned}$<br>(avec la mantisse arrondie au centième) <br>`
          } else {
            texteCorr = `$ ${texNombre(a[0])} \\times 10^{${texNombre(c[0])}} \\times ${texNombre(b[0])} \\times 10^{${texNombre(c[1])}} ${egalOuApprox(prod[0][0], 2)} ${texNombre(arrondi(decimalToScientifique(prod[0][0])[0], 2))} \\times 10^{${decimalToScientifique(prod[0][1])[1] + somme}} $  (avec la mantisse arrondie au centième) <br>`
          }
          reponse = `${prod[0][0].toFixed(2)}e${prod[0][1] + somme}`

          break
        case 2:
          texte = `Texte2 ${a[0]}` // b>1
          if (this.correctionDetaillee) {
            texteCorr += 'Correction Détaillée 2'
          } else {
            texteCorr += 'CorrTest2'
          }
          reponse = 'Test 2e5'
          somme = 0
          break
        case 3:
        default:
          texte = `Texte3 ${b[0]}` // b<-1
          if (this.correctionDetaillee) {
            texteCorr += 'Correction détaillée 3'
          } else {
            texteCorr = texte + 'CorrTest3'
          }
          reponse = 'test 3e6'
          somme = 0
          break
      }
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
      )
      handleAnswers(this, i, {
        reponse: { value: reponse, options: { ecritureScientifique: true } },
      })
      if (
        this.questionJamaisPosee(
          i,
          reponse,
          somme,
          a.join(';'),
          b.join(';'),
          c.join(';'),
          prod.join(';'),
        )
      ) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
