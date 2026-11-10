import {
  addMultiMathfield,
  type DataOptionsMultiMathfield,
} from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import { prenom } from '../../lib/outils/Personne'
import { texNombre, texPrix } from '../../lib/outils/texNombre'
import type { Valeur } from '../../lib/types'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const interactifReady = true

export const titre = "Modéliser une situation à l'aide d'une fonction"
export const dateDePublication = '06/07/2026'
export const dateDeModifImportante = '31/10/2026'
/**
 *
 * @author Jean-Claude Lhote à partir de l'exercice 2F21-1 de Gilles Mora

*/
export const uuid = '5622b'

export const refs = {
  'fr-fr': ['3F14-1', '2F16-1'],
  'fr-ch': ['10LCFA3A-12', '10LSFA3A-12', '11CTFA2H-12', '11LCFA2H-1', '11LSFA2H-1'],
}
export default class ModeliserSituations extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = '0'
    this.spacing = 1.5
    this.spacingCorr = 2
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '0: Mélange',
        '1 : La salle de sport',
        '2 : Location de voitures',
        '3 : Abonnement à une revue',
        '4 : Station service',
        '5 : Le silo à grains',
        '6 : Le hand-spinner',
        "7 : La facture d'eau",
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 7,
      melange: 0,
      defaut: 0,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let reponses: Valeur = {}
      let dataTemplate = ''
      let dataOptions: DataOptionsMultiMathfield = {}
      // Boucle principale où i+1 correspond au numéro de la question
      switch (
        listeTypeDeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 1: // salle de sport deux formules
          {
            const a = randint(11, 13)
            const dec1 = randint(1, 9) / 10
            const b = randint(5, 6) + dec1
            const c = randint(20, 25)
            const dec2 = randint(4, 7) / 10
            const d = randint(4, 4) + dec2

            texte = ` Dans une salle de sport, deux formules sont proposées :<br>
            ${texteGras('Formule A :')} abonnement mensuel de $${a}$ € puis $${texPrix(b)}$ € par séance ;<br>
            ${texteGras('Formule B :')} abonnement mensuel de $${c}$ € puis $${texPrix(d)}$ € par séance.<br>
            On note $x$ le nombre de séances mensuelles d'un abonné, $f(x)$ le prix payé avec la formule A et $g(x)$ le prix payé avec la formule B.<br><br>`
            dataTemplate = `a) Exprimer le prix payé $f(x)$ en fonction de $x$ : $f(x)=$%{champ1}<br>
b) Exprimer le prix payé $g(x)$ en fonction de $x$ : $g(x)=$%{champ2}<br>`
            dataOptions = {
              champ1: {
                keyboard: KeyboardType.clavierDeBaseAvecX,
                minWidth: 50,
                ldots: true,
              },
              champ2: {
                keyboard: KeyboardType.clavierDeBaseAvecX,
                minWidth: 50,
                ldots: true,
              },
            }
            reponses = {
              champ1: { value: `${a}+${texPrix(b)}x` },
              champ2: { value: `${c}+${texPrix(d)}x` },
            }
            texteCorr = `Les formules comprennent un abonnement fixe et un tarif particulier pour une séance. <br>
          Ainsi, le montant mensuel pour une formule est : Abonnement + Coût d'une séance $\\times$ Nombre de séances. <br>
          ${numAlpha(0)} La fonction $f$ est définie par $f(x)=${miseEnEvidence(`${a}+${texPrix(b)}x`)}$.<br>
          ${numAlpha(1)} La fonction $g$ est définie par $g(x)=${miseEnEvidence(`${c}+${texPrix(d)}x`)}$.`
          }
          break

        case 2: // location de voitures
          {
            const a = randint(80, 120) // forfait
            const c = randint(41, 65, [50, 60]) / 100 // prix /km

            texte = `  Une société de location de véhicules particuliers propose le tarif suivant pour un week-end de location :<br>
          ${texteGras('TARIF WEEK-END :')} forfait de $${a}$ € puis $${texNombre(c, 2)}$ € par $\\text{km}$ parcouru.<br>
          On note $x$ le nombre de $\\text{km}$ parcourus par un client au cours d'un week-end et on considère la fonction $T$ qui à chaque valeur de $x$ associe le prix payé par le client.<br>`
            dataTemplate = `Exprimer le prix payé $T(x)$ en fonction de $x$ : $T(x)=$%{champ1}`
            dataOptions = {
              champ1: {
                keyboard: KeyboardType.clavierDeBaseAvecX,
                minWidth: 50,
                ldots: true,
              },
            }
            reponses = {
              champ1: { value: `${a}+${texNombre(c, 2)}x` },
            }
            texteCorr = `Le montant payé par le client est la somme du forfait et du coût des $\\text{km}$ parcourus. <br>
          Ainsi, la fonction $T$ est définie par $T(x)=${miseEnEvidence(`${a}+${texNombre(c, 2)}x`)}$.`
          }
          break

        case 3: // abonnement à une revue
          {
            const a = randint(6, 10) * 1000 //
            const b = choice([40, 50, 80, 100])

            texte = `Le nombre d'abonnés potentiels à une revue dépend du prix de l'abonnement à cette revue, prix exprimé en euros.<br>
          On considère que le nombre d'abonnés est de $${texNombre(a)}$ lorsque l'abonnement est gratuit et qu'il diminue de $${b}$ pour chaque augmentation de $1$ € du prix de l'abonnement.<br>
          Soit $N$ la fonction qui donne le nombre d'abonnés en fonction du prix $x$ de l'abonnement annuel à cette revue.`
            dataTemplate = `Exprimer le nombre d'abonnés potentiels $N(x)$ en fonction de $x$ : $N(x)=$%{champ1}<br>`
            texteCorr = `Le nombre d'abonnés potentiels diminue de $${b}$ pour chaque augmentation de $1$ € du prix de l'abonnement. <br>
          Ainsi, la fonction $N$ est définie par $N(x)=${miseEnEvidence(`${texNombre(a)}-${b}x`)}$.`
            reponses = {
              champ1: { value: `${texNombre(a)}-${b}x` },
            }
          }
          break
        case 4: // station service
          {
            const a = randint(180, 220) / 100 //
            const P = prenom()

            texte = `Dans une station service, le prix de l'essence sans plomb $95$ est de $${texNombre(a)}$ € le litre.<br>
            On note $x$ le nombre de litres que met ${P} pour faire le plein du réservoir de sa voiture. <br>
On considère la fonction $f$ qui associe à chaque valeur de $x$, le prix payé en euros par ${P}.`
            dataTemplate = `Exprimer le prix payé $f(x)$ en fonction de $x$ : $f(x)=$%{champ1}<br>`

            texteCorr = `Le prix payé par ${P} est le produit du nombre de litres mis dans le réservoir par le prix d'un litre d'essence. <br>
          Ainsi, la fonction $f$ est définie par $f(x)=${miseEnEvidence(`${texNombre(a)}x`)}$.`
            reponses = {
              champ1: { value: `${texNombre(a)}x` },
            }
          }
          break

        case 5: // le silo à grains
          {
            const m = randint(27, 38, 30) + choice([0.2, 0.4, 0.6, 0.8]) // kg de grains mangés par jour
            const p = m * 5 * randint(6, 11) // capacité du silo

            texte = `Un éleveur de poulets remplit son silo avec $${texNombre(p, 0)}$ kg de grains.<br>
            Ses poulets consomment $${texNombre(m, 1)}$ kg de grains par jour.<br>
            On note $x$ le nombre de jours écoulés après avoir rempli le silo et $f(x)$ la masse (en $\\text{kg}$) restante au bout de $x$ jours.`
            dataTemplate = `Exprimer $f(x)$ en fonction de $x$ : $f(x)=$%{champ1}<br>`

            texteCorr = `La masse de grains restante dans le silo est la masse initiale moins la masse consommée par les poulets. <br>
          Ainsi, la fonction $f$ est définie par $f(x)=${miseEnEvidence(`${texNombre(p, 0)}-${texNombre(m, 1)}x`)}$.`
            reponses = {
              champ1: { value: `${texNombre(p, 0)}-${texNombre(m, 1)}x` },
            }
          }
          break

        case 6: // le hand-spinner
          {
            const v = randint(20, 27) // vitesse initiale
            const a = randint(-300, -200) / 1000 // coeff
            texte = ` Le hand-spinner est une sorte de toupie plate qui tourne sur elle-même.<br>
On donne au hand-spinner une vitesse de rotation initiale de $${texNombre(v, 0)}$ tours par seconde au temps $t = 0$, puis, au cours du temps, sa vitesse de rotation diminue jusqu'à l'arrêt complet du hand-spinner.<br>
On a mesuré que la vitesse de rotation du hand-spinner diminue de $${texNombre(-a, 3)}$ tours par seconde à chaque seconde.<br>`
            dataTemplate = `Exprimer la vitesse de rotation $v(x)$ du hand-spinner en fonction du temps $x$ écoulé en secondes depuis le départ : $v(x)=$%{champ1}<br>`
            texteCorr = `La vitesse de rotation du hand-spinner est une fonction affine du temps. <br>
          Ainsi, la fonction $v$ est définie par $v(x)=${miseEnEvidence(`${texNombre(v, 0)}-${texNombre(-a, 3)}x`)}$.`
            reponses = {
              champ1: { value: `${texNombre(v, 0)}-${texNombre(-a, 3)}x` },
            }
          }
          break

        default:
          {
            // la facture d'eau
            const abo = randint(451, 691) / 10 // abonnement
            const p = randint(301, 399) / 100 // prix du m3
            texte = ` Dans une région de France, le tarif de l'eau est le suivant : <br>
            un abonnement annuel de $${texNombre(abo, 2, true)}$ € et $${texNombre(p, 2, true)}$ € par mètre cube consommé.<br>
            On note $x$ la consommation d'eau en mètre cube d'un particulier et $P(x)$ le prix payé par ce particulier.<br>`

            dataTemplate = `Exprimer le prix payé $P$ en fonction de la consommation $x$ : $P(x)=$%{champ1}<br>`
            texteCorr = `Le prix payé par le particulier est la somme de l'abonnement annuel et du coût de la consommation d'eau. <br>
          Ainsi, la fonction $P$ est définie par $P(x)=${miseEnEvidence(`${texNombre(abo, 2, true)}+${texNombre(p, 2, true)}x`)}$.`
            reponses = {
              champ1: {
                value: `${texNombre(abo, 2, true)}+${texNombre(p, 2, true)}x`,
              },
            }
          }
          break
      }
      dataOptions = {
        champ1: {
          keyboard: KeyboardType.clavierDeBaseAvecX,
          minWidth: 50,
          ldots: true,
        },
      }
      if (this.questionJamaisPosee(i, texte)) {
        texte += addMultiMathfield(this, i, { dataTemplate, dataOptions })
        if (this.interactif) {
          handleAnswers(this, i, reponses, {
            formatInteractif: 'multi-mathfield',
          })
        }
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
