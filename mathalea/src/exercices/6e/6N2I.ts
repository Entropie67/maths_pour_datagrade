import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { prenom, prenomF, prenomM } from '../../lib/outils/Personne'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi, range1, rangeMinMax } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { texNombre, texPrix } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import operation from '../../modules/operations'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const titre = 'Résoudre un problème en utilisant la division décimale'
export const dateDePublication = '09/05/2025'

/**
 * Résoudre un problème en utilisant la division décimale.
 *
 * @author Éric Elter

 */
export const uuid = '12d6e'

export const refs = {
  'fr-fr': ['6N2I'],
  'fr-2016': ['6C31-1'],
  'fr-ch': ['PR-30', '9R1NO7E-2', '9R2NO7E-2', '9R3NO7E-2', 'PRQST02B-8', 'PRQNO15A-2'],
}
export default class DivisionDecimale extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de quotients',
      2,
      '1 : Inférieurs à 1\n2 : Supérieurs à 1\n3 : Mélange',
    ]
    this.spacing = 2
    this.spacingCorr = context.isHtml ? 2 : 1 // Important sinon opdiv n'est pas joli
    this.nbQuestions = 4
    this.sup = 3
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Résoudre les problèmes suivants.'
        : 'Résoudre le problème suivant.'

    const typesDeQuestionsDisponibles =
      this.sup === 1
        ? range1(3)
        : this.sup === 2
          ? rangeMinMax(4, 7)
          : range1(7)

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    let typesDeQuestions
    for (
      let i = 0, texte, texteCorr, cpt = 0, a, b, q;
      i < this.nbQuestions && cpt < 50;
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]
      switch (typesDeQuestions) {
        case 1: {
          a = choice([1.25, 1.5, 2, 2.5])
          b = choice([4, 8])
          q = arrondi(a / b, 4)
          const fruits = choice([
            "d'oranges",
            "d'abricots",
            'de pommes',
            "d'ananas",
            'de canneberges',
            'de groseilles',
          ])
          const bidule = prenom(1)
          texte = `${bidule} achète une bouteille de $${texNombre(a)}$ L de jus ${fruits} et la verse dans $${b}$ verres de façon équitable.
        Combien de centilitres chaque verre contiendra-t-il ?`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierNumbers,
            { texteAvant: sp(10), texteApres: ' cL' },
          )
          handleAnswers(this, i, {
            reponse: {
              value: arrondi(q * 100),
              options: { nombreDecimalSeulement: true },
            },
          })
          texteCorr = `On va partager $${texNombre(a)}$ L de jus ${fruits} en $${b}$ en posant la division : $${texNombre(a)} \\div ${b}$.`
          texteCorr += operation({
            operande1: a,
            operande2: b,
            type: 'division',
            precision: 4,
            options: { solution: true, colore: bleuMathalea },
          })
          texteCorr += `<br>$${texNombre(a)}\\div${b}=${texNombre(q)}$`
          texteCorr += `<br>Chaque verre va contenir $${texNombre(q)}$ L de jus ${fruits}, soit $${miseEnEvidence(texNombre(arrondi(q * 100)))}$ cL.`
          break
        }
        case 2: {
          b = randint(3, 9)
          q = arrondi(randint(51, 97, [60, 70, 80, 90]) / 100)
          a = arrondi(b * q)
          const produit = choice([
            ['éponge', 'éponges'],
            ['cahier', 'cahiers'],
            ['trousse', 'trousses'],
          ])
          texte = `$${b}$ ${produit[1]} coûtent $${texPrix(a)}$ €. Combien coûte $1$ ${produit[0]} ?`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierNumbers,
            { texteAvant: sp(10), texteApres: ' €' },
          )
          handleAnswers(this, i, {
            reponse: { value: q, options: { nombreDecimalSeulement: true } },
          })
          texteCorr = `On va partager $${texPrix(a)}$ € en $${b}$ en posant la division : $${texPrix(a)} \\div ${b}$.`
          texteCorr += operation({
            operande1: a,
            operande2: b,
            type: 'division',
            precision: 4,
            options: { solution: true, colore: orangeMathalea },
          })
          texteCorr += `<br>$${texNombre(a)}\\div${b}=${texNombre(q)}$`
          texteCorr += `<br>$1$ ${produit[0]} coûte $${miseEnEvidence(texNombre(q))}$ €.`
          break
        }
        case 3: {
          b = randint(4, 9)
          q = arrondi(randint(61, 93, [70, 80, 90]) / 100)
          a = arrondi(b * q)
          const bidule = prenomM()
          const truc = prenomF()
          texte = `${bidule} dispose de $${texNombre(a)}$ litres d'eau pour arroser $${b}$ plantes dans son jardin.
        Si ${truc} l'aide à répartir cette eau équitablement, combien de litres d'eau devra-t-elle verser sur chaque plante ?`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierNumbers,
            { texteAvant: sp(10), texteApres: ' L' },
          )
          handleAnswers(this, i, {
            reponse: { value: q, options: { nombreDecimalSeulement: true } },
          })
          texteCorr = `On va partager $${texNombre(a)}$ litres d'eau en $${b}$ en posant la division : $${texNombre(a)} \\div ${b}$.`
          texteCorr += operation({
            operande1: a,
            operande2: b,
            type: 'division',
            precision: 4,
            options: { solution: true, colore: orangeMathalea },
          })
          texteCorr += `<br>$${texNombre(a)}\\div${b}=${texNombre(q)}$`
          texteCorr += `<br>${truc} devra verser $${miseEnEvidence(texNombre(q))}$ litres d'eau sur chaque plante.`
          break
        }
        case 4: {
          b = choice([3, 4, 5, 6, 8, 9])
          a = arrondi((9 * randint(11, 31, [20, 30])) / 10)
          q = arrondi(a / b, 4)
          const matiere = choice([
            'de tissu',
            'de ruban',
            'de fil électrique',
            'de papier peint',
          ])
          const bidule = prenom(1)
          texte = `${bidule} dispose de $${texNombre(a)}\\text{ m}$ ${matiere} et souhaite le découper en $${b}$ morceaux égaux.
                  Quelle sera la longueur de chaque morceau en centimètres ?`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierNumbers,
            { texteAvant: sp(10), texteApres: ' $\\text{cm}$' },
          )
          handleAnswers(this, i, {
            reponse: {
              value: arrondi(q * 100),
              options: { nombreDecimalSeulement: true },
            },
          })
          texteCorr = `On va partager $${texNombre(a)}\\text{ m}$ ${matiere} en $${b}$ en posant la division : $${texNombre(a)} \\div ${b}$.`
          texteCorr += operation({
            operande1: a,
            operande2: b,
            type: 'division',
            precision: 4,
            options: { solution: true, colore: bleuMathalea },
          })
          texteCorr += `<br>$${texNombre(a)}\\div${b}=${texNombre(q)}$`
          texteCorr += `<br>Chaque morceau mesurera $${texNombre(q)}\\text{ m}$ ${matiere}, soit $${miseEnEvidence(texNombre(arrondi(q * 100)))}\\text{ cm}$.`
          break
        }
        case 5: {
          a = 18 + 0.9 * randint(1, 9)
          b = choice([3, 4, 5, 6, 8, 9])
          q = arrondi(a / b, 4)
          const aliment = choice([
            'de pâte à pizza',
            'de pâte à crêpes',
            'de farine',
            'de sucre',
            'de riz',
          ])
          texte = `Un restaurateur dispose de $${texNombre(a)}$ kg ${aliment} qu'il veut répartir en $${b}$ portions identiques.
                  Quelle masse ${aliment} contiendra chaque portion en grammes ?`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierNumbers,
            { texteAvant: sp(10), texteApres: ' g' },
          )
          handleAnswers(this, i, {
            reponse: {
              value: arrondi(q * 1000),
              options: { nombreDecimalSeulement: true },
            },
          })
          texteCorr = `On va partager $${texNombre(a)}$ kg ${aliment} en $${b}$ en posant la division : $${texNombre(a)} \\div ${b}$.`
          texteCorr += operation({
            operande1: a,
            operande2: b,
            type: 'division',
            precision: 4,
            options: { solution: true, colore: bleuMathalea },
          })
          texteCorr += `<br>$${texNombre(a)}\\div${b}=${texNombre(q)}$`
          texteCorr += `<br>Chaque portion contiendra $${texNombre(q)}$ kg ${aliment}, soit $${miseEnEvidence(texNombre(arrondi(q * 1000)))}$ g.`
          break
        }
        case 6: {
          b = randint(5, 9)
          q = arrondi(randint(200, 450) / 100)
          a = arrondi(b * q)
          const bidule = prenomF()
          texte = `${bidule} parcourt $${texNombre(a)}\\text{ km}$ en $${b}$ jours, en faisant la même distance chaque jour. 
                  Quelle distance parcourt-elle quotidiennement ?`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierNumbers,
            { texteAvant: sp(10), texteApres: '$\\text{ km}$' },
          )
          handleAnswers(this, i, {
            reponse: { value: q, options: { nombreDecimalSeulement: true } },
          })
          texteCorr = `On va partager $${texNombre(a)}\\text{ km}$ en $${b}$ en posant la division : $${texNombre(a)} \\div ${b}$.`
          texteCorr += operation({
            operande1: a,
            operande2: b,
            type: 'division',
            precision: 4,
            options: { solution: true, colore: orangeMathalea },
          })
          texteCorr += `<br>$${texNombre(a)}\\div${b}=${texNombre(q)}$`
          texteCorr += `<br>${bidule} parcourt $${miseEnEvidence(texNombre(q))}\\text{ km}$ chaque jour.`
          break
        }
        case 7:
        default: {
          b = randint(4, 8)
          q = arrondi((randint(1, 99) * 10 + randint(1, 9)) / 100)
          a = arrondi(b * q)
          const bidule = prenomF()
          texte = `${bidule} a téléchargé $${texNombre(a)}$ Go de données sur $${b}$ jours d'activité.
                  En moyenne, combien de Go a-t-elle téléchargés par jour d'activité ?`
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierNumbers,
            { texteAvant: sp(10), texteApres: ' Go' },
          )
          handleAnswers(this, i, {
            reponse: { value: q, options: { nombreDecimalSeulement: true } },
          })
          texteCorr = `On va partager $${texNombre(a)}$ Go en $${b}$ en posant la division : $${texNombre(a)} \\div ${b}$.`
          texteCorr += operation({
            operande1: a,
            operande2: b,
            type: 'division',
            precision: 4,
            options: { solution: true, colore: orangeMathalea },
          })
          texteCorr += `<br>$${texNombre(a)}\\div${b}=${texNombre(q)}$`
          texteCorr += `<br>${bidule} a téléchargé en moyenne $${miseEnEvidence(texNombre(q))}$ Go par jour d'activité.`
          break
        }
      }
      if (this.questionJamaisPosee(i, a, b)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
