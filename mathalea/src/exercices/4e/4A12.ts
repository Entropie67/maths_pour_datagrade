import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { nombreDeChiffresDe } from '../../lib/outils/nombres'
import { premiereLettreEnMajuscule, sp } from '../../lib/outils/outilString'
import { personne } from '../../lib/outils/Personne'
import { listeNombresPremiersStrictJusqua } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

export const titre = 'Résoudre des problèmes de conjonction de phénomènes'

export const dateDeModifImportante = '10/10/2022'

/**
 * Problèmes d'événements récurrents avec résolution à l'aide de décompositions en produits de facteurs premiers
 * @author Guillaume Valmont

 * 30/10/2021
 * Ajout de questions possibles le 10/10/2022 par Guillaume Valmont
 */
export const uuid = 'b16c6'

export const refs = {
  'fr-fr': ['4A12'],
  'fr-ch': ['9R2NO1H-6', '9R3NO1H-6', '10CTNO1B-6', 'PRQNO09A-11', 'PRQNO09C-8', 'PRQNO15B-1', 'PRQNO15C-1'],
}
export default class ProblemesEvenementsRecurrents extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.sup = 1
    this.besoinFormulaireNumerique = [
      'Difficulté',
      3,
      '1 : 1 facteur commun, 1 facteur spécifique\n2 : 2 facteurs communs, 1 facteur spécifique\n3 : 2 facteurs communs, 2 facteurs spécifiques',
    ]
    this.besoinFormulaire2Texte = [
      "Type d'énoncé",
      'Nombres séparés par des tirets :\n1 : Guirlandes\n2 : Voiture\n3 : Fusée\n4 : Restau - ciné\n5 : Engrenages\n6 : Mélange',
    ]
    this.sup2 = 6
    this.correctionDetailleeDisponible = true
    this.interactif = false
  }

  nouvelleVersion() {
    const preListePremiers = listeNombresPremiersStrictJusqua(12)
    const listePremiers = combinaisonListes(
      preListePremiers,
      this.nbQuestions * 5,
    )

    const valMaxParametre = 6
    const listeDesProblemes = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: valMaxParametre - 1,
      melange: valMaxParametre,
      nbQuestions: this.nbQuestions,
      defaut: 1,
    }).map(Number)
    const listeDesSaveurs = [
      'guirlande',
      'voiture',
      'fusée',
      'restau-ciné',
      'engrenages',
    ]
    const saveurs = []
    for (const probleme of listeDesProblemes) {
      saveurs.push(listeDesSaveurs[probleme - 1])
    }
    for (
      let i = 0,
        texte,
        texteCorr,
        indicesFacteursCommuns,
        indicesFacteursA,
        indicesFacteursB,
        Commun,
        A,
        B,
        decompositionCommun,
        decompositionA,
        decompositionB,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      indicesFacteursCommuns = []
      switch (this.sup) {
        case 1:
          indicesFacteursCommuns = [randint(0, 2)]
          indicesFacteursA = [randint(0, 4, indicesFacteursCommuns)]
          indicesFacteursB = [
            randint(0, 4, indicesFacteursCommuns.concat(indicesFacteursA)),
          ]
          Commun = listePremiers[indicesFacteursCommuns[0] + i * 5]
          A = listePremiers[indicesFacteursA[0] + i * 5]
          B = listePremiers[indicesFacteursB[0] + i * 5]
          break
        case 2:
          indicesFacteursCommuns = [randint(0, 2), randint(0, 2)]
          indicesFacteursCommuns = indicesFacteursCommuns.sort()
          indicesFacteursA = [randint(3, 4, indicesFacteursCommuns)]
          indicesFacteursB = [
            randint(3, 4, indicesFacteursCommuns.concat(indicesFacteursA)),
          ]
          Commun =
            listePremiers[indicesFacteursCommuns[0] + i * 5] *
            listePremiers[indicesFacteursCommuns[1] + i * 5]
          A = listePremiers[indicesFacteursA[0] + i * 5]
          B = listePremiers[indicesFacteursB[0] + i * 5]
          break
        case 3:
          indicesFacteursCommuns = [randint(0, 2), randint(0, 2)]
          indicesFacteursCommuns = indicesFacteursCommuns.sort((a, b) => a - b)
          indicesFacteursA = [
            randint(0, 2),
            randint(3, 4, indicesFacteursCommuns),
          ]
          indicesFacteursB = [
            randint(0, 2, indicesFacteursA),
            randint(3, 4, indicesFacteursCommuns.concat(indicesFacteursA)),
          ]
          Commun =
            listePremiers[indicesFacteursCommuns[0] + i * 5] *
            listePremiers[indicesFacteursCommuns[1] + i * 5]
          A =
            listePremiers[indicesFacteursA[0] + i * 5] *
            listePremiers[indicesFacteursA[1] + i * 5]
          B =
            listePremiers[indicesFacteursB[0] + i * 5] *
            listePremiers[indicesFacteursB[1] + i * 5]
          break
        default: // identique au cas 1
          indicesFacteursCommuns = [randint(0, 2)]
          indicesFacteursA = [randint(0, 4, indicesFacteursCommuns)]
          indicesFacteursB = [
            randint(0, 4, indicesFacteursCommuns.concat(indicesFacteursA)),
          ]
          Commun = listePremiers[indicesFacteursCommuns[0] + i * 5]
          A = listePremiers[indicesFacteursA[0] + i * 5]
          B = listePremiers[indicesFacteursB[0] + i * 5]
          break
      }
      let unite, phenomene1, phenomene2, texte1, texte2, texte3, texte4, texte5
      const typeDeQuestion = randint(1, 3)
      const Robert = personne()
      let uniteAMC = 'fois'
      switch (saveurs[i]) {
        case 'guirlande':
          texte = `Une guirlande électrique est constituée de lumières rouges et vertes.<br>
          Les lumières rouges s'allument toutes les $${texNombre(Commun * A)}$ secondes et les vertes toutes les $${texNombre(Commun * B)}$ secondes.<br>
          À un instant donné, on voit les lumières rouges et vertes allumées en même temps.<br>`
          if (this.interactif || context.isAmc) {
            switch (typeDeQuestion) {
              case 1:
                texte +=
                  'Au bout de combien de secondes ce phénomène se reproduira-t-il la prochaine fois ?'
                uniteAMC = 'secondes'
                break
              case 2:
                texte +=
                  "D'ici la prochaine fois que ce phénomène se reproduira, les lumières rouges s'allumeront combien de fois ?"
                break
              case 3:
                texte +=
                  "D'ici la prochaine fois que ce phénomène se reproduira, les lumières vertes s'allumeront combien de fois ?"
                break
            }
          } else {
            texte += `Au bout de combien de secondes ce phénomène se reproduira-t-il la prochaine fois ?<br>
            Les lumières rouges et vertes se seront allumées combien de fois ?`
          }
          unite = 'secondes'
          phenomene1 = 'les lumières rouges'
          phenomene2 = 'les lumières vertes'
          texte1 = 'Les lumières rouges seront allumées'
          texte2 = 'les lumières vertes'
          texte3 = 'Les lumières rouges et vertes seront allumées en même temps'
          texte4 =
            "le temps nécessaire pour qu'elle se rallument la première fois simultanément"
          texte5 = "s'allumeront"
          break
        case 'voiture':
          texte = `Pour l'entretien de sa voiture, ${Robert.prenom} veut se tenir à un calendrier très précis :<br>
          ${Robert.pronom} nettoie l'intérieur de sa voiture tous les $${texNombre(Commun * A)}$ jours et l'extérieur tous les $${texNombre(Commun * B)}$ jours.<br>
          Aujourd'hui, ${Robert.pronom} a fait les deux.<br>`
          if (this.interactif || context.isAmc) {
            switch (typeDeQuestion) {
              case 1:
                texte += `Au bout de combien de jours fera-t-${Robert.pronom} les deux dans la même journée ?`
                uniteAMC = 'jours'
                break
              case 2:
                texte += `D'ici la prochaine fois qu'${Robert.pronom} fera les deux dans la même journée, combien de fois nettoiera-t-${Robert.pronom} l'intérieur de sa voiture ?`
                break
              case 3:
                texte += `D'ici la prochaine fois qu'${Robert.pronom} fera les deux dans la même journée, combien de fois nettoiera-t-${Robert.pronom} l'extérieur de sa voiture ?`
                break
            }
          } else {
            texte += `Au bout de combien de jours fera-t-${Robert.pronom} les deux dans la même journée ?<br>
            Combien de fois aura-t-${Robert.pronom} nettoyé l'intérieur et l'extérieur de sa voiture ?`
          }
          unite = 'jours'
          phenomene1 = 'le nettoyage intérieur'
          phenomene2 = 'le nettoyage extérieur'
          texte1 = "L'intérieur sera nettoyé"
          texte2 = "l'extérieur"
          texte3 =
            'Les nettoyages intérieur et extérieur auront lieu le même jour'
          texte4 =
            'le nombre de jours avant un nettoyage intérieur et extérieur'
          texte5 = 'se fera'
          break
        case 'fusée':
          texte = `Pour l'entretien de sa fusée, ${Robert.prenom} doit se tenir à un calendrier très précis :<br>
          ${Robert.pronom} remplace la coiffe tous les $${texNombre(Commun * A)}$ jours et les boosters tous les $${texNombre(Commun * B)}$ jours.<br>
          Aujourd'hui, ${Robert.pronom} a fait les deux.<br>`
          if (this.interactif || context.isAmc) {
            switch (typeDeQuestion) {
              case 1:
                texte += `Au bout de combien de jours fera-t-${Robert.pronom} les deux dans la même journée ?`
                uniteAMC = 'jours'
                break
              case 2:
                texte += `D'ici la prochaine fois qu'${Robert.pronom} fera les deux dans la même journée, combien de fois remplacera-t-${Robert.pronom} la coiffe de sa fusée ?`
                break
              case 3:
                texte += `D'ici la prochaine fois qu'${Robert.pronom} fera les deux dans la même journée, combien de fois remplacera-t-${Robert.pronom} les boosters de sa fusée ?`
                break
            }
          } else {
            texte += `Au bout de combien de jours fera-t-${Robert.pronom} les deux dans la même journée ?<br>
            Combien de fois aura-t-${Robert.pronom} remplacé la coiffe et les boosters de sa fusée ?`
          }
          unite = 'jours'
          phenomene1 = 'le remplacement de la coiffe'
          phenomene2 = 'le remplacement des boosters'
          texte1 = 'La coiffe sera remplacée'
          texte2 = 'les boosters'
          texte3 =
            'Le remplacement de la coiffe et des boosters auront lieu le même jour'
          texte4 =
            'le nombre de jours avant le remplacement de la coiffe et des boosters'
          texte5 = 'se fera'
          break
        case 'restau-ciné':
          texte = `Pour sa résolution de cette année, ${Robert.prenom} a décidé de ne pas abuser des bonnes choses.<br>
          ${premiereLettreEnMajuscule(Robert.pronom)} s'accorde le droit d'aller au restaurant tous les $${texNombre(Commun * A)}$ jours et d'aller au cinéma tous les $${texNombre(Commun * B)}$ jours.<br>
          Aujourd'hui, ${Robert.pronom} s'est fait un «${sp()}restau - ciné${sp()}».<br>`
          if (this.interactif || context.isAmc) {
            switch (typeDeQuestion) {
              case 1:
                texte += `Au bout de combien de jours se fera-t-${Robert.pronom} un autre restau - ciné ?`
                uniteAMC = 'jours'
                break
              case 2:
                texte += `D'ici la prochaine fois qu'${Robert.pronom} fera un autre restau - ciné, combien de fois sera-t-${Robert.pronom} allé${Robert.pronom === 'il' ? '' : 'e'} au restaurant ?`
                break
              case 3:
                texte += `D'ici la prochaine fois qu'${Robert.pronom} fera un autre restau - ciné, combien de fois sera-t-${Robert.pronom} allé${Robert.pronom === 'il' ? '' : 'e'} au cinéma ?`
                break
            }
          } else {
            texte += `Au bout de combien de jours fera-t-${Robert.pronom} un autre restau - ciné ?<br>
            Combien de fois sera-t-${Robert.pronom} allé${Robert.pronom === 'il' ? '' : 'e'} au restaurant et au cinéma ?`
          }
          unite = 'jours'
          phenomene1 = 'aller au restaurant'
          phenomene2 = 'aller au cinéma'
          texte1 = `${Robert.Pronom} va au restaurant`
          texte2 = 'au cinéma'
          texte3 = `${Robert.pronom} se fera à nouveau un «${sp()}restau - ciné${sp()}»`
          texte4 = 'le nombre de jours avant le prochain «\u00a0restau - ciné\u00a0»'
          break
        case 'engrenages':
        default:
          texte = `Dans un engrenage, une première roue possède $${texNombre(Commun * A)}$ dents et une seconde en possède $${texNombre(Commun * B)}$.
          Elles tournent jusqu'à revenir (pour la première fois) en position initiale.<br>`
          if (this.interactif || context.isAmc) {
            switch (typeDeQuestion) {
              case 1:
                texte += 'De combien de dents chaque roue aura tourné ?'
                uniteAMC = 'dents'
                break
              case 2:
                texte += 'Combien de tours aura effectué la première roue ?'
                uniteAMC = 'tours'
                break
              case 3:
                texte += 'Combien de tours aura effectué la deuxième roue ?'
                uniteAMC = 'tours'
                break
              default:
                break
            }
          } else {
            texte += `De combien de dents chaque roue aura tourné ?<br>
            Combien de tours aura effectué chaque roue ?`
          }
          unite = 'dents'
          phenomene1 = 'la première roue'
          phenomene2 = 'la deuxième roue'
          texte1 = 'La première fera un tour'
          texte2 = 'la seconde'
          texte3 = 'Elles reviendront en position initiale'
          texte4 =
            'le nombre de dents avant de revenir pour la première fois en position initiale'
          break
      }
      /*
      let txtIntro = ''
      if (context.isHtml && saveurs[i] === 'engrenages') {
        // eslint-disable-next-line no-var
        var pourcentage = '100%'

        const idUnique = `${numeroExercice}_${Date.now()}`
        const idDivIntro = `divIntro${idUnique}`
        txtIntro += `<div id="${idDivIntro}" style="width: ${pourcentage}; height: 50px; display : table "></div>`
        svgEngrenages(idDivIntro, 200, 200)
      } else {
        txtIntro = ''
      }
      this.introduction = txtIntro
      */
      switch (this.sup) {
        case 1:
          decompositionCommun = texteEnCouleurEtGras(
            `$${texNombre(Commun)}$`,
            bleuMathalea,
          )
          decompositionA = texteEnCouleurEtGras(`$${texNombre(A)}$`, 'red')
          decompositionB = texteEnCouleurEtGras(`$${texNombre(B)}$`, 'green')
          break
        case 2:
          decompositionCommun = `${texteEnCouleurEtGras(`$${texNombre(listePremiers[indicesFacteursCommuns[0] + i * 5])}$`, bleuMathalea)} $\\times$ ${texteEnCouleurEtGras(`$${texNombre(listePremiers[indicesFacteursCommuns[1] + i * 5])}$`, bleuMathalea)}`
          decompositionA = texteEnCouleurEtGras(`$${texNombre(A)}$`, 'red')
          decompositionB = texteEnCouleurEtGras(`$${texNombre(B)}$`, 'green')
          break
        case 3:
          decompositionCommun = `${texteEnCouleurEtGras(`$${texNombre(listePremiers[indicesFacteursCommuns[0] + i * 5])}$`, bleuMathalea)} $\\times$ ${texteEnCouleurEtGras(`$${texNombre(listePremiers[indicesFacteursCommuns[1] + i * 5])}$`, bleuMathalea)}`
          decompositionA = `${texteEnCouleurEtGras(`$${texNombre(listePremiers[indicesFacteursA[0] + i * 5])}$`, 'red')} $\\times$ ${texteEnCouleurEtGras(`$${texNombre(listePremiers[indicesFacteursA[1] + i * 5])}$`, 'red')}`
          decompositionB = `${texteEnCouleurEtGras(`$${texNombre(listePremiers[indicesFacteursB[0]])}$`, 'green')} $\\times$ ${texteEnCouleurEtGras(`$${texNombre(listePremiers[indicesFacteursB[1] + i * 5])}$`, 'green')}`
          break

        default:
          decompositionCommun = texteEnCouleurEtGras(
            `$${texNombre(Commun)}$`,
            bleuMathalea,
          )
          decompositionA = texteEnCouleurEtGras(`$${texNombre(A)}$`, 'red')
          decompositionB = texteEnCouleurEtGras(`$${texNombre(B)}$`, 'green')
          break
      }
      texteCorr = ''
      if (this.correctionDetaillee) {
        texteCorr += `${texte1} à chaque multiple de ${texteEnCouleurEtGras(`$${texNombre(Commun * A)}$`, 'red')} ${unite}, ${texte2} à chaque multiple de ${texteEnCouleurEtGras(`$${texNombre(Commun * B)}$`, 'green')} ${unite}.<br>
        ${texte3} à chaque multiple commun de ${texteEnCouleurEtGras(`$${texNombre(Commun * A)}$`, 'red')} et de ${texteEnCouleurEtGras(`$${texNombre(Commun * B)}$`, 'green')}.<br>
        Pour trouver ${texte4}, on cherche le plus petit multiple qu'ils ont en commun.<br>
        Un moyen d'y arriver est de décomposer les nombres de ${unite} en produits de facteurs premiers et d'identifier les différences entre les décompositions :<br>`
      }
      if (this.sup === 3) {
        if (indicesFacteursA[0] >= indicesFacteursCommuns[1]) {
          texteCorr += `${texteEnCouleurEtGras(`$${texNombre(Commun * A)}$`, 'red')} = ${texteEnCouleurEtGras(listePremiers[indicesFacteursCommuns[0] + i * 5], bleuMathalea)} $\\times$ ${texteEnCouleurEtGras(listePremiers[indicesFacteursCommuns[1] + i * 5], bleuMathalea)} $\\times$ ${texteEnCouleurEtGras(listePremiers[indicesFacteursA[0] + i * 5], 'red')} $\\times$ ${texteEnCouleurEtGras(listePremiers[indicesFacteursA[1] + i * 5], 'red')} <br>`
        } else if (
          indicesFacteursA[0] >= indicesFacteursCommuns[0] &&
          indicesFacteursA[0] < indicesFacteursCommuns[1]
        ) {
          texteCorr += `${texteEnCouleurEtGras(`$${texNombre(Commun * A)}$`, 'red')} = ${texteEnCouleurEtGras(listePremiers[indicesFacteursCommuns[0] + i * 5], bleuMathalea)} $\\times$ ${texteEnCouleurEtGras(listePremiers[indicesFacteursA[0] + i * 5], 'red')} $\\times$ ${texteEnCouleurEtGras(listePremiers[indicesFacteursCommuns[1] + i * 5], bleuMathalea)} $\\times$ ${texteEnCouleurEtGras(listePremiers[indicesFacteursA[1] + i * 5], 'red')} <br>`
        } else if (indicesFacteursA[0] < indicesFacteursCommuns[0]) {
          texteCorr += `${texteEnCouleurEtGras(`$${texNombre(Commun * A)}$`, 'red')} = ${texteEnCouleurEtGras(listePremiers[indicesFacteursA[0] + i * 5], 'red')} $\\times$ ${texteEnCouleurEtGras(listePremiers[indicesFacteursCommuns[0] + i * 5], bleuMathalea)} $\\times$ ${texteEnCouleurEtGras(listePremiers[indicesFacteursCommuns[1] + i * 5], bleuMathalea)} $\\times$ ${texteEnCouleurEtGras(listePremiers[indicesFacteursA[1] + i * 5], 'red')} <br>`
        }
        if (indicesFacteursB[0] >= indicesFacteursCommuns[1]) {
          texteCorr += `${texteEnCouleurEtGras(`$${texNombre(Commun * B)}$`, 'green')} = ${texteEnCouleurEtGras(listePremiers[indicesFacteursCommuns[0] + i * 5], bleuMathalea)} $\\times$ ${texteEnCouleurEtGras(listePremiers[indicesFacteursCommuns[1] + i * 5], bleuMathalea)} $\\times$ ${texteEnCouleurEtGras(listePremiers[indicesFacteursB[0]], 'green')} $\\times$ ${texteEnCouleurEtGras(listePremiers[indicesFacteursB[1] + i * 5], 'green')} <br>`
        } else if (
          indicesFacteursB[0] >= indicesFacteursCommuns[0] &&
          indicesFacteursB[0] < indicesFacteursCommuns[1]
        ) {
          texteCorr += `${texteEnCouleurEtGras(`$${texNombre(Commun * B)}$`, 'green')} = ${texteEnCouleurEtGras(listePremiers[indicesFacteursCommuns[0] + i * 5], bleuMathalea)} $\\times$ ${texteEnCouleurEtGras(listePremiers[indicesFacteursB[0]], 'green')} $\\times$ ${texteEnCouleurEtGras(listePremiers[indicesFacteursCommuns[1] + i * 5], bleuMathalea)} $\\times$ ${texteEnCouleurEtGras(listePremiers[indicesFacteursB[1] + i * 5], 'green')} <br>`
        } else if (indicesFacteursB[0] < indicesFacteursCommuns[0]) {
          texteCorr += `${texteEnCouleurEtGras(`$${texNombre(Commun * B)}$`, 'green')} = ${texteEnCouleurEtGras(listePremiers[indicesFacteursB[0]], 'green')} $\\times$ ${texteEnCouleurEtGras(listePremiers[indicesFacteursCommuns[0] + i * 5], bleuMathalea)} $\\times$ ${texteEnCouleurEtGras(listePremiers[indicesFacteursCommuns[1] + i * 5], bleuMathalea)} $\\times$ ${texteEnCouleurEtGras(listePremiers[indicesFacteursB[1] + i * 5], 'green')} <br>`
        }
      } else {
        texteCorr += `${texteEnCouleurEtGras(`$${texNombre(Commun * A)}$`, 'red')} = ${decompositionCommun} $\\times$ ${decompositionA} <br>
        ${texteEnCouleurEtGras(`$${texNombre(Commun * B)}$`, 'green')} = ${decompositionCommun} $\\times$ ${decompositionB}<br>`
      }
      if (this.correctionDetaillee) {
        texteCorr +=
          'On multiplie les facteurs communs aux deux décompositions avec les facteurs spécifiques à chaque décomposition :<br>'
      }
      texteCorr += `${decompositionCommun} $\\times$ ${decompositionA} $\\times$ ${decompositionB} = $${texNombre(Commun * A * B)}$<br>
      Ce phénomène se produira à nouveau au bout de ${texteEnCouleurEtGras(`$${texNombre(Commun * A * B)}$`)} ${unite}, `
      if (saveurs[i] === 'restau-ciné') {
        texteCorr += `lorsqu'${Robert.pronom} ${texteEnCouleurEtGras('ira au restaurant', 'red')} pour la ${texteEnCouleurEtGras(`$${texNombre(B)}$`, 'green')}ème fois et qu'${Robert.pronom} ${texteEnCouleurEtGras('ira au cinéma', 'green')} pour la ${texteEnCouleurEtGras(`$${texNombre(A)}$`, 'red')}ème fois.<br>`
      } else if (saveurs[i] === 'engrenages') {
        texteCorr += `lorsque ${texteEnCouleurEtGras('la première roue', 'red')} aura fait ${texteEnCouleurEtGras(`$${texNombre(B)}$`, 'green')} tours et que ${texteEnCouleurEtGras('la deuxième roue', 'green')} aura fait ${texteEnCouleurEtGras(`$${texNombre(A)}$`, 'red')} tours.<br>`
      } else {
        texteCorr += `lorsque ${texteEnCouleurEtGras(String(phenomene1), 'red')} ${texte5} pour la ${texteEnCouleurEtGras(`$${texNombre(B)}$`, 'red')}$^{ème}$ fois et que ${texteEnCouleurEtGras(String(phenomene2), 'green')} ${texte5} pour la ${texteEnCouleurEtGras(`$${texNombre(A)}$`, 'green')}$^{ème}$ fois.<br>`
      }
      if (this.correctionDetaillee) {
        texteCorr += `<br>$${texNombre(Commun * A * B)}$ est bien un multiple de ${texteEnCouleurEtGras(`$${texNombre(Commun * A)}$`, 'red')} car :
         ${decompositionCommun} $\\times$ ${decompositionA} $\\times$ ${decompositionB} =
         (${decompositionCommun} $\\times$ ${decompositionA}) $\\times$ ${decompositionB} =
         ${texteEnCouleurEtGras(`$${texNombre(Commun * A)}$`, 'red')} $\\times$ ${texteEnCouleurEtGras(`$${texNombre(B)}$`, 'green')}.<br>
        $${texNombre(Commun * A * B)}$ est bien un multiple de ${texteEnCouleurEtGras(`$${texNombre(Commun * B)}$`, 'green')} car :
         ${decompositionCommun} $\\times$ ${decompositionA} $\\times$ ${decompositionB} =
         ${decompositionCommun} $\\times$ ${decompositionB} $\\times$ ${decompositionA} =
         (${decompositionCommun} $\\times$ ${decompositionB}) $\\times$ ${decompositionA} =
         ${texteEnCouleurEtGras(`$${texNombre(Commun * B)}$`, 'green')} $\\times$ ${texteEnCouleurEtGras(`$${texNombre(A)}$`, 'red')}.<br>`
      }
      let bonneReponse = Commun * A * B
      switch (typeDeQuestion) {
        case 2:
          bonneReponse = B
          break
        case 3:
          bonneReponse = A
          break
      }

      handleAnswers(this, i, { reponse: { value: bonneReponse } })

      if (this.interactif && !context.isAmc) {
        // Si l'exercice est interactif
        if (typeDeQuestion > 1) {
          if (saveurs[i] === 'engrenages') {
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
              { texteApres: ' tours' },
            )
          } else {
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
              { texteApres: ' fois' },
            )
          }
        } else {
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierNumbers,
            { texteApres: ' ' + unite },
          )
        }
      }
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: '',
          enonceAvant: false,
          propositions: [
            {
              type: 'AMCOpen',
              propositions: [
                {
                  texte: texteCorr,
                  enonce: texte + '<br>',
                  statut: 4,
                  pointilles: false,
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
                    texte: 'Nombre de ' + uniteAMC + ' : ',
                    valeur: [bonneReponse],
                    param: {
                      digits: Math.max(3, nombreDeChiffresDe(bonneReponse)),
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

      if (this.questionJamaisPosee(i, Commun, A * B)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
