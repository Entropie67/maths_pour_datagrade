import { amcConvert } from '../../lib/amc/amcBuilders'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha, sp } from '../../lib/outils/outilString'
import { listeDesDiviseurs } from '../../lib/outils/primalite'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Résoudre des problèmes avec recherche de diviseurs communs'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDePublication = '17/08/2021'

/**
 * 3 problèmes : Trouver le nombre maximal de groupes, de bouquets ou de corbeilles
 * en cherchant le plus grand diviseur commun de deux nombres.
 * Donner ensuite la composition de chaque groupe, bouquet ou corbeille.
 * @author Laurence Candille et Jean-claude Lhote (pour l'export AMC)
 */
export const uuid = '8e05e'

export const refs = {
  'fr-fr': ['3A12-3'],
  'fr-ch': ['9R2NO1H-4', '9R3NO1H-4', '10CTNO1B-4', 'PRQNO09C-6', 'PRQNO15B-7'],
}
export default class ResoudreDesProblemesDiviseursCommuns extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des problèmes',
      'Nombres séparés par des tirets :\n1 : Fleuriste\n2 : Professeur\n3 : Boulanger\n4 : Mélange',
    ]

    this.nbQuestions = 1

    this.sup = '4'
    this.spacing = 2
  }

  nouvelleVersion() {
    const listeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
      shuffle: false,
    })

    const nombrePremier = [2, 3, 5, 7, 11]

    for (
      let i = 0,
        texte,
        texteSansQuestions,
        texteA,
        texteB,
        texteC,
        texteCorr,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const objet = randint(30, 39) // objet représente : le nombre max de bouquets, de corbeilles ou de groupes
      const a = randint(0, 4)
      const var1 = nombrePremier[a] // var 1 est le nbre d iris, de croissants ou de garçons
      const b = randint(0, 4, [a])
      const var2 = nombrePremier[b] // var 2 est le nbre de roses, de brioches ou de filles

      switch (listeQuestions[i]) {
        case 1:
          // if (this.interactif) {
          texte = `Un fleuriste dispose de $${var1 * objet}$ iris et de $${var2 * objet}$ roses.<br>`
          texte +=
            'Il veut, en utilisant toutes ses fleurs, réaliser un maximum de bouquets '
          texte +=
            "contenant tous le même nombre d'iris et le même nombre de roses.<br>"
          texte +=
            'Donner le nombre maximal de bouquets que le fleuriste peut réaliser '
          texte += 'et la composition du bouquet.<br>'
          texteSansQuestions = texte
          texteA = context.isAmc ? numAlpha(0) : ''
          texteA += `Nombre maximal de bouquets :`

          texteCorr = numAlpha(0)
          texteCorr += `Le nombre maximal de bouquets est le plus grand diviseur commun de $${var1 * objet}$ et de $${var2 * objet}$.<br>`
          texteCorr += `${sp(2)}- Les diviseurs de $${var1 * objet}$ sont : $${listeDesDiviseurs(var1 * objet).join(', ')}$.<br>`
          texteCorr += `${sp(2)}- Les diviseurs de $${var2 * objet}$ sont : $${listeDesDiviseurs(var2 * objet).join(', ')}$.<br>`
          texteCorr += `$${objet}$ est le plus grand nombre qui divise à la fois $${var1 * objet}$ et $${var2 * objet}$.<br>`
          texteCorr +=
            ' Le nombre maximal de bouquets est donc : $' +
            miseEnEvidence(`${objet}`) +
            '$.<br><br>'
          texteB = context.isAmc ? numAlpha(1) : ''
          texteB += `Nombre d'iris dans chaque bouquet :`

          texteCorr +=
            numAlpha(1) + ` $${var1 * objet} \\div ${objet} = ${var1}$<br>`
          texteCorr +=
            "Le nombre d'iris dans chaque bouquet est : $" +
            miseEnEvidence(` ${var1}`) +
            '$.<br><br>'
          texteC = context.isAmc ? numAlpha(2) : ''
          texteC += 'Nombre de roses dans chaque bouquet :'

          texteCorr +=
            numAlpha(2) + ` $${var2 * objet} \\div ${objet} = ${var2}$<br>`
          texteCorr +=
            'Le nombre de roses dans chaque bouquet est : $' +
            miseEnEvidence(` ${var2}`) +
            '$.'
          break
        case 2:
          texte = `Un professeur organise une sortie pédagogique au Futuroscope pour ses élèves de 3ème. Il est accompagné de $${var1 * objet}$ garçons et de $${var2 * objet}$ filles.<br>`
          texte +=
            'Il souhaite répartir tous les élèves en réalisant un maximum de groupes '
          texte +=
            'contenant tous le même nombre de garçons et le même nombre de filles.<br>'
          texte +=
            'Donner le nombre maximal de groupes que le professeur peut réaliser '
          texte += 'et la composition de chaque groupe.<br>'
          texteSansQuestions = texte
          texteA = context.isAmc ? numAlpha(0) : ''
          texteA += `Nombre maximal de groupes :`

          texteCorr = numAlpha(0)
          texteCorr += `Le nombre maximal de groupes est le plus grand diviseur commun de $${var1 * objet}$ et de $${var2 * objet}$.<br>`
          texteCorr += `${sp(2)}- Les diviseurs de $${var1 * objet}$ sont : $${listeDesDiviseurs(var1 * objet).join(', ')}$.<br>`
          texteCorr += `${sp(2)}- Les diviseurs de $${var2 * objet}$ sont : $${listeDesDiviseurs(var2 * objet).join(', ')}$.<br>`
          texteCorr += `$${objet}$ est le plus grand nombre qui divise à la fois $${var1 * objet}$ et $${var2 * objet}$.<br>`
          texteCorr +=
            ' Le nombre maximal de groupes est donc : $' +
            miseEnEvidence(`${objet}`) +
            '$.<br><br>'
          texteB = context.isAmc ? numAlpha(1) : ''
          texteB += `Nombre de garçons dans chaque groupe :`

          texteCorr +=
            numAlpha(1) + ` $${var1 * objet} \\div ${objet} = ${var1}$<br>`
          texteCorr +=
            'Le nombre de garçons dans chaque groupe est : $' +
            miseEnEvidence(` ${var1}`) +
            '$.<br><br>'
          texteC = context.isAmc ? numAlpha(2) : ''
          texteC += 'Nombre de filles dans chaque groupe :'

          texteCorr +=
            numAlpha(2) + ` $${var2 * objet} \\div ${objet} = ${var2}$<br>`
          texteCorr +=
            'Le nombre de filles dans chaque groupe est : $' +
            miseEnEvidence(` ${var2}`) +
            '$.'
          break
        default: // si un utilisateur saisit 4 ou une valeur erronée renvoie par défaut vers le prbme 3
          texte = `Un boulanger dispose de $${var1 * objet}$ croissants et de $${var2 * objet}$ brioches.<br>`
          texte +=
            'Il veut, en utilisant toutes ses viennoiseries, réaliser un maximum de corbeilles '
          texte +=
            'contenant toutes le même nombre de croissants et le même nombre de brioches.<br>'
          texte +=
            'Donner le nombre maximal de corbeilles que le boulanger peut réaliser '
          texte += 'et la composition de chaque corbeille.<br>'
          texteSansQuestions = texte
          texteA = context.isAmc ? numAlpha(0) : ''
          texteA += `Nombre maximal de corbeilles :`

          texteCorr = numAlpha(0)
          texteCorr += `Le nombre maximal de corbeilles est le plus grand diviseur commun de $${var1 * objet}$ et de $${var2 * objet}$.<br>`
          texteCorr += `${sp(2)}- Les diviseurs de $${var1 * objet}$ sont : $${listeDesDiviseurs(var1 * objet).join(', ')}$.<br>`
          texteCorr += `${sp(2)}- Les diviseurs de $${var2 * objet}$ sont : $${listeDesDiviseurs(var2 * objet).join(', ')}$.<br>`
          texteCorr += `$${objet}$ est le plus grand nombre qui divise à la fois $${var1 * objet}$ et $${var2 * objet}$.<br>`
          texteCorr +=
            ' Le nombre maximal de corbeilles est donc : $' +
            miseEnEvidence(`${objet}`) +
            '$.<br><br>'
          texteB = context.isAmc ? numAlpha(1) : ''
          texteB += `Nombre de croissants dans chaque corbeille :`

          texteCorr +=
            numAlpha(1) + ` $${var1 * objet} \\div ${objet} = ${var1}$<br>`
          texteCorr +=
            'Le nombre de croissants dans chaque corbeille est : $' +
            miseEnEvidence(` ${var1}`) +
            '$.<br><br>'
          texteC = context.isAmc ? numAlpha(2) : ''
          texteC += 'Nombre de brioches dans chaque corbeille :'

          texteCorr +=
            numAlpha(2) + ` $${var2 * objet} \\div ${objet} = ${var2}$<br>`
          texteCorr +=
            'Le nombre de brioches dans chaque corbeille est : $' +
            miseEnEvidence(` ${var2}`) +
            '$.'
          break
      } // fin du switch
      texte += addMultiMathfield(this, i, {
        dataTemplate: createList({
          items: [
            `${texteA} %{champ1}`,
            `${texteB} %{champ2}`,
            `${texteC} %{champ3}`,
          ],
          style: 'alpha',
        }),
        dataOptions: {
          champ1: { keyboard: KeyboardType.clavierNumbers },
          champ2: { keyboard: KeyboardType.clavierNumbers },
          champ3: { keyboard: KeyboardType.clavierNumbers },
        },
      })
      handleAnswers(
        this,
        i,
        {
          champ1: { value: objet },
          champ2: { value: var1 },
          champ3: { value: var2 },
          bareme: toutAUnPoint,
        },
        { formatInteractif: 'multi-mathfield' },
      )

      if (this.questionJamaisPosee(i, var1, var2, objet)) {
        if (context.isAmc) {
          this.autoCorrectionAMC[i] = {
            enonce: '',
            enonceAvant: false,
            propositions: [
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: texteCorr,
                    statut: '',
                    reponse: {
                      texte: texteSansQuestions + '<br>' + texteA,
                      valeur: objet,
                      param: {
                        digits: 2,
                        decimals: 0,
                        signe: false,
                        approx: 0,
                      },
                    },
                  },
                ],
              },
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    statut: '',
                    reponse: {
                      texte: texteB,
                      valeur: var1,
                      param: {
                        digits: 2,
                        decimals: 0,
                        signe: false,
                        approx: 0,
                      },
                    },
                  },
                ],
              },
              {
                type: 'AMCNum',
                propositions: [
                  {
                    texte: '',
                    statut: '',
                    reponse: {
                      texte: texteC,
                      valeur: var2,
                      param: {
                        digits: 2,
                        decimals: 0,
                        signe: false,
                        approx: 0,
                      },
                    },
                  },
                ],
              },
            ],
          }
          this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
        }
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    } // fin du for

    listeQuestionsToContenu(this)
  }
}
