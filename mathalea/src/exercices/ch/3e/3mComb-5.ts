import Decimal from 'decimal.js'
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

export const titre = 'Dénombrer des placements et rangements'
export const dateDePublication = '05/02/2026'
export const interactifReady = true

export const uuid = 'b2t4e'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['3mComb-5'],
}

/**
 * Arrangements et combinaisons - Placements avec contraintes
 * @author Nathan Scheinmann
 */

function arrangement(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  return Math.round(factorielle(n) / factorielle(n - k))
}

export default class PlacementsRangements extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Voiture avec conducteurs (perm. sans rép.)',
        '2 : Photo de groupe (perm. sans rép.)',
        '3 : Rangement simple (perm. sans rép.)',
        '4 : Rangement objets identiques (perm. avec rép.)',
        '5 : Photo simple (arr. sans rép.)',
        '6 : Placement dans une salle (arr. sans rép.)',
        '7 : Mélange',
      ].join('\n'),
    ]
    this.sup = '7'
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 6,
      melange: 7,
      defaut: 7,
      listeOfCase: [
        'voiture',
        'photoGroupe',
        'etagereSimple',
        'etagereIdentiques',
        'photoSimple',
        'salle',
      ],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse = 0

      const typeQuestion = listeTypeDeQuestions[i]

      if (typeQuestion === 'voiture') {
        const nbPersonnes = randint(4, 8)
        const nbConducteurs = randint(2, Math.min(5, nbPersonnes - 1))
        const nbPlaces = nbPersonnes

        reponse = nbConducteurs * factorielle(nbPersonnes - 1)

        const vehicule = choice([
          `une voiture à $${nbPlaces}$ places`,
          `un minibus à $${nbPlaces}$ places`,
          `un véhicule à $${nbPlaces}$ places`,
          `un van à $${nbPlaces}$ places`,
        ])

        texte = `$${nbPersonnes}$ personnes montent dans ${vehicule}. `
        texte += `Seulement $${nbConducteurs}$ d'entre elles ont le permis de conduire. `
        texte += `De combien de façons différentes peuvent-elles s'installer ?`

        texteCorr = `Chaque place est distincte : l'ordre compte.<br>`
        texteCorr += `Le conducteur doit être choisi parmi les $${nbConducteurs}$ personnes ayant le permis.<br>`
        texteCorr += `Les $${nbPersonnes - 1}$ autres personnes se permutent dans les $${nbPersonnes - 1}$ places restantes : $P_{${nbPersonnes - 1}} = ${nbPersonnes - 1}!$<br><br>`
        texteCorr += `$${nbConducteurs} \\times P_{${nbPersonnes - 1}} = ${nbConducteurs} \\times ${nbPersonnes - 1}! = ${nbConducteurs} \\times ${texNombre(factorielle(nbPersonnes - 1))} = ${miseEnEvidence(texNombre(new Decimal(reponse), 0))}$`
      } else if (typeQuestion === 'photoSimple') {
        const nbPersonnes = randint(7, 15)
        const nbPlaces = randint(3, Math.min(7, nbPersonnes - 1))
        reponse = arrangement(nbPersonnes, nbPlaces)

        const lieu = choice([
          'sur un banc',
          'sur un podium',
          'devant un monument',
          'au premier rang',
          "le long d'une barrière",
        ])

        texte = `$${nbPersonnes}$ personnes se présentent pour une photo de groupe. `
        texte += `On aligne $${nbPlaces}$ d'entre elles ${lieu}. `
        texte += `Combien de photos différentes peut-on prendre ?`

        texteCorr = `On choisit et ordonne $${nbPlaces}$ personnes parmi $${nbPersonnes}$ : chaque position sur le banc est distincte (l'ordre compte).<br>`
        texteCorr += `Il s'agit d'un arrangement sans répétition :<br>`
        texteCorr += `$A_{${nbPlaces}}^{${nbPersonnes}} = \\dfrac{${nbPersonnes}!}{(${nbPersonnes}-${nbPlaces})!} = \\dfrac{${nbPersonnes}!}{${nbPersonnes - nbPlaces}!} = ${miseEnEvidence(texNombre(new Decimal(reponse), 0))}$`
      } else if (typeQuestion === 'photoGroupe') {
        const variante = choice(['groupe', 'nationalites'])

        if (variante === 'groupe') {
          const nbAmis = randint(2, 5)
          const nbAutres = randint(3, 7)
          const total = nbAmis + nbAutres

          reponse = factorielle(nbAmis) * factorielle(total - nbAmis + 1)

          const lien = choice([
            `$${nbAmis}$ amis qui veulent être côte à côte`,
            `$${nbAmis}$ frères et sœurs qui restent ensemble`,
            `$${nbAmis}$ collègues qui veulent être voisins`,
          ])

          texte = `$${total}$ personnes s'alignent pour une photo, dont ${lien}. `
          texte += `Combien de photos différentes peut-on prendre ?`

          texteCorr = `On considère les $${nbAmis}$ personnes groupées comme un seul bloc.<br>`
          texteCorr += `On a alors $${total - nbAmis + 1}$ «${sp()}éléments${sp()}» à permuter : $P_{${total - nbAmis + 1}} = ${total - nbAmis + 1}!$<br>`
          texteCorr += `À l'intérieur du bloc, les $${nbAmis}$ personnes se permutent : $P_{${nbAmis}} = ${nbAmis}!$<br><br>`
          texteCorr += `$P_{${nbAmis}} \\times P_{${total - nbAmis + 1}} = ${nbAmis}! \\times ${total - nbAmis + 1}! = ${factorielle(nbAmis)} \\times ${texNombre(factorielle(total - nbAmis + 1))} = ${miseEnEvidence(texNombre(new Decimal(reponse), 0))}$`
        } else {
          const nationalites = [
            ['Américains', 'Français', 'Suisses'],
            ['Allemands', 'Italiens', 'Espagnols'],
            ['Anglais', 'Japonais', 'Brésiliens'],
            ['Belges', 'Canadiens', 'Australiens'],
          ]
          const choixNat = choice(nationalites)
          const pays = choixNat.map((nom) => ({ nom, nb: randint(2, 4) }))

          let rep = factorielle(pays.length)
          for (const p of pays) {
            rep *= factorielle(p.nb)
          }
          reponse = rep

          const liste = pays.map((p) => `$${p.nb}$ ${p.nom}`).join(', ')
          texte = `${liste} s'alignent pour une photo. `
          texte += `Les personnes de même nationalité doivent rester côte à côte. `
          texte += `Combien de photos différentes peut-on prendre ?`

          texteCorr = `On permute d'abord les $${pays.length}$ blocs de nationalités : $P_{${pays.length}} = ${pays.length}!$<br>`
          for (const p of pays) {
            texteCorr += `Les $${p.nb}$ ${p.nom} se permutent : $P_{${p.nb}} = ${p.nb}!$<br>`
          }
          let calcul = `${pays.length}!`
          for (const p of pays) {
            calcul += ` \\times ${p.nb}!`
          }
          texteCorr += `<br>Total : $${calcul} = ${miseEnEvidence(texNombre(new Decimal(reponse), 0))}$`
        }
      } else if (typeQuestion === 'salle') {
        const nbPlaces = randint(15, 40)
        const nbPersonnes = randint(8, Math.min(10, nbPlaces - 2))
        const variante = choice(['libre', 'contrainte'])

        if (variante === 'libre') {
          reponse = arrangement(nbPlaces, nbPersonnes)

          const lieu = choice([
            `Une salle de cinéma contient $${nbPlaces}$ places numérotées.`,
            `Un amphithéâtre dispose de $${nbPlaces}$ sièges numérotés.`,
            `Une salle de conférences a $${nbPlaces}$ places assises numérotées.`,
            `Un stade possède $${nbPlaces}$ places numérotées dans une tribune.`,
          ])

          texte = `${lieu} $${nbPersonnes}$ personnes entrent. `
          texte += `De combien de façons peuvent-elles s'asseoir ?`

          texteCorr = `On place $${nbPersonnes}$ personnes sur $${nbPlaces}$ places, l'ordre compte.<br>`
          texteCorr += `Il s'agit d'un arrangement sans répétition :<br>`
          texteCorr += `$A_{${nbPersonnes}}^{${nbPlaces}} = \\dfrac{${nbPlaces}!}{(${nbPlaces}-${nbPersonnes})!} = \\dfrac{${nbPlaces}!}{${nbPlaces - nbPersonnes}!} = ${miseEnEvidence(texNombre(new Decimal(reponse), 0))}$`
        } else {
          const nbRangees = randint(3, 5)
          const placesParRangee = Math.floor(nbPlaces / nbRangees)
          const nbPremierRang = randint(2, Math.min(4, placesParRangee))
          const nbAutres = nbPersonnes - nbPremierRang

          reponse =
            arrangement(placesParRangee, nbPremierRang) *
            arrangement(nbPlaces - placesParRangee, nbAutres)

          texte = `Une salle contient $${nbRangees}$ rangées de $${placesParRangee}$ places numérotées. $${nbPersonnes}$ personnes entrent, dont $${nbPremierRang}$ doivent s'asseoir au premier rang. `
          texte += `De combien de façons peuvent-elles s'installer ?`

          texteCorr = `Les places sont numérotées, donc l'ordre compte :<br>`
          texteCorr += `$\\bullet$ Les $${nbPremierRang}$ au premier rang : $A_{${nbPremierRang}}^{${placesParRangee}} = ${arrangement(placesParRangee, nbPremierRang)}$<br>`
          texteCorr += `$\\bullet$ Les $${nbAutres}$ autres sur les $${nbPlaces - placesParRangee}$ places restantes : $A_{${nbAutres}}^{${nbPlaces - placesParRangee}} = ${texNombre(arrangement(nbPlaces - placesParRangee, nbAutres))}$<br><br>`
          texteCorr += `Total : $${arrangement(placesParRangee, nbPremierRang)} \\times ${texNombre(arrangement(nbPlaces - placesParRangee, nbAutres))} = ${miseEnEvidence(texNombre(new Decimal(reponse), 0))}$`
        }
      } else if (typeQuestion === 'etagereSimple') {
        const variante = choice(['simple', 'couleurs', 'interdit'])

        if (variante === 'simple') {
          const nbObjets = randint(5, 9)
          reponse = factorielle(nbObjets)

          const objet = choice([
            'livres',
            'DVD',
            'figurines',
            'trophées',
            'bocaux',
            'cadres',
            'statuettes',
            'vinyles',
            'boîtes',
            'peluches',
          ])

          texte = `On range $${nbObjets}$ ${objet} différents sur une étagère. `
          texte += `Combien de rangements différents sont possibles ?`

          texteCorr = `Il s'agit de permuter $${nbObjets}$ objets distincts :<br>`
          texteCorr += `$P_{${nbObjets}} = ${nbObjets}! = ${miseEnEvidence(texNombre(new Decimal(reponse), 0))}$`
        } else if (variante === 'couleurs') {
          const nbObjets = randint(6, 10)

          const objet = choice([
            'livres',
            'dossiers',
            'classeurs',
            'albums',
            'magazines',
            'manuels',
          ])
          const special = choice([
            'le dictionnaire',
            'le manuel',
            "l'encyclopédie",
            "l'atlas",
            'le recueil',
            'le grimoire',
          ])

          reponse = (nbObjets - 2) * factorielle(nbObjets - 1)

          texte = `On range $${nbObjets}$ ${objet} sur une étagère, dont ${special}. `
          texte += `${special.charAt(0).toUpperCase() + special.slice(1)} ne doit être ni en première ni en dernière position. `
          texte += `Combien de rangements sont possibles ?`

          texteCorr = `${special.charAt(0).toUpperCase() + special.slice(1)} peut occuper $${nbObjets - 2}$ positions (pas la première ni la dernière).<br>`
          texteCorr += `Les $${nbObjets - 1}$ autres ${objet} se permutent librement : $P_{${nbObjets - 1}} = ${nbObjets - 1}!$<br><br>`
          texteCorr += `Total : $${nbObjets - 2} \\times P_{${nbObjets - 1}} = ${nbObjets - 2} \\times ${nbObjets - 1}! = ${nbObjets - 2} \\times ${texNombre(factorielle(nbObjets - 1))} = ${miseEnEvidence(texNombre(new Decimal(reponse), 0))}$`
        } else {
          // Deux objets spéciaux qui doivent être séparés
          const nbObjets = randint(5, 8)
          const totalSansContrainte = factorielle(nbObjets)
          const avecEnsemble = 2 * factorielle(nbObjets - 1)
          reponse = totalSansContrainte - avecEnsemble

          const objet = choice(['livres', 'bocaux', 'figurines'])

          texte = `On range $${nbObjets}$ ${objet} différents sur une étagère. Deux d'entre eux ne doivent pas être côte à côte. `
          texte += `Combien de rangements sont possibles ?`

          texteCorr = `On retire du total les rangements où les deux sont côte à côte.<br>`
          texteCorr += `$\\bullet$ Total : $P_{${nbObjets}} = ${nbObjets}! = ${texNombre(totalSansContrainte)}$<br>`
          texteCorr += `$\\bullet$ Côte à côte : on regroupe les deux objets en un bloc ($2$ ordres possibles dans le bloc), ce qui donne $${nbObjets - 1}$ éléments à permuter : $2 \\times ${nbObjets - 1}! = ${texNombre(avecEnsemble)}$<br><br>`
          texteCorr += `Résultat : $${texNombre(totalSansContrainte)} - ${texNombre(avecEnsemble)} = ${miseEnEvidence(texNombre(new Decimal(reponse), 0))}$`
        }
      } else {
        // etagereIdentiques - permutation avec répétition
        const nb1 = randint(2, 5)
        const nb2 = randint(2, 5)
        const nb3 = randint(2, 4)
        const total = nb1 + nb2 + nb3

        const denom = factorielle(nb1) * factorielle(nb2) * factorielle(nb3)
        reponse = factorielle(total) / denom

        const couleurs = choice([
          [
            `$${nb1}$ billes rouges`,
            `$${nb2}$ billes bleues`,
            `$${nb3}$ billes vertes`,
          ],
          [
            `$${nb1}$ jetons dorés`,
            `$${nb2}$ jetons argentés`,
            `$${nb3}$ jetons bronze`,
          ],
          [
            `$${nb1}$ perles blanches`,
            `$${nb2}$ perles noires`,
            `$${nb3}$ perles grises`,
          ],
        ])

        texte = `On aligne ${couleurs[0]} identiques, ${couleurs[1]} identiques et ${couleurs[2]} identiques. `
        texte += `Combien d'alignements différents peut-on former ?`

        texteCorr = `Les objets de même couleur sont identiques entre eux : c'est une permutation avec répétition :<br>`
        texteCorr += `$\\overline{P}_{${total}}(${nb1};${nb2};${nb3}) = \\dfrac{${total}!}{${nb1}! \\times ${nb2}! \\times ${nb3}!} = \\dfrac{${texNombre(factorielle(total), 0)}}{${texNombre(denom, 0)}} = ${miseEnEvidence(texNombre(new Decimal(reponse), 0))}$`
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
