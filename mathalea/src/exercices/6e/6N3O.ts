import { bleuMathalea } from '../../lib/colors'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
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

export const uuid = '44e2e'

export const refs = {
  'fr-fr': ['6N3O'],
  'fr-2016': ['6N33-5'],
  'fr-ch': ['10CTFA1C-1', '10LCFA1C-1', '10LSFA1C-1', 'PRQPF05A-3'],
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
        '10 : Temps de lecture/jeux vidéo',
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
      let texteApresA = '' // si la fin de la phrase a) diffère de celle de b) et c)
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
          texteApres = `${unites} de ${nutriment}.`

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
          texteApres = `${unites} d'eau.`

          texteAvant[1] = `On peut en déduire que $${multiplePour100[i] * 100}$ ${unites} de ${fruits} contiennent`

          texteAvant[2] = `On peut aussi en déduire que $${arrondi(100 / diviseurPour100[i])}$ ${unites} de ${fruits} contiennent`

          break
        }
        case 5: {
          const nutriment = 'sucres'
          pourcentage = randint(11, 39, [20, 30])

          texteAvant[0] = `Si une boisson contient $${pourcentage}\\ \\%$ de ${nutriment}, alors pour $100$ ${unites} de cette boisson, il y a`
          texteApres = `${unites} de ${nutriment}.`

          texteAvant[1] = `On peut en déduire que $${multiplePour100[i] * 100}$ ${unites} de cette boisson contiennent`

          texteAvant[2] = `On peut aussi en déduire que $${arrondi(100 / diviseurPour100[i])}$ ${unites} de cette boisson contiennent`

          break
        }
        case 6: {
          const nutriment = 'sel'
          pourcentage = randint(2, 12, [10])

          texteAvant[0] = `Si un fromage contient $${pourcentage}\\ \\%$ de ${nutriment}, alors pour $100$ ${unites} de ce fromage, il y a`
          texteApres = `${unites} de ${nutriment}.`

          texteAvant[1] = `On peut en déduire que $${multiplePour100[i] * 100}$ ${unites} de ce fromage contiennent`

          texteAvant[2] = `On peut aussi en déduire que $${arrondi(100 / diviseurPour100[i])}$ ${unites} de ce fromage contiennent`

          break
        }
        case 7: {
          const nutriment = 'fibres'
          pourcentage = randint(1, 9)

          texteAvant[0] = `Si un légume contient $${pourcentage}\\ \\%$ de ${nutriment}, alors pour $100$ ${unites} de ce légume, il y a`
          texteApres = `${unites} de ${nutriment}.`

          texteAvant[1] = `On peut en déduire que $${multiplePour100[i] * 100}$ ${unites} de ce légume contiennent`

          texteAvant[2] = `On peut aussi en déduire que $${arrondi(100 / diviseurPour100[i])}$ ${unites} de ce légume contiennent`

          break
        }
        case 8:
          unites = '€'
          pourcentage = choice([15, 20, 25, 30, 40, 50, 60, 70])

          texteAvant[0] = `Si un magasin propose $${pourcentage}\\ \\%$ de réduction, alors pour $100$ €, on économise`
          texteApres = `${unites}.`

          texteAvant[1] = `On peut en déduire que pour $${multiplePour100[i] * 100}$ €, on économise`

          texteAvant[2] = `On peut aussi en déduire que pour $${arrondi(100 / diviseurPour100[i])}$ €, on économise`

          break
        case 9:
          unites = 'L'
          pourcentage = randint(4, 18, [10])

          texteAvant[0] = `Si une voiture consomme $${pourcentage}\\ \\%$ de son réservoir par $100\\text{ km}$, alors pour un réservoir de $100$ L, elle utilise`
          texteApresA = `${unites} de carburant par $100\\text{ km}$.`
          texteApres = `${unites} de carburant.`

          texteAvant[1] = `On peut en déduire que pour $${multiplePour100[i] * 100}\\text{ km}$, la voiture consomme`

          texteAvant[2] = `On peut aussi en déduire que pour $${arrondi(100 / diviseurPour100[i])}\\text{ km}$, la voiture consomme`

          break
        case 10:
          unites = 'minutes'
          pourcentage = choice([20, 40, 60])
          if (choice([true, false])) {
            texteAvant[0] = `Si ${quidam.prenom} passe $${pourcentage}\\ \\%$ de son temps à lire, alors pour $100$ minutes, ${quidam.pronom} lit`
            texteApres = `${unites}.`

            texteAvant[1] = `On peut en déduire que pour $${multiplePour100[i] * 100}$ minutes, ${quidam.prenom} lit`

            texteAvant[2] = `On peut aussi en déduire que pour $${arrondi(100 / diviseurPour100[i])}$ minutes, ${quidam.prenom} lit`
          } else {
            texteAvant[0] = `Si ${quidam.prenom} passe $${pourcentage}\\ \\%$ de son temps à jouer aux jeux vidéo, alors pour $100$ minutes, ${quidam.pronom} joue`
            texteApres = `${unites}.`

            texteAvant[1] = `On peut en déduire que pour $${multiplePour100[i] * 100}$ minutes, ${quidam.prenom} joue`

            texteAvant[2] = `On peut aussi en déduire que pour $${arrondi(100 / diviseurPour100[i])}$ minutes, ${quidam.prenom} joue`
          }
          break
        case 11:
          pourcentage = choice([40, 60, 70, 80, 90])
          if (choice([true, true, true, false])) {
            unites = 'tirs'
            texteAvant[0] = `Si, au ${choice(['football', 'handball', 'water-polo', 'hockey'])}, ${quidam.prenom} réussit $${pourcentage}\\ \\%$ de ses tirs au but, alors pour $100$ tentatives de tirs au but, ${quidam.pronom} réussit`
            texteApres = `${unites}.`

            texteAvant[1] = `On peut en déduire que pour $${multiplePour100[i] * 100}$ tentatives de tirs au but, ${quidam.prenom} marque`

            texteAvant[2] = `On peut aussi en déduire que pour $${arrondi(100 / diviseurPour100[i])}$ tentatives de tirs au but, ${quidam.prenom} marque`
          } else {
            unites = 'lancers'
            texteAvant[0] = `Si, au basketball, ${quidam.prenom} réussit $${pourcentage}\\ \\%$ de ses lancers francs, alors pour $100$ tentatives de lancers francs, ${quidam.pronom} réussit`
            texteApres = `${unites}.`

            texteAvant[1] = `On peut en déduire que pour $${multiplePour100[i] * 100}$ tentatives de lancers francs, ${quidam.prenom} marque`

            texteAvant[2] = `On peut aussi en déduire que pour $${arrondi(100 / diviseurPour100[i])}$ tentatives de lancers francs, ${quidam.prenom} marque`
          }
          break
        case 12:
          unites = 'kWh'
          pourcentage = randint(3, 29, [10, 20])
          texteAvant[0] = `Si un appareil utilise $${pourcentage}\\ \\%$ de l'énergie d'un foyer, alors pour $100$ kilowatt-heures (kWh), cet appareil consomme`
          texteApres = `${unites}.`

          texteAvant[1] = `On peut en déduire que pour $${multiplePour100[i] * 100}$ kWh, cet appareil consomme`

          texteAvant[2] = `On peut aussi en déduire que pour $${arrondi(100 / diviseurPour100[i])}$ kWh, cet appareil consomme`

          break
        case 13:
          unites = 'voix'
          pourcentage = choice([20, 40, 60, 80])
          texteAvant[0] = `Si, lors d'une élection, un candidat récolte $${pourcentage}\\ \\%$ des voix, alors pour $100$ votants, ce candidat reçoit`
          texteApres = `${unites}.`

          texteAvant[1] = `On peut en déduire que pour $${multiplePour100[i] * 100}$ votants, ce candidat reçoit`

          texteAvant[2] = `On peut aussi en déduire que pour $${arrondi(100 / diviseurPour100[i])}$ votants, ce candidat reçoit`

          break
        case 14:
          unites = '$\\text{ km}$'
          pourcentage = randint(31, 79, [40, 50, 60, 70])
          texteAvant[0] = `Si un cycliste parcourt $${pourcentage}\\ \\%$ de son trajet total en montée, alors pour $100\\text{ km}$ parcourus,`
          texteApres = `${unites} sont parcourus.`

          texteAvant[1] = `On peut en déduire que pour $${multiplePour100[i] * 100}\\text{ km}$ parcourus,`

          texteAvant[2] = `On peut aussi en déduire que pour $${arrondi(100 / diviseurPour100[i])}\\text{ km}$ parcourus,`

          break
      }
      const reponse = [
        pourcentage,
        pourcentage * multiplePour100[i],
        texNombre(arrondi(pourcentage / diviseurPour100[i])),
      ]

      const texte = `Compléter.<br>${addMultiMathfield(this, i, {
        dataTemplate: `a) ${texteAvant[0]} %{champ1} ${texteApresA || texteApres}
                   b) ${texteAvant[1]} %{champ2} ${texteApres}
                   c) ${texteAvant[2]} %{champ3} ${texteApres}
                  `,
        dataOptions: {
          champ1: { keyboard: KeyboardType.clavierNumbers, ldots: true },
          champ2: { keyboard: KeyboardType.clavierNumbers, ldots: true },
          champ3: { keyboard: KeyboardType.clavierNumbers, ldots: true },
        },
      })}`
      handleAnswers(
        this,
        i,
        {
          champ1: {
            value: reponse[0],
            options: { nombreDecimalSeulement: true },
          },
          champ2: {
            value: reponse[1],
            options: { nombreDecimalSeulement: true },
          },
          champ3: {
            value: reponse[2],
            options: { nombreDecimalSeulement: true },
          },
        },
        { formatInteractif: 'multi-mathfield' },
      )

      const itemsCorr = []
      for (let indice = 0; indice < 3; indice++) {
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
          (indice === 0 && texteApresA ? texteApresA : texteApres)
        itemsCorr.push(texteCorr)
      }

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
