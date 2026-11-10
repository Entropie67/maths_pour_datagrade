import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Effectuer des conversions d’aire (du cm² au m²)'
export const interactifReady = true

export const dateDePublication = '28/07/2025'
export const dateDeModifImportante = '9/09/2025'
// Ajout de l'interactivité et changements dans les polices pour les unités

/**
 * Effectuer des conversions d’aire (du cm^2 au m^2)
 * @author Éric Elter

 */
export const uuid = '026d9'

export const refs = {
  'fr-fr': ['6M2A'],
  'fr-2016': ['6M23-1'],
  'fr-ch': ['9R1GM4C-1', '9R2GM4C-1', '9R3GM4C-1', 'PRQMG04B-6'],
}
export default class convertirAiresVersion2025 extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 4
    this.besoinFormulaireTexte = [
      'Type de conversions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Du m² au dm²',
        '2 : Du dm² au m²',
        '3 : Du dm² au cm²',
        '4 : Du cm² au dm²',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.sup = 5
    this.besoinFormulaire2CaseACocher = ['Avec des nombres décimaux']
    this.sup2 = false
    this.consigne = 'Convertir.'
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    let typesDeConversions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    typesDeConversions = combinaisonListes(typesDeConversions, this.nbQuestions)

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // Boucle principale où i+1 correspond au numéro de la question
      texte = ''
      texteCorr = ''
      texte = ''

      let unite1 = ''
      let unite2 = ''
      switch (typesDeConversions[i]) {
        case 1:
          unite1 = '\\text{ m}^2'
          unite2 = '~\\text{dm}^2'
          break
        case 2:
          unite1 = '~\\text{dm}^2'
          unite2 = '\\text{ m}^2'
          break
        case 3:
          unite1 = '~\\text{dm}^2'
          unite2 = '\\text{ cm}^2'
          break
        case 4:
          unite1 = '\\text{ cm}^2'
          unite2 = '~\\text{dm}^2'
          break
      }
      let val = 0
      if (this.sup2) {
        // Si la case pour les nombres décimaux est cochée
        val = choice([
          arrondi(randint(1, 19) + randint(1, 19) / 10),
          arrondi(randint(1, 9) / 10),
          arrondi(randint(1, 9) / 100),
          arrondi(
            randint(1, 9) * 100 + randint(1, 9) * 10 + randint(1, 9) / 100,
          ),
        ])
        // XX,X 0,X 0,0X X,XX
      } else {
        val = choice([
          randint(1, 9),
          randint(1, 9) * 10,
          randint(1, 9) * 100,
          randint(1, 9) * 10 + randint(1, 9),
        ])
        // X, X0, X00, XX
      }
      const versUnitePlusPetite = typesDeConversions[i] % 2 === 1
      if (this.interactif) {
        texte += `$${texNombre(val)} ${unite1} = $`
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
          texteApres: ` $${unite2}$`,
        })
        handleAnswers(this, i, {
          reponse: {
            value: versUnitePlusPetite
              ? arrondi(val * 100)
              : arrondi(val / 100),
          },
        })
      } else {
        texte += `$${texNombre(val)} ${unite1} = \\ldots\\ldots\\ldots\\ldots ${unite2}$`
      }
      const adjectif = versUnitePlusPetite ? 'grande' : 'petite'
      const facteur = versUnitePlusPetite
        ? '100'
        : new FractionEtendue(1, 100).texFraction
      const reponse = texNombre(
        versUnitePlusPetite ? arrondi(val * 100) : arrondi(val / 100),
      )
      const operation = versUnitePlusPetite ? '~\\times~' : '~\\div~'
      texteCorr = `$1${unite1} = ${facteur} ${unite2}$ et donc la mesure en $${unite2}$ est $100$ fois plus ${adjectif} que la mesure en $${unite1}$`
      texteCorr += versUnitePlusPetite
        ? ` ($1 ${unite1}$ est une centaine de $${unite2}$)`
        : ` ($1 ${unite1}$ est un centième de $${unite2}$)`
      texteCorr += '.<br>'
      texteCorr += `$${texNombre(val)} ${unite1} = ${texNombre(val)} ${miseEnEvidence(`\\times 1${sp()}${unite1}`, bleuMathalea)}$ = `
      if (!versUnitePlusPetite)
        texteCorr += `$${texNombre(val)} ${miseEnEvidence(`\\times \\dfrac{1}{100}${sp()}${unite2}`, bleuMathalea)}$ = `
      texteCorr += `$${texNombre(val)} ${miseEnEvidence(`${operation} 100${sp()}${unite2}`, bleuMathalea)} = ${miseEnEvidence(reponse)} ${unite2}$`
      if (this.questionJamaisPosee(i, val)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
