import { addMathaleaCouteauSuisse } from '../../lib/customElements/MathaleaCouteauSuisse'
import {
  SchemaEnBarreElement,
  textesVides,
} from '../../lib/customElements/SchemaEnBarreElement'
import { schemaProblemeVarie } from '../../lib/problems/schemaProblemeVarie'
import { context } from '../../modules/context'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  combinaisonListes,
  combinaisonListesSansChangerOrdre,
} from '../../lib/outils/arrayOutils'
import { listeDeProblemesCompMulNbParts } from '../../lib/problems/problemeComparaisonMultiplicative/problemeCompMulNbParts'
import { listeDeProblemesCompMulGdeQuantite } from '../../lib/problems/problemeComparaisonMultiplicative/problemesCompMulGdeQuantite'
import { listeDeProblemesCompMulPteQuantite } from '../../lib/problems/problemeComparaisonMultiplicative/problemesCompMulPteQuantite'
import { listeDeProblemesCompMulTout } from '../../lib/problems/problemeComparaisonMultiplicative/problemesCompMulTout'
import { listeDeProblemesAdditifsPart } from '../../lib/problems/problemesAdditifs/problemesAdditifsPart'
import { listeDeProblemesAdditifsTout } from '../../lib/problems/problemesAdditifs/problemesAdditifsTout'
import { listeDeProblemesCompAddEcart } from '../../lib/problems/problemesComparaisonAdditive/problemesCompAddEcart'
import { listeDeProblemesCompAddGdeQuantite } from '../../lib/problems/problemesComparaisonAdditive/problemesCompAddGdeQuantite'
import { listeDeProblemesCompAddPteQuantite } from '../../lib/problems/problemesComparaisonAdditive/problemesCompAddPteQuantite'
import { listeDeProblemesMultiplicatifs } from '../../lib/problems/problemesMultiplicatifs/problemeMultiplicatifsTout'
import { listeDeProblemesMultiplicatifsNbParts } from '../../lib/problems/problemesMultiplicatifs/problemesMultiplicatifsNbParts'
import { listeDeProblemesMultiplicatifsParts } from '../../lib/problems/problemesMultiplicatifs/problemesMultiplicatifsPart'
import { listeDeProblemesTransfoApres } from '../../lib/problems/problemesTransformations/problemesTransfoApres'
import { listeDeProblemesTransfoAvant } from '../../lib/problems/problemesTransformations/problemesTransfoAvant'
import { listeDeProblemesTransfoTransfo } from '../../lib/problems/problemesTransformations/problemesTransfoTransfo'
import { gestionnaireFormulaireTexte } from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '06/06/2025'
export const dateDeModifImportante = '06/11/2026'

export const interactifReady = true
export const uuid = 'b3aa4'
export const refs = {
  'fr-fr': ['6N5-10', '5N1D'],
  'fr-2016': ['6C32-0'],
  'fr-ch': ['9R1NO7E-7', '9R2NO7E-7', '9R3NO7E-7', 'PRQST02B-13', 'PRQNO15A-7'],
}
export const titre = 'Résoudre des problèmes variés'
/**
 * @author Jean-claude Lhote
 */
