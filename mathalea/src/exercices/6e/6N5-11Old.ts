import { texPrix } from '../../lib/format/style'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { numAlpha, sp } from '../../lib/outils/outilString'
import { personne, prenom, prenomF } from '../../lib/outils/Personne'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { handleAnswers } from '../../lib/interactif/gestionInteractif'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'

export const interactifReady = true

export const titre = 'Résoudre des problèmes (plus complexes)'
export const dateDePublication = '27/11/2022'
export const dateDeModifImportante = '17/02/2025'

/**
 * Résoudre des problèmes (plus complexes)
 * @author Mickael Guironnet
 * Relecture typographique par Rémi Angot
 */
export const uuid = 'e906e'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': [],
}
export default class ExerciceProblemesComplexesOld extends Exercice {
  constructor() {
    super()
    this.sup = 11

    this.spacing = 1.5
    if (context.isHtml) this.spacingCorr = 1.5
    this.nbQuestions = 3

    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Régime alimentaire',
        '2 : Fromagerie',
        '3 : Programme de calcul',
        '4 : Cinéma (siège)',
        '5 : Cinéma (pellicule)',
        '6 : Boulangerie (sandwichs)',
        '7 : Cagettes',
        '8 : Billets',
        '9 : Fruits',
        '10 : Devinette',
        '11 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const listeDesProblemes = gestionnaireFormulaireTexte({
      max: 10,
      defaut: 11,
      melange: 11,
      nbQuestions: this.nbQuestions,
      // shuffle: false, // A GARDER POUR DEBUGGAGE
      saisie: this.sup,
    })

    let indiceInteractif = 0
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      let texte = ''
      let texteCorr = ''
      let questionParametre: number[] = []
      switch (listeDesProblemes[i]) {
        case 1: {
          const calAgneau = 3 + randint(1, 3) * 0.1 // 3.3
          const calEpinards = 0.3 + randint(1, 3) * 0.01 // 0.32
          const calFro = 1 + randint(1, 3) * 0.1 // 1.2
          const calPom = 0.5 + randint(1, 3) * 0.01 // 0.52
          const quaAgneau = 120 + randint(1, 9) // 125
          const quaEpinards = 150 + randint(0, 5) // 150
          const quaFro = 40 + randint(0, 9) // 45
          const quaPom = 120 + randint(0, 5) // 120
          questionParametre = [
            1,
            calAgneau,
            calEpinards,
            calFro,
            calPom,
            quaAgneau,
            quaEpinards,
            quaFro,
            quaPom,
          ]
          const personnage = personne()
          const prenomFP = personnage.prenom
          texte += `${prenomFP} suit un régime et ne doit pas absorber plus de $700$ calories par repas.<br>
                   Aujourd'hui, ${personnage.pronom} a mangé le repas suivant :<br>
                   une côtelette d'agneau de $${quaAgneau}$ g,<br> $${quaEpinards}$ g d'épinards,<br> $${quaFro}$ g de fromage blanc <br> et une pomme de $${quaPom}$ g. <br>
                   <br>On sait que $1$ g d'agneau fournit $${texNombre(calAgneau)}$ calories, <br> $1$ g d'épinards fournit $${texNombre(calEpinards)}$ calories, <br> $1$ g de fromage blanc fournit $${texNombre(calFro)}$ calories <br> et $1$ g de pomme $${texNombre(calPom)}$ calories.<br>`
          texteCorr += `Agneau : $${quaAgneau}\\times ${texNombre(calAgneau)} = ${miseEnEvidence(texNombre(calAgneau * quaAgneau))}$ calories. <br>
                        Epinards : $${quaEpinards}\\times ${texNombre(calEpinards)} = ${miseEnEvidence(texNombre(calEpinards * quaEpinards))}$ calories. <br>
                        Fromage blanc : $${quaFro}\\times ${texNombre(calFro)} = ${miseEnEvidence(texNombre(calFro * quaFro))}$ calories. <br>
                        Pomme : $${quaPom}\\times ${texNombre(calPom)} = ${miseEnEvidence(texNombre(calPom * quaPom))}$ calories. <br>
                        Cela fait un total de : $${texNombre(calAgneau * quaAgneau)} + ${texNombre(calEpinards * quaEpinards)} + ${texNombre(calFro * quaFro)} + ${texNombre(calPom * quaPom)} = ${texNombre(calAgneau * quaAgneau + calEpinards * quaEpinards + calFro * quaFro + calPom * quaPom)} $ calories.<br>
                        ${calAgneau * quaAgneau + calEpinards * quaEpinards + calFro * quaFro + calPom * quaPom < 700 ? `${prenomFP} ${texteEnCouleurEtGras('respecte')} son règime` : `${prenomFP} ${texteEnCouleurEtGras('ne respecte pas')} son règime`}
                        car $${texNombre(calAgneau * quaAgneau + calEpinards * quaEpinards + calFro * quaFro + calPom * quaPom)} ${calAgneau * quaAgneau + calEpinards * quaEpinards + calFro * quaFro + calPom * quaPom < 700 ? '< 700' : '> 700'}$.`
          if (this.interactif) {
            texte +=
              '<br>' +
              numAlpha(0) +
              `Combien de calories fournit une côtelette d'agneau de $${quaAgneau}$ g ?`
            handleAnswers(this, indiceInteractif, {
              reponse: { value: (calAgneau * quaAgneau).toFixed(2) },
            })
            texte += ajouteChampTexteMathLive(
              this,
              indiceInteractif,
              KeyboardType.clavierNumbers,
              { texteApres: ' calories' },
            )

            texte +=
              '<br>' +
              numAlpha(1) +
              `Combien de calories fournit $${quaEpinards}$ g d'épinards ?`
            handleAnswers(this, indiceInteractif + 1, {
              reponse: { value: (calEpinards * quaEpinards).toFixed(2) },
            })
            texte += ajouteChampTexteMathLive(
              this,
              indiceInteractif + 1,
              KeyboardType.clavierNumbers,
              { texteApres: ' calories' },
            )

            texte +=
              '<br>' +
              numAlpha(2) +
              `Combien de calories fournit $${quaFro}$ g de fromage blanc ?`
            handleAnswers(this, indiceInteractif + 2, {
              reponse: { value: (calFro * quaFro).toFixed(2) },
            })
            texte += ajouteChampTexteMathLive(
              this,
              indiceInteractif + 2,
              KeyboardType.clavierNumbers,
              { texteApres: ' calories' },
            )

            texte +=
              '<br>' +
              numAlpha(3) +
              `Combien de calories fournit une pomme de $${quaPom}$ g ?`
            handleAnswers(this, indiceInteractif + 3, {
              reponse: { value: (calPom * quaPom).toFixed(2) },
            })
            texte += ajouteChampTexteMathLive(
              this,
              indiceInteractif + 3,
              KeyboardType.clavierNumbers,
              { texteApres: ' calories' },
            )

            texte += '<br>' + numAlpha(4)
          }
          texte += `${prenomFP} respecte-t-${personnage.pronom} son régime ?`
          handleAnswers(this, indiceInteractif + 4, {
            reponse: {
              value:
                calAgneau * quaAgneau +
                  calEpinards * quaEpinards +
                  calFro * quaFro +
                  calPom * quaPom <
                700
                  ? 'Oui'
                  : 'Non',
              options: { texteSansCasse: true },
            },
          })
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif + 4,
            KeyboardType.alphanumeric,
            { texteApres: ' (oui ou non)' },
          )

          indiceInteractif += 5

          break
        }
        case 2: {
          const quaFro1 = 130 + randint(0, 9) // 133
          const masseFro1 = 2.3 + randint(0, 9) * 0.01 // 2,340
          const quaFro2 = 120 + randint(0, 9) // 122
          const masseFro2 = 3.1 + randint(0, 9) * 0.01 // 3,115
          const total = quaFro1 * masseFro1 + quaFro2 * masseFro2
          questionParametre = [2, quaFro1, masseFro1, quaFro2, masseFro2, total]
          texte += `Le livreur d'une fromagerie charge $${quaFro1}$ fromages pesant chacun $${texNombre(masseFro1)}$ kg <br>
                                  et $${quaFro2}$ autres pesant chacun $${texNombre(masseFro2)}$ kg dans une voiture pouvant transporter $700$ kg de fromage.<br>
                                  Le véhicule est-il en surcharge ?`
          handleAnswers(this, indiceInteractif, {
            reponse: {
              value: total > 700 ? 'Oui' : 'Non',
              options: { texteSansCasse: true },
            },
          })
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif,
            KeyboardType.alphanumeric,
            { texteApres: ' (oui ou non)' },
          )

          texte += '<br>Si oui, de combien ? Si non, combien reste-t-il ?'
          handleAnswers(this, indiceInteractif + 1, {
            reponse: {
              value:
                total > 700
                  ? (total - 700).toFixed(2)
                  : (700 - total).toFixed(),
            },
          })
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif + 1,
            KeyboardType.clavierNumbers,
            { texteApres: ' kg' },
          )

          texteCorr += `Première sorte de fromage : $${quaFro1}\\times ${texNombre(masseFro1)}${sp()}\\text{kg} = ${texNombre(quaFro1 * masseFro1)}${sp()}\\text{kg}$. <br>
                        Deuxième sorte de fromage : $${quaFro2}\\times ${texNombre(masseFro2)}${sp()}\\text{kg} = ${texNombre(quaFro2 * masseFro2)}${sp()}\\text{kg}$. <br>
                        Cela fait un total de $${texNombre(quaFro1 * masseFro1)}${sp()}\\text{kg} + ${texNombre(quaFro2 * masseFro2)}${sp()}\\text{kg} = ${texNombre(quaFro1 * masseFro1 + quaFro2 * masseFro2)}${sp()}\\text{kg}$.<br>
                        ${
                          total > 700
                            ? `${texteEnCouleurEtGras('Le véhicule est en surcharge')} et la surcharge est de : $${texNombre(total)}${sp()}\\text{kg} - 700${sp()}\\text{kg} = ${miseEnEvidence(texNombre(total - 700))}${sp()}\\text{kg}$.`
                            : `${texteEnCouleurEtGras("Le véhicule n'est pas en surcharge")} et il reste : $700${sp()}\\text{kg} - ${texNombre(total)}${sp()}\\text{kg} = ${miseEnEvidence(texNombre(700 - total))}${sp()}\\text{kg}$.`
                        }`

          indiceInteractif += 2

          break
        }
        case 3: {
          const k1 = randint(1, 8) * 0.1 // 0.4
          const k2 = randint(10, 30) // 25
          const n1 = randint(2, 9)
          const n2 = randint(2, 9, [n1])
          questionParametre = [3, k1, k2, n1, n2]
          texte += `On considère le programme de calcul :<br>
          • Choisir un nombre.<br>
          • Multiplier ce nombre par $${texNombre(k1)}$.<br>
          • Multiplier le résultat par $${texNombre(k2)}$.<br>`
          if (!this.interactif) {
            texte += `<br>${numAlpha(0)} Effectuer ce programme avec $${n1}$ et $${n2}$.
            <br>${numAlpha(1)} Remplacer ce programme par un programme plus court. Expliquer.`
          } else {
            texte += `<br>${numAlpha(0)} Effectuer ce programme avec $${n1}$.`
            handleAnswers(this, indiceInteractif, {
              reponse: { value: (n1 * k1 * k2).toFixed(2) },
            })
            texte += ajouteChampTexteMathLive(
              this,
              indiceInteractif,
              KeyboardType.clavierNumbers,
            )

            texte += `<br>${numAlpha(1)} Effectuer ce programme avec $${n2}$.`
            handleAnswers(this, indiceInteractif + 1, {
              reponse: { value: (n2 * k1 * k2).toFixed(2) },
            })
            texte += ajouteChampTexteMathLive(
              this,
              indiceInteractif + 1,
              KeyboardType.clavierNumbers,
            )
          }
          const correction1 = `Si le nombre est $${n1}$ :<br>
                        • $${n1} \\times ${texNombre(k1)} = ${texNombre(n1 * k1)}$ ;<br>
                        • $${texNombre(n1 * k1)} \\times ${texNombre(k2)} = ${miseEnEvidence(texNombre(n1 * k1 * k2))}$.<br>`
          const correction2 = `Si le nombre est $${n2}$ :<br>
                        • $${n2} \\times ${texNombre(k1)} = ${texNombre(n2 * k1)}$ ;<br>
                        • $${texNombre(n2 * k1)} \\times ${texNombre(k2)} = ${miseEnEvidence(texNombre(n2 * k1 * k2))}$.<br>`
          texteCorr = this.interactif
            ? `${numAlpha(0)} ${correction1} ${numAlpha(1)} ${correction2}`
            : `${numAlpha(0)} ${correction1} ${correction2}
                        ${numAlpha(1)} Le programme de calcul se résume par cette expression :<br>
                        «${sp()}nombre de départ $\\times ${texNombre(k1)} \\times ${texNombre(k2)}$${sp()}» <br>
                        C'est une expression avec uniquement des multiplications, il n'y a pas priorité, <br>
                        elle se résume par : «${sp()}nombre de départ $\\times ${texNombre(k1 * k2)}$${sp()}» car : $${texNombre(k1)}\\times${texNombre(k2)}=${texNombre(k1 * k2)}$.<br>
                        Donc le programme peut être le suivant : <br>
                        • Choisir un nombre.<br>
                        • Multiplier ce nombre par $${texNombre(k1 * k2)}$.<br>`
          indiceInteractif += 2

          break
        }
        case 4: {
          const range = randint(20, 40) // 35
          const fauteuils = randint(10, 20) // 12
          const prix = randint(5, 12) + randint(5, 8) * 0.1
          const n1 = randint(10, 15)
          questionParametre = [4, range, fauteuils, prix, n1]
          texte += `Dans une salle de cinéma, il y a $${range}$ rangées de $${fauteuils}$ fauteuils.<br>
                    Le prix d'une place pour une séance est de $${texPrix(prix)}$ €.<br>
                  ${numAlpha(0)} Si toutes les places sont occupées, quelle est la somme d'argent récoltée ?`
          handleAnswers(this, indiceInteractif, {
            reponse: { value: (fauteuils * range * prix).toFixed(2) },
          })
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif,
            KeyboardType.clavierNumbers,
            { texteApres: ' €' },
          )

          texte += `<br>
                  ${numAlpha(1)} Pour une autre séance, $${n1}$ rangées sont pleines, le reste des
                  rangées étant vides. Quelle est la recette pour cette séance ?`
          handleAnswers(this, indiceInteractif + 1, {
            reponse: { value: (fauteuils * n1 * prix).toFixed(2) },
          })
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif + 1,
            KeyboardType.clavierNumbers,
            { texteApres: ' €' },
          )

          texteCorr += `${numAlpha(0)} $${range} \\times ${fauteuils} =${fauteuils * range}$<br>
                        Il y a $${fauteuils * range}$ places dans la salle.<br>
                        $${fauteuils * range} \\times ${texPrix(prix)} = ${texPrix(fauteuils * range * prix)}$<br>
                        La somme d'argent perçue est $${miseEnEvidence(texPrix(fauteuils * range * prix))}$ €.<br>
                        ${numAlpha(1)} $${n1} \\times ${fauteuils} =${fauteuils * n1}$<br>
                        Il y a $${fauteuils * n1}$ places occupées dans la salle.<br>
                        $${fauteuils * n1} \\times ${texNombre(prix)} = ${texNombre(fauteuils * n1 * prix)}$<br>
                        La somme d'argent perçue est $${miseEnEvidence(texPrix(fauteuils * n1 * prix))}$ €.<br>`

          indiceInteractif += 2

          break
        }
        case 5: {
          const min = randint(1, 5) * 10 //  30
          const longueur = randint(2, 9) * 30 // 600m
          const nombreP = randint(3, 8)
          questionParametre = [5, min, longueur, nombreP]
          texte += `Avant l'arrivée du numérique, au cinéma, la pellicule était utilisée pour projeter des films.<br>
                   Le format souvent utilisé était le format $35\\text{ mm}$ ce qui signifie que la pellicule faisait $35\\text{ mm}$ de largeur.<br>
                   Avec $24$ images par seconde, une pellicule de film de $30$ mètres de long représente $1$ minute de projection.<br>
                   Pour projeter un film, plusieurs pellicules étaient nécessaires et le projectionniste avait pour rôle de les changer.<br>
                   ${numAlpha(0)} Si le film a $${nombreP}$ pellicules de $600\\text{ m}$, quelle est la longueur totale en mètres du film ?`
          handleAnswers(this, indiceInteractif, {
            reponse: { value: (nombreP * 600).toFixed(2) },
          })
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif,
            KeyboardType.clavierNumbers,
            { texteApres: '$\\text{ m}$' },
          )

          texte += `<br> ${numAlpha(1)} Si le film a $${nombreP}$ pellicules de $600\\text{ m}$, quelle est la durée totale du film ?`
          handleAnswers(this, indiceInteractif + 1, {
            reponse: { value: (nombreP * 20).toFixed(2) },
          })
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif + 1,
            KeyboardType.clavierNumbers,
            { texteApres: ' minutes' },
          )

          texte += `<br>${numAlpha(2)} Si le film dure $1${sp()}\\text{h}${sp()}${min}$, quelle est la longueur totale, en mètres, du film ?`
          handleAnswers(this, indiceInteractif + 2, {
            reponse: { value: ((60 + min) * 30).toFixed(2) },
          })
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif + 2,
            KeyboardType.clavierNumbers,
            {
              texteApres: '$\\text{ m}$',
            },
          )

          texte += `<br>${numAlpha(3)} Si le film dure $1${sp()}\\text{h}${sp()}${min}$, combien faut-il de pellicules entières de $600\\text{ m}$ ?`
          handleAnswers(this, indiceInteractif + 3, {
            reponse: { value: Math.floor(((60 + min) * 30) / 600).toFixed(2) },
          })
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif + 3,
            KeyboardType.clavierNumbers,
            { texteApres: ' pellicules entières de $600\\text{ m}$' },
          )

          texte += `<br>${numAlpha(4)} Si la pellicule mesure $${longueur}\\text{ m}$, quelle est la durée de la pellicule ?`
          handleAnswers(this, indiceInteractif + 4, {
            reponse: { value: Math.floor(longueur / 30).toFixed(2) },
          })
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif + 4,
            KeyboardType.clavierNumbers,
            { texteApres: ' minutes' },
          )

          texte += `<br>${numAlpha(5)} Si la pellicule mesure $${longueur}\\text{ m}$, combien d'images y a-t-il sur la pellicule ?`
          handleAnswers(this, indiceInteractif + 5, {
            reponse: {
              value: (Math.floor(longueur / 30) * 60 * 24).toFixed(2),
            },
          })
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif + 5,
            KeyboardType.clavierNumbers,
            { texteApres: ' images' },
          )

          texteCorr += `${numAlpha(0)} $${nombreP}${sp()}\\text{ pellicules} \\times 600${sp()}\\text{m} = ${texNombre(nombreP * 600)}${sp()}\\text{m}$<br>
                        La longueur totale du film est de $${miseEnEvidence(texNombre(nombreP * 600))}$ mètres.<br>
                        ${numAlpha(1)} $30${sp()}\\text{m} \\times 20 = 600${sp()}\\text{m}$ donc une pellicule de $600\\text{ m}$ représente $1${sp()}\\text{min} \\times 20 = 20${sp()}\\text{min}$.<br>
                        $${nombreP}${sp()}\\text{pellicules} \\times 20${sp()}\\text{min} = ${texNombre(nombreP * 20)}${sp()}\\text{min}$<br>
                        La durée totale du film est de $${miseEnEvidence(texNombre(nombreP * 20))}$ minutes.<br>
                        ${numAlpha(2)} $${60 + min}${sp()}\\text{min} \\times 30${sp()}\\text{m}= ${texNombre((60 + min) * 30)}${sp()}\\text{m}$<br>
                        La longueur totale en mètres d'un film de $1${sp()}\\text{h}${sp()}${min}$ est de $${miseEnEvidence(texNombre((60 + min) * 30))}$ mètres.<br>
                        ${numAlpha(3)} $${texNombre(Math.floor(((60 + min) * 30) / 600))} \\times 600${sp()}\\text{m} = ${texNombre(Math.floor(((60 + min) * 30) / 600) * 600)}${sp()}\\text{m}$`
          texteCorr +=
            (60 + min) * 30 - Math.floor(((60 + min) * 30) / 600) * 600 !== 0
              ? ` et $${texNombre(1 + Math.floor(((60 + min) * 30) / 600))} \\times 600${sp()}\\text{m} = ${texNombre((1 + Math.floor(((60 + min) * 30) / 600)) * 600)}${sp()}\\text{m}$.`
              : ''
          texteCorr += `<br>Donc il faut $${miseEnEvidence(texNombre(Math.floor(((60 + min) * 30) / 600)))}$ bobines de $600$ mètres`

          texteCorr +=
            (60 + min) * 30 - Math.floor(((60 + min) * 30) / 600) * 600 !== 0
              ? ` (et $1$ bobine de $${texNombre((60 + min) * 30 - Math.floor(((60 + min) * 30) / 600) * 600)}$ mètres).<br>`
              : '.<br>'
          texteCorr += `${numAlpha(4)} $${texNombre(Math.floor(longueur / 30))} \\times 30${sp()}\\text{m} = ${texNombre(longueur)}\\text{ m}$<br>
                        Donc la durée de la pellicule est de $${miseEnEvidence(texNombre(Math.floor(longueur / 30)))}$ minutes.<br>
                        ${numAlpha(5)} $${texNombre(Math.floor(longueur / 30))} \\times 60 = ${texNombre(Math.floor(longueur / 30) * 60)}$ secondes<br>
                        $${texNombre(Math.floor(longueur / 30) * 60)}${sp()}\\text{secondes} \\times 24${sp()}\\text{images} = ${texNombre(Math.floor(longueur / 30) * 60 * 24)}${sp()}\\text{images}$<br>
                         Il y a $${miseEnEvidence(texNombre(Math.floor(longueur / 30) * 60 * 24))}${sp()}\\text{images}$ dans la pellicule.`

          indiceInteractif += 6

          break
        }
        case 6: {
          const nbBo = randint(2, 5)
          const prixBo = 1 + randint(1, 9) * 0.1 + randint(1, 9) * 0.01
          const nbSch = randint(2, 5, [nbBo])
          const prixSch = 3 + randint(1, 9) * 0.1 + randint(1, 9) * 0.01
          questionParametre = [6, nbBo, prixBo, nbSch, prixSch]
          const prenomAcheteur = prenom()
          texte += `Dans une boulangerie, ${prenomAcheteur} achète $${nbSch}$ sandwichs à $${texNombre(prixSch)}$ € chacun.<br>
                    et $${nbBo}$ boissons à $${texNombre(prixBo, 2)}$ € chacune.<br>
                    ${prenomAcheteur} a un billet de $50$ €, combien va lui rendre le caissier ?`
          handleAnswers(this, indiceInteractif, {
            reponse: {
              value: (50 - (nbBo * prixBo + nbSch * prixSch)).toFixed(2),
            },
          })
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif,
            KeyboardType.clavierNumbers,
            { texteApres: ' €' },
          )

          texteCorr += `$${nbSch} \\times ${texNombre(prixSch, 2)} =${texNombre(nbSch * prixSch, 2)}$<br>
                        Le prix des sandwichs est de $${texPrix(nbSch * prixSch)}$ €.<br>
                        $${nbBo} \\times ${texNombre(prixBo)} =${texNombre(nbBo * prixBo, 2)}$<br>
                        Le prix des boisons est de $${texPrix(nbBo * prixBo)}$ €.<br>
                        $${texNombre(nbBo * prixBo, 2)} + ${texNombre(nbSch * prixSch, 2)} =${texNombre(nbBo * prixBo + nbSch * prixSch, 2)}$<br>
                        Le prix total à payer est $${texPrix(nbBo * prixBo + nbSch * prixSch)}$ €.<br>
                        $50 - (${texNombre(nbBo * prixBo)} + ${texNombre(nbSch * prixSch, 2)}) = ${texNombre(50 - (nbBo * prixBo + nbSch * prixSch), 2)}$<br>
                        Le caissier va rendre la somme de $${miseEnEvidence(texPrix(50 - (nbBo * prixBo + nbSch * prixSch)))}$ €.<br>`

          indiceInteractif++

          break
        }
        case 7: {
          const nbCagettes = randint(2, 5)
          const kgOranges = 5 + randint(2, 5) * 0.1
          const prixOranges = 6 + randint(2, 9) * 0.1 + randint(2, 9) * 0.01
          const prixOrangesKg = 1 + randint(5, 9) * 0.1
          questionParametre = [
            7,
            nbCagettes,
            kgOranges,
            prixOranges,
            prixOrangesKg,
          ]
          texte += `Un commerçant achète $${nbCagettes}$ cagettes d'oranges. Chaque cagette contient <br>
                    $${texNombre(kgOranges)}$ kg d'oranges et coûte $${texPrix(prixOranges)}$ €.<br>
                    Le commerçant revend les oranges $${texPrix(prixOrangesKg)}$ € le kilogramme.<br>
                    Quel est son bénéfice s'il réussit à tout vendre ?`
          handleAnswers(this, indiceInteractif, {
            reponse: {
              value: (
                nbCagettes * kgOranges * prixOrangesKg -
                nbCagettes * prixOranges
              ).toFixed(2),
            },
          })
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif,
            KeyboardType.clavierNumbers,
            { texteApres: ' €' },
          )

          texteCorr += `$${nbCagettes} \\times ${texNombre(kgOranges)} =${texNombre(nbCagettes * kgOranges)}$<br>
                        Il y a $${texNombre(nbCagettes * kgOranges)}$ kg d'oranges.<br>
                        $${texNombre(nbCagettes)} \\times ${texNombre(prixOranges)} =${texNombre(nbCagettes * prixOranges)}$<br>
                        Ce qui lui coûte $${texPrix(nbCagettes * prixOranges)}$ €.<br>
                        $${texNombre(nbCagettes * kgOranges)} \\times ${texNombre(prixOrangesKg)} =${texNombre(nbCagettes * kgOranges * prixOrangesKg)}$<br>
                        S'il revend tout, il va gagner $${texPrix(nbCagettes * kgOranges * prixOrangesKg)}$ €.<br>
                        $${texNombre(nbCagettes * kgOranges * prixOrangesKg)} - ${texNombre(nbCagettes * prixOranges)} = ${texNombre(nbCagettes * kgOranges * prixOrangesKg - nbCagettes * prixOranges)}$<br>
                        Le bénéfice sera alors de $${miseEnEvidence(texPrix(nbCagettes * kgOranges * prixOrangesKg - nbCagettes * prixOranges))}$ €.<br>`

          indiceInteractif++

          break
        }
        case 8: {
          const nbDix = randint(10, 20)
          const nbCinq = randint(10, 20, [nbDix])
          questionParametre = [8, nbDix, nbCinq]
          const prenomFe = prenomF()
          texte += `${prenomFe} a dans sa tirelire uniquement des billets de $5$ € et de $10$ €.<br>
                    Au total, elle a $${texNombre(nbDix + nbCinq)}$ billets qui représentent $${texNombre(nbDix * 10 + nbCinq * 5)}$ €.<br>`
          if (!this.interactif) {
            texte += 'Combien a-t-elle de billets de $5$ € et de $10$ € ?<br>'
          } else {
            texte += 'Combien a-t-elle de billets de $5$ € ?'
            handleAnswers(this, indiceInteractif, {
              reponse: { value: nbCinq.toFixed(2) },
            })
            texte += ajouteChampTexteMathLive(
              this,
              indiceInteractif,
              KeyboardType.clavierNumbers,
              { texteApres: ' billets de $5$ €' },
            )

            texte += '<br>Combien a-t-elle de billets de $10$ € ?'
            handleAnswers(this, indiceInteractif + 1, {
              reponse: { value: nbDix.toFixed(2) },
            })
            texte += ajouteChampTexteMathLive(
              this,
              indiceInteractif + 1,
              KeyboardType.clavierNumbers,
              { texteApres: ' billets de $10$ €' },
            )
          }
          texteCorr += `Après plusieurs essais, on trouve qu'elle a $${miseEnEvidence(nbDix)}$ billets de $10$ € et $${miseEnEvidence(nbCinq)}$ billets de $5$ €.`
          texteCorr += `<br><br>Vérification :<br>
                    Nombre de billets : $${nbDix} \\text{ billets de 10 €} + ${nbCinq} \\text{ billets de 5 €} =${texNombre(nbDix + nbCinq)}${sp()}\\text{billets}$.<br>
                    Somme d'argent : $${nbDix} \\times 10${sp()}\\text{€} + ${nbCinq} \\times 5${sp()}\\text{€} =${texNombre(nbDix * 10 + nbCinq * 5)}${sp()}\\text{€}$.`

          indiceInteractif += 2

          break
        }
        case 9: {
          const nbBarquettesFr = randint(20, 30)
          const gBarquettesFr = 250 * randint(2, 5)
          const prixFr = 7 + randint(2, 5) * 0.1
          const nbBarquettesMy = randint(20, 30, [nbBarquettesFr])
          const gBarquettesMy = 250 * randint(2, 5)
          const prixMy = 8 + randint(2, 5) * 0.1
          const prixFinal =
            nbBarquettesFr * gBarquettesFr * 0.001 * prixFr +
            nbBarquettesMy * gBarquettesMy * 0.001 * prixMy
          questionParametre = [
            9,
            nbBarquettesFr,
            gBarquettesFr,
            prixFr,
            nbBarquettesMy,
            gBarquettesMy,
            prixMy,
            prixFinal,
          ]
          const isEnviron =
            Math.abs(prixFinal * 100 - Math.round(prixFinal * 100)) > 0.001
              ? 'environ'
              : ''
          texte += `Un marchand de fruits vend $${nbBarquettesFr}$ barquettes de $${texNombre(gBarquettesFr)}$ g de fraises des bois à $${texPrix(prixFr)}$ € le kg<br>
                    et $${nbBarquettesMy}$ barquettes de $${texNombre(gBarquettesMy)}$ g de myrtilles des bois à $${texPrix(prixMy)}$ € le kg.<br>
                    Combien d'argent lui rapporte cette vente ?`
          handleAnswers(this, indiceInteractif, {
            reponse: { value: prixFinal.toFixed(2) },
          })
          texte += ajouteChampTexteMathLive(
            this,
            indiceInteractif,
            KeyboardType.clavierNumbers,
            { texteApres: ' €' },
          )

          texteCorr += `$${nbBarquettesFr} \\times ${texNombre(gBarquettesFr)}${sp()}\\text{g} = ${texNombre(nbBarquettesFr * gBarquettesFr)}${sp()}\\text{g}$ de fraises.<br>
                        $${texNombre(nbBarquettesFr * gBarquettesFr)}${sp()}\\text{g} \\div 1${sp()}000 = ${texNombre(nbBarquettesFr * gBarquettesFr * 0.001, 4)} $ kg de fraises.<br>
                        $${texNombre(nbBarquettesFr * gBarquettesFr * 0.001)}${sp()}\\text{kg} \\times ${texNombre(prixFr)}${sp()}\\text{€/kg} =${texNombre(nbBarquettesFr * gBarquettesFr * 0.001 * prixFr)}$ € pour les fraises.<br>
                        $${nbBarquettesMy} \\times ${texNombre(gBarquettesMy)}${sp()}\\text{g} = ${texNombre(nbBarquettesMy * gBarquettesMy)}${sp()}\\text{g}$ de myrtilles.<br>
                        $${texNombre(nbBarquettesMy * gBarquettesMy)}${sp()}\\text{g} \\div 1${sp()}000 = ${texNombre(nbBarquettesMy * gBarquettesMy * 0.001)}${sp()}\\text{kg}$ de myrtilles.<br>
                        $${texNombre(nbBarquettesMy * gBarquettesMy * 0.001)}${sp()}\\text{kg} \\times ${texNombre(prixMy)}${sp()}\\text{€/kg} =${texNombre(nbBarquettesMy * gBarquettesMy * 0.001 * prixMy)}$ € pour les myrtilles.<br>
                        $${texNombre(nbBarquettesFr * gBarquettesFr * 0.001 * prixFr)} + ${texNombre(nbBarquettesMy * gBarquettesMy * 0.001 * prixMy)} = ${texNombre(nbBarquettesFr * gBarquettesFr * 0.001 * prixFr + nbBarquettesMy * gBarquettesMy * 0.001 * prixMy)}$<br>
                        Cette vente va lui rapporter ${isEnviron} $${miseEnEvidence(texPrix(prixFinal))}$ €.<br>`

          indiceInteractif++

          break
        }
        case 10: {
          const nbP = randint(5, 10)
          const nbD = randint(2, nbP - 1)
          const opP = randint(1, 3)
          const opD = randint(1, 3, [opP])
          questionParametre = [10, nbP, nbD, opP, opD]
          texte += `Devinette : je pense à deux nombres entiers.<br>
                    Si j'effectue ${opP === 1 ? 'la somme' : opP === 2 ? 'la différence' : 'le produit'} entre ses deux nombres,
                    alors j'obtiens $${opP === 1 ? texNombre(nbP + nbD) : opP === 2 ? texNombre(nbP - nbD) : texNombre(nbP * nbD)}$.<br>
                    Si j'effectue ${opD === 1 ? 'la somme' : opD === 2 ? 'la différence' : 'le produit'} entre ses deux nombres,
                    alors j'obtiens $${opD === 1 ? texNombre(nbP + nbD) : opD === 2 ? texNombre(nbP - nbD) : texNombre(nbP * nbD)}$.<br>`
          if (!this.interactif) {
            texte += 'Quels sont ces deux nombres ?'
          } else {
            texte += 'Quel est le plus petit de ces deux nombres ?'
            handleAnswers(this, indiceInteractif, {
              reponse: { value: Math.min(nbP, nbD).toFixed(2) },
            })
            texte += ajouteChampTexteMathLive(
              this,
              indiceInteractif,
              KeyboardType.clavierNumbers,
            )

            texte += '<br>Quel est le plus grand de ces deux nombres ?'
            handleAnswers(this, indiceInteractif + 1, {
              reponse: { value: Math.max(nbP, nbD).toFixed(2) },
            })
            texte += ajouteChampTexteMathLive(
              this,
              indiceInteractif + 1,
              KeyboardType.clavierNumbers,
            )
          }

          texteCorr += `Par essais-erreurs, on trouve $${miseEnEvidence(nbP)}$ et $${miseEnEvidence(nbD)}$.<br>
                        Vérification :<br>
                        $${nbP} ${opP === 1 ? '+' : opP === 2 ? '-' : '\\times'} ${nbD} = ${opP === 1 ? texNombre(nbP + nbD) : opP === 2 ? texNombre(nbP - nbD) : texNombre(nbP * nbD)}$<br>
                        $${nbP} ${opD === 1 ? '+' : opD === 2 ? '-' : '\\times'} ${nbD} = ${opD === 1 ? texNombre(nbP + nbD) : opD === 2 ? texNombre(nbP - nbD) : texNombre(nbP * nbD)}$<br>
                        `

          indiceInteractif += 2

          break
        }
      }

      if (this.questionJamaisPosee(i, ...questionParametre)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
