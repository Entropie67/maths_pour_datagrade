import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import {
    factorielle,
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Dénombrer des questionnaires et configurations'
export const dateDePublication = '05/02/2026'
export const interactifReady = true

export const uuid = 'berqw'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['3mComb-10'],
}

/**
 * Dénombrement - Questionnaires, configurations et problèmes variés
 * @author Nathan Scheinmann
 */

function combinaison(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  return Math.round(factorielle(n) / (factorielle(k) * factorielle(n - k)))
}

export default class QuestionnairesConfigurations extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Questionnaire à choix multiples (arr. avec rép.)',
        '2 : Nombre total de sous-ensembles (arr. avec rép.)',
        '3 : Attribution de prix distincts (arr. sans rép.)',
        '4 : Matchs aller-retour (arr. sans rép.)',
        '5 : Distribution objets identiques (combinaison)',
        '6 : Sélection sans ordre (combinaison)',
        '7 : Poignées de main / matchs simples (combinaison)',
        '8 : Sous-ensembles de taille fixe (combinaison)',
        '9 : Mélange',
      ].join('\n'),
    ]
    this.sup = '9'
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 8,
      melange: 9,
      defaut: 9,
      listeOfCase: [
        'qcm',
        'sousensemblesTotal',
        'prix',
        'matchsAllerRetour',
        'distribIdentiques',
        'selection',
        'poigneesSimples',
        'sousensemblesTaille',
      ],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse = 0

      const typeQuestion = listeTypeDeQuestions[i]

      if (typeQuestion === 'qcm') {
        const variante = choice(['simple', 'vraixFaux', 'mixte', 'auMoinsUne'])

        if (variante === 'simple') {
          const nbQuestions = randint(8, 15)
          const nbReponses = randint(3, 5)

          reponse = Math.pow(nbReponses, nbQuestions)

          const ctx = choice([
            'questionnaire à choix multiples (QCM)',
            'test de connaissances',
            'examen à choix multiples',
            'sondage',
          ])

          texte = `Un ${ctx} comporte $${nbQuestions}$ questions. `
          texte += `Chaque question propose $${nbReponses}$ réponses possibles, dont une seule est correcte. `
          texte += `Combien de grilles-réponses différentes peut-on remplir ?`

          texteCorr = `Pour chaque question de la grille-réponses, on choisit une réponse parmi $${nbReponses}$ possibles.<br>`
          texteCorr += `C'est un arrangement avec répétition (chaque question est indépendante) :<br>`
          texteCorr += `$\\overline{A}_{${nbQuestions}}^{${nbReponses}} = ${nbReponses}^{${nbQuestions}} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else if (variante === 'vraixFaux') {
          const nbQuestions = randint(10, 20)

          reponse = Math.pow(2, nbQuestions)

          const ctx = choice([
            'questionnaire vrai/faux',
            'test de type vrai ou faux',
            'QCM binaire (vrai/faux)',
          ])

          texte = `Un ${ctx} comporte $${nbQuestions}$ questions. `
          texte += `Combien de grilles-réponses différentes peut-on remplir ?`

          texteCorr = `Pour chaque question de la grille-réponses, on choisit entre vrai et faux : $2$ possibilités.<br>`
          texteCorr += `C'est un arrangement avec répétition :<br>`
          texteCorr += `$\\overline{A}_{${nbQuestions}}^{2} = 2^{${nbQuestions}} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else if (variante === 'mixte') {
          const nbVF = randint(5, 10)
          const nbQCM = randint(4, 8)
          const nbReponses = randint(3, 5)

          const partieVF = Math.pow(2, nbVF)
          const partieQCM = Math.pow(nbReponses, nbQCM)
          reponse = partieVF * partieQCM

          texte = `Un examen comporte $${nbVF}$ questions vrai/faux et $${nbQCM}$ questions à choix multiples avec $${nbReponses}$ réponses possibles chacune. `
          texte += `Combien de copies différentes peut-on rendre ?`

          texteCorr = `Chaque question occupe une position distincte dans le questionnaire et la même réponse peut apparaître plusieurs fois : c'est un arrangement avec répétition.<br><br>`
          texteCorr += `$\\bullet$ Questions vrai/faux ($${nbVF}$ positions, 2 réponses) : $\\overline{A}_{${nbVF}}^{2} = 2^{${nbVF}} = ${partieVF}$ possibilités<br>`
          texteCorr += `$\\bullet$ Questions QCM ($${nbQCM}$ positions, ${nbReponses} réponses) : $\\overline{A}_{${nbQCM}}^{${nbReponses}} = ${nbReponses}^{${nbQCM}} = ${texNombre(partieQCM)}$ possibilités<br><br>`
          texteCorr += `Par le principe multiplicatif : $${partieVF} \\times ${texNombre(partieQCM)} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else {
          // Au moins une bonne réponse
          const nbQuestions = randint(8, 12)
          const nbReponses = randint(3, 4)

          const total = Math.pow(nbReponses, nbQuestions)
          const toutesFausses = Math.pow(nbReponses - 1, nbQuestions)
          reponse = total - toutesFausses

          texte = `Un QCM comporte $${nbQuestions}$ questions à $${nbReponses}$ réponses. `
          texte += `Combien de grilles contiennent au moins une bonne réponse ?`

          texteCorr = `Pour chaque question, on choisit une réponse parmi $${nbReponses}$. On calcule le complémentaire :<br>`
          texteCorr += `Total de grilles : $\\overline{A}_{${nbQuestions}}^{${nbReponses}} = ${nbReponses}^{${nbQuestions}} = ${texNombre(total, 0)}$<br>`
          texteCorr += `Grilles avec aucune bonne réponse ($${nbReponses - 1}$ mauvaises par question) : $\\overline{A}_{${nbQuestions}}^{${nbReponses - 1}} = ${nbReponses - 1}^{${nbQuestions}} = ${texNombre(toutesFausses, 0)}$<br><br>`
          texteCorr += `Au moins une bonne : $${texNombre(total, 0)} - ${texNombre(toutesFausses, 0)} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        }
      } else if (typeQuestion === 'distribIdentiques') {
        const nbBonbons = randint(8, 15)
        const nbEnfants = randint(3, 5)

        // Objets identiques entre personnes distinctes (étoiles et barres)
        reponse = combinaison(nbBonbons + nbEnfants - 1, nbEnfants - 1)

        const objet = choice([
          'bonbons',
          'billes',
          'pièces de monnaie',
          'jetons',
        ])

        texte = `On distribue $${nbBonbons}$ ${objet} identiques à $${nbEnfants}$ enfants. `
        texte += `Combien de répartitions différentes sont possibles (un enfant peut ne rien recevoir) ?`

        texteCorr = `Les ${objet} sont identiques : seul le nombre donné à chaque enfant compte.<br>`
        texteCorr += `On imagine une ligne avec les $${nbBonbons}$ ${objet} et $${nbEnfants - 1}$ séparations («${sp()}|${sp()}»). Les séparations découpent en $${nbEnfants}$ groupes, un par enfant (un groupe peut être vide).<br>`
        texteCorr += `Il y a $${nbBonbons + nbEnfants - 1}$ positions au total, et on choisit $${nbEnfants - 1}$ d'entre elles pour les séparations (l'ordre des ${objet} ne compte pas) : c'est une combinaison.<br>`
        texteCorr += `$C_{${nbEnfants - 1}}^{${nbBonbons + nbEnfants - 1}} = \\dfrac{${nbBonbons + nbEnfants - 1}!}{${nbEnfants - 1}! \\times ${nbBonbons}!} = ${miseEnEvidence(texNombre(reponse, 0))}$`
      } else if (typeQuestion === 'prix') {
        const nbPrix = randint(3, 5)
        const nbCandidats = randint(8, 15)

        // Prix distincts à des candidats distincts (arrangement sans répétition)
        reponse = 1
        for (let j = 0; j < nbPrix; j++) reponse *= nbCandidats - j

        const ctx = choice([
          { concours: 'concours de mathématiques', prix: 'prix' },
          { concours: 'compétition sportive', prix: 'médailles' },
          { concours: 'festival de musique', prix: 'trophées' },
          { concours: 'olympiade scientifique', prix: 'distinctions' },
        ])

        texte = `Lors d'un ${ctx.concours}, $${nbCandidats}$ candidats sont en lice pour $${nbPrix}$ ${ctx.prix} distincts. `
        texte += `Combien de palmarès différents sont possibles ?`

        texteCorr = `On choisit successivement les lauréats : qui reçoit le 1er prix, puis le 2ème, etc. Les prix sont distincts et l'ordre compte.<br>`
        texteCorr += `C'est un arrangement sans répétition :<br>`
        texteCorr += `$A_{${nbPrix}}^{${nbCandidats}} = \\dfrac{${nbCandidats}!}{${nbCandidats - nbPrix}!} = ${miseEnEvidence(texNombre(reponse, 0))}$`
      } else if (typeQuestion === 'selection') {
        const nbObjets = randint(6, 12)
        const k = randint(2, 5)

        reponse = combinaison(nbObjets, k)

        const objet = choice([
          { nom: 'livres', verbe: 'à lire en priorité' },
          { nom: 'dossiers', verbe: 'à traiter en premier' },
          { nom: 'projets', verbe: 'à financer cette année' },
          { nom: 'candidatures', verbe: "à retenir pour l'entretien" },
          { nom: 'films', verbe: 'à visionner ce week-end' },
        ])

        texte = `On choisit $${k}$ ${objet.nom} parmi $${nbObjets}$ ${objet.verbe}. `
        texte += `Combien de sélections différentes peut-on faire ?`

        texteCorr = `On choisit $${k}$ éléments parmi $${nbObjets}$, l'ordre n'important pas.<br>`
        texteCorr += `C'est une combinaison :<br>`
        texteCorr += `$C_{${k}}^{${nbObjets}} = \\dfrac{${nbObjets}!}{${k}! \\times ${nbObjets - k}!} = ${miseEnEvidence(texNombre(reponse, 0))}$`
      } else if (typeQuestion === 'poigneesSimples') {
        const variante = choice(['poignees', 'matchsSimple', 'appels', 'duels'])

        if (variante === 'poignees') {
          const n = randint(10, 30)

          reponse = combinaison(n, 2)

          const contexte = choice([
            `$${n}$ personnes se rencontrent et chacune serre la main de toutes les autres.`,
            `Lors d'une réunion de $${n}$ personnes, tout le monde se salue en se serrant la main.`,
            `$${n}$ diplomates participent à un sommet et se saluent tous mutuellement par une poignée de main.`,
            `À une fête de famille, $${n}$ personnes se serrent la main deux à deux.`,
            `$${n}$ collègues se retrouvent et chaque paire échange une poignée de main.`,
          ])

          texte = `${contexte} Combien de poignées de main sont échangées au total ?`

          texteCorr = `Si A serre la main de B, c'est la même poignée que B avec A : l'ordre n'importe pas.<br>`
          texteCorr += `On choisit 2 personnes parmi $${n}$ (combinaison) :<br>`
          texteCorr += `$C_2^{${n}} = \\dfrac{${n}!}{2! \\times ${n - 2}!} = \\dfrac{${n} \\times ${n - 1}}{2} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else if (variante === 'matchsSimple') {
          const n = randint(6, 18)
          reponse = combinaison(n, 2)

          const sport = choice([
            'football',
            'basketball',
            'handball',
            'volleyball',
            'hockey',
            'rugby',
            'tennis',
            'badminton',
            'curling',
            'pétanque',
          ])

          texte = `Dans un tournoi de ${sport} à $${n}$ équipes, chaque équipe rencontre chacune des autres une seule fois. `
          texte += `Combien de matchs sont joués au total ?`

          texteCorr = `Si A joue contre B, c'est le même match que B joue contre A : l'ordre n'importe pas.<br>`
          texteCorr += `On choisit $2$ équipes parmi $${n}$ (combinaison) :<br>`
          texteCorr += `$C_2^{${n}} = \\dfrac{${n} \\times ${n - 1}}{2} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else if (variante === 'appels') {
          const n = randint(5, 12)

          reponse = combinaison(n, 2)

          const ctx = choice([
            `$${n}$ amis s'appellent chacun une fois par téléphone.`,
            `$${n}$ correspondants s'envoient chacun un message.`,
            `$${n}$ ordinateurs sont connectés en réseau, chaque paire ayant une liaison directe.`,
          ])

          texte = `${ctx} Combien de communications sont établies au total ?`

          texteCorr = `Un appel entre A et B est le même qu'entre B et A : l'ordre n'importe pas.<br>`
          texteCorr += `On choisit 2 éléments parmi $${n}$ (combinaison) :<br>`
          texteCorr += `$C_2^{${n}} = \\dfrac{${n} \\times ${n - 1}}{2} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else {
          const n = randint(8, 16)

          reponse = combinaison(n, 2)

          const jeu = choice(['échecs', 'dames', 'go', 'backgammon'])

          texte = `Dans un tournoi de ${jeu} à $${n}$ joueurs, chaque joueur affronte chacun des autres une fois. Combien de parties sont jouées ?`

          texteCorr = `Si A affronte B, c'est la même partie que B contre A : l'ordre n'importe pas.<br>`
          texteCorr += `On choisit $2$ joueurs parmi $${n}$ (combinaison) :<br>`
          texteCorr += `$C_2^{${n}} = \\dfrac{${n} \\times ${n - 1}}{2} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        }
      } else if (typeQuestion === 'matchsAllerRetour') {
        const n = randint(6, 18)
        reponse = n * (n - 1)

        const sport = choice([
          'football',
          'basketball',
          'handball',
          'hockey',
          'volleyball',
        ])

        texte = `Dans un championnat de ${sport} à $${n}$ équipes, chaque équipe rencontre chacune des autres en match aller et retour. `
        texte += `Combien de matchs sont joués au total ?`

        texteCorr = `Pour un match aller-retour, on choisit d'abord l'équipe à domicile, puis celle à l'extérieur : l'ordre compte.<br>`
        texteCorr += `C'est un arrangement sans répétition de $2$ équipes parmi $${n}$ :<br>`
        texteCorr += `$A_2^{${n}} = ${n} \\times (${n} - 1) = ${miseEnEvidence(texNombre(reponse, 0))}$`
      } else if (typeQuestion === 'sousensemblesTotal') {
        const variante = choice(['total', 'complementaire'])

        if (variante === 'total') {
          const n = randint(4, 8)

          reponse = Math.pow(2, n)

          const ctx = choice([
            `Soit $E$ un ensemble à $${n}$ éléments.`,
            `On dispose de $${n}$ objets distincts.`,
            `Un menu propose $${n}$ garnitures optionnelles.`,
          ])

          texte = `${ctx} Combien de choix sont possibles sachant qu'on peut ne rien choisir ou tout choisir ?`

          texteCorr = `Chaque élément est soit dans le sous-ensemble, soit non : $2$ choix par élément.<br>`
          texteCorr += `C'est un arrangement avec répétition :<br>`
          texteCorr += `$\\overline{A}_{${n}}^{2} = 2^{${n}} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else {
          const n = randint(5, 9)

          // Sous-ensembles non vides et différents de E
          reponse = Math.pow(2, n) - 2

          texte = `Soit $E$ un ensemble à $${n}$ éléments. Combien de sous-ensembles propres non vides de $E$ existe-t-il ?`

          texteCorr = `Un sous-ensemble propre non vide est différent de $\\emptyset$ et de $E$.<br>`
          texteCorr += `Pour chaque élément, on choisit : dans le sous-ensemble ou non ($2$ choix), d'où $2^{${n}} = ${Math.pow(2, n)}$ sous-ensembles au total.<br>`
          texteCorr += `On retire $\\emptyset$ et $E$ :<br>`
          texteCorr += `$2^{${n}} - 2 = ${Math.pow(2, n)} - 2 = ${miseEnEvidence(texNombre(reponse, 0))}$`
        }
      } else {
        // sousensemblesTaille - combinaison
        const variante = choice(['taille', 'auMoins'])

        if (variante === 'taille') {
          const n = randint(6, 12)
          const k = randint(2, n - 2)

          reponse = combinaison(n, k)

          texte = `Soit $E$ un ensemble à $${n}$ éléments. Combien de sous-ensembles à exactement $${k}$ éléments peut-on former ?`

          texteCorr = `On choisit $${k}$ éléments parmi $${n}$ ; l'ordre des éléments dans un sous-ensemble ne compte pas.<br>`
          texteCorr += `C'est une combinaison :<br>`
          texteCorr += `$C_{${k}}^{${n}} = \\dfrac{${n}!}{${k}! \\times ${n - k}!} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else {
          const n = randint(5, 8)
          const k = randint(2, 3)

          let rep = 0
          for (let j = k; j <= n; j++) {
            rep += combinaison(n, j)
          }
          reponse = rep

          texte = `Soit $E$ un ensemble à $${n}$ éléments. Combien de sous-ensembles contiennent au moins $${k}$ éléments ?`

          texteCorr = `On dénombre par le complémentaire. Il y a $C_j^{${n}}$ sous-ensembles de taille $j$, car l'ordre ne compte pas dans un sous-ensemble.<br>`
          texteCorr += `Sous-ensembles de taille $0$ à $${k - 1}$ :<br>`
          let soustrait = 0
          for (let j = 0; j < k; j++) {
            texteCorr += `$\\bullet$ Taille $${j}$ : $C_{${j}}^{${n}} = ${combinaison(n, j)}$<br>`
            soustrait += combinaison(n, j)
          }
          texteCorr += `<br>Total des sous-ensembles : $2^{${n}} = ${Math.pow(2, n)}$<br>`
          texteCorr += `Au moins $${k}$ éléments : $2^{${n}} - ${soustrait} = ${Math.pow(2, n)} - ${soustrait} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        }
      }

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
          texteAvant: '<br>',
        })
        handleAnswers(this, i, {
          reponse: { value: reponse.toString() },
        })
      }

      if (this.questionJamaisPosee(i, typeQuestion, reponse)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
