import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { prenom, prenomF } from '../../lib/outils/Personne'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { minToHoraire, minToHour } from '../../lib/outils/dateEtHoraires'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { formatMinute } from '../../lib/outils/texNombre'
import Hms from '../../modules/Hms'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer des durées ou déterminer un horaire'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

export const dateDeModifImportante = '09/10/2023' // Correction détaillée

/**
 * Problèmes où il faut calculer la durée d'un évènement ou un horaire.
 * Paramétrage possible :
 * * 1 : calculs de durées
 * * 2 : calculer l'heure de début
 * * 3 : calculer l'heure de fin
 * * 4 : mélange des 3 types précédents
 * @author Rémi Angot
 */
export const uuid = 'e960d'

export const refs = {
  'fr-fr': ['6M4A-1'],
  'fr-2016': ['6D12'],
  'fr-ch': ['9R1GM4D-2', '9R2GM4D-2', '9R3GM4D-2', '10CTGM4B-8', '10LCGM4B-8', '10LSGM4B-8', 'PRQMG04D-6'],
}
export default class CalculsDeDureesOuHoraires extends Exercice {
  constructor() {
    super()
    this.sup = 4
    this.spacing = 2
    this.nbQuestions = 3

    this.spacingCorr = 2
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      "1 : Calcul de durées\n2 : Calcul de l'horaire de fin\n3 : Calcul de l'horaire de début\n4 : Mélange",
    ]
  }

  nouvelleVersion() {
    const typeDeContexte = combinaisonListes([1, 2, 3, 4, 5], this.nbQuestions)
    let typesDeQuestions // 1 : calcul de durées // 2 : calcul de l'horaire de début // 3 : calcul de l'horaire de fin // 4 : mélange

    if (this.sup < 4) {
      // que des questions de niveau 1 ou que des questions de niveau 2
      typesDeQuestions = combinaisonListes([this.sup], this.nbQuestions)
    } else {
      // un mélange équilibré de questions
      typesDeQuestions = combinaisonListes([1, 2, 3], this.nbQuestions)
    }

    for (
      let i = 0,
        d1,
        h1,
        m1,
        d2,
        h2,
        m2,
        d,
        h,
        m,
        texte,
        texteInteractif,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let texteCorr = ''
      let texteCorrPerso = ''
      // d1 : heure de début (h1 heures m1 min)
      // d2 : heure de fin (h2 heures m2 min)
      // d : durée
      h1 = 0
      h2 = 0
      m1 = 0
      m2 = 0
      d1 = 0
      d2 = 0
      let reponse: Hms
      if (typeDeContexte[i] === 1) {
        h1 = randint(20, 22)
        m1 = randint(35, 58)
        d1 = h1 * 60 + m1
        h2 = h1 + 2
        m2 = randint(1, m1 - 1) // pour s'assurer qu'il y a une retenue dans d2-d1
        d2 = h2 * 60 + m2
        d = d2 - d1
        d1 = minToHoraire(d1, true)
        d2 = minToHoraire(d2, true)
        h = Math.floor(d / 60)
        m = d % 60
        d = minToHour(d, true)
        if (typesDeQuestions[i] === 1) {
          texte = `La diffusion d'un film commence à $${d1}$ et se termine à $${d2}$.<br>Combien de temps dure ce film ?`
          texteCorrPerso = `Le film dure $${miseEnEvidence(d)}$.`
          texteInteractif = 'Le film dure'
          reponse = Hms.fromString(d)
        } else if (typesDeQuestions[i] === 2) {
          texte = `Un film dure $${d}$ et commence à $${d1}$. <br>À quelle heure termine-t-il ?`
          texteCorrPerso = `Le film termine à $${miseEnEvidence(d2)}$.`
          texteInteractif = 'Le film termine à '
          reponse = Hms.fromString(d2)
        } else {
          texte = `Un film de $${d}$ termine à $${d2}$. <br>À quelle heure commence-t-il ?`
          texteCorrPerso = `Le film commence à $${miseEnEvidence(d1)}$.`
          texteInteractif = 'Le film commence à'
          reponse = Hms.fromString(d1)
        }
      } else if (typeDeContexte[i] === 2) {
        h1 = randint(20, 23)
        m1 = randint(35, 58)
        d1 = h1 * 60 + m1
        h2 = h1 + 1
        m2 = randint(1, m1) // pour s'assurer qu'il y a une retenue dans d2-d1
        d2 = h2 * 60 + m2
        d = d2 - d1
        while (d < 27 || d > 75 || d === 60) {
          h1 = randint(20, 23)
          m1 = randint(35, 58)
          d1 = h1 * 60 + m1
          h2 = h1 + 2
          m2 = randint(1, m1) // pour s'assurer qu'il y a une retenue dans d2-d1
          d2 = h2 * 60 + m2
          d = d2 - d1
        }
        d1 = minToHoraire(d1, true)
        d2 = minToHoraire(d2, true)
        h = Math.floor(d / 60)
        m = d % 60
        d = minToHour(d, true)

        if (typesDeQuestions[i] === 1) {
          texte = `Sur son service de streaming favori, ${prenom()} commence à regarder une série à $${d1}$ et celle-ci se termine à $${d2}$. <br>Combien de temps dure l'épisode ?`
          texteCorrPerso = `L'épisode dure $${miseEnEvidence(d)}$. `
          reponse = Hms.fromString(d)
          texteInteractif = "L'épisode dure"
        } else if (typesDeQuestions[i] === 2) {
          texte = `${prenom()} allume son ordinateur à $${d1}$ pour regarder une série de $${d}$. <br>À quelle heure la série s'achève-t-elle ?`
          texteCorrPerso = `La série s'achève à $${miseEnEvidence(d2)}$. `
          reponse = Hms.fromString(d2)
          texteInteractif = "La série s'achève à"
        } else {
          texte = `${prenom()} termine de regarder une série de $${d}$ à $${d2}$. <br>À quelle heure la série commence-t-elle ?`
          texteCorrPerso = `La série commence à $${miseEnEvidence(d1)}$. `
          reponse = Hms.fromString(d1)
          texteInteractif = 'La série commence à'
        }
      } else if (typeDeContexte[i] === 3) {
        h1 = randint(8, 21)
        m1 = randint(1, 58)
        d1 = h1 * 60 + m1
        h2 = h1 + randint(1, 2)
        m2 = randint(1, 59) // pas forcément de retenue dans d2-d1
        d2 = h2 * 60 + m2
        d = d2 - d1
        d1 = minToHoraire(d1, true)
        d2 = minToHoraire(d2, true)
        h = Math.floor(d / 60)
        m = d % 60
        d = minToHour(d, true)

        if (typesDeQuestions[i] === 1) {
          texte = `Une émission télévisée est diffusée de $${d1}$ à $${d2}$. <br>Combien de temps dure-t-elle ?`
          texteCorrPerso = `L'émission dure $${miseEnEvidence(d)}$. `
          reponse = Hms.fromString(d)
          texteInteractif = "L'émission dure"
        } else if (typesDeQuestions[i] === 2) {
          texte = `Une émission télévisée de $${d}$ commence à $${d1}$. <br>À quelle heure s'achèvera-t-elle ?`
          texteCorrPerso = `L'émission s'achèvera à $${miseEnEvidence(d2)}$. `
          reponse = Hms.fromString(d2)
          texteInteractif = "L'émission s'achèvera à"
        } else {
          texte = `À $${d2}$, ${prenom()} termine de regarder une émission de $${d}$. <br>À quelle heure l'émission commence-t-elle ?`
          texteCorrPerso = `L'émission commence à $${miseEnEvidence(d1)}$. `
          reponse = Hms.fromString(d1)
          texteInteractif = "L'émission commence à"
        }
      } else if (typeDeContexte[i] === 4) {
        h1 = randint(13, 16)
        m1 = randint(1, 58)
        d1 = h1 * 60 + m1
        h2 = h1 + randint(1, 2)
        m2 = randint(1, 58) // pas forcément de retenue dans d2-d1
        d2 = h2 * 60 + m2
        d = d2 - d1
        while (d < 27 || d > 75 || d === 60) {
          h1 = randint(13, 16)
          m1 = randint(35, 58)
          d1 = h1 * 60 + m1
          h2 = h1 + randint(1, 2)
          m2 = randint(1, m1) // pour s'assurer qu'il y a une retenue dans d2-d1
          d2 = h2 * 60 + m2
          d = d2 - d1
        }
        d1 = minToHoraire(d1, true)
        d2 = minToHoraire(d2, true)
        h = Math.floor(d / 60)
        m = d % 60
        d = minToHour(d, true)

        if (typesDeQuestions[i] === 1) {
          texte = `Un papa regarde la compétition de gymnastique de sa fille de $${d1}$ à $${d2}$. <br>Quelle est la durée de cette compétition ?`
          texteCorrPerso = `La compétition dure $${miseEnEvidence(d)}$. `
          reponse = Hms.fromString(d)
          texteInteractif = 'La compétition dure'
        } else if (typesDeQuestions[i] === 2) {
          texte = `Une compétition de gymnastique commence à $${d1}$ et dure $${d}$. <br>À quelle heure termine-t-elle ?`
          texteCorrPerso = `La compétition termine à $${miseEnEvidence(d2)}$. `
          reponse = Hms.fromString(d2)
          texteInteractif = 'La compétition termine à'
        } else {
          texte = `Une compétition de gymnastique qui termine à $${d2}$ dure $${d}$. <br>À quelle heure commence-t-elle ?`
          texteCorrPerso = `La compétition commence à $${miseEnEvidence(d1)}$. `
          reponse = Hms.fromString(d1)
          texteInteractif = 'La compétition commence à'
        }
      } else {
        h1 = randint(8, 15)
        m1 = randint(25, 58)
        d1 = h1 * 60 + m1
        h2 = h1 + randint(2, 5)
        m2 = randint(1, m1) // pour s'assurer qu'il y a une retenue dans d2-d1
        d2 = h2 * 60 + m2
        d = d2 - d1
        while (d < 27 || d > 75 || d === 60) {
          h1 = randint(20, 23)
          m1 = randint(35, 58)
          d1 = h1 * 60 + m1
          h2 = h1 + 2
          m2 = randint(1, m1) // pour s'assurer qu'il y a une retenue dans d2-d1
          d2 = h2 * 60 + m2
          d = d2 - d1
        }
        d1 = minToHoraire(d1, true)
        d2 = minToHoraire(d2, true)
        h = Math.floor(d / 60)
        m = d % 60
        d = minToHour(d, true)

        if (typesDeQuestions[i] === 1) {
          texte = `Un train part à $${d1}$ et arrive à destination à $${d2}$. <br>Quelle est la durée du trajet ?`
          texteCorrPerso = `Le trajet dure $${miseEnEvidence(d)}$. `
          reponse = Hms.fromString(d)
          texteInteractif = 'Le trajet dure'
        } else if (typesDeQuestions[i] === 2) {
          const prenom = prenomF()
          texte = `${prenom} monte dans le train à $${d1}$ pour un trajet qui doit durer $${d}$. <br>À quelle heure arrive-t-elle ?`
          texteCorrPerso = `${prenom} arrive à $${miseEnEvidence(d2)}$. `
          reponse = Hms.fromString(d2)
          texteInteractif = `${prenom} arrive à`
        } else {
          texte = `Un train arrive en gare à $${d2}$ après un trajet de $${d}$. <br>À quelle heure le voyage commence-t-il ?`
          texteCorrPerso = `Le voyage commencé à $${miseEnEvidence(d1)}$. `
          reponse = Hms.fromString(d1)
          texteInteractif = 'Le voyage commence à'
        }
      }
      switch (typesDeQuestions[i]) {
        case 1:
          texteCorr += `$${d1}~\\xrightarrow{+${formatMinute(60 - m1)}~\\text{min}}${(h1 + 1) % 24}~\\text{h} \\xrightarrow{+${h2 - h1 - 1 > 0 ? `${(h2 - h1 - 1) % 24}~\\text{h}~` : ''}${formatMinute(m2)}~\\min}${h2 % 24}~\\text{h}~${formatMinute(m2)}~\\text{min}$<br>`
          texteCorr += `$${d2} - ${d1} = ${d}$<br>`
          break
        case 2:
          texteCorr += `$${d1} + ${d} = ${h1 + h}~\\text{h}~${formatMinute(m1 + m)}~\\text{min}`
          if (m1 + m > 59)
            texteCorr += `= ${h1 + h}~\\text{h}+ 60~\\text{min}+${formatMinute(m1 + m - 60)}~\\text{min}= ${h1 + h}~\\text{h}+ 1~\\text{h}+${formatMinute(m1 + m - 60)}~\\text{min}`
          texteCorr += '$<br>'
          break
        case 3:
          texteCorr += `$${h2 % 24}~\\text{h}~${formatMinute(m2)}~\\text{min}`
          if (h > 0)
            texteCorr += `\\xrightarrow{-${h}~\\text{h}} ${h2 - h}~\\text{h}~${formatMinute(m2)}~\\text{min}`
          texteCorr += `\\xrightarrow{-${formatMinute(m2)}~\\text{min}} ${(h2 - h) % 24}~\\text{h} \\xrightarrow{-${formatMinute(Math.abs(m - m2))}~\\text{min}} ${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}$<br>`
          texteCorr += `$${d2}-${d} = ${d1}$<br>`
          break
      }
      texteCorr += texteCorrPerso
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce:
            'Dans chacun des encadrés, montrer une démarche ou un calcul et répondre par une phrase.<br>',
          enonceAvant: false,
          enonceAvantUneFois: true,
          melange: false,
          propositions: [
            {
              type: 'AMCOpen',
              propositions: [
                {
                  texte: ' ',
                  statut: 3, // (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                  feedback: '',
                  enonce: texte + '<br>', // EE : ce champ est facultatif et fonctionnel qu'en mode hybride (en mode normal, il n'y a pas d'intérêt)
                  sanscadre: false, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      if (this.interactif) {
        texte += '<br>'
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierHms, {
          texteAvant: texteInteractif + ' : ',
        })
        handleAnswers(this, i, {
          reponse: { value: reponse.toString(), options: { HMS: true } },
        })
      }

      if (this.questionJamaisPosee(i, m1, d1, h1, m2, d2, h2)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
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
