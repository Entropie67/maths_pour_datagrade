import { fraction } from '../../modules/fractions'
import Exercice from '../Exercice'

import {
  addMultiMathfield,
  type DataOptionsMultiMathfield,
} from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes2 } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import type { Valeur } from '../../lib/types'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import { sp } from '../../lib/outils/outilString'

export const titre =
  "Associer et utiliser différentes écritures d'un nombre décimal : écriture à virgule, fraction, nombre mixte, pourcentage"
export const interactifReady = true

export const dateDePublication = '09/08/2026'
export const dateDeModifImportante = '21/09/2026'
/**
 * Associer et utiliser différentes écritures d'un nombre décimal : écriture à virgule, fraction, nombre mixte, pourcentage
 * *
 * @author Mireille Gain, à partir de 6N1F

 */

export const uuid = '67f4a'

export const refs = {
  'fr-fr': ['6N1F', '5N3autoK'],
  'fr-ch': ['9R1NO4E-9', '9R2NO4E-9', '9R3NO4E-9', 'PRQNO11A-10'],
}

/** Les quatre écritures possibles, dans l'ordre d'affichage historique. */
const FORMES = {
  mixte: 1,
  fraction: 2,
  decimal: 3,
  pourcentage: 4,
} as const

const NOM_FORME: Record<number, string> = {
  1: 'nombre mixte',
  2: 'fraction décimale',
  3: 'nombre décimal',
  4: 'pourcentage',
}

const NOMBRE_EN_LETTRES: Record<number, string> = {
  1: 'une',
  2: 'deux',
  3: 'trois',
}

/** Un champ élémentaire d'une écriture demandée en interactif. */
type SousChampDemande = {
  keyboard: string | undefined
  value: string | number
  options: Record<string, boolean>
}

/** Une écriture demandée : sa ligne de correction et ses champs interactifs. */
type FormeDemandee = {
  id: number
  ligneCorrection: string
  /** Gabarit de la ligne interactive, chaque `@` reçoit un `%{champN}`. */
  gabaritInteractif: string
  sousChamps: SousChampDemande[]
}

