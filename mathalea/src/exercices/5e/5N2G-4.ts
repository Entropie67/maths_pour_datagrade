import { tableauColonneLigne } from '../../lib/2d/tableau'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { AddTabDbleEntryMathlive } from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Additionner deux entiers relatifs dans un tableau à double entrée'
export const dateDeModifImportante = '07/04/2026'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'

/**
 * Additionner deux entiers relatifs dans un tableau à double entrée
 * @author Rémi Angot
 * Passage en interactif, changement total du code pour les tableaux et amélioration de la consigne par Éric Elter le 07/06/2025
 * Rajout du barème plus adapté par Éric Elter le 07/04/2026
 */
export const uuid = '4125e'

export const refs = {
  'fr-fr': ['5N2G-4'],
  'fr-2016': ['5R20-5'],
  'fr-ch': ['9R2NO3C-6', '9R3NO3C-6', '10CTNO2A-6', 'PRQNO06B-2'],
}

type Cellule = {
  value: number
  options?: {
    nombreDecimalSeulement?: boolean
  }
}
type Bareme = (l: number[]) => [number, number]

export default class ExerciceTableauAdditionsRelatifs extends Exercice {
  constructor() {
    super()
    this.consigne =
      "Compléter ce tableau de manière à ce que chaque case corresponde à la somme du nombre dans l'en-tête de la colonne associée et du nombre dans l'en-tête de la ligne associée."

    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    const listeSignes1 = combinaisonListes([-1, 1], 4)

    const nombreSurLigne: number[] = []
    const nombreDansColonne: number[] = []
    const ligneEnt = []
    const colonneEnt = ['+']
    for (let i = 0; i < 4; i++) {
      // Génère un nombre entre 2 et 9, différent de ceux déjà choisis
      const dejaChoisisLigne = nombreSurLigne.map((n) => Math.abs(n))
      const a = randint(2, 9, dejaChoisisLigne)
      nombreSurLigne.push(a * listeSignes1[i])
      ligneEnt.push(`${ecritureAlgebrique(a * listeSignes1[i])}`)

      const dejaChoisisColonne = nombreDansColonne.map((n) => Math.abs(n))
      const b = randint(2, 9, dejaChoisisColonne)
      nombreDansColonne.push(b * listeSignes1[i])
      colonneEnt.push(`${ecritureAlgebrique(b * listeSignes1[i])}`)
    }

    const contenu = Array(16).fill('')
    const objetReponse1: { [key: string]: Cellule } & { bareme?: Bareme } = {}
    const sommeDiviseePar2: (l: number[]) => [number, number] = (
      listePoints,
    ) => {
      const somme = listePoints.reduce((acc, val) => acc + val, 0)
      const resultat = Math.ceil(somme / 2)
      return [resultat, 8]
    }

    objetReponse1.bareme = sommeDiviseePar2

    const contenuCorr = []
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const somme = nombreSurLigne[i] + nombreDansColonne[j]
        const key = `L${i + 1}C${j + 1}`
        objetReponse1[key] = {
          value: somme,
        }
        contenuCorr.push(
          miseEnEvidence(somme === 0 ? somme : ecritureAlgebrique(somme)),
        )
      }
    }

    const tableau = tableauColonneLigne(colonneEnt, ligneEnt, contenu)
    const tableauInteractif = AddTabDbleEntryMathlive.create(
      this.numeroExercice ?? 0,
      0,
      AddTabDbleEntryMathlive.convertTclToTableauMathlive(
        colonneEnt,
        ligneEnt,
        contenu,
      ),
      'clavierDeBase', // type de clavier
      true,
      {},
    )

    const texte = this.interactif ? tableauInteractif.output : tableau
    handleAnswers(this, 0, objetReponse1, {
      formatInteractif: 'tableau-mathlive',
    })

    const tableauCorr = tableauColonneLigne(colonneEnt, ligneEnt, contenuCorr)
    const texteCorr = `${tableauCorr}`

    this.listeQuestions.push(texte)
    this.listeCorrections.push(texteCorr)

    if (context.isAmc) {
      this.autoCorrectionAMC[0] = {
        enonce: this.question,
        propositions: [
          {
            texte: '',
            statut: 1, // OBLIGATOIRE (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
            sanscadre: true, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
          },
        ],
      }
      this.questionsAMC[0] = amcConvert(this.autoCorrectionAMC[0])
    }
    listeQuestionsToContenu(this)
  }
}
