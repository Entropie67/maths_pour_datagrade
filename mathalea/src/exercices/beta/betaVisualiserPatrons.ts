import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

import {
  listeDeBases,
  patronEnS,
  patronEnT,
  patronHasard,
} from '../../modules/PatronsPrismes'

export const titre = 'Visualiser des patrons de prismes'
export const dateDePublication = '13/05/2026'

export const uuid = 'cce0c'
export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}

/**
 * Choisir le bon patron parmi ceux proposés
 * @author Olivier Mimeau
 */

export default class choixPatron extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Type de question entre 1 et 3',
      [
        'Nombres séparés par des tirets  :',
        '0 : melange',
        '1 : Au Hasard',
        '2 : en T',
        '3 : en S',
      ].join('\n'),
    ]
    this.sup = 0
    this.besoinFormulaire2Texte = [
      'Type de base',
      [
        'Nombres séparés par des tirets  :',
        '0 : melange',
        'voir le commentaire',
      ].join('\n'),
    ]
    this.sup2 = 0
    this.besoinFormulaire3Texte = [
      'Options',
      [
        'Nombres séparés par des tirets  :',
        "0 : Pas d'option",
        '1 : Patron en S avec T possible',
        '2 : Patron au Hasard avec T possible',
        '3 : Patron au Hasard avec S possible',
        '4 : Numerotation prédéfinie',
        '5 : Numerotation au hasard',
        '6 : Afficher segment 0',
        '7 : Afficher segment 0 et segment 1',
        '8 : Patron Horizontal',
        '9 : Patron Vertical',
      ].join('\n'),
    ]
    this.sup3 = 0

    this.comment =
      "Numerotation prédéfinie :<br> bases : 1 puis 2 <br> faces latérales à partir de 10 dans l'ordre de construction"
  }

  nouvelleVersion() {
    // context.pixelsParCm = 10
    // xmin: -1, xmax: 6, ymin: -1, scale: 0.4
    this.comment =
      "Numerotation prédéfinie :<br> bases : 1 puis 2 <br> faces latérales à partir de 10 dans l'ordre de construction"
    this.comment +=
      '<br>Types de base :<br>' +
      listeDeBases
        .map(
          (base, index) =>
            `${index + 1}. ${base.description} (${base.nbSommet} sommets)`,
        )
        .join('<br>')

    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 0,
      defaut: 1,
      listeOfCase: ['type1', 'type2', 'type3'],
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeBase = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: listeDeBases.length,
      melange: 0,
      defaut: 0,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    let listeOptions: number[] = []
    if (this.sup3 !== 0 && this.sup3 !== '' && this.sup3 !== '0') {
      listeOptions = gestionnaireFormulaireTexte({
        saisie: this.sup3,
        min: 1,
        max: 9,
        melange: 0,
        defaut: 5,
        nbQuestions: 0,
      }).map(Number)
    }

    const enTavecS = listeOptions.indexOf(1) > -1
    const hasardavecT = listeOptions.indexOf(2) > -1
    const hasardavecS = listeOptions.indexOf(3) > -1
    const numStandard = listeOptions.indexOf(4) > -1
    const numHasard = listeOptions.indexOf(5) > -1
    const numerotation = numStandard
      ? 'standard'
      : numHasard
        ? 'hasard'
        : 'sans'
    const affSeg0 = listeOptions.indexOf(6) > -1
    const affSeg1 = listeOptions.indexOf(7) > -1
    const afficheSegment = affSeg0 ? (affSeg1 ? 'seg0seg1' : 'seg0') : 'sans'
    const patronHoriz = listeOptions.indexOf(8) > -1
    const patronVert = listeOptions.indexOf(9) > -1
    const patronHorizVert = patronHoriz
      ? 'horizontal'
      : patronVert
        ? 'vertical'
        : 'sansOrientation'

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ``
      let texteCorr = ''
      // texte += `listeOptions : ${listeOptions}<br>`
      // texte += `orientation : ${patronHorizVert}<br>`

      const hauteurPrisme = 4 // randint(2, 5)
      const angleDepart = 0
      // let nbSommetBase = 3
      // let listeCotesBase = [2, 3]
      // let listeAnglesBase = [60]

      const laDefBase = listeDeBases[listeTypeDeBase[i] - 1]
      const nbSommetBase = laDefBase.nbSommet
      const listeCotesBase = laDefBase.listeCotes
      const listeAnglesBase = laDefBase.listeAngles

      switch (listeTypeQuestions[i]) {
        case 'type2':
          {
            texte += 'patronEnT<br>'
            const base1 = patronEnT(
              nbSommetBase,
              hauteurPrisme,
              listeCotesBase,
              listeAnglesBase,
              {
                angleDeDepart: angleDepart,
                horizontal: patronHorizVert,
                tNumerotation: numerotation,
              },
            )
            texte += base1.dessinerObjet(numerotation, afficheSegment)
            texteCorr = `Correction $${i + 1}$ de type $2$`
          }

          break

        case 'type1':
          {
            texte += 'patronHasard<br>'
            const base1 = patronHasard(
              nbSommetBase,
              hauteurPrisme,
              listeCotesBase,
              listeAnglesBase,
              {
                angleDeDepart: angleDepart,
                enT: hasardavecT,
                enS: hasardavecS,
                horizontal: patronHorizVert,
                tNumerotation: numerotation,
              },
            )
            /* texte += '<br>parcours complet Type 1: <br>'
            texte += base1.parcoursCompletNonRedondant() */
            texte += base1.dessinerObjet(numerotation, afficheSegment)
            texteCorr = `Correction $${i + 1}$ de type $1$`
          }

          break
        case 'type3':
          {
            texte += 'patronEnS<br>'
            const base1 = patronEnS(
              nbSommetBase,
              hauteurPrisme,
              listeCotesBase,
              listeAnglesBase,
              {
                angleDeDepart: angleDepart,
                enT: enTavecS,
                horizontal: patronHorizVert,
                tNumerotation: numerotation,
              },
            )

            texte += base1.dessinerObjet(numerotation, afficheSegment)
            texteCorr = `Correction $${i + 1}$ de type $3$`
          }

          break
      }

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr ?? ''
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
