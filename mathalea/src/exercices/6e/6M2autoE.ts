import { bleuMathalea } from '../../lib/colors'
import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  ajouteChampTexteMathLive,
  remplisLesBlancs,
} from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const titre =
  'Convertir $1\\text{ m}^2$ en $\\text{dm}^2$ ou $1\\text{ dm}^2$ en $\\text{cm}^2$ et inversement'
export const dateDePublication = '30/07/2025'

/**
 *
 * @author Éric Elter
 */
export const uuid = 'a6e80'
export const refs = {
  'fr-fr': ['6M2autoE', '6AutoA2-1'],
  'fr-2016': ['6M23-2'],
  'fr-ch': ['9R1GM4C-4', '9R2GM4C-4', '9R3GM4C-4', 'PRQMG04B-8'],
}

export default class ConvertirM2EnDm2 extends Exercice {
  constructor() {
    super()
    this.consigne = 'Compléter.'
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Type de conversions',
      [
        'Nombres séparés par des tirets :',
        '1 : Du m² au dm²',
        '2 : Du dm² au m²',
        '3 : Du dm² au cm²',
        '4 : Du cm² au dm²',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      'Type de question',
      `Nombres séparés par des tirets :
    1 : Phrase
    2 : Quotient (si possible)
    3 : Quotient ou Décimal
    4 : Mélange`,
    ]
    this.sup = 5
    this.sup2 = 4
  }

  nouvelleVersion() {
    let listeConversions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: 4,
    }).map(Number)
    listeConversions = combinaisonListes(listeConversions, 50)

    let listeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: 3,
    }).map(Number)
    listeQuestionsDisponibles = combinaisonListes(listeQuestionsDisponibles, 50)

    const tableauDesPossibilites: [[number, number], number][] = [
      [[1, 1], 1],
      [[1, 2], 2],
      [[1, 3], 2], // identique à [1,2]
      [[2, 1], 3],
      [[2, 2], 4],
      [[2, 3], 5],
      [[3, 1], 6],
      [[3, 2], 7],
      [[3, 3], 7], // identique à [3,2]
      [[4, 1], 8],
      [[4, 2], 9],
      [[4, 3], 10],
    ]

    const choixListeDeroulante = [
      { label: 'un millier', value: 'un millier' },
      { label: 'une centaine', value: 'une centaine' },
      { label: 'une dizaine', value: 'une dizaine' },
      { label: 'un dixième', value: 'un dixième' },
      { label: 'un centième', value: 'un centième' },
      { label: 'un millième', value: 'un millième' },
    ]
    const pairesMetriques: string[][] = [
      ['\\text{m}', '\\text{dm}'],
      ['\\text{dm}', '\\text{m}'],
      ['\\text{dm}', '\\text{cm}'],
      ['\\text{cm}', '\\text{dm}'],
    ]
    const rapport = [
      new FractionEtendue(1, 100).texFraction,
      '100',
      texNombre(0.01),
    ]
    let compteurAleatoire = 0
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const element = [listeConversions[cpt], listeQuestionsDisponibles[cpt]]
      const index = tableauDesPossibilites.findIndex(
        ([coords, _]) => coords[0] === element[0] && coords[1] === element[1],
      )
      if (index !== -1) {
        compteurAleatoire = tableauDesPossibilites[index][1]
      }

      let reponse = ''
      if (this.questionJamaisPosee(i, compteurAleatoire)) {
        // Si la question n'a jamais été posée, on en créé une autre
        if (index !== -1) {
          tableauDesPossibilites.splice(index, 1)
        }

        const texteInitial = `$1~${pairesMetriques[listeConversions[cpt] - 1][0]}^2 $`
        let texte = texteInitial
        let texteCorr = ''
        switch (listeQuestionsDisponibles[cpt]) {
          case 1:
            texte += ' est égal à '
            texteCorr = texte
            texte += this.interactif
              ? choixDeroulant(this, i, { choices: choixListeDeroulante })
              : '$\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots\\ldots$ '
            texte += `de $1~${pairesMetriques[listeConversions[cpt] - 1][1]}^2$.`
            reponse =
              listeConversions[cpt] % 2 === 1 ? 'une centaine' : 'un centième'
            texteCorr += `${texteEnCouleurEtGras(reponse)} de $1~${pairesMetriques[listeConversions[cpt] - 1][1]}^2$.`
            handleAnswers(
              this,
              i,
              { reponse: { value: reponse } },
              { formatInteractif: 'liste-deroulante' },
            )
            break
          case 2:
            texteCorr = texte
            texte += ' = '
            texte +=
              listeConversions[cpt] % 2 === 0
                ? remplisLesBlancs(
                    this,
                    i,
                    `\\dfrac{1}{%{champ1}} ${pairesMetriques[listeConversions[cpt] - 1][1]}^2`,
                    KeyboardType.clavierNumbers,
                    '\\ldots',
                  )
                : this.interactif
                  ? ajouteChampTexteMathLive(
                      this,
                      i,
                      KeyboardType.clavierDeBaseAvecFraction,
                      {
                        texteApres: `$${pairesMetriques[listeConversions[cpt] - 1][1]}^2$`,
                      },
                    )
                  : `$\\ldots\\ldots\\ldots~${pairesMetriques[listeConversions[cpt] - 1][1]}^2$`
            reponse = '100'
            texteCorr +=
              ' est égal à ' +
              `${texteEnCouleurEtGras(listeConversions[cpt] % 2 === 1 ? 'une centaine' : 'un centième', bleuMathalea)} de $1~${pairesMetriques[listeConversions[cpt] - 1][1]}^2$.<br>`
            texteCorr += texteInitial
            texteCorr +=
              listeConversions[cpt] % 2 === 0
                ? ` = $\\dfrac{1}{${miseEnEvidence('100')}} ${pairesMetriques[listeConversions[cpt] - 1][1]}^2$`
                : ` = $${miseEnEvidence('100')}~${pairesMetriques[listeConversions[cpt] - 1][1]}^2$`
            if (listeConversions[cpt] % 2 === 0) {
              handleAnswers(
                this,
                i,
                { champ1: { value: reponse } },
                { formatInteractif: 'fillInTheBlank' },
              )
            } else {
              handleAnswers(this, i, { reponse: { value: reponse } })
            }
            break
          case 3:
            texteCorr = texte
            texte += ' = '
            texte += this.interactif
              ? ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierDeBaseAvecFraction,
                  {
                    texteApres: `$${pairesMetriques[listeConversions[cpt] - 1][1]}^2$`,
                  },
                )
              : `$\\ldots\\ldots\\ldots~${pairesMetriques[listeConversions[cpt] - 1][1]}^2$`
            reponse = rapport[listeConversions[cpt] % 2]
            texteCorr +=
              ' est égal à ' +
              `${texteEnCouleurEtGras(listeConversions[cpt] % 2 === 1 ? 'une centaine' : 'un centième', bleuMathalea)} de $1~${pairesMetriques[listeConversions[cpt] - 1][1]}^2$.<br>`
            texteCorr +=
              texteInitial +
              ` = $${miseEnEvidence(reponse)}~${pairesMetriques[listeConversions[cpt] - 1][1]}^2`
            if (listeConversions[cpt] % 2 === 0) {
              texteCorr += ` = ${miseEnEvidence(texNombre(0.01))}~${pairesMetriques[listeConversions[cpt] - 1][1]}^2`
            }
            texteCorr += '$'
            handleAnswers(this, i, { reponse: { value: reponse } })
            break
        }

        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
