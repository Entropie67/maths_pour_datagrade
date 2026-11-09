/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/interactivity/mathLive.hms.test.ts ⚠️
 */

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { formatMinute } from '../../lib/outils/texNombre'
import Hms from '../../modules/Hms'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Additionner des durées'
export const interactifReady = true

export const dateDeModifImportante = '20/03/2026'

/**
 * Additions de durées de différents :
 * * MS+MS=1hMS sans retenue sur les s
 * * MS+MS=1hMS avec retenue
 * * HM+HM avec retenue
 * * HMS+HMS avec retenue sur les min
 * * HMS+HMS avec retenues min et s
 * @author Rémi Angot
 */
export const uuid = '5f315'

export const refs = {
  'fr-fr': ['6M4A'],
  'fr-2016': ['6D11'],
  'fr-ch': ['9R1GM4D-1', '9R2GM4D-1', '9R3GM4D-1', '10CTGM4B-7', '10LCGM4B-7', '10LSGM4B-7', 'PRQMG04D-5'],
}
export default class SommeDeDurees extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Niveau de difficulté',
      'Nombres séparés par des tirets :\n1 : Additions minutes-secondes sans conversion\n2 : Additions heures-minutes avec potentielle conversion\n3 : Additions heures-minutes-secondes sans conversion\n4 : Additions minutes-secondes avec potentielle conversion\n5 : Additions heures-minutes-secondes avec potentielle conversion\n6 : Mélange',
    ]
    this.sup = '1-2' // 2 niveaux de difficultés
    this.spacing = 2
    this.nbQuestions = 5
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Compléter les égalités suivantes.'
        : "Compléter l'égalité suivante."
    const typesDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 5,
      defaut: 6,
      melange: 6,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    for (
      let i = 0, h1, h2, m1, m2, s1, s2, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      h1 = 0
      h2 = 0
      m1 = 0
      m2 = 0
      s1 = 0
      s2 = 0
      let t1: Hms
      let t2: Hms
      if (typesDeQuestions[i] === 1) {
        s1 = randint(11, 39)
        s2 = randint(1, 20)
        m1 = randint(20, 59)
        m2 = randint(40, 59)
        t1 = new Hms({ minute: m1, second: s1 })
        t2 = new Hms({ minute: m2, second: s2 })
        texte = `$${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}=$`
        texteCorr = `$${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}= ${formatMinute(m1 + m2)}~\\text{min}~${formatMinute(s1 + s2)}~\\text{s}$<br>`
        texteCorr += `$${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}= 60~\\text{min} + ${formatMinute(m1 + m2 - 60)}~\\text{min}+${formatMinute(s1 + s2)}~\\text{s}$<br>`
        texteCorr += `$${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}= 1~\\text{h} + ${formatMinute(m1 + m2 - 60)}~\\text{min}+${formatMinute(s1 + s2)}~\\text{s}$<br>`
        texteCorr += `$${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}= ${miseEnEvidence(`1~\\text{h}~${formatMinute(m1 + m2 - 60)}~\\text{min}~${formatMinute(s1 + s2)}~\\text{s}`)}$`
      } else if (typesDeQuestions[i] === 2) {
        h1 = randint(2, 12)
        h2 = randint(2, 11)
        m1 = randint(30, 50)
        m2 = randint(30, 50)
        t1 = new Hms({ minute: m1, hour: h1 })
        t2 = new Hms({ minute: m2, hour: h2 })
        texte = `$${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}+${h2}~\\text{h}~${formatMinute(m2)}~\\text{min}=$`
        texteCorr = `$${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}+${h2}~\\text{h}~${formatMinute(m2)}~\\text{min}= ${h1 + h2}~\\text{h}~${formatMinute(m1 + m2)}~\\text{min}$<br>`
        texteCorr += `$${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}+${h2}~\\text{h}~${formatMinute(m2)}~\\text{min}= ${h1 + h2}~\\text{h}+60~\\text{min}+${formatMinute(m1 + m2 - 60)}~\\text{min}$<br>`
        texteCorr += `$${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}+${h2}~\\text{h}~${formatMinute(m2)}~\\text{min}= ${h1 + h2}~\\text{h}+1~\\text{h}+${formatMinute(m1 + m2 - 60)}~\\text{min}$<br>`
        texteCorr += `$${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}+${h2}~\\text{h}~${formatMinute(m2)}~\\text{min}= ${miseEnEvidence(`${h1 + h2 + 1}~\\text{h}~${formatMinute(m1 + m2 - 60)}~\\text{min}`)}$`
      } else if (typesDeQuestions[i] === 3) {
        h1 = randint(2, 12)
        h2 = randint(2, 11)
        m1 = randint(20, 40)
        m2 = randint(10, 59 - m1)
        s1 = randint(2, 55)
        s2 = randint(1, 59 - s1)
        t1 = new Hms({ hour: h1, minute: m1, second: s1 })
        t2 = new Hms({ hour: h2, minute: m2, second: s2 })
        texte = `$${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${h2}~\\text{h}~${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}=$`
        texteCorr = `$${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${h2}~\\text{h}~${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}= ${miseEnEvidence(`${h1 + h2}~\\text{h}~${formatMinute(m1 + m2)}~\\text{min}~${formatMinute(s1 + s2)}~\\text{s}`)}$`
      } else if (typesDeQuestions[i] === 4) {
        s1 = randint(21, 39)
        s2 = randint(40, 59)
        m1 = randint(20, 59)
        m2 = randint(40, 59)
        t1 = new Hms({ minute: m1, second: s1 })
        t2 = new Hms({ minute: m2, second: s2 })
        texte = `$${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}=$`
        texteCorr = `$${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}= ${formatMinute(m1 + m2)}~\\text{min}~${formatMinute(s1 + s2)}~\\text{s}$<br>`
        texteCorr += `$${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}= ${formatMinute(m1 + m2)}~\\text{min}+60~\\text{s}+${formatMinute(s1 + s2 - 60)}~\\text{s}$<br>`
        texteCorr += `$${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}= ${formatMinute(m1 + m2)}~\\text{min}+1~\\text{min}+${formatMinute(s1 + s2 - 60)}~\\text{s}$<br>`
        texteCorr += `$${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}= ${formatMinute(m1 + m2 + 1)}~\\text{min}+${formatMinute(s1 + s2 - 60)}~\\text{s}$<br>`
        texteCorr += `$${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}= 60~\\text{min}+${formatMinute(m1 + m2 + 1 - 60)}~\\text{min}+${formatMinute(s1 + s2 - 60)}~\\text{s}$<br>`
        texteCorr += `$${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}= 1~\\text{h}+${formatMinute(m1 + m2 + 1 - 60)}~\\text{min}+${formatMinute(s1 + s2 - 60)}~\\text{s}$<br>`
        texteCorr += `$${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}= ${miseEnEvidence(`1~\\text{h}~${formatMinute(m1 + m2 + 1 - 60)}~\\text{min}~${formatMinute(s1 + s2 - 60)}~\\text{s}`)}$`
      } else {
        if (choice([true, false])) {
          h1 = randint(2, 12)
          h2 = randint(2, 11)
          m1 = randint(30, 50)
          m2 = randint(30, 50)
          s1 = randint(2, 55)
          s2 = randint(1, 60 - s1 - 1)
          t1 = new Hms({ hour: h1, minute: m1, second: s1 })
          t2 = new Hms({ hour: h2, minute: m2, second: s2 })
          texte = `$${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${h2}~\\text{h}~${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}=$`
          texteCorr = `$${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${h2}~\\text{h}~${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}= ${h1 + h2}~\\text{h}~${formatMinute(m1 + m2)}~\\text{min}~${formatMinute(s1 + s2)}~\\text{s}$<br>`
          texteCorr += `$${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${h2}~\\text{h}~${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}= ${h1 + h2}~\\text{h}+60~\\text{min}+${formatMinute(m1 + m2 - 60)}~\\text{min}+${formatMinute(s1 + s2)}~\\text{s}$<br>`
          texteCorr += `$${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${h2}~\\text{h}~${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}= ${h1 + h2}~\\text{h}+1~\\text{h}+${formatMinute(m1 + m2 - 60)}~\\text{min}+${formatMinute(s1 + s2)}~\\text{s}$<br>`
          texteCorr += `$${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${h2}~\\text{h}~${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}= ${h1 + h2 + 1}~\\text{h}+${formatMinute(m1 + m2 - 60)}~\\text{min}+${formatMinute(s1 + s2)}~\\text{s}$<br>`
          texteCorr += `$${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${h2}~\\text{h}~${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}= ${h1 + h2}~\\text{h}~${formatMinute(m1 + m2)}~\\text{min}~${formatMinute(s1 + s2)}~\\text{s} = ${miseEnEvidence(`${h1 + h2 + 1}~\\text{h}~${formatMinute(m1 + m2 - 60)}~\\text{min}~${formatMinute(s1 + s2)}~\\text{s}`)}$`
        } else {
          h1 = randint(2, 12)
          h2 = randint(2, 11)
          m1 = randint(30, 50)
          m2 = randint(30, 50)
          s1 = randint(2, 55)
          s2 = randint(60 - s1, 59)
          t1 = new Hms({ hour: h1, minute: m1, second: s1 })
          t2 = new Hms({ hour: h2, minute: m2, second: s2 })
          texte = `$${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${h2}~\\text{h}~${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}=$`
          texteCorr = `$${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${h2}~\\text{h}~${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}=${h1 + h2}~\\text{h}~${formatMinute(m1 + m2)}~\\text{min}~${formatMinute(s1 + s2)}~\\text{s}$<br>`
          texteCorr += `$${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${h2}~\\text{h}~${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}=${h1 + h2}~\\text{h}+${formatMinute(m1 + m2)}~\\text{min}+60~\\text{s}+${formatMinute(s1 + s2 - 60)}~\\text{s}$<br>`
          texteCorr += `$${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${h2}~\\text{h}~${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}=${h1 + h2}~\\text{h}+${formatMinute(m1 + m2)}~\\text{min}+1~\\text{min}+${formatMinute(s1 + s2 - 60)}~\\text{s}$<br>`
          texteCorr += `$${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${h2}~\\text{h}~${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}=${h1 + h2}~\\text{h}+${formatMinute(m1 + m2 + 1)}~\\text{min}+${formatMinute(s1 + s2 - 60)}~\\text{s}$<br>`
          texteCorr += `$${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${h2}~\\text{h}~${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}=${h1 + h2}~\\text{h}+60~\\text{min}+${formatMinute(m1 + m2 + 1 - 60)}~\\text{min}+${formatMinute(s1 + s2 - 60)}~\\text{s}$<br>`
          texteCorr += `$${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${h2}~\\text{h}~${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}=${h1 + h2}~\\text{h}+1~\\text{h}+${formatMinute(m1 + m2 + 1 - 60)}~\\text{min}+${formatMinute(s1 + s2 - 60)}~\\text{s}$<br>`
          texteCorr += `$${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${h2}~\\text{h}~${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}=${h1 + h2 + 1}~\\text{h}+${formatMinute(m1 + m2 + 1 - 60)}~\\text{min}+${formatMinute(s1 + s2 - 60)}~\\text{s}$<br>`
          texteCorr += `$${h1}~\\text{h}~${formatMinute(m1)}~\\text{min}~${formatMinute(s1)}~\\text{s}+${h2}~\\text{h}~${formatMinute(m2)}~\\text{min}~${formatMinute(s2)}~\\text{s}=${miseEnEvidence(`${h1 + h2 + 1}~\\text{h}~${formatMinute(m1 + m2 + 1 - 60)}~\\text{min}~${formatMinute(s1 + s2 - 60)}~\\text{s}`)}$`
        }
      }

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierHms)
        handleAnswers(this, i, {
          reponse: { value: t1.add(t2), options: { HMS: true } },
        })
      }

      if (this.questionJamaisPosee(i, m1, s1, h1, m2, s2, h2, t2.toString())) {
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
