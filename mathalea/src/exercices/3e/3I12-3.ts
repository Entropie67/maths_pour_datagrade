import { amcConvert } from '../../lib/amc/amcBuilders'
import { lampeMessage } from '../../lib/format/message'
import {
  choice,
  compteOccurences,
  enleveDoublonNum,
} from '../../lib/outils/arrayOutils'
import { range1 } from '../../lib/outils/nombres'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import {
  contraindreValeur,
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import { scratchblock } from '../../modules/scratchblock'
import Exercice from '../Exercice'

export const titre = 'Compléter un script Scratch - 2'
export const amcReady = true
export const amcType = 'AMCOpen'

export const dateDePublication = '22/09/2022'
export const dateDeModifImportante = '08/05/2023' // par EE : Le nb de questions peut être supérieur à 1.

/**
 * Compléter un script sur les multiples et diviseurs
 * @author Éric Elter
 */
export const uuid = '52c97'

export const refs = {
  'fr-fr': ['3I12-3'],
  'fr-ch': [],
}
export default class CompleterScriptDiviseurs extends Exercice {
  constructor() {
    super()
    // Déclaré explicitement pour le contrôle des corrections minimales : script Scratch à compléter : pas de réponse courte.
    this.reponseCourteDisponible = false
    this.besoinFormulaireTexte = [
      'Brique(s) à trouver',
      'Nombres séparés par des tirets :\n1 : Ligne 2 (variable)\n2 : Ligne 2 (nombre)\n3 : Ligne 4\n4 : Ligne 5 (réponse)\n5 : Ligne 5 (variable)\n6 : Ligne 5 (nombre)\n7 : Ligne 6 (variable et réponse)\n8 : Ligne 6 (mot(s))\n9 : Ligne 7 (nombre)\n10 : Ligne 7 (variable)\n11 : Tous ces choix',
    ]
    // 'Choix entre 1 et 10. Si ce choix est inférieur au nombre de briques à trouver, alors les briques seront choisies aléatoirement parmi celles à trouver. Si ce choix est supérieur au nombre de briques à trouver, alors les briques à trouver seront complétées par des briques choisies aléatoirement parmi les restantes.'
    this.besoinFormulaire2Numerique = ['Nombre de briques à trouver', 10]
    this.besoinFormulaire3Texte = [
      'Choix sur la brique intiale',
      'Nombres séparés par des tirets :\n1 : La brique initiale est un clic sur drapeau vert.\n2 : La brique initiale est un clic sur lutin.\n3 : La brique initiale est un appui sur touche imposée\n4 : La brique initiale est un appui sur touche non imposée\n5 : Une des possiblités précédentes choisie au hasard',
    ]
    this.besoinFormulaire4Texte = [
      'Choix sur une des phrases finales',
      'Nombres séparés par des tirets :\n1 : Une phrase finale contient : ... est un multiple de ...\n2 : Une phrase finale contient : ... divise ...\n3 : Une phrase finale contient : ... est un diviseur de ...\n4 : Une des possiblités précédentes choisie au hasard',
    ]
    this.sup = 11
    this.sup2 = 3
    this.sup3 = 5
    this.sup4 = 4
    this.spacing = 2
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    this.introduction = lampeMessage({
      titre: context.isHtml
        ? `${scratchblock('\\begin{scratch}[print,fill,blocks,scale=0.5]\n\\ovaloperator{\\ovalnum{ } modulo \\ovalnum{ }}\\end{scratch}')}`
        : 'Information',
      texte:
        (context.isHtml
          ? ''
          : '$\\setscratch{print}\\ovaloperator{\\ovalnum{ } modulo \\ovalnum{ }}$<br>') +
        'Cette brique donne le reste de la division euclidienne du nombre de gauche par le nombre de droite.',
      couleur: 'nombres',
    })

    const nbBriquesATrouver = contraindreValeur(
      1,
      10,
      this.sup2,
      randint(1, 10),
    )
    this.consigne = 'Compléter '
    this.consigne +=
      nbBriquesATrouver > 1 ? 'les briques manquantes.' : 'la brique manquante.'
    /*
    let briquesATrouver = []
    if (!this.sup) { // Si aucune liste n'est saisie
      briquesATrouver = shuffle(range1(10)).slice(0, nbBriquesATrouver)
    } else {
      if (typeof (this.sup) === 'number') {
        this.sup = contraindreValeur(1, 10, this.sup, 10)
        briquesATrouver = [this.sup]
        for (let i = 1; i < nbBriquesATrouver; i++) {
          briquesATrouver.push(randint(1, 10, briquesATrouver))
        }
      } else {
        briquesATrouver = this.sup.split('-')// Sinon on créé un tableau à partir des valeurs séparées par des -
        for (let i = 0; i < briquesATrouver.length; i++) { // on a un tableau avec des strings : ['1', '1', '2']
          briquesATrouver[i] = contraindreValeur(1, 10, parseInt(briquesATrouver[i]), randint(1, 10))
        }
        briquesATrouver = enleveDoublonNum(briquesATrouver)
        if (nbBriquesATrouver > briquesATrouver.length) {
          for (let i = briquesATrouver.length; i < nbBriquesATrouver; i++) {
            briquesATrouver.push(randint(1, 10, briquesATrouver))
          }
        } else if (nbBriquesATrouver < briquesATrouver.length) {
          briquesATrouver = shuffle(briquesATrouver).slice(0, nbBriquesATrouver)
        }
      }
    }
    */

    let briquesATrouver = gestionnaireFormulaireTexte({
      max: 10,
      defaut: 11,
      melange: 11,
      nbQuestions: 0,
      saisie: this.sup,
    }).map(Number)

    briquesATrouver.push(...range1(10))
    briquesATrouver = enleveDoublonNum(briquesATrouver).slice(
      0,
      nbBriquesATrouver,
    )

    const choixLigne2a = compteOccurences(briquesATrouver, 1) > 0
    const choixLigne2b = compteOccurences(briquesATrouver, 2) > 0
    const choixLigne4 = compteOccurences(briquesATrouver, 3) > 0
    const choixLigne5a = compteOccurences(briquesATrouver, 4) > 0
    const choixLigne5b = compteOccurences(briquesATrouver, 5) > 0
    const choixLigne5c = compteOccurences(briquesATrouver, 6) > 0
    const choixLigne6Extremes = compteOccurences(briquesATrouver, 7) > 0
    const choixLigne6Centre = compteOccurences(briquesATrouver, 8) > 0
    const choixLigne7a = compteOccurences(briquesATrouver, 9) > 0
    const choixLigne7b = compteOccurences(briquesATrouver, 10) > 0

    /*
    let optionsBriques = []
    if (!this.sup3) { // Si aucune liste n'est saisie
      optionsBriques = [randint(1, 4)]
    } else {
      if (typeof (this.sup3) === 'number') {
        this.sup3 = contraindreValeur(1, 5, this.sup3, 5)
        optionsBriques = [this.sup3 === 5 ? randint(1, 4) : this.sup3]
      } else {
        optionsBriques = this.sup3.split('-')// Sinon on créé un tableau à partir des valeurs séparées par des -
        for (let i = 0; i < optionsBriques.length; i++) { // on a un tableau avec des strings : ['1', '1', '2']
          optionsBriques[i] = contraindreValeur(1, 5, parseInt(optionsBriques[i]), 5)
        }
        if (compteOccurences(optionsBriques, 5) > 0) optionsBriques = [randint(1, 4)]
        else optionsBriques = combinaisonListes(optionsBriques, optionsBriques.length)
      }
    }
    const briqueInitiale = optionsBriques[0]
    */

    const briqueInitiale = gestionnaireFormulaireTexte({
      max: 4,
      defaut: 5,
      melange: 5,
      nbQuestions: this.nbQuestions,
      saisie: this.sup2,
    })

    /*
    optionsBriques = []
    if (!this.sup4) { // Si aucune liste n'est saisie
      optionsBriques = [randint(1, 3)]
    } else {
      if (typeof (this.sup4) === 'number') {
        this.sup4 = contraindreValeur(1, 4, this.sup4, 4)
        optionsBriques = [this.sup4 === 4 ? randint(1, 3) : this.sup4]
      } else {
        optionsBriques = this.sup4.split('-')// Sinon on créé un tableau à partir des valeurs séparées par des -
        for (let i = 0; i < optionsBriques.length; i++) { // on a un tableau avec des strings : ['1', '1', '2']
          optionsBriques[i] = contraindreValeur(1, 4, parseInt(optionsBriques[i]), 4)
        }
        if (compteOccurences(optionsBriques, 4) > 0) optionsBriques = [randint(1, 3)]
        else optionsBriques = combinaisonListes(optionsBriques, optionsBriques.length)
      }
    }
    const choixScript = optionsBriques[0]
    */

    const choixScript = gestionnaireFormulaireTexte({
      max: 3,
      defaut: 4,
      melange: 4,
      nbQuestions: this.nbQuestions,
      saisie: this.sup3,
    })

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      const tableauTouches = []
      for (let i = 1; i < 27; i++)
        tableauTouches.push(String.fromCharCode(64 + i).toLowerCase())
      for (let i = 0; i < 10; i++) tableauTouches.push(i)
      tableauTouches.push('espace')
      tableauTouches.push('flèche haut')
      tableauTouches.push('flèche bas')
      tableauTouches.push('flèche droite')
      tableauTouches.push('flèche gauche')
      const touchePressee = choice(tableauTouches)

      const nb1 = randint(1, 26, [23, 9, 15, 17]) // Pour éviter I,O,Q et W
      const var1 = lettreDepuisChiffre(nb1)
      let texteScratch = '\\begin{scratch}[print,fill,blocks,scale=1]\n'
      switch (briqueInitiale[i]) {
        case 1:
          texteScratch += '\\blockinit{quand \\greenflag est cliqué}\n'
          break
        case 2:
          texteScratch += '\\blockinit{quand ce sprite est cliqué}\n'
          break
        case 3:
          texteScratch += `\\blockinit{quand la touche \\selectmenu{${touchePressee}} est pressée}\n`
          break
        case 4:
          texteScratch +=
            "\\blockinit{quand la touche \\selectmenu{n'importe laquelle} est pressée}\n"
          break
      }
      const texteSansTrou = [texteScratch]
      texteSansTrou.push(
        `\\blockvariable{mettre \\selectmenu{${var1}} à \\ovalnum{1}}\n`,
      )
      texteScratch += `\\blockvariable{mettre \\selectmenu{${choixLigne2a ? ' ................ ' : var1}} à ${choixLigne2b ? '\\ovalnum{ ................ }' : '\\ovalnum{1}'}}\n`

      texteSansTrou.push(
        '\\blockmove{demander \\ovalnum{Donne-moi un nombre entier.} et attendre}\n',
      )
      texteScratch += texteSansTrou[2]

      texteSansTrou.push(
        '\\blockrepeat{répéter \\ovalsensing{réponse} fois}\n{\n',
      )
      texteScratch += choixLigne4
        ? '\\blockrepeat{répéter \\ovalnum{ ................ } fois}\n{\n'
        : texteSansTrou[3]

      texteSansTrou.push(
        `\\blockif{si \\booloperator{\\ovaloperator{\\ovalsensing{réponse} modulo \\ovalmove{${var1}}} = \\ovalnum{0}} alors}\n`,
      )

      texteScratch += '\\blockif{si \\booloperator{\\ovaloperator{'
      texteScratch += choixLigne5a
        ? '\\ovalnum{ ................ }'
        : '\\ovalsensing{réponse}'
      texteScratch += ' modulo '
      texteScratch += choixLigne5b
        ? '\\ovalnum{ ................ }'
        : `\\ovalmove{${var1}}`
      texteScratch += '} = '
      texteScratch += choixLigne5c
        ? '\\ovalnum{ ................ }}'
        : '\\ovalnum{0}}'
      texteScratch += ' alors}\n'

      switch (choixScript[i]) {
        case 1: // .... est un multiple de ....
          texteSansTrou.push(
            `{\\blocklook{dire \\ovaloperator{regrouper \\ovaloperator{regrouper \\ovalsensing{réponse} et \\ovaloperator{regrouper \\ovalnum{ est un multiple de } et \\ovalmove{${var1}}}} et \\ovalnum{.}} pendant \\ovalnum{0.5} secondes}\n}\n`,
          )
          texteScratch += `{\\blocklook{dire \\ovaloperator{regrouper \\ovaloperator{regrouper ${choixLigne6Extremes ? '\\ovalnum{ ................ }' : '\\ovalsensing{réponse}'} et \\ovaloperator{regrouper \\ovalnum{${choixLigne6Centre ? ' ................ ' : ' est un multiple de '}} et ${choixLigne6Extremes ? '\\ovalnum{ ................ }' : '\\ovalmove{' + var1 + '}'}}} et \\ovalnum{.}} pendant \\ovalnum{0.5} secondes}\n}\n`
          break
        case 2: // .... divise ....
          texteSansTrou.push(
            `{\\blocklook{dire \\ovaloperator{regrouper \\ovaloperator{regrouper \\ovalmove{${var1}} et \\ovaloperator{regrouper \\ovalnum{ divise } et \\ovalsensing{réponse}}} et \\ovalnum{.}} pendant \\ovalnum{0.5} secondes}\n}\n`,
          )
          texteScratch += `{\\blocklook{dire \\ovaloperator{regrouper \\ovaloperator{regrouper ${choixLigne6Extremes ? '\\ovalnum{ ................ }' : '\\ovalmove{' + var1 + '}'} et \\ovaloperator{regrouper \\ovalnum{${choixLigne6Centre ? ' ................ ' : ' divise '}} et ${choixLigne6Extremes ? '\\ovalnum{ ................ }' : '\\ovalsensing{réponse}'}}} et \\ovalnum{.}} pendant \\ovalnum{0.5} secondes}\n}\n`
          break
        case 3: // .... est un diviseur de  ....
          texteSansTrou.push(
            `{\\blocklook{dire \\ovaloperator{regrouper \\ovaloperator{regrouper \\ovalmove{${var1}} et \\ovaloperator{regrouper \\ovalnum{ est un diviseur de } et \\ovalsensing{réponse}}} et \\ovalnum{.}} pendant \\ovalnum{0.5} secondes}\n}\n`,
          )
          texteScratch += `{\\blocklook{dire \\ovaloperator{regrouper \\ovaloperator{regrouper ${choixLigne6Extremes ? '\\ovalnum{ ................ }' : '\\ovalmove{' + var1 + '}'} et \\ovaloperator{regrouper \\ovalnum{${choixLigne6Centre ? ' ................ ' : ' est un diviseur de '}} et ${choixLigne6Extremes ? '\\ovalnum{ ................ }' : '\\ovalsensing{réponse}'}}} et \\ovalnum{.}} pendant \\ovalnum{0.5} secondes}\n}\n`
          break
      }
      texteSansTrou.push(
        `\\blockvariable{ajouter \\ovalnum{1} à \\selectmenu{${var1}}}\n`,
      )
      texteScratch += `\\blockvariable{ajouter ${choixLigne7a ? '\\ovalnum{ ................ }' : '\\ovalnum{1}'} à \\selectmenu{${choixLigne7b ? ' ................ ' : var1}}}\n`

      texteSansTrou.push('}\n\\end{scratch}')

      texteScratch += texteSansTrou[7]

      const texteScratchSuivantContexte = scratchblock(texteScratch)
      texte =
        typeof texteScratchSuivantContexte === 'string'
          ? texteScratchSuivantContexte
          : 'problème avec texteScratch'

      const texteSansTrouSuivantContexte = scratchblock(texteSansTrou.join(''))
      texteCorr =
        typeof texteSansTrouSuivantContexte === 'string'
          ? texteSansTrouSuivantContexte
          : 'problème avec texteCorr'

      if (context.isAmc) {
        this.autoCorrectionAMC = [
          {
            enonce: this.consigne + '<br>' + texte + '<br>',
            propositions: [{ statut: 3, sanscadre: true }],
          },
        ]
        this.questionsAMC = this.autoCorrectionAMC.map((questionAMC) =>
          amcConvert(questionAMC),
        )
      }

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    this.nbQuestions = this.listeQuestions.length
    listeQuestionsToContenu(this)
  }
}