export default class AssocierDifferentesEcrituresNombreDecimal extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.besoinFormulaireTexte = [
      'Forme initiale donnée',
      'Nombres séparés par des tirets :\n1 : Nombre mixte\n2 : Fraction décimale\n3 : Nombre décimal\n4 : Pourcentage\n5 : Mélange',
    ]
    this.sup = 5
    this.besoinFormulaire2CaseACocher = [
      "Avec rappel de la définition d'un nombre mixte",
    ]
    this.sup2 = false
    this.besoinFormulaire3CaseACocher = [
      'Avec des millièmes dans la partie décimale',
    ]
    this.sup3 = true
    this.spacingCorr = 3
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      max: 4,
      defaut: 5, // Mélange par défaut
      melange: 5,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
    })

    // Les écritures effectivement retenues par l'utilisateur. Le formulaire
    // « Forme initiale donnée » ne pilotait que l'écriture de départ : les trois
    // autres écritures étaient toujours demandées, y compris celles décochées.
    // On restreint désormais l'ensemble des écritures en jeu à celles cochées :
    // l'écriture donnée tourne parmi elles, les écritures demandées sont les
    // autres écritures cochées. En dessous de deux écritures (ou en mélange),
    // on garde le comportement historique avec les quatre écritures.
    const idsDemandes = String(this.sup ?? '')
      .split('-')
      .map((valeur) => parseInt(valeur, 10))
      .filter((n) => Number.isInteger(n))
    const melangeDemande = idsDemandes.length === 0 || idsDemandes.includes(5)
    const formesCochees = [1, 2, 3, 4].filter((id) => idsDemandes.includes(id))
    const formesActives =
      melangeDemande || formesCochees.length < 2 ? [1, 2, 3, 4] : formesCochees
    const toutesLesFormes = formesActives.length === 4

    if (toutesLesFormes) {
      if (this.nbQuestions === 1) {
        this.consigne =
          `Écrire le nombre suivant sous les trois formes manquantes parmi${sp()}: <br>nombre décimal, fraction décimale, pourcentage, nombre mixte`
      } else {
        this.consigne =
          `Écrire chacun des nombres suivants sous les trois formes manquantes parmi${sp()}: <br>nombre décimal, fraction décimale, pourcentage, nombre mixte`
      }
    } else {
      const nbManquantes = formesActives.length - 1
      const formesMot =
        nbManquantes === 1
          ? 'la forme manquante'
          : `les ${NOMBRE_EN_LETTRES[nbManquantes]} formes manquantes`
      const listeFormes = formesActives.map((id) => NOM_FORME[id]).join(', ')
      const sujet =
        this.nbQuestions === 1
          ? 'le nombre suivant'
          : 'chacun des nombres suivants'
      this.consigne = `Écrire ${sujet} sous ${formesMot} parmi${sp()}: <br>${listeFormes}`
    }
    if (this.sup2) {
      this.consigne +=
        " (somme d'un entier et d'une fraction décimale strictement inférieure à $1$)."
    } else {
      this.consigne += '.'
    }
    const listeTypeDeQuestions = combinaisonListes2(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (
      let i = 0,
        texte,
        texteCorr,
        formeDeci,
        formeMixte,
        formeMixteEnEvidence,
        formeFrac,
        formePourc,
        entier,
        deci,
        centi,
        milli,
        nbChiffres,
        partieDecimale,
        fracG,
        fracGNS,
        fracD,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      entier = randint(1, 20)
      deci = randint(1, 9)
      centi = randint(1, 9) * 10 + randint(1, 9)
      milli = randint(1, 9) * 100 + randint(1, 9) * 10 + randint(1, 9)
      nbChiffres = this.sup3 ? choice([1, 2, 3]) : choice([1, 2])
      if (nbChiffres === 1) {
        partieDecimale = deci
        fracG = fraction(entier * 10 + deci, 10)
        fracD = fraction(deci, 10)
        formePourc = entier * 100 + deci * 10
      } else if (nbChiffres === 2) {
        partieDecimale = centi
        fracG = fraction(entier * 100 + centi, 100)
        fracD = fraction(centi, 100)
        formePourc = entier * 100 + centi
      } else {
        partieDecimale = milli
        fracG = fraction(entier * 1000 + milli, 1000)
        fracD = fraction(milli, 1000)
        formePourc = entier * 100 + milli / 10
      }

      formeDeci = texNombre(
        entier + partieDecimale / 10 ** nbChiffres,
        nbChiffres,
      )
      formeFrac = `$${fracG.texFraction}$`
      formeMixte = `$${entier} + ${fracD.texFraction}$`
      formeMixteEnEvidence = `$${miseEnEvidence(entier)} + ${miseEnEvidence(fracD.texFraction)}$`

      // Descripteurs réutilisables des écritures qui peuvent être demandées.
      const champMixte: FormeDemandee = {
        id: FORMES.mixte,
        ligneCorrection: `d'un nombre mixte${sp()}: ${formeMixteEnEvidence}`,
        gabaritInteractif:
          `d'un nombre mixte${sp()}: @ (partie entière) + @ (fraction décimale)`,
        sousChamps: [
          {
            keyboard: KeyboardType.clavierDeBase,
            value: entier,
            options: { nombreDecimalSeulement: true },
          },
          {
            keyboard: KeyboardType.clavierDeBaseAvecFraction,
            value: fracD.texFraction,
            options: { fractionDecimale: true },
          },
        ],
      }
      const champFraction = (ligne: string): FormeDemandee => ({
        id: FORMES.fraction,
        ligneCorrection: ligne,
        gabaritInteractif: `d'une fraction décimale${sp()}: @`,
        sousChamps: [
          {
            keyboard: KeyboardType.clavierDeBaseAvecFraction,
            value: fracG.texFraction,
            options: { fractionDecimale: true },
          },
        ],
      })
      const champDecimal = (ligne: string): FormeDemandee => ({
        id: FORMES.decimal,
        ligneCorrection: ligne,
        gabaritInteractif: `d'un nombre décimal${sp()}: @`,
        sousChamps: [
          {
            keyboard: KeyboardType.clavierDeBase,
            value: formeDeci,
            options: { nombreDecimalSeulement: true },
          },
        ],
      })
      const champPourcentage = (ligne: string): FormeDemandee => ({
        id: FORMES.pourcentage,
        ligneCorrection: ligne,
        gabaritInteractif: `d'un pourcentage${sp()}: @ %`,
        sousChamps: [
          {
            keyboard: KeyboardType.clavierDeBase,
            value: formePourc,
            options: { nombreDecimalSeulement: true },
          },
        ],
      })

      let formesDemandees: FormeDemandee[]

      switch (listeTypeDeQuestions[i]) {
        case 1: // Nombre mixte (Somme d'un entier et d'une fraction décimale)
          {
            texte = formeMixte
            formesDemandees = [
              champDecimal(
                `d'un nombre décimal${sp()}: $${miseEnEvidence(formeDeci)}$`,
              ),
              champFraction(
                `d'une fraction décimale${sp()}: $${miseEnEvidence(fracG)}$`,
              ),
              champPourcentage(
                `d'un pourcentage${sp()}: $${miseEnEvidence(texNombre(formePourc, 1))}~\\%$`,
              ),
            ]
          }
          break

        case 2: // Fraction décimale
          {
            texte = formeFrac
            formesDemandees = [
              champMixte,
              champDecimal(
                `d'un nombre décimal${sp()}: $${miseEnEvidence(formeDeci)}$`,
              ),
              champPourcentage(
                `d'un pourcentage${sp()}: $${miseEnEvidence(texNombre(formePourc, 1))}~\\%$`,
              ),
            ]
          }
          break

        case 3: // Nombre décimal
          {
            texte = `$${formeDeci}$`
            formesDemandees = [
              champMixte,
              champFraction(
                `d'une fraction décimale${sp()}: $${miseEnEvidence(fracG)}$`,
              ),
              champPourcentage(
                `d'un pourcentage${sp()}: $${miseEnEvidence(texNombre(formePourc))}~\\%$`,
              ),
            ]
          }
          break

        case 4: // Pourcentage
        default:
          {
            texte = `$${texNombre(formePourc, 1)}~\\%$`
            if (nbChiffres === 1) {
              fracGNS = fraction(entier * 100 + deci * 10, 100)
              formesDemandees = [
                champFraction(
                  `d'une fraction décimale${sp()}: $${miseEnEvidence(fracG)}$ (ou $${fracGNS.texFraction}$)`,
                ),
                champDecimal(
                  `d'un nombre décimal${sp()}: $${miseEnEvidence(formeDeci)}$ (ou $${texNombre(entier + partieDecimale / 10, 2, true)}$)`,
                ),
                champMixte,
              ]
            } else {
              formesDemandees = [
                champFraction(
                  `d'une fraction décimale${sp()}: $${miseEnEvidence(fracG)}$`,
                ),
                champDecimal(
                  `d'un nombre décimal${sp()}: $${miseEnEvidence(formeDeci)}$`,
                ),
                champMixte,
              ]
            }
          }
          break
      }

      // On ne garde que les écritures cochées par l'utilisateur.
      const formesRetenues = formesDemandees.filter((forme) =>
        formesActives.includes(forme.id),
      )

      texteCorr = `
            ${texte} peut aussi s'écrire sous forme${sp()}:<br>
           ${formesRetenues
             .map((forme) => forme.ligneCorrection)
             .join(' <br>\n           ')}
            `

      if (this.interactif) {
        let compteurChamp = 0
        const dataOptions: Record<string, { keyboard: string | undefined }> = {}
        const lignesTemplate: string[] = []
        for (const forme of formesRetenues) {
          let ligne = forme.gabaritInteractif
          for (const sousChamp of forme.sousChamps) {
            const nom = `champ${++compteurChamp}`
            ligne = ligne.replace('@', `%{${nom}}`)
            dataOptions[nom] = { keyboard: sousChamp.keyboard }
          }
          lignesTemplate.push(ligne)
        }
        texte = addMultiMathfield(this, i, {
          dataTemplate: `
           ${texte} peut aussi s'écrire sous forme de${sp()}:<br>
           ${lignesTemplate.join(' <br>\n           ')}
            `,
          dataOptions: dataOptions as DataOptionsMultiMathfield,
        })
      }

      let compteurReponse = 0
      const reponses: Record<
        string,
        { value: string | number; options: Record<string, boolean> }
      > = {}
      for (const forme of formesRetenues) {
        for (const sousChamp of forme.sousChamps) {
          reponses[`champ${++compteurReponse}`] = {
            value: sousChamp.value,
            options: sousChamp.options,
          }
        }
      }
      if (compteurReponse > 0) {
        handleAnswers(this, i, reponses as unknown as Valeur, {
          formatInteractif: 'multi-mathfield',
        })
      }

      // Ajouter la question et la correction si la question n'a jamais été posée
      if (this.questionJamaisPosee(i, entier, deci, centi, milli, nbChiffres)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
  }
}
