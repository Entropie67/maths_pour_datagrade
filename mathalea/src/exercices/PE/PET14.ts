import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { formuleEnTex } from '../../lib/outils/tableurFormules'
import {
  NB_SCENARIOS,
  cellulesAvecFormule,
  cellulesCible,
  creeScenario,
  derniereCibleDe,
  formulaireScenarios,
  formulesRecopiees,
} from '../../lib/outils/tableurScenarios'
import { rendTableur } from '../../lib/outils/tableurRendu'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Écrire une formule de tableur'
export const dateDePublication = '14/10/2026'
export const interactifReady = true
export const uuid = '17455'

export const refs = {
  'fr-fr': ['PET14'],
  'fr-ch': [],
}

/**
 * Écrire purement et simplement une formule de calcul (CRPE).
 * @author Rémi Angot
 */
export default class EcrireFormuleTableur extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = formulaireScenarios()
    this.sup = String(NB_SCENARIOS + 1)
  }

  nouvelleVersion() {
    const numeros = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: NB_SCENARIOS,
      melange: NB_SCENARIOS + 1,
      defaut: NB_SCENARIOS + 1,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const s = creeScenario(numeros[i])
      const recopie = s.nbRecopies > 0
      const parametresTableur = {
        nbColonnes: s.nbColonnes,
        nbLignes: s.nbLignes,
        largeurs: s.largeurs,
        lignesEntete: s.numero === 6 ? [2] : [1],
      }

      let texte = `${s.intro}<br>`
      texte += rendTableur({
        ...parametresTableur,
        exercice: this,
        question: i,
        cellules: s.cellules,
        interactif: this.interactif,
        cellulesModifiables: cellulesCible(s),
        formuleImprimee: { cellule: s.cible, formule: '?' },
        couleurs: Object.fromEntries(
          cellulesCible(s).map((ref) => [ref, '#fde68a']),
        ),
      })
      texte += `<br>Écrire, dans la cellule ${s.cible}, une formule permettant de ${s.but}`
      texte += recopie
        ? `, la cellule pouvant ensuite être étirée vers le bas jusqu’en ${derniereCibleDe(s)}.`
        : '.'
      if (this.interactif && recopie) {
        texte += `<br>Saisir la formule dans la cellule ${s.cible} puis étirer la cellule vers le bas.`
      }

      if (this.interactif) {
        const bonnesFormules = formulesRecopiees(s, s.formuleJuste)
        handleAnswers(
          this,
          i,
          {
            sheetAnswer: {
              goodAnswerFormulas: cellulesCible(s).map((ref, k) => ({
                ref,
                formula: bonnesFormules[k],
              })),
              // trois tirages pour éviter qu'une formule fausse passe par hasard
              sheetTestDatas: [...s.testes, ...s.testes, ...s.testes],
            },
          },
          { formatInteractif: 'my-spreadsheet' },
        )
      }

      let texteCorr = `Il faut saisir dans la cellule ${s.cible} la formule $${miseEnEvidence(formuleEnTex(s.formuleJuste))}$`
      texteCorr += recopie ? ' puis étirer la cellule vers le bas.' : '.'
      if (s.formulesJustes.length > 1) {
        texteCorr += `<br>D’autres écritures sont possibles, par exemple $${formuleEnTex(s.formulesJustes[1])}$.`
      }
      texteCorr += '<br>Avec cette formule, le tableur affiche :<br>'
      texteCorr += rendTableur({
        ...parametresTableur,
        cellules: cellulesAvecFormule(s, s.formuleJuste),
        formuleImprimee: { cellule: s.cible, formule: s.formuleJuste },
      })

      if (this.questionJamaisPosee(i, s.numero, JSON.stringify(s.cellules))) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
