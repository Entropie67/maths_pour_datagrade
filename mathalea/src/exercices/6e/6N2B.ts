import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '23/10/2024'

export const interactifReady = true

export const titre =
  'Multiplier par $0{,}1$ ; $0{,}01$ ; $0{,}001$ (compléter avec le nombre qui convient)'

/**
 * @author Ali BEN YOUSSEF
 * Relecture : Coach Jean Claude LHOTE
 */
export const uuid = '5df6e'
export const refs = {
  'fr-fr': ['6N2B'],
  'fr-2016': ['6C30-5b'],
  'fr-ch': ['9R1NO6G-1', '9R2NO6G-1', '9R3NO6G-1'],
}
export default class MultiplierPar001Bis extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4 // Ici le nombre de questions

    this.consigne = 'Compléter les pointillés.'
    this.correctionDetailleeDisponible = true

    this.sup = false
    this.sup2 = 4
    this.besoinFormulaireCaseACocher = ['Nombres entiers', true]
    this.besoinFormulaire2Texte = [
      'Type de questions',
      'Nombres séparés par des tirets :\n1 : Nombre à retrouver\n2 : 0,1 ou 0,01 ou 0,001 à retrouver\n3 : Résultat à retrouver\n4 : Mélange',
    ]
  }

  // c'est ici que commence le code de l'exercice cette fonction crée une copie de l'exercice
  nouvelleVersion() {
    // la variable numeroExercice peut être récupérée pour permettre de différentier deux copies d'un même exo
    // Par exemple, pour être certain de ne pas avoir les mêmes noms de points en appelant 2 fois cet exo dans la même page

    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })

    const rang = ['millièmes', 'centièmes', 'dixièmes']
    const coefficient = shuffle([-1, -2, -3])
    for (
      let i = 0,
        texte: string,
        texteCorr: string,
        coef: number,
        nombre,
        nombreentier,
        resultat,
        exposant,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = '' // Nous utilisons souvent cette variable pour construire le texte de la question.
      texteCorr = '' // Idem pour le texte de la correction.
      coef = coefficient.pop()!
      if (coefficient.length === 0) coefficient.push(...shuffle([-1, -2, -3]))
      if (!this.sup) {
        exposant = -randint(1, 3)
      } else {
        exposant = 0
      }
      nombreentier = randint(10, 1000) + randint(10, 999) * choice([0, 1000])
      nombre = nombreentier * 10 ** exposant
      resultat = nombre * 10 ** coef
      let reponse: string = ''
      switch (
        listeTypeDeQuestions[i] // Chaque question peut être d'un type différent, ici 3 cas sont prévus...
      ) {
        case 1:
          texte = remplisLesBlancs(
            this,
            i,
            `%{champ1} \\times ${texNombre(10 ** coef)}${sp(2)}=${sp(2)}${texNombre(resultat)}`,
            KeyboardType.numbersSpace,
          )
          if (this.correctionDetaillee) {
            texteCorr = `Quand on multiplie par $${texNombre(10 ** coef)}=${texFractionFromString(1, 10 ** -coef)}$, chaque chiffre prend une valeur $${texNombre(10 ** -coef)}$ fois plus petite.<br>`
            texteCorr += `Le chiffre des unités se positionne donc dans les ${rang[3 + coef]}${sp()}:<br>`
          }
          texteCorr += `$${miseEnEvidence(texNombre(nombre))} \\times ${texNombre(10 ** coef)}${sp(2)}=${sp(2)}${texNombre(resultat)}$`
          reponse = texNombre(nombre, 6)
          break
        case 3:
          texte = remplisLesBlancs(
            this,
            i,
            `${texNombre(nombre)} \\times ${texNombre(10 ** coef)}${sp(2)}=%{champ1}`,
            KeyboardType.numbersSpace,
          )
          if (this.correctionDetaillee) {
            texteCorr = `Quand on multiplie par $${texNombre(10 ** coef)}=${texFractionFromString(1, 10 ** -coef)}$, chaque chiffre prend une valeur $${texNombre(10 ** -coef)}$ fois plus petite.<br>`
            texteCorr += `Le chiffre des unités se positionne donc dans les ${rang[3 + coef]}${sp()}:<br>`
          }
          texteCorr += `$${texNombre(nombre)} \\times ${texNombre(10 ** coef)}${sp(2)}=${sp(2)}${miseEnEvidence(texNombre(resultat))}$`
          reponse = texNombre(resultat, 6)
          break
        case 2:
          texte = remplisLesBlancs(
            this,
            i,
            `${texNombre(nombre)} \\times %{champ1}${sp(2)}=${sp(2)}${texNombre(resultat)}`,
            KeyboardType.numbersSpace,
          )
          if (this.correctionDetaillee) {
            texteCorr = `Quand on multiplie par $${texNombre(10 ** coef)}=${texFractionFromString(1, 10 ** -coef)}$, chaque chiffre prend une valeur $${texNombre(10 ** -coef)}$ fois plus petite.<br>`
            texteCorr += `Le chiffre des unités se positionne donc dans les ${rang[3 + coef]}${sp()}:<br>`
          }
          texteCorr += `$${texNombre(nombre)} \\times ${miseEnEvidence(texNombre(10 ** coef))}${sp(2)}=${sp(2)}${texNombre(resultat)}$`
          reponse = texNombre(10 ** coef, 6)
          break
      }

      if (this.questionJamaisPosee(i, nombre, coef)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        // Si la question n'a jamais été posée, on la stocke dans la liste des questions
        handleAnswers(this, i, { champ1: { value: reponse } })
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
  }
}
