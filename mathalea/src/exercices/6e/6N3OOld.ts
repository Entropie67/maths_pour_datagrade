import { bleuMathalea } from '../../lib/colors'
import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi, rangeMinMax } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { prenomPronom } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Comprendre le sens d'un pourcentage"
export const interactifReady = true

export const dateDePublication = '22/07/2025'

/** Comprendre le sens d'un pourcentage
 * @author Éric Elter
 */

export const uuid = '44e23'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

export default class ComprendreSensPourcentage extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.comment +=
      'On peut sélectionner son thème de questions grâce à un paramètre.<br>'
    this.comment +=
      'À la question b), on peut choisir son multiple de 100 grâce à un paramètre.<br>'
    this.comment +=
      'À la question c), on peut choisir son diviseur de 100 grâce à un paramètre.<br>'
    this.besoinFormulaireTexte = [
      'Thème de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Sucres dans un aliment',
        '2 : Graisses dans un aliment',
        '3 : Protéines dans un aliment',
        '4 : Eau dans un fruit',
        '5 : Sucres dans une boisson',
        '6 : Sel dans un fromage',
        '7 : Fibres dans un légume',
        '8 : Réduction sur un prix',
        "9 : Consommation d'essence",
        '10 : Temps de lecture/jeux vidéos',
        '11 : Réussite sportive',
        '12 : Consommation électrique',
        "13 : Résultats d'une élection",
        '14 : Distance parcourue à vélo',
        '15 : Mélange',
      ].join('\n'),
    ]
    this.sup = 1

    this.besoinFormulaire2Texte = [
      'Multiples de 100',
      [
        'Nombres séparés par des tirets :',
        '1 : 200',
        '2 : 300',
        '3 : 400',
        '4 : 500',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.sup2 = 5

    this.besoinFormulaire3Texte = [
      'Diviseurs de 100',
      [
        'Nombres séparés par des tirets :',
        '1 : 50',
        '2 : 25',
        '3 : 20',
        '4 : 10',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.sup3 = 5

    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
      max: 14,
      melange: 15,
      defaut: 15,
    }).map(Number)

    const multiplePour100 = gestionnaireFormulaireTexte({
      nbQuestions: this.nbQuestions,
      saisie: this.sup2,
      max: 4,
      melange: 5,
      defaut: 5,
      listeOfCase: rangeMinMax(2, 5),
    }).map(Number)

    const diviseurPour100 = gestionnaireFormulaireTexte({
      nbQuestions: this.nbQuestions,
      saisie: this.sup3,
      max: 4,
      melange: 5,
      defaut: 5,
      listeOfCase: [2, 4, 5, 10],
    }).map(Number)

    let pourcentage = 0
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texteCorr = ''
      const texteAvant = []
      let texteApres = ''
      let unites = 'g'
      const quidam = prenomPronom()
      switch (listeTypeDeQuestions[i]) {
        case 1:
        case 2:
        case 3: {
          let nutriment = ''
          switch (listeTypeDeQuestions[i]) {
            case 1:
              nutriment = 'sucres'
              break
            case 2:
              nutriment = 'graisses'
              break
            default:
              nutriment = 'protéines'
              break
          }
          pourcentage = randint(21, 49, [30, 40]) // Entier aléatoire entre 21 et 49 en excluant 30 et 40.

          texteAvant[0] = `Si un aliment contient $${pourcentage}\\ \\%$ de ${nutriment}, alors pour $100$ ${unites} de cet aliment, il y a`
          texteApres = `${unites} de ${nutriment}.<br>`

          texteAvant[1] = `On peut en déduire que $${multiplePour100[i] * 100}$ ${unites} de cet aliment contiennent`

          texteAvant[2] = `On peut aussi en déduire que $${arrondi(100 / diviseurPour100[i])}$ ${unites} de cet aliment contiennent`

          break
        }
        case 4: {
          const fruitsAvecArticle = choice([
            'un concombre',
            'une pastèque',
            'une tomate',
            'une courgette',
            'une fraise',
            'un melon',
            'un pamplemousse',
            'une pêche',
          ])
          const fruits = fruitsAvecArticle.split(' ')[1]
          pourcentage = randint(81, 96, [90])

          texteAvant[0] = `Si ${fruitsAvecArticle} contient $${pourcentage}\\ \\%$ d'eau, alors pour $100$ ${unites} de ${fruits}, il y a`
          texteApres = `${unites} d'eau.<br>`

          texteAvant[1] = `On peut en déduire que $${multiplePour100[i] * 100}$ ${unites} de ${fruits} contiennent`

          texteAvant[2] = `On peut aussi en déduire que $${arrondi(100 / diviseurPour100[i])}$ ${unites} de ${fruits} contiennent`

          break
        }
        case 5: {
          const nutriment = 'sucres'
          pourcentage = randint(11, 39, [20, 30])

          texteAvant[0] = `Si une boisson contient $${pourcentage}\\ \\%$ de ${nutriment}, alors pour $100$ ${unites} de cette boisson, il y a`
          texteApres = `${unites} de ${nutriment}.<br>`

          texteAvant[1] = `On peut en déduire que $${multiplePour100[i] * 100}$ ${unites} de cette boisson contiennent`

          texteAvant[2] = `On peut aussi en déduire que $${arrondi(100 / diviseurPour100[i])}$ ${unites} de cette boisson contiennent`

          break
        }
        case 6: {
          const nutriment = 'sel'
          pourcentage = randint(2, 12, [10])

          texteAvant[0] = `Si un fromage contient $${pourcentage}\\ \\%$ de ${nutriment}, alors pour $100$ ${unites} de ce fromage, il y a`
          texteApres = `${unites} de ${nutriment}.<br>`

          texteAvant[1] = `On peut en déduire que $${multiplePour100[i] * 100}$ ${unites} de ce fromage contiennent`

          texteAvant[2] = `On peut aussi en déduire que $${arrondi(100 / diviseurPour100[i])}$ ${unites} de ce fromage contiennent`

          break
        }
        case 7: {
          const nutriment = 'fibres'
          pourcentage = randint(1, 9)

          texteAvant[0] = `Si un légume contient $${pourcentage}\\ \\%$ de ${nutriment}, alors pour $100$ ${unites} de ce légume, il y a`
          texteApres = `${unites} de ${nutriment}.<br>`

          texteAvant[1] = `On peut en déduire que $${multiplePour100[i] * 100}$ ${unites} de ce légume contiennent`

          texteAvant[2] = `On peut aussi en déduire que $${arrondi(100 / diviseurPour100[i])}$ ${unites} de ce légume contiennent`

          break
        }
        case 8:
          unites = '€'
          pourcentage = choice([15, 20, 25, 30, 40, 50, 60, 70])

          texteAvant[0] = `Si un magasin propose $${pourcentage}\\ \\%$ de réduction, alors pour $100$ €, on économise`
          texteApres = `${unites}.<br>`

          texteAvant[1] = `On peut en déduire que pour $${multiplePour100[i] * 100}$ €, on économise`

          texteAvant[2] = `On peut aussi en déduire que pour $${arrondi(100 / diviseurPour100[i])}$ €, on économise`

          break
        case 9:
          unites = 'L'
          pourcentage = randint(4, 18, [10])

          texteAvant[0] = `Si une voiture consomme $${pourcentage}\\ \\%$ de son réservoir par $100\\text{ km}$, alors pour $100\\text{ km}$, elle utilise`
          texteApres = `${unites} de carburant.<br>`

          texteAvant[1] = `On peut en déduire que pour $${multiplePour100[i] * 100}\\text{ km}$, la voiture consomme`

          texteAvant[2] = `On peut aussi en déduire que pour $${arrondi(100 / diviseurPour100[i])}\\text{ km}$, la voiture consomme`

          break
        case 10:
          unites = 'minutes'
          pourcentage = choice([20, 40, 60])
          if (choice([true, false])) {
            texteAvant[0] = `Si ${quidam.prenom} passe $${pourcentage}\\ \\%$ de son temps à lire, alors pour $100$ minutes, ${quidam.pronom} lit`
            texteApres = `${unites}.<br>`

            texteAvant[1] = `On peut en déduire que pour $${multiplePour100[i] * 100}$ minutes, ${quidam.prenom} lit`

            texteAvant[2] = `On peut aussi en déduire que pour $${arrondi(100 / diviseurPour100[i])}$ minutes, ${quidam.prenom} lit`
          } else {
            texteAvant[0] = `Si ${quidam.prenom} passe $${pourcentage}\\ \\%$ de son temps à jouer aux jeux vidéos, alors pour $100$ minutes, ${quidam.pronom} joue`
            texteApres = `${unites}.<br>`

            texteAvant[1] = `On peut en déduire que pour $${multiplePour100[i] * 100}$ minutes, ${quidam.prenom} joue`

            texteAvant[2] = `On peut aussi en déduire que pour $${arrondi(100 / diviseurPour100[i])}$ minutes, ${quidam.prenom} joue`
          }
          break
        case 11:
          pourcentage = choice([40, 60, 70, 80, 90])
          if (choice([true, true, true, false])) {
            unites = 'tirs'
            texteAvant[0] = `Si, au ${choice(['football', 'handball', 'water-polo', 'hockey'])}, ${quidam.prenom} réussit $${pourcentage}\\ \\%$ de ses tirs au but, alors pour $100$ tentatives de tirs au but, ${quidam.pronom} réussit`
            texteApres = `${unites}.<br>`

            texteAvant[1] = `On peut en déduire que pour $${multiplePour100[i] * 100}$ tentatives de tirs au but, ${quidam.prenom} marque`

            texteAvant[2] = `On peut aussi en déduire que pour $${arrondi(100 / diviseurPour100[i])}$ tentatives de tirs au but, ${quidam.prenom} marque`
          } else {
            unites = 'lancers'
            texteAvant[0] = `Si, au basketball, ${quidam.prenom} réussit $${pourcentage}\\ \\%$ de ses lancers francs, alors pour $100$ tentatives de lancers francs, ${quidam.pronom} réussit`
            texteApres = `${unites}.<br>`

            texteAvant[1] = `On peut en déduire que pour $${multiplePour100[i] * 100}$ tentatives de lancers francs, ${quidam.prenom} marque`

            texteAvant[2] = `On peut aussi en déduire que pour $${arrondi(100 / diviseurPour100[i])}$ tentatives de lancers francs, ${quidam.prenom} marque`
          }
          break
        case 12:
          unites = 'kWh'
          pourcentage = randint(3, 29, [10, 20])
          texteAvant[0] = `Si un appareil utilise $${pourcentage}\\ \\%$ de l'énergie d'un foyer, alors pour $100$ kilowatt-heures (kWh), cet appareil consomme`
          texteApres = `${unites}.<br>`

          texteAvant[1] = `On peut en déduire que pour $${multiplePour100[i] * 100}$ kWh, cet appareil consomme`

          texteAvant[2] = `On peut aussi en déduire que pour $${arrondi(100 / diviseurPour100[i])}$ kWh, cet appareil consomme`

          break
        case 13:
          unites = 'voix'
          pourcentage = choice([20, 40, 60, 80])
          texteAvant[0] = `Si, lors d'une élection, un candidat récolte $${pourcentage}\\ \\%$ des voix, alors pour $100$ votants, ce candidat reçoit`
          texteApres = `${unites}.<br>`

          texteAvant[1] = `On peut en déduire que pour $${multiplePour100[i] * 100}$ votants, ce candidat reçoit`

          texteAvant[2] = `On peut aussi en déduire que pour $${arrondi(100 / diviseurPour100[i])}$ votants, ce candidat reçoit`

          break
        case 14:
          unites = '$\\text{ km}$'
          pourcentage = randint(31, 79, [40, 50, 60, 70])
          texteAvant[0] = `Si un cycliste parcourt $${pourcentage}\\ \\%$ de son trajet total en montée, alors pour $100\\text{ km}$ parcourus,`
          texteApres = `${unites} sont parcourus.<br>`

          texteAvant[1] = `On peut en déduire que pour $${multiplePour100[i] * 100}\\text{ km}$ parcourus,`

          texteAvant[2] = `On peut aussi en déduire que pour $${arrondi(100 / diviseurPour100[i])}\\text{ km}$ parcourus,`

          break
      }
      const reponse = [
        pourcentage,
        pourcentage * multiplePour100[i],
        texNombre(arrondi(pourcentage / diviseurPour100[i])),
      ]
      const items = []
      const itemsCorr = []
      for (let indice = 0; indice < 3; indice++) {
        items.push(
          this.interactif
            ? ajouteChampTexteMathLive(
                this,
                3 * i + indice,
                KeyboardType.clavierNumbers,
                { texteAvant: texteAvant[indice], texteApres },
              )
            : texteAvant[indice] + ' $\\ldots$ ' + texteApres,
        )
        handleAnswers(this, 3 * i + indice, {
          reponse: {
            value: reponse[indice],
            options: { nombreDecimalSeulement: true },
          },
        })
        texteCorr = ''
        switch (indice) {
          case 1:
            if (this.correctionDetaillee) {
              texteCorr += `$${multiplePour100[i] * 100}$ ${unites} = $${miseEnEvidence(multiplePour100[i], bleuMathalea)} \\times 100$ ${unites} ${sp(10)}`
              texteCorr += `et ${sp(10)} $${miseEnEvidence(multiplePour100[i], bleuMathalea)} \\times ${pourcentage}$ ${unites} = $${miseEnEvidence(reponse[1])}$ ${unites}.<br>`
            }
            break
          case 2:
            if (this.correctionDetaillee) {
              texteCorr += `$${arrondi(100 / diviseurPour100[i])}$ ${unites} = $100$ ${unites} $\\div ${miseEnEvidence(diviseurPour100[i], bleuMathalea)}$ ${sp(10)}`
              texteCorr += `et ${sp(10)} $${pourcentage}$ ${unites} $\\div ${miseEnEvidence(diviseurPour100[i], bleuMathalea)}$ = $${miseEnEvidence(reponse[2])}$ ${unites}.<br>`
            }
            break
        }
        texteCorr +=
          texteAvant[indice] +
          ` $${miseEnEvidence(reponse[indice])}$ ` +
          texteApres
        itemsCorr.push(texteCorr)
      }
      const texte = createList({ items, style: 'alpha' })
      texteCorr = createList({ items: itemsCorr, style: 'alpha' })
      if (
        this.questionJamaisPosee(
          i,
          pourcentage,
          multiplePour100[i],
          diviseurPour100[i],
        )
      ) {
        this.listeCorrections[i] = texteCorr
        this.listeQuestions[i] = texte
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
