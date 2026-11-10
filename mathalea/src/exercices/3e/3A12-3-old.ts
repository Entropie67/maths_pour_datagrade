import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
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
export const uuid = '8c05e'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class ResoudreDesProblemesDiviseursCommunsOld extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des problèmes',
      'Nombres séparés par des tirets :\n1 : Fleuriste\n2 : Professeur\n3 : Boulanger\n4 : Mélange',
    ]

    this.nbQuestions = 3

    this.sup = '4'
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
          if (this.interactif && !context.isAmc) {
            texte = `Un fleuriste dispose de ${var1 * objet} iris et de ${var2 * objet} roses. <br>`
            texte +=
              'Il veut, en utilisant toutes ses fleurs, réaliser un maximum de bouquets '
            texte +=
              "contenant tous le même nombre d'iris et le même nombre de roses. <br>"
            texte +=
              'Donner le nombre maximal de bouquets que le fleuriste peut réaliser '
            texte += 'et la composition du bouquet.<br><br>'
            texteA = numAlpha(0) + `Nombre maximal de bouquets :${sp(20)}`
            texte += texteA
            texte +=
              ajouteChampTexteMathLive(
                this,
                3 * i,
                KeyboardType.clavierNumbers,
              ) + '<br><br>'
            texteCorr = numAlpha(0)
            texteCorr += `- Les diviseurs de ${var1 * objet} sont : ${listeDesDiviseurs(var1 * objet).join(', ')}.<br>`
            texteCorr += `${sp(2)}- Les diviseurs de ${var2 * objet} sont : ${listeDesDiviseurs(var2 * objet).join(', ')}.<br>`
            texteCorr += `${objet} est le plus grand nombre qui divise à la fois ${var1 * objet} et ${var2 * objet}.<br>`
            texteCorr +=
              ' Le nombre maximal de bouquets est donc : ' +
              texteEnCouleurEtGras(`${objet}`) +
              '.<br><br>'
            handleAnswers(
              this,
              3 * i,
              { reponse: { value: objet } },
              { formatInteractif: 'mathlive' },
            )

            texteB = numAlpha(1) + `Nombre d'iris dans chaque bouquet :${sp(8)}`
            texte += texteB
            texte +=
              ajouteChampTexteMathLive(
                this,
                3 * i + 1,
                KeyboardType.clavierNumbers,
              ) + '<br><br>'
            texteCorr +=
              numAlpha(1) + ` $${var1 * objet} \\div ${objet} = ${var1}$<br>`
            texteCorr +=
              "Le nombre d'iris dans chaque bouquet est :" +
              texteEnCouleurEtGras(` ${var1}`) +
              '.<br><br>'
            handleAnswers(
              this,
              3 * i + 1,
              { reponse: { value: var1 } },
              { formatInteractif: 'mathlive' },
            )

            texteC = numAlpha(2) + ' Nombre de roses dans chaque bouquet :'
            texte += texteC
            texte +=
              ajouteChampTexteMathLive(
                this,
                3 * i + 2,
                KeyboardType.clavierNumbers,
              ) + '<br>'
            texteCorr +=
              numAlpha(2) + ` $${var2 * objet} \\div ${objet} = ${var2}$<br>`
            texteCorr +=
              'Le nombre de roses dans chaque bouquet est :' +
              texteEnCouleurEtGras(` ${var2}`) +
              '.<br><br>'
            handleAnswers(
              this,
              3 * i + 2,
              { reponse: { value: var2 } },
              { formatInteractif: 'mathlive' },
            )
          } else {
            texte = `Un fleuriste dispose de ${var1 * objet} iris et de ${var2 * objet} roses. <br>`
            texte +=
              'Il veut, en utilisant toutes ses fleurs, réaliser un maximum de bouquets '
            texte +=
              "contenant tous le même nombre d'iris et le même nombre de roses. <br><br>"
            texteSansQuestions = texte
            texteA =
              numAlpha(0) + 'Quel est le nombre maximal de bouquets ?<br><br>'
            texte += texteA
            texteCorr = numAlpha(0)
            texteCorr += `- Les diviseurs de ${var1 * objet} sont : ${listeDesDiviseurs(var1 * objet).join(', ')}.<br>`
            texteCorr += `${sp(2)}- Les diviseurs de ${var2 * objet} sont : ${listeDesDiviseurs(var2 * objet).join(', ')}.<br>`
            texteCorr += `${objet} est le plus grand nombre qui divise à la fois ${var1 * objet} et ${var2 * objet}.<br>`
            texteCorr +=
              ' Le nombre maximal de bouquets est donc : ' +
              texteEnCouleurEtGras(`${objet}`) +
              '.<br><br>'

            texteB =
              numAlpha(1) +
              "Quel est le nombre d'iris dans chaque bouquet ?<br><br>"
            texte += texteB
            texteCorr +=
              numAlpha(1) + ` $${var1 * objet} \\div ${objet} = ${var1}$<br>`
            texteCorr +=
              "Le nombre d'iris dans chaque bouquet est :" +
              texteEnCouleurEtGras(` ${var1}`) +
              '.<br><br>'

            texteC =
              numAlpha(2) +
              'Quel est le nombre de roses dans chaque bouquet ?<br><br>'
            texte += texteC
            texteCorr +=
              numAlpha(2) + ` $${var2 * objet} \\div ${objet} = ${var2}$<br>`
            texteCorr +=
              'Le nombre de roses dans chaque bouquet est :' +
              texteEnCouleurEtGras(` ${var2}`) +
              '.<br><br>'
          }
          break
        case 2:
          if (this.interactif && !context.isAmc) {
            texte = `Un professeur organise une sortie pédagogique au Futuroscope pour ses élèves de 3ème. Il est accompagné de ${var1 * objet} garçons et de ${var2 * objet} filles. <br>`
            texte +=
              'Il souhaite répartir tous les élèves en réalisant un maximum de groupes '
            texte +=
              'contenant tous le même nombre de garçons et le même nombre de filles. <br>'
            texte +=
              'Donner le nombre maximal de groupes que le professeurs peut réaliser '
            texte += 'et la composition de chaque groupe.<br><br>'
            texteA = numAlpha(0) + `Nombre maximal de groupes :${sp(26)}`
            texte += texteA
            texte +=
              ajouteChampTexteMathLive(
                this,
                3 * i,
                KeyboardType.clavierNumbers,
              ) + '<br><br>'
            texteCorr = numAlpha(0)
            texteCorr += `- Les diviseurs de ${var1 * objet} sont : ${listeDesDiviseurs(var1 * objet).join(', ')}.<br>`
            texteCorr += `${sp(2)}- Les diviseurs de ${var2 * objet} sont : ${listeDesDiviseurs(var2 * objet).join(', ')}.<br>`
            texteCorr += `${objet} est le plus grand nombre qui divise à la fois ${var1 * objet} et ${var2 * objet}.<br>`
            texteCorr +=
              ' Le nombre maximal de groupes est donc : ' +
              texteEnCouleurEtGras(`${objet}`) +
              '.<br><br>'
            handleAnswers(
              this,
              3 * i,
              { reponse: { value: objet } },
              { formatInteractif: 'mathlive' },
            )

            texteB = numAlpha(1) + 'Nombre de garçons dans chaque groupe :'
            texte += texteB
            texte +=
              ajouteChampTexteMathLive(
                this,
                3 * i + 1,
                KeyboardType.clavierNumbers,
              ) + '<br><br>'
            texteCorr +=
              numAlpha(1) + ` $${var1 * objet} \\div ${objet} = ${var1}$<br>`
            texteCorr +=
              'Le nombre de garçons dans chaque groupe est :' +
              texteEnCouleurEtGras(` ${var1}`) +
              '.<br><br>'
            handleAnswers(
              this,
              3 * i + 1,
              { reponse: { value: var1 } },
              { formatInteractif: 'mathlive' },
            )

            texteC =
              numAlpha(2) + ` Nombre de filles dans chaque groupe :${sp(6)}`
            texte += texteC
            texte +=
              ajouteChampTexteMathLive(
                this,
                3 * i + 2,
                KeyboardType.clavierNumbers,
              ) + '<br>'
            texteCorr +=
              numAlpha(2) + ` $${var2 * objet} \\div ${objet} = ${var2}$<br>`
            texteCorr +=
              'Le nombre de filles dans chaque groupe est :' +
              texteEnCouleurEtGras(` ${var2}`) +
              '.<br><br>'
            handleAnswers(
              this,
              3 * i + 2,
              { reponse: { value: var2 } },
              { formatInteractif: 'mathlive' },
            )
          } else {
            texte = `Un professeur organise une sortie pédagogique au Futuroscope pour ses élèves de 3ème. Il est accompagné de ${var1 * objet} garçons et de ${var2 * objet} filles. <br>`
            texte +=
              'Il souhaite répartir tous les élèves en réalisant un maximum de groupes '
            texte +=
              'contenant tous le même nombre de garçons et le même nombre de filles. <br><br>'
            texteSansQuestions = texte
            texteA =
              numAlpha(0) + 'Quel est le nombre maximal de groupes ?<br><br>'
            texte += texteA
            texteCorr = numAlpha(0)
            texteCorr += `- Les diviseurs de ${var1 * objet} sont : ${listeDesDiviseurs(var1 * objet).join(', ')}.<br>`
            texteCorr += `${sp(2)}- Les diviseurs de ${var2 * objet} sont : ${listeDesDiviseurs(var2 * objet).join(', ')}.<br>`
            texteCorr += `${objet} est le plus grand nombre qui divise à la fois ${var1 * objet} et ${var2 * objet}.<br>`
            texteCorr +=
              ' Le nombre maximal de groupes est donc : ' +
              texteEnCouleurEtGras(`${objet}`) +
              '.<br><br>'

            texteB =
              numAlpha(1) +
              'Quel est le nombre de garçons dans chaque groupe ?<br><br>'
            texte += texteB
            texteCorr +=
              numAlpha(1) + ` $${var1 * objet} \\div ${objet} = ${var1}$<br>`
            texteCorr +=
              'Le nombre de garçons dans chaque groupe est :' +
              texteEnCouleurEtGras(` ${var1}`) +
              '.<br><br>'

            texteC =
              numAlpha(2) +
              'Quel est le nombre de filles dans chaque groupe ?<br><br>'
            texte += texteC
            texteCorr +=
              numAlpha(2) + ` $${var2 * objet} \\div ${objet} = ${var2}$<br>`
            texteCorr +=
              'Le nombre de filles dans chaque groupe est :' +
              texteEnCouleurEtGras(` ${var2}`) +
              '.<br><br>'
          }
          break
        default: // si un utilisateur saisit 4 ou une valeur erronée renvoie par défaut vers le prbme 3
          if (this.interactif && !context.isAmc) {
            texte = `Un boulanger dispose de ${var1 * objet} croissants et de ${var2 * objet} brioches. <br>`
            texte +=
              'Il veut, en utilisant toutes ses viennoiseries, réaliser un maximum de corbeilles '
            texte +=
              'contenant toutes le même nombre de croissants et le même nombre de brioches. <br>'
            texte +=
              'Donner le nombre maximal de corbeilles que le boulanger peut réaliser '
            texte += 'et la composition de chaque corbeille.<br><br>'
            texteA =
              numAlpha(0) + 'Nombre maximal de corbeilles :' + `${sp(30)}`
            texte += texteA
            texte +=
              ajouteChampTexteMathLive(
                this,
                3 * i,
                KeyboardType.clavierNumbers,
              ) + '<br><br>'
            texteCorr = numAlpha(0)
            texteCorr += `- Les diviseurs de ${var1 * objet} sont : ${listeDesDiviseurs(var1 * objet).join(', ')}.<br>`
            texteCorr += `${sp(2)};- Les diviseurs de ${var2 * objet} sont : ${listeDesDiviseurs(var2 * objet).join(', ')}.<br>`
            texteCorr += `${objet} est le plus grand nombre qui divise à la fois ${var1 * objet} et ${var2 * objet}.<br>`
            texteCorr +=
              ' Le nombre maximal de corbeilles est donc : ' +
              texteEnCouleurEtGras(`${objet}`) +
              '.<br><br>'
            handleAnswers(
              this,
              3 * i,
              { reponse: { value: objet } },
              { formatInteractif: 'mathlive' },
            )

            texteB =
              numAlpha(1) + 'Nombre de croissants dans chaque corbeille :'
            texte += texteB
            texte +=
              ajouteChampTexteMathLive(
                this,
                3 * i + 1,
                KeyboardType.clavierNumbers,
              ) + '<br><br>'
            texteCorr +=
              numAlpha(1) + ` $${var1 * objet} \\div ${objet} = ${var1}$<br>`
            texteCorr +=
              'Le nombre de croissants dans chaque corbeille est :' +
              texteEnCouleurEtGras(` ${var1}`) +
              '.<br><br>'
            handleAnswers(
              this,
              3 * i + 1,
              { reponse: { value: var1 } },
              { formatInteractif: 'mathlive' },
            )

            texteC =
              numAlpha(2) +
              ` Nombre de brioches dans chaque corbeille :${sp(2)}`
            texte += texteC
            texte +=
              ajouteChampTexteMathLive(
                this,
                3 * i + 2,
                KeyboardType.clavierNumbers,
              ) + '<br>'
            texteCorr +=
              numAlpha(2) + ` $${var2 * objet} \\div ${objet} = ${var2}$<br>`
            texteCorr +=
              'Le nombre de brioches dans chaque corbeille est :' +
              texteEnCouleurEtGras(` ${var2}`) +
              '.<br><br>'
            handleAnswers(
              this,
              3 * i + 2,
              { reponse: { value: var2 } },
              { formatInteractif: 'mathlive' },
            )
          } else {
            texte = `Un boulanger dispose de ${var1 * objet} croissants et de ${var2 * objet} brioches. <br>`
            texte +=
              'Il veut, en utilisant toutes ses viennoiseries, réaliser un maximum de corbeilles '
            texte +=
              'contenant toutes le même nombre de croissants et le même nombre de brioches. <br><br>'
            texteSansQuestions = texte
            texteA =
              numAlpha(0) + 'Quel est le nombre maximal de corbeilles ?<br><br>'
            texte += texteA
            texteCorr = numAlpha(0)
            texteCorr += `- Les diviseurs de ${var1 * objet} sont : ${listeDesDiviseurs(var1 * objet).join(', ')}.<br>`
            texteCorr += `${sp(2)}- Les diviseurs de ${var2 * objet} sont : ${listeDesDiviseurs(var2 * objet).join(', ')}.<br>`
            texteCorr += `${objet} est le plus grand nombre qui divise à la fois ${var1 * objet} et ${var2 * objet}.<br>`
            texteCorr +=
              ' Le nombre maximal de corbeilles est donc : ' +
              texteEnCouleurEtGras(`${objet}`) +
              '.<br><br>'

            texteB =
              numAlpha(1) +
              'Quel est le nombre de croissants dans chaque corbeille ?<br><br>'
            texte += texteB
            texteCorr +=
              numAlpha(1) + ` $${var1 * objet} \\div ${objet} = ${var1}$<br>`
            texteCorr +=
              'Le nombre de croissants dans chaque corbeille est :' +
              texteEnCouleurEtGras(` ${var1}`) +
              '.<br><br>'

            texteC =
              numAlpha(2) +
              'Quel est le nombre de brioches dans chaque corbeille ?<br><br>'
            texte += texteC
            texteCorr +=
              numAlpha(2) + ` $${var2 * objet} \\div ${objet} = ${var2}$<br>`
            texteCorr +=
              'Le nombre de brioches dans chaque corbeille est :' +
              texteEnCouleurEtGras(` ${var2}`) +
              '.<br><br>'
          }
          break
      } // fin du switch
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
