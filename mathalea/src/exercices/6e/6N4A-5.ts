import {
  addMathaleaCouteauSuisse,
  type MathaleaCouteauSuisseChild,
} from '../../lib/customElements/MathaleaCouteauSuisse'
import {
  clesNombresVerifies,
  SchemaEnBarreElement,
  sixSchemasVidesTypst,
  textesVides,
  TYPES_SCHEMA_EN_BARRE,
  type SchemaEnBarreType,
} from '../../lib/customElements/SchemaEnBarreElement'
import { MultiMathfieldElement } from '../../lib/customElements/MultiMathfield'
import { toutPourUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import {
  problemesSchemasEnBarre,
  texConclusion,
  texLigneCalcul,
  type ProblemeSchemaEnBarre,
} from '../../lib/problems/problemesSchemasEnBarre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import { context } from '../../modules/context'
import Exercice from '../Exercice'

export const titre = 'Modéliser un problème par un schéma en barre'
export const dateDePublication = '19/09/2026'
export const dateDeModifImportante = '08/11/2026'
export const interactifReady = true
export const uuid = '4cbb7'
export const refs = {
  'fr-fr': ['6N4A-5'],
  'fr-ch': ['9R1NO7F-8', '9R2NO7F-8', '9R3NO7F-8', 'PRQST02C-8'],
}

/**
 * Le champ de la phrase de conclusion est un second enfant du couteau suisse :
 * il reçoit un index de question décalé pour que ses identifiants
 * (`champTexteEx…Q…`, `resultatCheckEx…Q…`) ne se confondent pas avec ceux du
 * schéma, qui porte l'index de la question.
 */
const DECALAGE_INDEX_CONCLUSION = 100

/**
 * L'élève choisit parmi les six schémas en barre celui qui modélise le
 * problème (additif ou multiplicatif ; parties-tout, comparaison ou comparaison
 * avec total), le complète avec les données de l'énoncé et un « ? » pour la
 * valeur cherchée, puis écrit la réponse dans la phrase de conclusion.
 * @author Rémi Angot
 */
export default class ModeliserParUnSchemaEnBarre extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.besoinFormulaireTexte = [
      'Types de problèmes',
      'Nombres séparés par des tirets :\n1 : Additif de parties-tout\n2 : Additif de comparaison\n3 : Additif de comparaison avec total\n4 : Multiplicatif de parties-tout\n5 : Multiplicatif de comparaison\n6 : Multiplicatif de comparaison avec total\n7 : Mélange',
    ]
    this.sup = '7'
    this.besoinFormulaire2CaseACocher = [
      "Imposer le type de schéma (l'élève ne fait que le compléter)",
      false,
    ]
    this.sup2 = false
    this.besoinFormulaire3CaseACocher = ['Unités dans les calculs', false]
    this.sup3 = false
    this.besoinFormulaire4Numerique = [
      'Évaluation du schéma',
      2,
      "1 : Le schéma n'est pas évalué (seul le résultat final compte)\n2 : Le schéma et le résultat final sont évalués (1 point chacun)",
    ]
    this.sup4 = 2
    this.besoinFormulaire5CaseACocher = [
      'Impression : afficher les six schémas vides en introduction (sans type imposé)',
      false,
    ]
    this.sup5 = false
  }

  nouvelleVersion() {
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 6,
      defaut: 7,
      melange: 7,
      nbQuestions: this.nbQuestions,
    }).map((n) => TYPES_SCHEMA_EN_BARRE[Number(n) - 1])
    const tirages = Object.fromEntries(
      TYPES_SCHEMA_EN_BARRE.map((type) => [
        type,
        combinaisonListes(problemesSchemasEnBarre[type], this.nbQuestions),
      ]),
    ) as Record<SchemaEnBarreType, (() => ProblemeSchemaEnBarre)[]>
    const indices = Object.fromEntries(
      TYPES_SCHEMA_EN_BARRE.map((type) => [type, 0]),
    ) as Record<SchemaEnBarreType, number>
    const schemaEvalue = Number(this.sup4) !== 1
    if (this.interactif) {
      this.consigne = this.sup2
        ? 'Compléter le schéma en barres avec les données du problème puis répondre à la question.'
        : 'Choisir le schéma qui modélise le problème et le compléter avec ses données, en écrivant «\u00a0?\u00a0» pour la valeur cherchée, puis répondre à la question.'
    } else {
      this.consigne = `${this.sup2 ? 'Compléter' : 'Réaliser'} un schéma en barres avec les données du problème puis répondre à la question.`
    }
    // Pour choisir un schéma et le recopier sur la copie (inutile si le type
    // est imposé).
    this.introduction =
      context.isTypst && this.sup5 && !this.sup2 ? sixSchemasVidesTypst() : ''
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = types[i]
      const probleme = tirages[type][indices[type]++ % tirages[type].length]()
      if (!this.questionJamaisPosee(i, probleme.enonce)) continue
      const { attendu, conclusion } = probleme
      const { suite } = conclusion
      const typeImpose = this.sup2 ? attendu.type : undefined
      const numeroExercice = this.numeroExercice ?? 0
      const indexConclusion = i + DECALAGE_INDEX_CONCLUSION
      const uniteEtSuite = `${conclusion.unite}${conclusion.apres === '' ? '.' : ` ${conclusion.apres}`}`

      let schema = ''
      if (this.interactif) {
        schema = SchemaEnBarreElement.create({
          numeroExercice,
          questionIndex: i,
          typeImpose,
        })
      } else if (typeImpose != null) {
        // Sur papier ou sans interactivité : le gabarit vide du schéma imposé.
        schema = SchemaEnBarreElement.create({
          id: `schemaEnBarreVideEx${numeroExercice}Q${i}`,
          numeroExercice,
          questionIndex: i,
          typeImpose,
          interactivityOn: false,
        })
      }
      let phrase = ''
      if (this.interactif) {
        phrase =
          suite == null
            ? ajouteChampTexteMathLive(
                this,
                indexConclusion,
                KeyboardType.clavierDeBase,
                { texteAvant: conclusion.avant, texteApres: uniteEtSuite },
              )
            : // Deux réponses dans la même phrase, pour un seul point.
              MultiMathfieldElement.create({
                numeroExercice,
                questionIndex: indexConclusion,
                dataTemplate: `${conclusion.avant} %{champ1} ${conclusion.unite} ${suite.avant} %{champ2} ${suite.unite}.`,
                dataOptions: {
                  champ1: { keyboard: KeyboardType.clavierDeBase },
                  champ2: { keyboard: KeyboardType.clavierDeBase },
                },
              })
      }
      // Le <br> avant le schéma : une ligne terminée par un saut forcé n'est
      // pas justifiée, la dernière ligne de l'énoncé reste alignée à gauche.
      const contenu = `${probleme.enonce}${context.isHtml ? '<br>' : ''}${schema}<br>${phrase}`

      if (this.interactif) {
        const elements: MathaleaCouteauSuisseChild[] = []
        if (schemaEvalue) {
          elements.push({
            formatInteractif: SchemaEnBarreElement.elementTag,
            autoCorrection: {
              valeur: { reponse: { value: JSON.stringify(attendu) } },
            },
          })
        }
        elements.push(
          suite == null
            ? {
                formatInteractif: 'mathalea-mathfield',
                questionIndex: indexConclusion,
                autoCorrection: {
                  valeur: {
                    reponse: {
                      value: texNombre(conclusion.reponse, 2),
                      options: { noFeedback: true },
                    },
                  },
                },
              }
            : {
                formatInteractif: 'multi-mathfield',
                questionIndex: indexConclusion,
                autoCorrection: {
                  valeur: {
                    champ1: {
                      value: texNombre(conclusion.reponse, 2),
                      options: { noFeedback: true },
                    },
                    champ2: {
                      value: texNombre(suite.reponse, 2),
                      options: { noFeedback: true },
                    },
                    bareme: toutPourUnPoint,
                  },
                },
              },
        )
        this.listeQuestions[i] = addMathaleaCouteauSuisse(this, i, {
          elements,
          contenu,
        })
      } else {
        this.listeQuestions[i] = contenu
      }

      const schemaCorrige = SchemaEnBarreElement.create({
        id: `schemaEnBarreCorrEx${numeroExercice}Q${i}`,
        numeroExercice,
        questionIndex: i,
        initialState: {
          type: attendu.type,
          textes: {
            ...textesVides(),
            ...attendu.textesIndicatifs,
            ...attendu.textes,
          },
          nbRectangles: attendu.nbRectangles ?? 'plus',
        },
        // Les nombres à placer pour que le schéma soit compté juste.
        nombresEnEvidence: schemaEvalue
          ? clesNombresVerifies(attendu.textes)
          : [],
        interactivityOn: false,
      })
      const calculs = probleme.calculs
        .map((calcul, index) =>
          texLigneCalcul(
            calcul,
            this.sup3,
            index === probleme.calculs.length - 1,
          ),
        )
        .join('<br>')
      this.listeCorrections[i] =
        `${probleme.explication}${schemaCorrige}${calculs}<br>${texConclusion(conclusion)}`
      i++
    }
    listeQuestionsToContenu(this)
  }
}
