import { choixDeroulant } from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { formuleEnTex } from '../../lib/outils/tableurFormules'
import {
  NB_SCENARIOS,
  creeScenario,
  derniereCibleDe,
  formulaireScenarios,
  formulesRecopiees,
} from '../../lib/outils/tableurScenarios'
import { rendTableur } from '../../lib/outils/tableurRendu'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Dire si une formule de tableur est juste ou fausse'
export const dateDePublication = '14/10/2026'
export const interactifReady = true
export const uuid = 'c98bc'

export const refs = {
  'fr-fr': ['PET12'],
  'fr-ch': [],
}

/**
 * Dire si une formule de calcul donnée est juste ou fausse (CRPE).
 * @author Rémi Angot
 */
export default class FormuleJusteOuFausse extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
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
    const verdicts = combinaisonListes([true, false], this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const s = creeScenario(numeros[i])
      const estJuste = verdicts[i]
      const erreur = choice(s.erreurs)
      const formule = estJuste ? choice(s.formulesJustes) : erreur.formule
      const recopie = s.nbRecopies > 0

      let texte = `${s.intro}<br>`
      texte += rendTableur({
        cellules: s.cellules,
        nbColonnes: s.nbColonnes,
        nbLignes: s.nbLignes,
        largeurs: s.largeurs,
        lignesEntete: s.numero === 6 ? [2] : [1],
      })
      texte += `<br>Afin de ${s.but}, un élève va saisir dans la cellule ${s.cible} la formule $${formuleEnTex(formule)}$`
      texte += recopie
        ? `, puis étirer la cellule vers le bas jusqu’en ${derniereCibleDe(s)}.`
        : '.'
      const contientDesFormules = Object.values(s.cellules).some(
        (v) => typeof v === 'string' && v.startsWith('='),
      )
      if (context.isHtml && contientDesFormules) {
        texte +=
          '<br><em>Cliquer sur une cellule du tableur permet de lire sa formule.</em>'
      }
      texte += '<br>'
      if (this.interactif) {
        texte += `Cette formule est ${choixDeroulant(this, i, {
          choices: [
            { label: 'Choisir', value: '' },
            { label: 'juste', value: 'juste' },
            { label: 'fausse', value: 'fausse' },
          ],
        })}.`
        handleAnswers(
          this,
          i,
          { reponse: { value: estJuste ? 'juste' : 'fausse' } },
          { formatInteractif: 'liste-deroulante' },
        )
      } else {
        texte += 'Cette formule est-elle juste ? Justifier la réponse.'
      }

      let texteCorr = ''
      if (estJuste) {
        texteCorr += `La formule $${formuleEnTex(formule)}$ est ${texteEnCouleurEtGras('juste')} : elle permet de ${s.but}.`
      } else {
        texteCorr += `La formule $${formuleEnTex(formule)}$ est ${texteEnCouleurEtGras('fausse')} : ${erreur.explication}.`
      }
      if (recopie) {
        const [, deuxieme] = formulesRecopiees(s, formule)
        texteCorr += `<br>Quand on étire la cellule vers le bas, les références sont décalées : en ${s.cible.replace(/\d+/, '')}${Number(s.cible.replace(/\D+/, '')) + 1}, la formule devient $${formuleEnTex(deuxieme)}$.`
      }
      if (!estJuste) {
        texteCorr += `<br>Une formule juste est $${formuleEnTex(s.formuleJuste)}$.`
      }

      if (
        this.questionJamaisPosee(
          i,
          s.numero,
          formule,
          JSON.stringify(s.cellules),
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
