import {
  choice,
  combinaisonListesSansChangerOrdre,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texPrix } from '../../lib/format/style'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { arrondi } from '../../lib/outils/nombres'
import Exercice from '../Exercice'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import { tableauColonneLigne } from '../../lib/2d/tableau'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { AddTabDbleEntryMathlive } from '../../lib/interactif/tableaux/AjouteTableauMathlive'

// une fonction pour les textes de correction
/**
 * @param {string} type // ce qui est donné, remise en pourcentage; Montant de la remise ou Nouveau prix
 * @param {object} remiseInit //remise initiale deux propriétés nb sous forme numerique et str sous forme de chaine
 * @param {object} remise //remise effective deux propriétés nb sous forme numerique et str sous forme de codageHauteurTriangle
 * @param {number} prix
 */
function justifCorrType(
  type: string,
  remiseInit: { str: string; nb: number },
  remise: { str: string; nb: number },
  prix: number,
) {
  let sortie = ''
  switch (type) {
    case 'pourcentage':
      sortie = `L'énoncé indique le montant pour une remise de $${remiseInit.str}$ du prix initial or $${texNombre(remise.nb / remiseInit.nb)} \\times ${remiseInit.str} = ${remise.str}$.<br>
Donc pour une remise de $${remise.str}$ du prix initial, le montant de la remise sera $${texNombre(remise.nb / remiseInit.nb)}$ fois celui de la remise de $${remiseInit.str}$ du prix initial,<br>
d'où le calcul pour le montant de la remise : $${miseEnEvidence(`${texPrix((prix * remiseInit.nb) / 100)} \\times ${texNombre(remise.nb / remiseInit.nb)} = ${texPrix((prix * remise.nb) / 100)}`)}$.<br>
Et celui pour le nouveau prix : $${miseEnEvidence(`${texPrix(prix)}-${texPrix((prix * remise.nb) / 100)} = ${texPrix(prix - (prix * remise.nb) / 100)}`)}$.<br><br>
Mais on peut aussi calculer directement le prix réduit en faisant :<br>
$${miseEnEvidence(`${texPrix(prix)} \\times (100${sp(1)}\\% - ${remise.str}) = ${texPrix(prix)} \\times ${100 - remise.nb}${sp(1)}\\% = ${texPrix(prix)} \\times ${texNombre(1 - remise.nb / 100)} = ${texPrix(prix * (1 - remise.nb / 100))}`)}$
`
      break
    case 'remise':
      sortie = `L'énoncé indique $${texPrix((prix * remise.nb) / 100)}$ € de remise pour un montant de $${texPrix(prix)}$ €,<br>
d'où le calcul pour le pourcentage de remise : $${miseEnEvidence(`${texPrix((prix * remise.nb) / 100)} \\div ${texPrix(prix)} = ${texNombre(remise.nb / 100)} = ${remise.str}`)}$.<br>
Et celui pour le nouveau prix : $${miseEnEvidence(`${texPrix(prix)}-${texPrix((prix * remise.nb) / 100)} = ${texPrix(prix - (prix * remise.nb) / 100)}`)}$.`

      break
    case 'nouveau_prix':
      sortie = `L'énoncé indique un nouveau prix de $${texPrix(prix - (prix * remise.nb) / 100)}$ € pour un montant de $${texPrix(prix)}$ €,<br>
d'où le calcul pour le nouveau prix : $${miseEnEvidence(`${texPrix(prix)} - ${texPrix(prix - (prix * remise.nb) / 100)} = ${texPrix((prix * remise.nb) / 100)}`)}$.<br>
Et celui pour le pourcentage de remise : $${miseEnEvidence(`${texPrix((prix * remise.nb) / 100)} \\div ${texPrix(prix)} = ${texNombre(remise.nb / 100)} = ${remise.str}`)}$.`
      break
    case 'pourcentage_constant':
      sortie = `L'énoncé indique un prix de $${texPrix(prix)}$ € et une remise de $${remise.str}$ du prix initial,<br>
d'où le calcul pour le montant de la remise : $${miseEnEvidence(`${texPrix(prix)} \\times ${remise.str} = ${texPrix(prix)} \\times ${texNombre(remise.nb / 100)} = ${texPrix((prix * remise.nb) / 100)}`)}$.<br>
Et celui pour le nouveau prix : $${miseEnEvidence(`${texPrix(prix)}-${texPrix((prix * remise.nb) / 100)} = ${texPrix(prix - (prix * remise.nb) / 100)}`)}$.<br><br>
Mais on peut aussi calculer directement le prix réduit en faisant :<br>
$${miseEnEvidence(`${texPrix(prix)} \\times (100${sp(1)}\\% - ${remise.str}) = ${texPrix(prix)} \\times ${100 - remise.nb}${sp(1)}\\% = ${texPrix(prix)} \\times ${texNombre(1 - remise.nb / 100)} = ${texPrix(prix * (1 - remise.nb / 100))}`)}$
`
      break
  }
  return sortie
}

/**
 * * Tableaux et pourcentages
 * * 5N11-pere de 5N11-1 et 5N11-2
 * * publication initiale le 08/2020
 * * modification le 25/11/2020 pour ajouter des paramétrages
 * * modification le 27/11/2020 ajout de la modulation de la demande
 * @author Sébastien Lozano
 */