export default class ProblemesVaries extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.besoinFormulaireTexte = [
      'Types de problèmes',
      `Nombres séparés par des tirets :\n
1 : Additif recherche du tout\n
2 : Additif recherche d'une partie\n
3 : Transformation recherche avant \n
4 : Transformation recherche après\n 
5 : Transformation recherche transformation \n
6 : Comparaison additive recherche grande quantité\n
7 : Comparaison additive recherche petite quantité\n
8 : Comparaison additive recherche écart\n
9 : Multiplicatif recherche du tout \n
10 : Multiplicatif recherche de la valeur d'une part \n
11 : Multiplicatif recherche du nombre de parts\n
12 : Comparaison multiplicative recherche grande quantité\n
13 : Comparaison multiplicative recherche petite quantité\n
14 : Comparaison multiplicative recherche du tout\n
15 : Comparaison multiplicative recherche du nombre de fois\n
16 : Mélange`,
    ]
    this.besoinFormulaire2CaseACocher = [
      'Avec des nombres décimaux si possible',
      false,
    ]
    this.sup2 = false // pour l'instant pas de décimaux quasiment dans les problèmes
    this.sup = '16'
    this.besoinFormulaire4Numerique = [
      'Utilisation du schéma en barre',
      3,
      '1 : Répondre uniquement\n2 : Compléter le schéma imposé puis répondre\n3 : Choisir et compléter le schéma puis répondre',
    ]
    this.sup4 = 1
    this.sup3 = false // Ce paramètre permet de changer les problèmes choisis par type. Le mettre à true dans l'url pour avoir des problèmes qui ne changent pas d'ordre dans la liste (CDV)
  }

  nouvelleVersion() {
    const modeSchema = Number(this.sup4)
    const avecSchema = modeSchema === 2 || modeSchema === 3
    this.consigne = !avecSchema
      ? ''
      : modeSchema === 2
        ? 'Compléter le schéma en barre avec les données du problème, en écrivant « ? » pour la valeur cherchée, puis répondre à la question.'
        : 'Choisir le schéma qui modélise le problème et le compléter avec ses données, en écrivant « ? » pour la valeur cherchée, puis répondre à la question.'
    if (avecSchema && !this.interactif) {
      this.consigne = `${modeSchema === 2 ? 'Compléter' : 'Réaliser'} un schéma en barre avec les données du problème puis répondre à la question.`
    }
    const fonctionCombinaison = this.sup3
      ? combinaisonListesSansChangerOrdre
      : combinaisonListes
    const typesDeProblemes = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 15,
      defaut: 16,
      melange: 16,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    const problemesAdditifsTout = fonctionCombinaison(
      listeDeProblemesAdditifsTout,
      this.nbQuestions,
    )
    const problemesAdditifsPart = fonctionCombinaison(
      listeDeProblemesAdditifsPart,
      this.nbQuestions,
    )
    const problemesMultiplicatifs = fonctionCombinaison(
      listeDeProblemesMultiplicatifs,
      this.nbQuestions,
    )
    const problemesPartageSimple = fonctionCombinaison(
      listeDeProblemesMultiplicatifsParts,
      this.nbQuestions,
    )
    // const problemesPartageAvecResteRetire = fonctionCombinaison(listeDeProblemesPartageAvecResteRetire, this.nbQuestions)
    //  const problemesComplexes = fonctionCombinaison(listeDeProblemesMultiplicatifsComplexes, this.nbQuestions)
    const problemesCompAddEcart = fonctionCombinaison(
      listeDeProblemesCompAddEcart,
      this.nbQuestions,
    )
    const problemesCompAddGdeQuantite = fonctionCombinaison(
      listeDeProblemesCompAddGdeQuantite,
      this.nbQuestions,
    )
    const problemesCompAddPteQuantite = fonctionCombinaison(
      listeDeProblemesCompAddPteQuantite,
      this.nbQuestions,
    )
    const problemesTransoApres = fonctionCombinaison(
      listeDeProblemesTransfoApres,
      this.nbQuestions,
    )
    const problemesTransfoTransfo = fonctionCombinaison(
      listeDeProblemesTransfoTransfo,
      this.nbQuestions,
    )
    const problemesTransoAvant = fonctionCombinaison(
      listeDeProblemesTransfoAvant,
      this.nbQuestions,
    )
    const problemesMultiplicatifsNbParts = fonctionCombinaison(
      listeDeProblemesMultiplicatifsNbParts,
      this.nbQuestions,
    )
    const problemesCompMulTout = fonctionCombinaison(
      listeDeProblemesCompMulTout,
      this.nbQuestions,
    )
    const problemesCompMulNbParts = fonctionCombinaison(
      listeDeProblemesCompMulNbParts,
      this.nbQuestions,
    )
    const problemesCompMulGdeQuantite = fonctionCombinaison(
      listeDeProblemesCompMulGdeQuantite,
      this.nbQuestions,
    )
    const problemesCompMulPteQuantite = fonctionCombinaison(
      listeDeProblemesCompMulPteQuantite,
      this.nbQuestions,
    )
    const fonctionsProblemes = []
    let indexP1 = 0
    let indexP2 = 0
    let indexP3 = 0
    let indexP4 = 0
    let indexP5 = 0
    let indexP6 = 0
    let indexP7 = 0
    let indexP8 = 0
    let indexP9 = 0
    let indexP10 = 0
    let indexP11 = 0
    let indexP12 = 0
    let indexP13 = 0
    let indexP14 = 0
    let indexP15 = 0

    for (let i = 0; i < this.nbQuestions; i++) {
      switch (typesDeProblemes[i]) {
        case 1:
          fonctionsProblemes.push(
            problemesAdditifsTout[
              indexP1 % listeDeProblemesAdditifsTout.length
            ],
          )
          indexP1++
          break
        case 2:
          fonctionsProblemes.push(
            problemesAdditifsPart[
              indexP2 % listeDeProblemesAdditifsPart.length
            ],
          )
          indexP2++
          break
        case 3:
          fonctionsProblemes.push(
            problemesTransoAvant[indexP3 % listeDeProblemesTransfoAvant.length],
          )
          indexP3++
          break
        case 4:
          fonctionsProblemes.push(
            problemesTransoApres[indexP4 % listeDeProblemesTransfoApres.length],
          )
          indexP4++
          break
        case 5:
          fonctionsProblemes.push(
            problemesTransfoTransfo[
              indexP5 % listeDeProblemesTransfoTransfo.length
            ],
          )
          indexP5++
          break
        case 6:
          fonctionsProblemes.push(
            problemesCompAddGdeQuantite[
              indexP6 % listeDeProblemesCompAddGdeQuantite.length
            ],
          )
          indexP6++
          break
        case 7:
          fonctionsProblemes.push(
            problemesCompAddPteQuantite[
              indexP7 % listeDeProblemesCompAddPteQuantite.length
            ],
          )
          indexP7++
          break
        case 8:
          fonctionsProblemes.push(
            problemesCompAddEcart[
              indexP8 % listeDeProblemesCompAddEcart.length
            ],
          )
          indexP8++
          break
        case 9:
          fonctionsProblemes.push(
            problemesMultiplicatifs[
              indexP9 % listeDeProblemesMultiplicatifs.length
            ],
          )
          indexP9++
          break
        case 10:
          fonctionsProblemes.push(
            problemesPartageSimple[
              indexP10 % listeDeProblemesMultiplicatifsParts.length
            ],
          )
          indexP10++
          break
        case 11:
          fonctionsProblemes.push(
            problemesMultiplicatifsNbParts[
              indexP11 % listeDeProblemesMultiplicatifsNbParts.length
            ],
          )
          indexP11++
          break
        case 12:
          fonctionsProblemes.push(
            problemesCompMulGdeQuantite[
              indexP12 % listeDeProblemesCompMulGdeQuantite.length
            ],
          )
          indexP12++
          break
        case 13:
          fonctionsProblemes.push(
            problemesCompMulPteQuantite[
              indexP13 % listeDeProblemesCompMulPteQuantite.length
            ],
          )
          indexP13++
          break
        case 14:
          fonctionsProblemes.push(
            problemesCompMulTout[indexP14 % listeDeProblemesCompMulTout.length],
          )
          indexP14++
          break
        case 15:
        default:
          fonctionsProblemes.push(
            problemesCompMulNbParts[
              indexP15 % listeDeProblemesCompMulNbParts.length
            ],
          )
          indexP15++
          break
      }
    }
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 100;) {
      const probleme = fonctionsProblemes[i](this.sup2 ?? false)
      const { attendu, correction } = schemaProblemeVarie(
        probleme,
        typesDeProblemes[i],
      )
      const numeroExercice = this.numeroExercice ?? 0
      // Éviter les collisions d'identifiants entre le schéma et le champ réponse.
      const indexReponse = avecSchema ? i + 100 : i
      const reponse = {
        value: probleme.reponse,
        options: probleme.optionsComparaison ?? {},
      }
      const schema =
        avecSchema && (this.interactif || modeSchema === 2)
          ? SchemaEnBarreElement.create({
              numeroExercice,
              questionIndex: i,
              typeImpose: modeSchema === 2 ? attendu.type : undefined,
              interactivityOn: this.interactif,
            })
          : ''
      const champ = this.interactif
        ? ajouteChampTexteMathLive(
            this,
            indexReponse,
            probleme.styleChampTexteMathlive ?? KeyboardType.clavierDeBase,
            probleme.optionsChampTexteMathlive,
          )
        : ''
      let question = `${probleme.enonce}${schema ? `${context.isHtml ? '<br>' : ''}${schema}` : ''}${this.interactif ? `<br>${champ}` : ''}`
      if (this.interactif) {
        if (avecSchema) {
          // Deux points par question, quels que soient le type et le tirage.
          question = addMathaleaCouteauSuisse(this, i, {
            contenu: question,
            elements: [
              {
                formatInteractif: SchemaEnBarreElement.elementTag,
                autoCorrection: {
                  valeur: { reponse: { value: JSON.stringify(attendu) } },
                },
              },
              {
                formatInteractif: 'mathalea-mathfield',
                questionIndex: indexReponse,
                autoCorrection: { valeur: { reponse } },
              },
            ],
          })
        } else {
          handleAnswers(this, i, { reponse })
        }
      }
      if (
        this.questionJamaisPosee(
          i,
          probleme.enonce,
          JSON.stringify(probleme.data),
        )
      ) {
        this.listeQuestions.push(question)
        this.listeCorrections.push(
          probleme.correction +
            '<br><br>' +
            SchemaEnBarreElement.create({
              id: `schemaEnBarreCorrEx${numeroExercice}Q${i}`,
              numeroExercice,
              questionIndex: i,
              initialState: {
                type: attendu.type,
                textes: {
                  ...textesVides(),
                  ...attendu.textesIndicatifs,
                  ...correction,
                },
                nbRectangles: attendu.nbRectangles ?? 'plus',
              },
              interactivityOn: false,
            }),
        )
        i++
      }
      cpt++
    }
  }
}
