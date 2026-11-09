import GlisseNombreElement from 'glisse-nombre'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi, rangeMinMax } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

/**
 * Définit le customElement glisse-nombre
 */
if (customElements.get('glisse-nombre') === undefined) {
  customElements.define('glisse-nombre', GlisseNombreElement)
}

export const titre =
  'Multiplier ou diviser un nombre entier par $10$, $100$ ou $1\\,000$'
export const interactifReady = true

export const dateDeModifImportante = '01/02/2026'

/**
 * Multiplier ou diviser un nombre entier par 10, 100 ou 1 000
 *
 * Le nombre entier est de la forme X, XX, X0X, X00X ou XXX
 * @author Rémi Angot (modifié par Éric Elter)
 */
export const uuid = 'ec005'

export const refs = {
  'fr-fr': ['6N0A-13'],
  'fr-2016': ['6N24-1'],
  'fr-ch': ['9R1NO6F-12', '9R2NO6F-12', '9R3NO6F-12'], // Primaire anciennement : ['9NO10-5'],
}
export default class ExerciceMultiplierOuDiviserUnNombreEntierPar101001000 extends Exercice {
  constructor() {
    super()
    this.consigne = "Donner l'écriture décimale."
    this.spacing = 2
    this.spacingCorr = 2
    this.besoinFormulaireNumerique = [
      "Choix de l'opération",
      3,
      '1 : Multiplication\n2 : Division\n3 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = [
      'Afficher le tableau de numération (glisse-nombre)',
      true,
    ]
    this.sup = 3
    this.sup2 = true
  }

  nouvelleVersion() {
    this.consigne =
      this.sup === 1 ? 'Donner le résultat.' : "Donner l'écriture décimale."
    // reinit() ne remet pas this.introduction à zéro : on le vide ici pour que
    // décocher l'option retire bien le tableau de numération à la régénération.
    this.introduction = ''
    const listeQuestions =
      this.sup === 3
        ? combinaisonListes(rangeMinMax(1, 2), this.nbQuestions)
        : combinaisonListes([this.sup], this.nbQuestions)
    const puissancesDixDisponibles = combinaisonListes(
      [10, 100, 1000],
      this.nbQuestions,
    )
    for (
      let i = 0, a, b, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      a = choice(
        [
          randint(2, 9),
          randint(11, 99),
          randint(1, 9) * 100 + randint(1, 9),
          randint(1, 9) * 1000 + randint(1, 9),
        ],
        randint(101, 999),
      )
      // X, XX, X0X, X00X,XXX
      b = puissancesDixDisponibles[i]
      if (listeQuestions[i] === 2) {
        texte = '$ ' + texFractionFromString(texNombre(a), texNombre(b)) + '$'
        texteCorr =
          '$ ' +
          texFractionFromString(texNombre(a), texNombre(b)) +
          ' = ' +
          miseEnEvidence(texNombre(a / b)) +
          ' $'
        if (context.isHtml && i === 0 && this.sup2) {
          this.introduction = `<glisse-nombre number="${texNombre(a / b)}"/>`
        }
      } else {
        texte = '$ ' + texNombre(a) + '\\times' + texNombre(b) + '$'
        texteCorr =
          '$ ' +
          texNombre(a) +
          '\\times' +
          texNombre(b) +
          ' = ' +
          miseEnEvidence(texNombre(a * b)) +
          ' $'
        if (context.isHtml && i === 0 && this.sup2) {
          this.introduction = `<glisse-nombre number="${a}"/>`
        }
      }

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierNumbers,
          { texteAvant: ' =' },
        )
        handleAnswers(this, i, {
          reponse: {
            value: listeQuestions[i] === 1 ? arrondi(a * b) : arrondi(a / b),
            options: { nombreDecimalSeulement: true },
          },
        })
      }
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
