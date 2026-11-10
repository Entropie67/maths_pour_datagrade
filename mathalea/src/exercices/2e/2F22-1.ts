import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Déterminer l'image d'un nombre par une fonction de référence"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '18/01/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
// export const dateDeModifImportante = '24/10/2021' // Une date de modification importante au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 *
 * @author Degrange Mathieu
 *
 */
export const dateDeModifImportante = '31/10/2026'
export const uuid = 'b6cc0'

export const refs = {
  'fr-fr': ['2F22-1'],
  'fr-ch': ['11LCFA2F-1', '11LSFA2F-1'],
}

type FonctionReference =
  'carré' | 'cube' | 'racine carrée' | 'inverse' | 'valeur absolue'

export default class ImageFonctionsRefs extends Exercice {
  can: boolean
  protected typeQuestionFixe?: FonctionReference
  constructor() {
    super()

    this.nbQuestions = 3

    this.besoinFormulaireCaseACocher = ['Fonction carré (programme 2026)']
    this.besoinFormulaire2CaseACocher = ['Fonction inverse (programme 2026)']
    this.besoinFormulaire3CaseACocher = [
      'Fonction valeur absolue (programme 2026)',
    ]
    this.besoinFormulaire4CaseACocher = ['Fonction cube (année de transition)']
    this.besoinFormulaire5CaseACocher = [
      'Fonction racine carrée (année de transition)',
    ]
    this.sup = true
    this.sup2 = true
    this.sup3 = true
    this.sup4 = false
    this.sup5 = false
    this.can = false // course aux nombres, si true les calculs pourront être fait de tête

    this.nbCols = 1
    this.nbColsCorr = 1
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles: FonctionReference[] = []
    if (this.typeQuestionFixe !== undefined) {
      typeQuestionsDisponibles.push(this.typeQuestionFixe)
    } else {
      if (this.sup) typeQuestionsDisponibles.push('carré')
      if (this.sup2) typeQuestionsDisponibles.push('inverse')
      if (this.sup3) typeQuestionsDisponibles.push('valeur absolue')
      if (this.sup4) typeQuestionsDisponibles.push('cube')
      if (this.sup5) typeQuestionsDisponibles.push('racine carrée')
    }

    if (typeQuestionsDisponibles.length === 0) {
      typeQuestionsDisponibles.push('carré')
    }

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )

    const listeTypeQuestionsDansLOrdre = typeQuestionsDisponibles.filter((x) =>
      listeTypeQuestions.includes(x),
    )
    // Il y a jusqu'à 5 fonctions de référence : il faut autant de noms.
    const nomsFonctions = ['f', 'g', 'h', 'i', 'j']

    this.consigne =
      (typeQuestionsDisponibles.length >= 2 ? 'Soient ' : 'Soit ') +
      listeTypeQuestionsDansLOrdre
        .map((x, i) => '$' + nomsFonctions[i] + '$ la fonction ' + x)
        .join(', ')
        .replace(/,([^,]*$)/, ' et$1') +
      '.'

