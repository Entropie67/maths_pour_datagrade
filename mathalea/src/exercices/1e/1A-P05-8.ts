import { tableauColonneLigne } from '../../lib/2d/tableau'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { AddTabDbleEntryMathlive } from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import { bleuMathalea, orangeMathalea, vertMathalea } from '../../lib/colors'
import {
  miseEnCouleur,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Compléter un tableau croisé de probabilités'
export const dateDePublication = '27/10/2026'
export const uuid = 'a2340'
export const interactifReady = true

export const refs = {
  'fr-fr': ['1A-P05-8'],
  'fr-ch': [],
}

const coordonnees = [
  'L1C1',
  'L1C2',
  'L1C3',
  'L2C1',
  'L2C2',
  'L2C3',
  'L3C1',
  'L3C2',
  'L3C3',
]

// Indices (dans l'ordre ligne par ligne) des quatre probabilités croisées
const probasCroisees = [0, 1, 3, 4]

const enSoixantiemes = (unites: number) => Math.round(unites * 5) / 100

/**
 * Compléter un tableau croisé de probabilités avec les événements A et B :
 * trois probabilités croisées et un total sont donnés, il reste cinq cases à remplir.
 * @author Stéphane Guyon
 */
export default class TableauCroiseProbabilites extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion(): void {
    for (let i = 0; i < this.nbQuestions; i++) {
      // Probabilités multiples de 0,05 dont la somme vaut 1 (20 unités de 0,05)
      const ua = randint(1, 16)
      const ub = randint(1, 18 - ua)
      const uc = randint(1, 19 - ua - ub)
      const ud = 20 - ua - ub - uc
      // Probabilité croisée masquée : son total de ligne ou de colonne est donné.
      const masque = probasCroisees[randint(0, 3)]
      const totalDonneParLigne = randint(0, 1) === 0
      const indiceTotalDonne = totalDonneParLigne
        ? masque < 3
          ? 2
          : 5
        : masque % 3 === 0
          ? 6
          : 7

      const unites = [ua, ub, ua + ub, uc, ud, uc + ud, ua + uc, ub + ud, 20]
      const valeurs = unites.map(enSoixantiemes)
      const indicesDonnes = [
        ...probasCroisees.filter((indice) => indice !== masque),
        indiceTotalDonne,
      ]
      const donnees = valeurs.map((valeur, indice) =>
        indicesDonnes.includes(indice) ? texNombre(valeur, 2) : '',
      )
      const entetesColonnes = ['~', 'A', '\\overline{A}', '\\text{Total}']
      const entetesLignes = ['B', '\\overline{B}', '\\text{Total}']

      const enonce = `Soit $A$ et $B$ deux événements d'un même univers. On note $\\overline{A}$ l'événement contraire de $A$ et $\\overline{B}$ l'événement contraire de $B$.<br>
Le tableau croisé ci-dessous donne les probabilités respectives de ces événements.<br>
Compléter le tableau.<br>`

      let texte: string
      if (this.interactif) {
        const tableauMathlive =
          AddTabDbleEntryMathlive.convertTclToTableauMathlive(
            entetesColonnes,
            entetesLignes,
            donnees,
          )
        texte =
          enonce +
          AddTabDbleEntryMathlive.create(
            this.numeroExercice ?? 0,
            i,
            tableauMathlive,
            KeyboardType.clavierNumbers ?? '',
            true,
            {},
          ).output
        // Cinq champs quel que soit le tirage : le barème est donc fixe.
        const reponses: Record<string, { value: number }> = {}
        valeurs.forEach((valeur, indice) => {
          if (!indicesDonnes.includes(indice)) {
            reponses[coordonnees[indice]] = { value: valeur }
          }
        })
        handleAnswers(this, i, reponses, {
          formatInteractif: 'tableauMathlive',
        })
      } else {
        texte =
          enonce +
          tableauColonneLigne(
            entetesColonnes,
            entetesLignes,
            donnees.map((valeur) => (valeur === '' ? '\\ldots' : valeur)),
            1.5,
          )
      }

      // Correction en trois étapes, chacune avec sa couleur et son tableau
      const couleurEtape1 = orangeMathalea
      const couleurEtape2 = vertMathalea
      const couleurEtape3 = bleuMathalea
      const couleurs: Record<number, string> = {}
      const colorie = (indice: number, couleur: string) =>
        miseEnCouleur(texNombre(valeurs[indice], 2), couleur)
      // Tableau avec les cases connues (en couleur si elles viennent d'être trouvées)
      const tableauEtape = (connues: number[]) =>
        tableauColonneLigne(
          entetesColonnes,
          entetesLignes,
          valeurs.map((valeur, indice) =>
            !connues.includes(indice)
              ? ''
              : couleurs[indice]
                ? miseEnCouleur(texNombre(valeur, 2), couleurs[indice])
                : texNombre(valeur, 2),
          ),
          1.5,
        )
      const calcul = (
        indicesTermes: number[],
        resultat: number,
        couleur: string,
      ) =>
        `$${indicesTermes.map((indice) => texNombre(valeurs[indice], 2)).join('+')}=${colorie(resultat, couleur)}$`

      // Étape 1 : la case croisée manquante
      const autreProba = totalDonneParLigne
        ? masque < 3
          ? 1 - masque
          : 7 - masque
        : masque < 3
          ? masque + 3
          : masque - 3
      couleurs[masque] = couleurEtape1
      const connues1 = [...indicesDonnes, masque]
      let texteCorr = `${texteEnCouleurEtGras('Étape $\\mathbf{1}$ : la case croisée manquante.', couleurEtape1)}<br>
Le total de la ${totalDonneParLigne ? 'ligne' : 'colonne'} est donné, donc on retranche l'autre case de cette ${totalDonneParLigne ? 'ligne' : 'colonne'} : $${texNombre(valeurs[indiceTotalDonne], 2)}-${texNombre(valeurs[autreProba], 2)}=${colorie(masque, couleurEtape1)}$.<br>
${tableauEtape(connues1)}<br>`

      // Étape 2 : les totaux de lignes manquants
      const totauxLignes = [2, 5].filter(
        (indice) => indice !== indiceTotalDonne,
      )
      totauxLignes.forEach((indice) => {
        couleurs[indice] = couleurEtape2
      })
      const connues2 = [...connues1, ...totauxLignes]
      texteCorr += `${texteEnCouleurEtGras('Étape $\\mathbf{2}$ : les totaux des lignes.', couleurEtape2)}<br>
On additionne les probabilités de chaque ligne : ${totauxLignes
        .map((indice) =>
          calcul(indice === 2 ? [0, 1] : [3, 4], indice, couleurEtape2),
        )
        .join(' ; ')}.<br>
${tableauEtape(connues2)}<br>`

      // Étape 3 : les totaux de colonnes manquants et le total général
      const totauxColonnes = [6, 7].filter(
        (indice) => indice !== indiceTotalDonne,
      )
      ;[...totauxColonnes, 8].forEach((indice) => {
        couleurs[indice] = couleurEtape3
      })
      texteCorr += `${texteEnCouleurEtGras('Étape $\\mathbf{3}$ : les totaux des colonnes et le total général.', couleurEtape3)}<br>
On additionne les probabilités de chaque colonne : ${totauxColonnes
        .map((indice) =>
          calcul(indice === 6 ? [0, 3] : [1, 4], indice, couleurEtape3),
        )
        .join(' ; ')}${totauxColonnes.length > 0 ? '.' : ''}<br>
La somme de toutes les probabilités vaut ${calcul([2, 5], 8, couleurEtape3)}.<br>
${tableauEtape([...connues2, ...totauxColonnes, 8])}`

      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
    }
    listeQuestionsToContenu(this)
  }
}
