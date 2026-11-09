import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiMoins } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer un carré'
export const dateDePublication = '17/01/2023'
export const dateDeModifImportante = '02/10/2026' // Éric Elter
export const interactifReady = true

/**
 * Calculer de carré d'un nombre
 * * Entier relatif
 * * Décimal relatif
 * * Fractionnaire relatif
 * @author Sébastien LOZANO
 */

export const uuid = 'e564e'

export const refs = {
  'fr-fr': ['4G20-3', '3AutoN08'],
  'fr-ch': ['9R1NO5B-1', '9R2NO5B-1', '9R3NO5B-1', 'PRQNO03B-9', 'PRQNO07A-7', 'PRQNO07B-4'],
}
export default class calculsDeCarre extends Exercice {
  constructor() {
    super()

    this.sup = '1'
    this.nbQuestions = 6
    this.spacingCorr = context.isHtml ? 2 : 1.5
    this.spacing = 2
    this.consigneModifiable = false
    this.besoinFormulaireTexte = [
      'Types de questions sur les probabilités',
      [
        'Nombres séparés par des tirets :',
        '1 : Entier naturel',
        '2 : Entier relatif',
        '3 : Nombre décimal positif',
        '4 : Nombre décimal relatif',
        '5 : Nombre fractionnaire relatif',
        '6 : Mélange',
      ].join('\n'),
    ]

    this.comment =
      'Il est possible de faire cet exercice de tête en connaissant les 15 premiers carrés parfaits.'
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 5,
      melange: 6,
      defaut: 6,
      nbQuestions: this.nbQuestions,
      shuffle: false,
      enleveDoublons: true,
    }).map(Number)

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"

    this.consigne =
      this.nbQuestions === 1
        ? 'Calculer le carré du nombre suivant.'
        : 'Calculer les carrés des nombres suivants.'
    if (this.interactif) {
      this.consigne = 'Calculer.'
    }

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const entier = randint(1, 15)
      const signe = randint(-1, 1, [0])
      const decimal = randint(1, 15) / 10
      const numerateur = randint(2, 9)
      let denominateur = randint(2, 9, [numerateur])
      while (
        denominateur % numerateur === 0 ||
        numerateur % denominateur === 0
      ) {
        denominateur = randint(2, 9)
      }
      switch (listeTypeDeQuestions[i]) {
        case 1: // entier naturel
          texte = this.interactif ? `$${entier}^2 =$` : `$${entier}$`
          texteCorr = `$${entier}^2=${entier}\\times${entier}=${miseEnEvidence(entier * entier)}$`
          handleAnswers(this, i, { reponse: { value: entier * entier } })
          break
        case 2: {
          // entier relatif
          texte = this.interactif
            ? `$${ecritureParentheseSiMoins(signe * entier)}^2=$`
            : `$${signe * entier}$`
          const nbAMultiplier =
            signe === -1 ? `(${signe * entier})` : `${signe * entier}`
          texteCorr = `$${nbAMultiplier}^2=${nbAMultiplier} \\times ${nbAMultiplier}`
          texteCorr += `=${miseEnEvidence(entier * entier)}$`
          handleAnswers(this, i, { reponse: { value: entier * entier } })
          break
        }
        case 3: // décimal positif
          texte = this.interactif
            ? `$${texNombre(decimal, 2)}^2=$`
            : `$${texNombre(decimal, 2)}$`
          texteCorr = `$${texNombre(decimal, 2)}^2=${texNombre(decimal, 2)}\\times${texNombre(decimal, 2)}`
          texteCorr += `=${miseEnEvidence(texNombre(decimal ** 2, 2))}$`
          handleAnswers(this, i, {
            reponse: { value: (decimal ** 2).toFixed(2) },
          })
          break
        case 4: {
          // décimal relatif
          texte = this.interactif
            ? `$${ecritureParentheseSiMoins(texNombre(signe * decimal, 2))}^2=$`
            : `$${texNombre(signe * decimal, 2)}$`
          const nbAMultiplier =
            signe === -1
              ? `(${texNombre(signe * decimal, 2)})`
              : `${texNombre(signe * decimal, 2)}`
          texteCorr = `$${nbAMultiplier}^2=${nbAMultiplier} \\times ${nbAMultiplier}`
          texteCorr += `=${miseEnEvidence(texNombre(decimal ** 2, 2))}$`
          handleAnswers(this, i, {
            reponse: { value: (decimal ** 2).toFixed(2) },
          })
          break
        }
        case 5: // fractionnaire relatif
        default: {
          texte = this.interactif
            ? `$\\left(${signe === -1 ? '-' : ''}\\dfrac{${numerateur}}{${denominateur}}\\right)^2=$`
            : `$${signe === -1 ? '-' : ''}\\dfrac{${numerateur}}{${denominateur}}$`
          texteCorr =
            signe === -1
              ? `^2`
              : `$\\left(\\dfrac{${numerateur}}{${denominateur}}\\right)^2`
          const nbAMultiplier =
            signe === -1
              ? `\\left(-\\dfrac{${numerateur}}{${denominateur}}\\right)`
              : `\\left(\\dfrac{${numerateur}}{${denominateur}}\\right)`
          const nbAMultiplier2 =
            signe === -1
              ? `\\left(-\\dfrac{${numerateur}}{${denominateur}}\\right)`
              : `\\dfrac{${numerateur}}{${denominateur}}`
          texteCorr = `$${nbAMultiplier}^2=${nbAMultiplier2} \\times ${nbAMultiplier2}`
          texteCorr += `=${miseEnEvidence(`\\dfrac{${numerateur * numerateur}}{${denominateur * denominateur}}`)}$`
          handleAnswers(this, i, {
            reponse: {
              value: new FractionEtendue(
                numerateur * numerateur,
                denominateur * denominateur,
              ),
              options: { fractionEgale: true },
            },
          })
          break
        }
      }

      if (
        this.questionJamaisPosee(
          i,
          this.sup === 1 || this.sup === 2
            ? entier
            : this.sup === 3 || this.sup === 4
              ? decimal
              : numerateur,
        )
      ) {
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBaseAvecFraction,
        )
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
