import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { fraction } from '../../modules/fractions'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Calculer des probabilités'
export const interactifReady = true

export const dateDePublication = '02/08/2024' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModificationImportante = '29/12/2025' // Mise en place de l'interactivité (Jean-claude Lhote)
export const uuid = '24db8'
export const refs = {
  'fr-fr': ['4S20-4', 'BP2FLUC12', 'BP1AUTO010'],
  'fr-ch': ['4mProbStat-15', '11LSNO4C-5'],
}

/**
 *  Calculer des probabilités avec des cartes à jouer.
 * @author Mireille Gain

*/
export default class ProbabilitesEnJeuxDe32Cartes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.nbQuestionsModifiable = false
    this.spacing = 1.2
    this.spacingCorr = 1.2
    this.besoinFormulaireCaseACocher = ['Afficher un jeu de 32 cartes']
    this.sup = false
  }

  nouvelleVersion() {
    this.consigne =
      "On tire une carte dans un jeu de $32$ cartes.<br>Calculer la probabilité d'obtenir chacun des événements suivants."
    if (context.isHtml && this.sup) {
      const imageCartes =
        '<img src="/alea/images/jeu32cartes.png" alt="Jeu de 32 cartes" class="max-w-lg my-4">'
      this.consigne += imageCartes
    }
    const typeDeQuestionsDisponibles = [
      'type1',
      'type2',
      'type3',
      'type4',
      'type5',
      'type6',
      'type7',
      'type8',
    ]
    const listeTypeDeQuestions = combinaisonListes(
      typeDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque cycle
    let texte = ''
    const texteCorr: string[] = [
      "On est dans une situation d'équiprobabilité.<br> Donc la probabilité est donnée par le quotient du nombre de cas favorables par le nombre de cas au total.<br>",
    ]

    const a = fraction(1, 2)
    const b = fraction(16, 32)
    const c = fraction(1, 4)
    const d = fraction(8, 32)
    const e = fraction(1, 32)
    const f = fraction(2, 32)
    const g = fraction(1, 16)
    const h = fraction(4, 32)
    const p = fraction(1, 8)
    const j = fraction(28, 32)
    const k = fraction(7, 8)
    const l = fraction(20, 32)
    const m = fraction(5, 8)
    const n = fraction(30, 32)
    const o = fraction(15, 16)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const famille = choice(['Carreau', 'Cœur', 'Pique', 'Trèfle'])
      const couleur = choice(['Rouge', 'Noire'])
      const valeur = choice([
        'un As',
        'un Sept',
        'un Huit',
        'un Neuf',
        'un Dix',
        'un Valet',
        'une Dame',
        'un Roi',
      ])
      const valeur2 = choice([
        "l'As",
        'le Sept',
        'le Huit',
        'le Neuf',
        'le Dix',
        'le Valet',
        'la Dame',
        'le Roi',
      ])
      let reponse: string = ''
      texteCorr.length = 1 // On réinitialise la correction
      switch (
        listeTypeDeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'type1':
          texte = `Tirer une carte de couleur ${couleur}.<br>`
          texteCorr.push(
            `La moitié des cartes est de couleur ${couleur}.<br>Il y en a donc $16$ sur $32$.<br>`,
          )
          texteCorr.push(
            `Donc la probabilité de tirer une carte de couleur ${couleur} est de $${miseEnEvidence(b.texFraction)}$ ou encore $${miseEnEvidence(a.texFraction)}$.`,
          )
          reponse = b.texFraction

          break
        case 'type2':
          texte = `Tirer un ${famille}.<br>`
          texteCorr.push(
            `Un quart des cartes sont de la famille ${famille}.<br>Il y en a donc $8$ sur $32$.<br>`,
          )
          texteCorr.push(
            `Donc la probabilité de tirer un ${famille} est de $${miseEnEvidence(d.texFraction)}$ ou encore $${miseEnEvidence(c.texFraction)}$.`,
          )
          reponse = d.texFraction
          break
        case 'type3':
          texte = `Tirer ${valeur2} de ${famille}.<br>`
          texteCorr.push(
            `Tirer ${valeur2} de ${famille} ne peut s'obtenir que d'une seule manière.<br>`,
          )
          texteCorr.push(
            `Donc la probabilité de tirer ${valeur2} de ${famille} est de $${miseEnEvidence(e.texFraction)}$.`,
          )
          reponse = e.texFraction
          break
        case 'type4':
          texte = `Tirer ${valeur} de couleur ${couleur}.<br>`
          texteCorr.push(
            `Il y a deux cartes correspondant à ${valeur} de couleur ${couleur}.<br>`,
          )
          texteCorr.push(
            `Donc la probabilité de tirer ${valeur} de couleur ${couleur} est de $${miseEnEvidence(f.texFraction)}$ ou encore $${miseEnEvidence(g.texFraction)}$.`,
          )
          reponse = f.texFraction
          break
        case 'type5':
          texte = `Tirer ${valeur}.<br>`
          texteCorr.push(`Il y a quatre cartes correspondant à ${valeur}.<br>`)
          texteCorr.push(
            `Donc la probabilité de tirer ${valeur} est de $${miseEnEvidence(h.texFraction)}$ ou encore $${miseEnEvidence(p.texFraction)}$.`,
          )
          reponse = h.texFraction
          break
        case 'type6':
          texte = `Tirer une autre carte qu'${valeur}.<br>`
          texteCorr.push(`Il y a $28$ cartes autres qu'${valeur}.<br>`)
          texteCorr.push(
            `Donc la probabilité de tirer une autre carte qu'${valeur} est de $${miseEnEvidence(j.texFraction)}$ ou encore $${miseEnEvidence(k.texFraction)}$.`,
          )
          reponse = j.texFraction
          break
        case 'type7':
          texte = 'Tirer une carte qui ne soit pas une figure.<br>'
          texteCorr.push(
            'Il y a $12$ cartes qui sont des figures, donc $20$ qui ne sont pas des figures.<br>',
          )
          texteCorr.push(
            `Donc la probabilité de tirer une carte qui ne soit pas une figure est de $${miseEnEvidence(l.texFraction)}$ ou encore $${miseEnEvidence(m.texFraction)}$.`,
          )
          reponse = l.texFraction
          break
        case 'type8':
          texte = `Tirer une carte autre qu'${valeur} de couleur ${couleur}.<br>`
          texteCorr.push(
            `Il y a 30 cartes qui ne correspondent pas à ${valeur} de couleur ${couleur}.<br>`,
          )
          texteCorr.push(
            `Donc la probabilité de tirer une carte autre qu'${valeur} de couleur ${couleur} est de $${miseEnEvidence(n.texFraction)}$ ou encore $${miseEnEvidence(o.texFraction)}$.`,
          )
          reponse = n.texFraction
          break
      }
      texte += ajouteQuestionMathlive({
        exercice: this,
        question: i,
        reponseParams: { formatInteractif: 'mathalea-mathfield' },
        objetReponse: {
          reponse: { value: reponse },
        },
        typeInteractivite: 'mathlive',
      })
      this.listeQuestions.push(texte)
      this.listeCorrections.push(
        i === 0 ? texteCorr.join('') : texteCorr.slice(1).join(''),
      )
      i++
      cpt++
    }

    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