export default class TableauxEtPourcentages extends Exercice {
  exo: string
  constructor() {
    super()
    this.exo = '5N11-1'
    this.sup = 1 // nature du coefficient entre les pourcentages, entier/decimal
    this.sup2 = 1 // nombre de colonnes
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles

    typesDeQuestionsDisponibles = [this.sup2 - 1]
    if (this.sup3) {
      typesDeQuestionsDisponibles = [4]
    }

    const listeTypeDeQuestions = combinaisonListesSansChangerOrdre(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées --> à remettre comme ci-dessus

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;

    ) {
      let choixPrix, prix1, prix2, prix3, prix4, prix5, prix, remises
      do {
        choixPrix = randint(150, 300)
      } while (choixPrix % 5 !== 0)

      if (this.exo === '5N11-1') {
        // prix constant
        prix = [choixPrix, choixPrix, choixPrix, choixPrix, choixPrix]
      } else {
        prix1 = randint(150, 300)
        prix2 = randint(150, 300, [prix1])
        prix3 = randint(150, 300, [prix1, prix2])
        prix4 = randint(150, 300, [prix1, prix2, prix3])
        prix5 = randint(150, 300, [prix1, prix2, prix3, prix4])
        prix = [prix1, prix2, prix3, prix4, prix5]
      }

      if (this.sup === 1 || this.sup === '1') {
        // coeff entier // Rajout EE du 'ou' pour 5N11-2
        if (this.exo === '5N11-1') {
          // prix constant
          remises = choice([
            [
              { str: `5${sp(1)}\\%`, nb: 5 },
              { str: `10${sp(1)}\\%`, nb: 10 },
              { str: `15${sp(1)}\\%`, nb: 15 },
              { str: `20${sp(1)}\\%`, nb: 20 },
              { str: `25${sp(1)}\\%`, nb: 25 },
              { str: `30${sp(1)}\\%`, nb: 30 },
            ],
            [
              { str: `5${sp(1)}\\%`, nb: 5 },
              { str: `35${sp(1)}\\%`, nb: 35 },
              { str: `45${sp(1)}\\%`, nb: 45 },
              { str: `55${sp(1)}\\%`, nb: 55 },
              { str: `65${sp(1)}\\%`, nb: 65 },
              { str: `75${sp(1)}\\%`, nb: 75 },
            ],
            [
              { str: `5${sp(1)}\\%`, nb: 5 },
              { str: `15${sp(1)}\\%`, nb: 15 },
              { str: `25${sp(1)}\\%`, nb: 25 },
              { str: `35${sp(1)}\\%`, nb: 35 },
              { str: `45${sp(1)}\\%`, nb: 45 },
              { str: `55${sp(1)}\\%`, nb: 55 },
            ],
            [
              { str: `5${sp(1)}\\%`, nb: 5 },
              { str: `30${sp(1)}\\%`, nb: 30 },
              { str: `40${sp(1)}\\%`, nb: 40 },
              { str: `50${sp(1)}\\%`, nb: 50 },
              { str: `60${sp(1)}\\%`, nb: 60 },
              { str: `70${sp(1)}\\%`, nb: 70 },
            ],
            [
              { str: `5${sp(1)}\\%`, nb: 5 },
              { str: `25${sp(1)}\\%`, nb: 25 },
              { str: `40${sp(1)}\\%`, nb: 40 },
              { str: `45${sp(1)}\\%`, nb: 45 },
              { str: `50${sp(1)}\\%`, nb: 50 },
              { str: `55${sp(1)}\\%`, nb: 55 },
            ],
            [
              { str: `5${sp(1)}\\%`, nb: 5 },
              { str: `45${sp(1)}\\%`, nb: 45 },
              { str: `50${sp(1)}\\%`, nb: 50 },
              { str: `55${sp(1)}\\%`, nb: 55 },
              { str: `60${sp(1)}\\%`, nb: 60 },
              { str: `65${sp(1)}\\%`, nb: 65 },
            ],
            [
              { str: `5${sp(1)}\\%`, nb: 5 },
              { str: `50${sp(1)}\\%`, nb: 50 },
              { str: `55${sp(1)}\\%`, nb: 55 },
              { str: `60${sp(1)}\\%`, nb: 60 },
              { str: `65${sp(1)}\\%`, nb: 65 },
              { str: `70${sp(1)}\\%`, nb: 70 },
            ],
            [
              { str: `10${sp(1)}\\%`, nb: 10 },
              { str: `20${sp(1)}\\%`, nb: 20 },
              { str: `30${sp(1)}\\%`, nb: 30 },
              { str: `40${sp(1)}\\%`, nb: 40 },
              { str: `50${sp(1)}\\%`, nb: 50 },
              { str: `60${sp(1)}\\%`, nb: 60 },
            ],
            [
              { str: `10${sp(1)}\\%`, nb: 10 },
              { str: `30${sp(1)}\\%`, nb: 30 },
              { str: `40${sp(1)}\\%`, nb: 40 },
              { str: `50${sp(1)}\\%`, nb: 50 },
              { str: `60${sp(1)}\\%`, nb: 60 },
              { str: `70${sp(1)}\\%`, nb: 70 },
            ],
            [
              { str: `10${sp(1)}\\%`, nb: 10 },
              { str: `40${sp(1)}\\%`, nb: 40 },
              { str: `50${sp(1)}\\%`, nb: 50 },
              { str: `60${sp(1)}\\%`, nb: 60 },
              { str: `70${sp(1)}\\%`, nb: 70 },
              { str: `80${sp(1)}\\%`, nb: 80 },
            ],
          ])
        } else {
          // pourcentage constant
          remises = choice([
            [
              { str: `5${sp(1)}\\%`, nb: 5 },
              { str: `5${sp(1)}\\%`, nb: 5 },
              { str: `5${sp(1)}\\%`, nb: 5 },
              { str: `5${sp(1)}\\%`, nb: 5 },
              { str: `5${sp(1)}\\%`, nb: 5 },
              { str: `5${sp(1)}\\%`, nb: 5 },
            ],
            [
              { str: `10${sp(1)}\\%`, nb: 10 },
              { str: `10${sp(1)}\\%`, nb: 10 },
              { str: `10${sp(1)}\\%`, nb: 10 },
              { str: `10${sp(1)}\\%`, nb: 10 },
              { str: `10${sp(1)}\\%`, nb: 10 },
              { str: `10${sp(1)}\\%`, nb: 10 },
            ],
            [
              { str: `15${sp(1)}\\%`, nb: 15 },
              { str: `15${sp(1)}\\%`, nb: 15 },
              { str: `15${sp(1)}\\%`, nb: 15 },
              { str: `15${sp(1)}\\%`, nb: 15 },
              { str: `15${sp(1)}\\%`, nb: 15 },
              { str: `15${sp(1)}\\%`, nb: 15 },
            ],
            [
              { str: `20${sp(1)}\\%`, nb: 20 },
              { str: `20${sp(1)}\\%`, nb: 20 },
              { str: `20${sp(1)}\\%`, nb: 20 },
              { str: `20${sp(1)}\\%`, nb: 20 },
              { str: `20${sp(1)}\\%`, nb: 20 },
              { str: `20${sp(1)}\\%`, nb: 20 },
            ],
            [
              { str: `25${sp(1)}\\%`, nb: 25 },
              { str: `25${sp(1)}\\%`, nb: 25 },
              { str: `25${sp(1)}\\%`, nb: 25 },
              { str: `25${sp(1)}\\%`, nb: 25 },
              { str: `25${sp(1)}\\%`, nb: 25 },
              { str: `25${sp(1)}\\%`, nb: 25 },
            ],
            [
              { str: `30${sp(1)}\\%`, nb: 30 },
              { str: `30${sp(1)}\\%`, nb: 30 },
              { str: `30${sp(1)}\\%`, nb: 30 },
              { str: `30${sp(1)}\\%`, nb: 30 },
              { str: `30${sp(1)}\\%`, nb: 30 },
              { str: `30${sp(1)}\\%`, nb: 30 },
            ],
            [
              { str: `35${sp(1)}\\%`, nb: 35 },
              { str: `35${sp(1)}\\%`, nb: 35 },
              { str: `35${sp(1)}\\%`, nb: 35 },
              { str: `35${sp(1)}\\%`, nb: 35 },
              { str: `35${sp(1)}\\%`, nb: 35 },
              { str: `35${sp(1)}\\%`, nb: 35 },
            ],
            [
              { str: `40${sp(1)}\\%`, nb: 40 },
              { str: `40${sp(1)}\\%`, nb: 40 },
              { str: `40${sp(1)}\\%`, nb: 40 },
              { str: `40${sp(1)}\\%`, nb: 40 },
              { str: `40${sp(1)}\\%`, nb: 40 },
              { str: `40${sp(1)}\\%`, nb: 40 },
            ],
            [
              { str: `45${sp(1)}\\%`, nb: 45 },
              { str: `45${sp(1)}\\%`, nb: 45 },
              { str: `45${sp(1)}\\%`, nb: 45 },
              { str: `45${sp(1)}\\%`, nb: 45 },
              { str: `45${sp(1)}\\%`, nb: 45 },
              { str: `45${sp(1)}\\%`, nb: 45 },
            ],
            [
              { str: `50${sp(1)}\\%`, nb: 50 },
              { str: `50${sp(1)}\\%`, nb: 50 },
              { str: `50${sp(1)}\\%`, nb: 50 },
              { str: `50${sp(1)}\\%`, nb: 50 },
              { str: `50${sp(1)}\\%`, nb: 50 },
              { str: `50${sp(1)}\\%`, nb: 50 },
            ],
            [
              { str: `55${sp(1)}\\%`, nb: 55 },
              { str: `55${sp(1)}\\%`, nb: 55 },
              { str: `55${sp(1)}\\%`, nb: 55 },
              { str: `55${sp(1)}\\%`, nb: 55 },
              { str: `55${sp(1)}\\%`, nb: 55 },
              { str: `55${sp(1)}\\%`, nb: 55 },
            ],
            [
              { str: `60${sp(1)}\\%`, nb: 60 },
              { str: `60${sp(1)}\\%`, nb: 60 },
              { str: `60${sp(1)}\\%`, nb: 60 },
              { str: `60${sp(1)}\\%`, nb: 60 },
              { str: `60${sp(1)}\\%`, nb: 60 },
              { str: `60${sp(1)}\\%`, nb: 60 },
            ],
            [
              { str: `65${sp(1)}\\%`, nb: 65 },
              { str: `65${sp(1)}\\%`, nb: 65 },
              { str: `65${sp(1)}\\%`, nb: 65 },
              { str: `65${sp(1)}\\%`, nb: 65 },
              { str: `65${sp(1)}\\%`, nb: 65 },
              { str: `65${sp(1)}\\%`, nb: 65 },
            ],
            [
              { str: `70${sp(1)}\\%`, nb: 70 },
              { str: `70${sp(1)}\\%`, nb: 70 },
              { str: `70${sp(1)}\\%`, nb: 70 },
              { str: `70${sp(1)}\\%`, nb: 70 },
              { str: `70${sp(1)}\\%`, nb: 70 },
              { str: `70${sp(1)}\\%`, nb: 70 },
            ],
            [
              { str: `75${sp(1)}\\%`, nb: 75 },
              { str: `75${sp(1)}\\%`, nb: 75 },
              { str: `75${sp(1)}\\%`, nb: 75 },
              { str: `75${sp(1)}\\%`, nb: 75 },
              { str: `75${sp(1)}\\%`, nb: 75 },
              { str: `75${sp(1)}\\%`, nb: 75 },
            ],
            [
              { str: `80${sp(1)}\\%`, nb: 80 },
              { str: `80${sp(1)}\\%`, nb: 80 },
              { str: `80${sp(1)}\\%`, nb: 80 },
              { str: `80${sp(1)}\\%`, nb: 80 },
              { str: `80${sp(1)}\\%`, nb: 80 },
              { str: `80${sp(1)}\\%`, nb: 80 },
            ],
          ])
        }
      } else {
        // coeff décimal
        if (this.exo === '5N11-1') {
          // prix constant
          remises = choice([
            [
              { str: `10${sp(1)}\\%`, nb: 10 },
              { str: `5${sp(1)}\\%`, nb: 5 },
              { str: `15${sp(1)}\\%`, nb: 15 },
              { str: `25${sp(1)}\\%`, nb: 25 },
              { str: `35${sp(1)}\\%`, nb: 35 },
              { str: `45${sp(1)}\\%`, nb: 45 },
            ],
            [
              { str: `50${sp(1)}\\%`, nb: 50 },
              { str: `30${sp(1)}\\%`, nb: 30 },
              { str: `10${sp(1)}\\%`, nb: 10 },
              { str: `20${sp(1)}\\%`, nb: 20 },
              { str: `40${sp(1)}\\%`, nb: 40 },
              { str: `60${sp(1)}\\%`, nb: 60 },
            ],
            [
              { str: `20${sp(1)}\\%`, nb: 20 },
              { str: `10${sp(1)}\\%`, nb: 10 },
              { str: `50${sp(1)}\\%`, nb: 50 },
              { str: `30${sp(1)}\\%`, nb: 30 },
              { str: `40${sp(1)}\\%`, nb: 40 },
              { str: `60${sp(1)}\\%`, nb: 60 },
            ],
            [
              { str: `40${sp(1)}\\%`, nb: 40 },
              { str: `10${sp(1)}\\%`, nb: 10 },
              { str: `5${sp(1)}\\%`, nb: 5 },
              { str: `20${sp(1)}\\%`, nb: 20 },
              { str: `50${sp(1)}\\%`, nb: 50 },
              { str: `30${sp(1)}\\%`, nb: 30 },
            ],
            [
              { str: `80${sp(1)}\\%`, nb: 80 },
              { str: `10${sp(1)}\\%`, nb: 10 },
              { str: `50${sp(1)}\\%`, nb: 50 },
              { str: `30${sp(1)}\\%`, nb: 30 },
              { str: `40${sp(1)}\\%`, nb: 40 },
              { str: `20${sp(1)}\\%`, nb: 20 },
            ],
            [
              { str: `10${sp(1)}\\%`, nb: 10 },
              { str: `15${sp(1)}\\%`, nb: 15 },
              { str: `25${sp(1)}\\%`, nb: 25 },
              { str: `35${sp(1)}\\%`, nb: 35 },
              { str: `45${sp(1)}\\%`, nb: 45 },
              { str: `55${sp(1)}\\%`, nb: 55 },
            ],
            [
              { str: `50${sp(1)}\\%`, nb: 50 },
              { str: `35${sp(1)}\\%`, nb: 35 },
              { str: `10${sp(1)}\\%`, nb: 10 },
              { str: `25${sp(1)}\\%`, nb: 25 },
              { str: `40${sp(1)}\\%`, nb: 40 },
              { str: `65${sp(1)}\\%`, nb: 65 },
            ],
            [
              { str: `20${sp(1)}\\%`, nb: 20 },
              { str: `5${sp(1)}\\%`, nb: 5 },
              { str: `50${sp(1)}\\%`, nb: 50 },
              { str: `35${sp(1)}\\%`, nb: 35 },
              { str: `40${sp(1)}\\%`, nb: 40 },
              { str: `55${sp(1)}\\%`, nb: 55 },
            ],
            [
              { str: `40${sp(1)}\\%`, nb: 40 },
              { str: `15${sp(1)}\\%`, nb: 15 },
              { str: `5${sp(1)}\\%`, nb: 5 },
              { str: `20${sp(1)}\\%`, nb: 20 },
              { str: `30${sp(1)}\\%`, nb: 30 },
              { str: `25${sp(1)}\\%`, nb: 25 },
            ],
            [
              { str: `80${sp(1)}\\%`, nb: 80 },
              { str: `20${sp(1)}\\%`, nb: 20 },
              { str: `55${sp(1)}\\%`, nb: 55 },
              { str: `30${sp(1)}\\%`, nb: 30 },
              { str: `40${sp(1)}\\%`, nb: 40 },
              { str: `20${sp(1)}\\%`, nb: 20 },
            ],
          ])
        } else {
          // pourcentage constant
          // c'est juste pour ne pas que typescript râle, c'est jamais utilisé.
          remises = [
            { str: `10${sp(1)}\\%`, nb: 10 },
            { str: `5${sp(1)}\\%`, nb: 5 },
            { str: `15${sp(1)}\\%`, nb: 15 },
            { str: `25${sp(1)}\\%`, nb: 25 },
            { str: `35${sp(1)}\\%`, nb: 35 },
            { str: `45${sp(1)}\\%`, nb: 45 },
          ]

          // [{str:`10${sp(1)}\\%`,nb:10},{str:`5${sp(1)}\\%`,nb:5},{str:`15${sp(1)}\\%`,nb:15},{str:`25${sp(1)}\\%`,nb:25},{str:`35${sp(1)}\\%`,nb:35},{str:`45${sp(1)}\\%`,nb:45}],
          // [{str:`50${sp(1)}\\%`,nb:50},{str:`30${sp(1)}\\%`,nb:30},{str:`10${sp(1)}\\%`,nb:10},{str:`20${sp(1)}\\%`,nb:20},{str:`40${sp(1)}\\%`,nb:40},{str:`60${sp(1)}\\%`,nb:60}],
          // [{str:`20${sp(1)}\\%`,nb:20},{str:`10${sp(1)}\\%`,nb:10},{str:`50${sp(1)}\\%`,nb:50},{str:`30${sp(1)}\\%`,nb:30},{str:`40${sp(1)}\\%`,nb:40},{str:`60${sp(1)}\\%`,nb:60}],
          // [{str:`40${sp(1)}\\%`,nb:40},{str:`10${sp(1)}\\%`,nb:10},{str:`5${sp(1)}\\%`,nb:5},{str:`20${sp(1)}\\%`,nb:20},{str:`50${sp(1)}\\%`,nb:50},{str:`30${sp(1)}\\%`,nb:30}],
          // [{str:`80${sp(1)}\\%`,nb:80},{str:`10${sp(1)}\\%`,nb:10},{str:`50${sp(1)}\\%`,nb:50},{str:`30${sp(1)}\\%`,nb:30},{str:`40${sp(1)}\\%`,nb:40},{str:`20${sp(1)}\\%`,nb:20}],
          // [{str:`10${sp(1)}\\%`,nb:10},{str:`15${sp(1)}\\%`,nb:15},{str:`25${sp(1)}\\%`,nb:25},{str:`35${sp(1)}\\%`,nb:35},{str:`45${sp(1)}\\%`,nb:45},{str:`55${sp(1)}\\%`,nb:55}],
          // [{str:`50${sp(1)}\\%`,nb:50},{str:`35${sp(1)}\\%`,nb:35},{str:`10${sp(1)}\\%`,nb:10},{str:`25${sp(1)}\\%`,nb:25},{str:`40${sp(1)}\\%`,nb:40},{str:`65${sp(1)}\\%`,nb:65}],
          // [{str:`20${sp(1)}\\%`,nb:20},{str:`5${sp(1)}\\%`,nb:5},{str:`50${sp(1)}\\%`,nb:50},{str:`35${sp(1)}\\%`,nb:35},{str:`40${sp(1)}\\%`,nb:40},{str:`55${sp(1)}\\%`,nb:55}],
          // [{str:`40${sp(1)}\\%`,nb:40},{str:`15${sp(1)}\\%`,nb:15},{str:`5${sp(1)}\\%`,nb:5},{str:`20${sp(1)}\\%`,nb:20},{str:`30${sp(1)}\\%`,nb:30},{str:`25${sp(1)}\\%`,nb:25}],
          // [{str:`80${sp(1)}\\%`,nb:80},{str:`20${sp(1)}\\%`,nb:20},{str:`55${sp(1)}\\%`,nb:55},{str:`30${sp(1)}\\%`,nb:30},{str:`40${sp(1)}\\%`,nb:40},{str:`20${sp(1)}\\%`,nb:20}],
          // ]);
        }
      }

      // pour les situations, autant de situations que de cas dans le switch !
      const situations = [
        {
          tableau: tableauColonneLigne(
            ['\\text{Prix en €}', texPrix(prix[0]), texPrix(prix[1])],
            [
              '\\text{Remise en pourcentage}',
              '\\text{Montant de la remise en €}',
              '\\text{Nouveau prix en €}',
            ],
            [
              remises[0].str,
              remises[1].str,
              texPrix((prix[0] * remises[0].nb) / 100),
              '',
              texPrix(prix[0] - (prix[0] * remises[0].nb) / 100),
              '',
            ],
          ),
          tableau_corr: tableauColonneLigne(
            ['\\text{Prix en €}', texPrix(prix[0]), texPrix(prix[1])],
            [
              '\\text{Remise en pourcentage}',
              '\\text{Montant de la remise en €}',
              '\\text{Nouveau prix en €}',
            ],
            [
              remises[0].str,
              remises[1].str,
              texPrix((prix[0] * remises[0].nb) / 100),
              miseEnEvidence(`${texPrix((prix[1] * remises[1].nb) / 100)}`),
              texPrix(prix[0] - (prix[0] * remises[0].nb) / 100),
              miseEnEvidence(
                `${texPrix(prix[1] - (prix[1] * remises[1].nb) / 100)}`,
              ),
            ],
          ),
        },
        {
          tableau: tableauColonneLigne(
            [
              '\\text{Prix en €}',
              texPrix(prix[0]),
              texPrix(prix[1]),
              texPrix(prix[2]),
            ],
            [
              '\\text{Remise en pourcentage}',
              '\\text{Montant de la remise en €}',
              '\\text{Nouveau prix en €}',
            ],
            [
              remises[0].str,
              remises[1].str,
              remises[2].str,
              texPrix((prix[0] * remises[0].nb) / 100),
              '',
              '',
              texPrix(prix[0] - (prix[0] * remises[0].nb) / 100),
              '',
              '',
            ],
          ),
          tableau_corr: tableauColonneLigne(
            [
              '\\text{Prix en €}',
              texPrix(prix[0]),
              texPrix(prix[1]),
              texPrix(prix[2]),
            ],
            [
              '\\text{Remise en pourcentage}',
              '\\text{Montant de la remise en €}',
              '\\text{Nouveau prix en €}',
            ],
            [
              remises[0].str,
              remises[1].str,
              remises[2].str,
              texPrix((prix[0] * remises[0].nb) / 100),
              miseEnEvidence(`${texPrix((prix[1] * remises[1].nb) / 100)}`),
              miseEnEvidence(`${texPrix((prix[2] * remises[2].nb) / 100)}`),
              texPrix(prix[0] - (prix[0] * remises[0].nb) / 100),
              miseEnEvidence(
                `${texPrix(prix[1] - (prix[1] * remises[1].nb) / 100)}`,
              ),
              miseEnEvidence(
                `${texPrix(prix[2] - (prix[2] * remises[2].nb) / 100)}`,
              ),
            ],
          ),
        },
        {
          tableau: tableauColonneLigne(
            [
              '\\text{Prix en €}',
              texPrix(prix[0]),
              texPrix(prix[1]),
              texPrix(prix[2]),
              texPrix(prix[3]),
            ],
            [
              '\\text{Remise en pourcentage}',
              '\\text{Montant de la remise en €}',
              '\\text{Nouveau prix en €}',
            ],
            [
              remises[0].str,
              remises[1].str,
              remises[2].str,
              remises[3].str,
              texPrix((prix[0] * remises[0].nb) / 100),
              '',
              '',
              '',
              texPrix(prix[0] - (prix[0] * remises[0].nb) / 100),
              '',
              '',
              '',
            ],
          ),
          tableau_corr: tableauColonneLigne(
            [
              '\\text{Prix en €}',
              texPrix(prix[0]),
              texPrix(prix[1]),
              texPrix(prix[2]),
              texPrix(prix[3]),
            ],
            [
              '\\text{Remise en pourcentage}',
              '\\text{Montant de la remise en €}',
              '\\text{Nouveau prix en €}',
            ],
            [
              remises[0].str,
              remises[1].str,
              remises[2].str,
              remises[3].str,
              texPrix((prix[0] * remises[0].nb) / 100),
              miseEnEvidence(`${texPrix((prix[1] * remises[1].nb) / 100)}`),
              miseEnEvidence(`${texPrix((prix[2] * remises[2].nb) / 100)}`),
              miseEnEvidence(`${texPrix((prix[3] * remises[3].nb) / 100)}`),
              texPrix(prix[0] - (prix[0] * remises[0].nb) / 100),
              miseEnEvidence(
                `${texPrix(prix[1] - (prix[1] * remises[1].nb) / 100)}`,
              ),
              miseEnEvidence(
                `${texPrix(prix[2] - (prix[2] * remises[2].nb) / 100)}`,
              ),
              miseEnEvidence(
                `${texPrix(prix[3] - (prix[3] * remises[3].nb) / 100)}`,
              ),
            ],
          ),
        },
        {
          tableau: tableauColonneLigne(
            [
              '\\text{Prix en €}',
              texPrix(prix[0]),
              texPrix(prix[1]),
              texPrix(prix[2]),
              texPrix(prix[3]),
              texPrix(prix[4]),
            ],
            [
              '\\text{Remise en pourcentage}',
              '\\text{Montant de la remise en €}',
              '\\text{Nouveau prix en €}',
            ],
            [
              remises[0].str,
              remises[1].str,
              remises[2].str,
              remises[3].str,
              remises[4].str,
              texPrix((prix[0] * remises[0].nb) / 100),
              '',
              '',
              '',
              '',
              texPrix(prix[0] - (prix[0] * remises[0].nb) / 100),
              '',
              '',
              '',
              '',
            ],
          ),
          tableau_corr: tableauColonneLigne(
            [
              '\\text{Prix en €}',
              texPrix(prix[0]),
              texPrix(prix[1]),
              texPrix(prix[2]),
              texPrix(prix[3]),
              texPrix(prix[4]),
            ],
            [
              '\\text{Remise en pourcentage}',
              '\\text{Montant de la remise en €}',
              '\\text{Nouveau prix en €}',
            ],
            [
              remises[0].str,
              remises[1].str,
              remises[2].str,
              remises[3].str,
              remises[4].str,
              texPrix((prix[0] * remises[0].nb) / 100),
              miseEnEvidence(`${texPrix((prix[1] * remises[1].nb) / 100)}`),
              miseEnEvidence(`${texPrix((prix[2] * remises[2].nb) / 100)}`),
              miseEnEvidence(`${texPrix((prix[3] * remises[3].nb) / 100)}`),
              miseEnEvidence(`${texPrix((prix[4] * remises[4].nb) / 100)}`),
              texPrix(prix[0] - (prix[0] * remises[0].nb) / 100),
              miseEnEvidence(
                `${texPrix(prix[1] - (prix[1] * remises[1].nb) / 100)}`,
              ),
              miseEnEvidence(
                `${texPrix(prix[2] - (prix[2] * remises[2].nb) / 100)}`,
              ),
              miseEnEvidence(
                `${texPrix(prix[3] - (prix[3] * remises[3].nb) / 100)}`,
              ),
              miseEnEvidence(
                `${texPrix(prix[4] - (prix[4] * remises[4].nb) / 100)}`,
              ),
            ],
          ),
        },
        {
          tableau: [],
          tableau_corr: [],
        },
      ]

      let corrections
      let contenuModulation: string[] = []
      if (this.sup3) {
        const interieurTableauTableauCorr = choice([
          {
            tableauCase4: [
              remises[0].str,
              remises[1].str,
              '',
              '',
              texPrix((prix[0] * remises[0].nb) / 100),
              '',
              `${texPrix((prix[0] * remises[2].nb) / 100)}`,
              '',
              texPrix(prix[0] - (prix[0] * remises[0].nb) / 100),
              '',
              '',
              `${texPrix(prix[0] - (prix[0] * remises[3].nb) / 100)}`,
            ],
            tableauCase4Corr: [
              remises[0].str,
              remises[1].str,
              miseEnEvidence(remises[2].str),
              miseEnEvidence(remises[3].str),
              texPrix((prix[0] * remises[0].nb) / 100),
              miseEnEvidence(`${texPrix((prix[0] * remises[1].nb) / 100)}`),
              `${texPrix((prix[0] * remises[2].nb) / 100)}`,
              miseEnEvidence(`${texPrix((prix[0] * remises[3].nb) / 100)}`),
              texPrix(prix[0] - (prix[0] * remises[0].nb) / 100),
              miseEnEvidence(
                `${texPrix(prix[0] - (prix[0] * remises[1].nb) / 100)}`,
              ),
              miseEnEvidence(
                `${texPrix(prix[0] - (prix[0] * remises[2].nb) / 100)}`,
              ),
              `${texPrix(prix[0] - (prix[0] * remises[3].nb) / 100)}`,
            ],
            corrections: `${justifCorrType('pourcentage', remises[0], remises[1], prix[0])}<br><br>${justifCorrType('remise', remises[0], remises[2], prix[0])}<br><br>${justifCorrType('nouveau_prix', remises[0], remises[3], prix[0])}`,
          },
          {
            tableauCase4: [
              remises[0].str,
              remises[1].str,
              '',
              '',
              texPrix((prix[0] * remises[0].nb) / 100),
              '',
              '',
              `${texPrix((prix[0] * remises[3].nb) / 100)}`,
              texPrix(prix[0] - (prix[0] * remises[0].nb) / 100),
              '',
              `${texPrix(prix[0] - (prix[0] * remises[2].nb) / 100)}`,
              '',
            ],
            tableauCase4Corr: [
              remises[0].str,
              remises[1].str,
              miseEnEvidence(remises[2].str),
              miseEnEvidence(remises[3].str),
              texPrix((prix[0] * remises[0].nb) / 100),
              miseEnEvidence(`${texPrix((prix[0] * remises[1].nb) / 100)}`),
              miseEnEvidence(`${texPrix((prix[0] * remises[2].nb) / 100)}`),
              `${texPrix((prix[0] * remises[3].nb) / 100)}`,
              texPrix(prix[0] - (prix[0] * remises[0].nb) / 100),
              miseEnEvidence(
                `${texPrix(prix[0] - (prix[0] * remises[1].nb) / 100)}`,
              ),
              `${texPrix(prix[0] - (prix[0] * remises[2].nb) / 100)}`,
              miseEnEvidence(
                `${texPrix(prix[0] - (prix[0] * remises[3].nb) / 100)}`,
              ),
            ],
            corrections: `${justifCorrType('pourcentage', remises[0], remises[1], prix[0])}<br><br>${justifCorrType('nouveau_prix', remises[0], remises[2], prix[0])}<br><br>${justifCorrType('remise', remises[0], remises[3], prix[0])}`,
          },
          {
            tableauCase4: [
              remises[0].str,
              '',
              remises[2].str,
              '',
              texPrix((prix[0] * remises[0].nb) / 100),
              `${texPrix((prix[0] * remises[1].nb) / 100)}`,
              '',
              '',
              texPrix(prix[0] - (prix[0] * remises[0].nb) / 100),
              '',
              '',
              `${texPrix(prix[0] - (prix[0] * remises[3].nb) / 100)}`,
            ],
            tableauCase4Corr: [
              remises[0].str,
              miseEnEvidence(remises[1].str),
              remises[2].str,
              miseEnEvidence(remises[3].str),
              texPrix((prix[0] * remises[0].nb) / 100),
              `${texPrix((prix[0] * remises[1].nb) / 100)}`,
              miseEnEvidence(`${texPrix((prix[0] * remises[2].nb) / 100)}`),
              miseEnEvidence(`${texPrix((prix[0] * remises[3].nb) / 100)}`),
              texPrix(prix[0] - (prix[0] * remises[0].nb) / 100),
              miseEnEvidence(
                `${texPrix(prix[0] - (prix[0] * remises[1].nb) / 100)}`,
              ),
              miseEnEvidence(
                `${texPrix(prix[0] - (prix[0] * remises[2].nb) / 100)}`,
              ),
              `${texPrix(prix[0] - (prix[0] * remises[3].nb) / 100)}`,
            ],
            corrections: `${justifCorrType('remise', remises[0], remises[1], prix[0])}<br><br>${justifCorrType('pourcentage', remises[0], remises[2], prix[0])}<br><br>${justifCorrType('nouveau_prix', remises[0], remises[3], prix[0])}`,
          },
          {
            tableauCase4: [
              remises[0].str,
              '',
              '',
              remises[3].str,
              texPrix((prix[0] * remises[0].nb) / 100),
              `${texPrix((prix[0] * remises[1].nb) / 100)}`,
              '',
              '',
              texPrix(prix[0] - (prix[0] * remises[0].nb) / 100),
              '',
              `${texPrix(prix[0] - (prix[0] * remises[2].nb) / 100)}`,
              '',
            ],
            tableauCase4Corr: [
              remises[0].str,
              miseEnEvidence(remises[1].str),
              miseEnEvidence(remises[2].str),
              remises[3].str,
              texPrix((prix[0] * remises[0].nb) / 100),
              `${texPrix((prix[0] * remises[1].nb) / 100)}`,
              miseEnEvidence(`${texPrix((prix[0] * remises[2].nb) / 100)}`),
              miseEnEvidence(`${texPrix((prix[0] * remises[3].nb) / 100)}`),
              texPrix(prix[0] - (prix[0] * remises[0].nb) / 100),
              miseEnEvidence(
                `${texPrix(prix[0] - (prix[0] * remises[1].nb) / 100)}`,
              ),
              `${texPrix(prix[0] - (prix[0] * remises[2].nb) / 100)}`,
              miseEnEvidence(
                `${texPrix(prix[0] - (prix[0] * remises[3].nb) / 100)}`,
              ),
            ],
            corrections: `${justifCorrType('remise', remises[0], remises[1], prix[0])}<br><br>${justifCorrType('nouveau_prix', remises[0], remises[2], prix[0])}<br><br>${justifCorrType('pourcentage', remises[0], remises[3], prix[0])}`,
          },
          {
            tableauCase4: [
              remises[0].str,
              '',
              remises[2].str,
              '',
              texPrix((prix[0] * remises[0].nb) / 100),
              '',
              '',
              `${texPrix((prix[0] * remises[3].nb) / 100)}`,
              texPrix(prix[0] - (prix[0] * remises[0].nb) / 100),
              `${texPrix(prix[0] - (prix[0] * remises[1].nb) / 100)}`,
              '',
              '',
            ],
            tableauCase4Corr: [
              remises[0].str,
              miseEnEvidence(remises[1].str),
              remises[2].str,
              miseEnEvidence(remises[3].str),
              texPrix((prix[0] * remises[0].nb) / 100),
              miseEnEvidence(`${texPrix((prix[0] * remises[1].nb) / 100)}`),
              miseEnEvidence(`${texPrix((prix[0] * remises[2].nb) / 100)}`),
              `${texPrix((prix[0] * remises[3].nb) / 100)}`,
              texPrix(prix[0] - (prix[0] * remises[0].nb) / 100),
              `${texPrix(prix[0] - (prix[0] * remises[1].nb) / 100)}`,
              miseEnEvidence(
                `${texPrix(prix[0] - (prix[0] * remises[2].nb) / 100)}`,
              ),
              miseEnEvidence(
                `${texPrix(prix[0] - (prix[0] * remises[3].nb) / 100)}`,
              ),
            ],
            corrections: `${justifCorrType('nouveau_prix', remises[0], remises[1], prix[0])}<br><br>${justifCorrType('pourcentage', remises[0], remises[2], prix[0])}<br><br>${justifCorrType('remise', remises[0], remises[3], prix[0])}`,
          },
          {
            tableauCase4: [
              remises[0].str,
              '',
              '',
              remises[3].str,
              texPrix((prix[0] * remises[0].nb) / 100),
              '',
              `${texPrix((prix[0] * remises[2].nb) / 100)}`,
              '',
              texPrix(prix[0] - (prix[0] * remises[0].nb) / 100),
              `${texPrix(prix[0] - (prix[0] * remises[1].nb) / 100)}`,
              '',
              '',
            ],
            tableauCase4Corr: [
              remises[0].str,
              miseEnEvidence(remises[1].str),
              miseEnEvidence(remises[2].str),
              remises[3].str,
              texPrix((prix[0] * remises[0].nb) / 100),
              miseEnEvidence(`${texPrix((prix[0] * remises[1].nb) / 100)}`),
              `${texPrix((prix[0] * remises[2].nb) / 100)}`,
              miseEnEvidence(`${texPrix((prix[0] * remises[3].nb) / 100)}`),
              texPrix(prix[0] - (prix[0] * remises[0].nb) / 100),
              `${texPrix(prix[0] - (prix[0] * remises[1].nb) / 100)}`,
              miseEnEvidence(
                `${texPrix(prix[0] - (prix[0] * remises[2].nb) / 100)}`,
              ),
              miseEnEvidence(
                `${texPrix(prix[0] - (prix[0] * remises[3].nb) / 100)}`,
              ),
            ],
            corrections: `${justifCorrType('nouveau_prix', remises[0], remises[1], prix[0])}<br><br>${justifCorrType('remise', remises[0], remises[2], prix[0])}<br><br>${justifCorrType('pourcentage', remises[0], remises[3], prix[0])}`,
          },
        ])

        const tableauCase4 = tableauColonneLigne(
          [
            '\\text{Prix en €}',
            texPrix(prix[0]),
            texPrix(prix[0]),
            texPrix(prix[0]),
            texPrix(prix[0]),
          ],
          [
            '\\text{Remise en pourcentage}',
            '\\text{Montant de la remise en €}',
            '\\text{Nouveau prix en €}',
          ],
          interieurTableauTableauCorr.tableauCase4,
        )
        const tableauCase4Corr = tableauColonneLigne(
          [
            '\\text{Prix en €}',
            texPrix(prix[0]),
            texPrix(prix[0]),
            texPrix(prix[0]),
            texPrix(prix[0]),
          ],
          [
            '\\text{Remise en pourcentage}',
            '\\text{Montant de la remise en €}',
            '\\text{Nouveau prix en €}',
          ],
          interieurTableauTableauCorr.tableauCase4Corr,
        )
        if (this.correctionDetaillee) {
          corrections = interieurTableauTableauCorr.corrections
          corrections += "<br><br>D'où le tableau complété :<br><br>"
        } else {
          corrections = ''
        }
        contenuModulation = interieurTableauTableauCorr.tableauCase4
        situations[4].tableau = tableauCase4
        situations[4].tableau_corr = tableauCase4Corr
      } else {
        let typeCorr
        if (this.exo === '5N11-1') {
          typeCorr = 'pourcentage'
        } else {
          typeCorr = 'pourcentage_constant'
        }
        if (this.sup2 === 1 && this.correctionDetaillee) {
          corrections = `${justifCorrType(typeCorr, remises[0], remises[1], prix[1])}`
          corrections += "<br><br>D'où le tableau complété :<br><br>"
        } else if (this.sup2 === 2 && this.correctionDetaillee) {
          corrections = `${justifCorrType(typeCorr, remises[0], remises[1], prix[1])}<br><br>${justifCorrType(typeCorr, remises[0], remises[2], prix[2])}`
          corrections += "<br><br>D'où le tableau complété :<br><br>"
        } else if (this.sup2 === 3 && this.correctionDetaillee) {
          corrections = `${justifCorrType(typeCorr, remises[0], remises[1], prix[1])}<br><br>${justifCorrType(typeCorr, remises[0], remises[2], prix[2])}<br><br>${justifCorrType(typeCorr, remises[0], remises[3], prix[3])}`
          corrections += "<br><br>D'où le tableau complété :<br><br>"
        } else if (this.sup2 === 4 && this.correctionDetaillee) {
          corrections = `${justifCorrType(typeCorr, remises[0], remises[1], prix[1])}<br><br>${justifCorrType(typeCorr, remises[0], remises[2], prix[2])}<br><br>${justifCorrType(typeCorr, remises[0], remises[3], prix[3])}<br><br>${justifCorrType(typeCorr, remises[0], remises[4], prix[4])}`
          corrections += "<br><br>D'où le tableau complété :<br><br>"
        } else {
          corrections = ''
        }
      }

      const enonces = []
      for (let k = 0; k < situations.length; k++) {
        enonces.push({
          enonce: `
${situations[k].tableau}
`,
          question: '',
          correction: `
${corrections}
${situations[k].tableau_corr}
`,
        })
      }

      texte = `${enonces[listeTypeDeQuestions[i]].enonce}`
      texteCorr = `${enonces[listeTypeDeQuestions[i]].correction}`

      let texteAffiche = texte
      const kSituation = listeTypeDeQuestions[i]
      if (this.interactif && kSituation === 4) {
        // Modulation de ce qui est demandé : 4 colonnes de prix identique,
        // les cellules vides du tableau de l'énoncé sont à compléter.
        const colHeaders = [
          '\\text{Prix en €}',
          ...[0, 1, 2, 3].map(() => texPrix(prix[0])),
        ]
        const rowHeadersInteractif = [
          '\\text{Remise en pourcentage}',
          '\\text{Montant de la remise en €}',
          '\\text{Nouveau prix en €}',
        ]
        const tableauInteractif = AddTabDbleEntryMathlive.create(
          this.numeroExercice ?? 0,
          i,
          AddTabDbleEntryMathlive.convertTclToTableauMathlive(
            colHeaders,
            rowHeadersInteractif,
            contenuModulation,
          ),
          'clavierNumbers',
          true,
          {},
        )
        texteAffiche = tableauInteractif.output

        const objetReponse: Record<string, { value: number }> = {}
        contenuModulation.forEach((cellule, idx) => {
          if (cellule !== '') return
          const ligne = Math.floor(idx / 4)
          const col = idx % 4
          const remiseNb = remises[col].nb
          const montant = (prix[0] * remiseNb) / 100
          const valeurs = [remiseNb, montant, prix[0] - montant]
          objetReponse[`L${ligne + 1}C${col + 1}`] = {
            value: arrondi(valeurs[ligne], 2),
          }
        })
        handleAnswers(this, i, objetReponse, {
          formatInteractif: 'tableau-mathlive',
        })
      } else if (this.interactif) {
        // Le tableau à compléter version élève : une colonne de référence
        // (déjà remplie) suivie de kSituation + 1 colonnes à compléter.
        const numDataCols = kSituation + 2
        const colHeaders = [
          '\\text{Prix en €}',
          ...prix.slice(0, numDataCols).map((p: number) => texPrix(p)),
        ]
        const rowHeadersInteractif = [
          '\\text{Remise en pourcentage}',
          '\\text{Montant de la remise en €}',
          '\\text{Nouveau prix en €}',
        ]
        const contenuInteractif: string[] = []
        for (let col = 0; col < numDataCols; col++) {
          contenuInteractif.push(remises[col].str)
        }
        for (let col = 0; col < numDataCols; col++) {
          contenuInteractif.push(
            col === 0 ? texPrix((prix[0] * remises[0].nb) / 100) : '',
          )
        }
        for (let col = 0; col < numDataCols; col++) {
          contenuInteractif.push(
            col === 0
              ? texPrix(prix[0] - (prix[0] * remises[0].nb) / 100)
              : '',
          )
        }

        const tableauInteractif = AddTabDbleEntryMathlive.create(
          this.numeroExercice ?? 0,
          i,
          AddTabDbleEntryMathlive.convertTclToTableauMathlive(
            colHeaders,
            rowHeadersInteractif,
            contenuInteractif,
          ),
          'clavierNumbers',
          true,
          {},
        )
        texteAffiche = tableauInteractif.output

        const objetReponse: Record<string, { value: number }> = {}
        for (let col = 1; col < numDataCols; col++) {
          objetReponse[`L2C${col + 1}`] = {
            value: arrondi((prix[col] * remises[col].nb) / 100, 2),
          }
          objetReponse[`L3C${col + 1}`] = {
            value: arrondi(
              prix[col] - (prix[col] * remises[col].nb) / 100,
              2,
            ),
          }
        }
        handleAnswers(this, i, objetReponse, {
          formatInteractif: 'tableau-mathlive',
        })
      }

      if (this.listeQuestions.indexOf(texte) === -1) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texteAffiche
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
