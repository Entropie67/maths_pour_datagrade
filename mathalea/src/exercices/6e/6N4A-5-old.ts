// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid b7c21 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import {
  addMathaleaCouteauSuisse,
  type MathaleaCouteauSuisseChild,
} from '../../lib/customElements/MathaleaCouteauSuisse'
import {
  clesNombresVerifies,
  SchemaEnBarreElement,
  textesVides,
} from '../../lib/customElements/SchemaEnBarreElement'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import {
  famillesArchive6N4A5,
  texConclusion,
  texLigneCalcul,
} from '../../lib/problems/problemesSchemasEnBarre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import { context } from '../../modules/context'
import Exercice from '../Exercice'

export const titre = 'Modéliser un problème par un schéma en barre'
export const dateDePublication = '19/09/2026'
export const dateDeModifImportante = '02/11/2026'
export const interactifReady = true
export const uuid = 'b7c21'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

/**
 * Le champ de la phrase de conclusion est un second enfant du couteau suisse :
 * il reçoit un index de question décalé pour que ses identifiants
 * (`champTexteEx…Q…`, `resultatCheckEx…Q…`) ne se confondent pas avec ceux du
 * schéma, qui porte l'index de la question.
 */
const DECALAGE_INDEX_CONCLUSION = 100

/**
 * L'élève choisit parmi les quatre schémas en barre celui qui modélise le
 * problème (additif ou multiplicatif, parties-tout ou comparaison), le
 * complète avec les données de l'énoncé et un « ? » pour la valeur cherchée,
 * puis écrit la réponse dans la phrase de conclusion.
 * @author Rémi Angot
 */
export default class ModeliserParUnSchemaEnBarreOld extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.besoinFormulaireTexte = [
      'Types de problèmes',
      'Nombres séparés par des tirets :\n1 : Additif de parties-tout\n2 : Additif de comparaison\n3 : Multiplicatif de parties-tout\n4 : Multiplicatif de comparaison\n5 : Mélange',
    ]
    this.sup = '5'
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
  }

  nouvelleVersion() {
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      defaut: 5,
      melange: 5,
      nbQuestions: this.nbQuestions,
    }).map((n) => Number(n) - 1)
    const tirages = famillesArchive6N4A5.map((famille) =>
      combinaisonListes(famille, this.nbQuestions),
    )
    const indices = famillesArchive6N4A5.map(() => 0)
    const schemaEvalue = Number(this.sup4) !== 1
    if (this.interactif) {
      this.consigne = this.sup2
        ? 'Compléter le schéma en barres avec les données du problème puis répondre à la question.'
        : 'Choisir le schéma qui modélise le problème et le compléter avec ses données, en écrivant «\u00a0?\u00a0» pour la valeur cherchée, puis répondre à la question.'
    } else {
      this.consigne = `${this.sup2 ? 'Compléter' : 'Réaliser'} un schéma en barres avec les données du problème puis répondre à la question.`
    }
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = types[i]
      const probleme = tirages[type][indices[type]++ % tirages[type].length]()
      if (!this.questionJamaisPosee(i, probleme.enonce)) continue
      const { attendu, conclusion } = probleme
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
      const phrase = this.interactif
        ? ajouteChampTexteMathLive(
            this,
            indexConclusion,
            KeyboardType.clavierDeBase,
            { texteAvant: conclusion.avant, texteApres: uniteEtSuite },
          )
        : ''
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
        elements.push({
          formatInteractif: 'mathalea-mathfield',
          questionIndex: indexConclusion,
          autoCorrection: {
            valeur: {
              reponse: { value: texNombre(conclusion.reponse, 2) },
            },
          },
        })
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