    const listePhrases = combinaisonListes([0, 1], this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const nom =
        nomsFonctions[
          listeTypeQuestionsDansLOrdre.indexOf(listeTypeQuestions[i])
        ]
      let nombre: number
      let solution: FractionEtendue
      let calcul: number
      switch (listeTypeQuestions[i]) {
        case 'carré':
          nombre = randint(-10, 10, [0, 1])
          calcul = nombre * nombre
          solution = new FractionEtendue(calcul, 1)
          texteCorr = `$${nom}(${nombre}) = ${ecritureParentheseSiNegatif(nombre)}^2 = ${ecritureParentheseSiNegatif(nombre)} \\times ${ecritureParentheseSiNegatif(nombre)} = ${miseEnEvidence(texNombre(nombre * nombre, 0))}$`
          break
        case 'cube':
          nombre = randint(-5, 5, [0, 1])
          calcul = nombre * nombre * nombre
          solution = new FractionEtendue(calcul, 1)
          texteCorr = `$${nom}(${nombre}) = ${ecritureParentheseSiNegatif(nombre)}^3 = ${ecritureParentheseSiNegatif(nombre)} \\times ${ecritureParentheseSiNegatif(nombre)} \\times ${ecritureParentheseSiNegatif(nombre)} = ${ecritureParentheseSiNegatif(nombre * nombre)} \\times ${ecritureParentheseSiNegatif(nombre)} = ${miseEnEvidence(texNombre(nombre ** 3, 0))}$`
          break
        case 'racine carrée':
          calcul = randint(1, 10)
          solution = new FractionEtendue(calcul, 1)
          nombre = calcul * calcul
          texteCorr = `$${nom}(${nombre}) = ${miseEnEvidence(`\\sqrt{${nombre}}`)} = ${miseEnEvidence(solution.texFraction)} $ car $ ${ecritureParentheseSiNegatif(solution.valeurDecimale)}^2 = ${texNombre(nombre, 0)}$.`
          break
        case 'valeur absolue':
          nombre = randint(-10, 10, [0, 1])
          calcul = Math.abs(nombre)
          solution = new FractionEtendue(calcul, 1)
          texteCorr = `$${nom}(${nombre})=|${nombre}|=${miseEnEvidence(texNombre(calcul, 0))}$`
          break
        case 'inverse':
        default:
          if (this.can) {
            nombre = choice([2, 4, 5, 10])
          } else {
            const expo1 = randint(0, 5)
            nombre = this.can
              ? choice([2, 4, 5, 10])
              : Math.pow(2, expo1) *
                Math.pow(5, expo1 === 0 ? randint(1, 5) : randint(0, 5))
          }
          if (Math.random() < 0.25) nombre = arrondi(1 / nombre, 6)
          if (Math.random() < 0.5) nombre *= -1
          solution = new FractionEtendue(1, nombre)
          texteCorr = `$${nom}(${texNombre(nombre, 6)}) = ${miseEnEvidence(texFractionFromString(1, nombre))} = ${miseEnEvidence(texNombre(solution.valeurDecimale))}$`
          break
      }
      const phrase = listePhrases[i]
        ? `$${nom}(${texNombre(nombre, 6)})$`
        : `l'image de $${texNombre(nombre, 6)}$ par la fonction $${nom}$`
      if (listePhrases[i])
        texteCorr += `<br>L'image de $${texNombre(nombre, 6)}$ par la fonction $${nom}$ est donc $${miseEnEvidence(solution.texFractionSimplifiee)}$.`
      texte = `Calculer ${phrase}.`
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecFraction,
      )

      // Si la question n'a jamais été posée, on l'enregistre
      if (this.questionJamaisPosee(i, listeTypeQuestions[i], nombre)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        handleAnswers(this, i, {
          reponse: { value: solution.texFraction },
        })
        i++
      }
      cpt++
    }
    // Conserver une numérotation LaTeX, même lorsqu'une version ne contient
    // qu'une question.
    listeQuestionsToContenu(this, true)
    if (this.can) {
      // Course aux nombres : une seule question, dont l'énoncé doit reprendre
      // la consigne (« Soit f la fonction carré. »), sinon le sens de f/g/h
      // disparaît de la colonne « Énoncé ». Cette classe étend Exercice (pas
      // ExerciceSimple) : listeCanEnonces/listeCanReponsesACompleter, lues
      // par le pipeline « course aux nombres », doivent être remplies à la
      // main (ExerciceSimple le ferait automatiquement, pas Exercice).
      this.canEnonce = `${this.consigne}<br>${this.listeQuestions[0]}`
      this.canReponseACompleter = '$\\ldots$'
      this.listeCanEnonces[0] = this.canEnonce
      this.listeCanReponsesACompleter[0] = this.canReponseACompleter
      this.correction = this.listeCorrections[0]
    }
  }
}
