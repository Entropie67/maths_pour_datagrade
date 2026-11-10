import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const titre = "Connaitre les différentes écritures d'une proportion"
export const dateDePublication = '21/04/2023'
export const dateDeModifImportante = '31/01/2024'
/**
* Ecriture des  proportions
*
* * 3 Situations :
*Pourcentage-->fraction-->décimal
*Pourcentage-->fraction-->décimal
*Pourcentage-->fraction-->décimal

* @author Gilles Mora
* *
*/
export const uuid = 'ae913'

export const refs = {
  'fr-fr': ['2I10-1'],
  'fr-ch': [],
}
export default class DiffentesEcrituresProportions extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de questions',
      4,
      '1 : Décimal vers fraction ou pourcentage \n2 : Pourcentage vers fraction ou décimal\n3 : Fraction vers décimal ou pourcentage \n4 : Mélange',
    ]

    this.nbQuestions = 4
    this.sup = 4 // type de questions
  }

  nouvelleVersion() {
    let typesDeQuestionsDisponibles = []
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = ['Decimal']
    } else if (this.sup === 2) {
      typesDeQuestionsDisponibles = ['Pourcentage']
    } else if (this.sup === 3) {
      typesDeQuestionsDisponibles = ['Fraction']
    } else {
      typesDeQuestionsDisponibles = ['Decimal', 'Pourcentage', 'Fraction'] //,
    }
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posées mais l'ordre diffère à chaque "cycle"
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let listeFractions: [number, number][]
      let fraction: [number, number]
      let n: number, d: number
      let f: number
      let dec: number
      let pourc: number
      switch (randint(1, 4)) {
        case 1:
          dec = randint(1, 99) / 100
          pourc = dec * 100
          listeFractions = [
            [1, 2],
            [1, 4],
            [1, 5],
            [2, 5],
            [3, 5],
            [4, 5],
            [6, 5],
            [7, 5],
            [3, 4],
            [5, 8],
            [7, 8],
            [3, 8],
            [1, 8],
            [3, 10],
            [7, 10],
            [3, 20],
            [7, 20],
            [9, 20],
            [11, 20],
            [13, 20],
            [17, 20],
          ] //
          fraction = choice(listeFractions)
          n = fraction[0]
          d = fraction[1]
          f = n / d

          break
        case 2:
          dec = randint(1, 99) / 1000
          pourc = dec * 100
          n = randint(1, 49)
          d = choice([1000, 100, 50, 500])
          f = n / d
          break
        case 3:
          dec = randint(1, 99) / 10000
          pourc = dec * 100
          n = randint(1, 24)
          d = choice([25, 100, 200])
          f = n / d
          break
        case 4:
        default:
          dec = randint(11, 99) / 10
          pourc = dec * 100
          listeFractions = [
            [32, 125],
            [32, 125],
            [2, 125],
            [7, 125],
            [9, 125],
            [13, 125],
            [32, 125],
            [71, 125],
            [108, 125],
            [9, 250],
            [17, 250],
            [81, 1250],
            [91, 1250],
            [87, 1250],
            [91, 1250],
            [47, 1250],
            [59, 1250],
            [31, 1250],
            [63, 1250],
            [117, 2500],
            [91, 2500],
          ] //
          fraction = choice(listeFractions)
          n = fraction[0]
          d = fraction[1]
          f = n / d
          break
      }

      switch (listeTypeDeQuestions[i]) {
        case 'Decimal':
          texte =
            "Écrire sous la forme d'une écriture fractionnaire de dénominateur $100$, puis sous la forme d'un pourcentage.<br>"
          if (this.interactif) {
            texte += remplisLesBlancs(
              this,
              i,
              `$${texNombre(dec, 4)}=\\dfrac{%{champ1}}{%{champ2}}=%{champ3}\\%`,
              KeyboardType.clavierDeBase,
              '\\ldots\\ldots',
            )
          } else {
            if (context.isHtml) {
              texte += ''
            } else {
              texte += '<br>'
            }
            texte += `$${texNombre(dec, 4)}=${context.isHtml ? '\\ldots' : '\\makebox[.08\\linewidth]{\\dotfill}'}=${context.isHtml ? '\\ldots' : '\\makebox[.08\\linewidth]{\\dotfill}'}\\,\\%$`
            if (context.isHtml) {
              texte += ''
            } else {
              texte += '<br>'
            }
          }
          texteCorr = `$${texNombre(dec, 4)}=\\dfrac{${miseEnEvidence(texNombre(pourc, 3))}}{${miseEnEvidence(100)}}=${miseEnEvidence(texNombre(pourc, 3))} \\,\\%$`
          handleAnswers(this, i, {
            bareme: (listePoints) => [
              listePoints[0] * listePoints[1] + listePoints[2],
              2,
            ],
            champ1: { value: pourc.toFixed(4) },
            champ2: { value: String(100) },
            champ3: { value: pourc.toFixed(4) },
          })
          break

        case 'Pourcentage':
          texte =
            "Écrire sous forme décimale, puis sous la forme d'une écriture fractionnaire de dénominateur $100$.<br>"
          if (this.interactif) {
            texte += remplisLesBlancs(
              this,
              i,
              `$${texNombre(pourc, 4)}\\,\\%=%{champ1}=\\dfrac{%{champ2}}{%{champ3}}`,
              KeyboardType.clavierDeBase,
              '\\ldots\\ldots',
            )
          } else {
            if (context.isHtml) {
              texte += ''
            } else {
              texte += '<br>'
            }
            texte += `$${texNombre(pourc, 4)}\\,\\%=${context.isHtml ? '\\ldots' : '\\makebox[.08\\linewidth]{\\dotfill}'}=${context.isHtml ? '\\ldots' : '\\makebox[.08\\linewidth]{\\dotfill}'}$`
            if (context.isHtml) {
              texte += ''
            } else {
              texte += '<br>'
            }
          }
          texteCorr = `$${texNombre(pourc, 3)}\\,\\%=${miseEnEvidence(texNombre(dec, 4))}=\\dfrac{${miseEnEvidence(texNombre(pourc, 3))}}{${miseEnEvidence(100)}}$`
          handleAnswers(this, i, {
            bareme: (listePoints) => [
              listePoints[0] + listePoints[1] * listePoints[2],
              2,
            ],
            champ1: { value: dec.toFixed(4) },
            champ2: { value: pourc.toFixed(4) },
            champ3: { value: String(100) },
          })

          break
        case 'Fraction':
          texte =
            "Écrire sous forme décimale, puis sous la forme d'un pourcentage.<br>"
          if (this.interactif) {
            texte += remplisLesBlancs(
              this,
              i,
              `$\\dfrac{${texNombre(n, 0)}}{${texNombre(d, 0)}}=%{champ1}=%{champ2}\\%`,
              KeyboardType.clavierDeBase,
              '\\ldots\\ldots',
            )
          } else {
            if (context.isHtml) {
              texte += ''
            } else {
              texte += '<br>'
            }
            texte += `$\\dfrac{${texNombre(n, 0)}}{${texNombre(d, 0)}}=${context.isHtml ? '\\ldots' : '\\makebox[.08\\linewidth]{\\dotfill}'}=${context.isHtml ? '\\ldots' : '\\makebox[.08\\linewidth]{\\dotfill}'}\\,\\%$`
            if (context.isHtml) {
              texte += ''
            } else {
              texte += '<br>'
            }
          }

          texteCorr = `$\\dfrac{${texNombre(n, 0)}}{${texNombre(d, 0)}}=${miseEnEvidence(texNombre(f, 4))}=${miseEnEvidence(texNombre(f * 100, 4))}\\,\\%$`
          handleAnswers(this, i, {
            bareme: (listePoints) => [listePoints[0] + listePoints[1], 2],
            champ1: { value: f.toFixed(4) },
            champ2: { value: (f * 100).toFixed(4) },
          })
          break
      }

      if (this.questionJamaisPosee(i, dec, pourc)) {
        // on utilise donc cette fonction basée sur les variables aléatoires pour éviter les doublons
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
