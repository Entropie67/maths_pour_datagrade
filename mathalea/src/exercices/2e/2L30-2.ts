import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { texteGras } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs, arrondi } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre =
  "Utiliser les propriétés de conservation du sens d'une inégalité"
export const dateDePublication = '14/02/2023'
export const dateDeModifImportante = '07/04/2026'

export const interactifReady = true

/**
 * @author Gilles Mora
 */

export const uuid = 'e32f3'

export const refs = {
  'fr-fr': ['2L30-2'],
  'fr-ch': [],
}
export default class ProprietesInegalites extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type des questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Encadrer des expressions avec des racines carrées',
        '2 : Comparer une expression avec une inconnue',
        '3 : Encadrer une expression avec une inconnue',
        '4 : Encadrer une expression avec deux inconnues',
        '5 : Mélange',
      ].join('\n'),
    ]

    this.nbQuestions = 1

    this.sup = '5'

    this.spacing = 1.5 // Interligne des questions
    this.spacingCorr = 2 // Interligne des réponses
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
      listeOfCase: ['typeE1', 'typeE2', 'typeE3', 'typeE4'],
    })
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let a: number
      let m: number
      let p: number
      let enonceCalcul: string
      let reponse1: string | number = 0
      let reponse2 = 0
      switch (
        listeTypeDeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'typeE1': //
          {
            a = randint(2, 30, [4, 9, 16, 25])
            const rac = Math.sqrt(a)
            m = randint(-10, 10, 0)
            p = randint(-10, 10, 0)
            const choix1 = choice([
              ['<', '>'],
              ['\\leqslant', '\\geqslant'],
            ])
            const choix2 = choice([
              ['<', '>'],
              ['\\leqslant', '\\geqslant'],
            ])
            enonceCalcul = `${rienSi1(m)}\\sqrt{${a}}${ecritureAlgebrique(p)}`
            texte = ` Sachant que $${texNombre(Math.floor(100 * rac) / 100, 2)} ${choix1[0]} \\sqrt{${a}} ${choix2[0]} ${texNombre(Math.ceil(100 * rac) / 100, 2)}$,
            encadrer, le plus précisément possible, $${enonceCalcul}$.
                `
            if (this.interactif)
              texte +=
                '<br>' +
                addMultiMathfield(this, i, {
                  dataTemplate: `%{champ1} $${m > 0 ? `${choix1[0]}` : `${choix2[0]}`} ${enonceCalcul} ${m > 0 ? `${choix2[0]}` : `${choix1[0]}`}$ %{champ2}`,
                  dataOptions: {
                    champ1: { keyboard: KeyboardType.clavierDeBase },
                    champ2: { keyboard: KeyboardType.clavierDeBase },
                  },
                })
            const reponseMax = arrondi((m * Math.ceil(100 * rac)) / 100 + p, 2)
            const reponseMin = arrondi((m * Math.floor(100 * rac)) / 100 + p, 2)
            reponse1 = m > 0 ? reponseMin : reponseMax
            reponse2 = m < 0 ? reponseMin : reponseMax
            texteCorr = `${texteGras(`Méthode${sp()}:`)} en partant de l'encadrement initial de $\\sqrt{${a}}$,
on forme, avec des opérations successives, $${rienSi1(m)}\\sqrt{${a}}${ecritureAlgebrique(p)}$.<br>
$\\begin{aligned}\\phantom{'Ainsi, '}
${texNombre(Math.floor(100 * rac) / 100, 2)}${choix1[0]}&\\sqrt{${a}}${choix2[0]}${texNombre(Math.ceil(100 * rac) / 100, 2)}\\\\`
            texteCorr += `${m}\\times ${texNombre(Math.floor(100 * rac) / 100, 2)}${m > 0 ? `${choix1[0]}` : `${choix1[1]}`}&${m}\\times \\sqrt{${a}} ${m > 0 ? `${choix2[0]}` : `${choix2[1]}`} ${m}\\times ${texNombre(Math.ceil(100 * rac) / 100, 2)}   ${sp(7)}\\text{ On multiplie par ${m > 0 ? `$${m}> 0$ ` : `$${m}< 0 $`}, le sens des inégalités ${m > 0 ? 'ne change pas' : 'change'}.}\\\\`
            texteCorr += `${texNombre((m * Math.floor(100 * rac)) / 100, 2)}${m > 0 ? `${choix1[0]}` : `${choix1[1]}`}& ${m}\\sqrt{${a}} ${m > 0 ? `${choix2[0]}` : `${choix2[1]}`}${texNombre((m * Math.ceil(100 * rac)) / 100, 2)} \\\\`
            texteCorr += `${texNombre((m * Math.floor(100 * rac)) / 100, 2)} ${ecritureAlgebrique(p)}${m > 0 ? `${choix1[0]}` : `${choix1[1]}`}& ${m}\\sqrt{${a}} ${ecritureAlgebrique(p)} ${m > 0 ? `${choix2[0]}` : `${choix2[1]}`}  ${texNombre((m * Math.ceil(100 * rac)) / 100, 2)} ${ecritureAlgebrique(p)} ${sp(7)}\\text{ On  ${p > 0 ? 'ajoute' : 'retranche'} ${abs(p)}.} \\\\`
            const texteCorrBis = `${texNombre((m * Math.floor(100 * rac)) / 100 + p, 2)}  ${m > 0 ? `${choix1[0]}` : `${choix1[1]}`}&${m}\\sqrt{${a}} ${ecritureAlgebrique(p)}  ${m > 0 ? `${choix2[0]}` : `${choix2[1]}`} ${texNombre((m * Math.ceil(100 * rac)) / 100 + p, 2)}`
            const borneMin = texNombre((m * Math.floor(100 * rac)) / 100 + p, 2)
            const borneMax = texNombre((m * Math.ceil(100 * rac)) / 100 + p, 2)
            texteCorr +=
              m > 0
                ? `${miseEnEvidence(borneMin)}  ${choix1[0]}&${m}\\sqrt{${a}} ${ecritureAlgebrique(p)}  ${choix2[0]} ${miseEnEvidence(borneMax)}` +
                  '\\\\'
                : texteCorrBis + '\\\\'
            texteCorr += '\\end{aligned}$'
            if (m < 0) {
              texteCorr += `<br>Ainsi,  $${miseEnEvidence(texNombre(reponse1))}  ${choix2[0]} ${m}\\sqrt{${a}} ${ecritureAlgebrique(p)} ${choix1[0]} ${miseEnEvidence(texNombre(reponse2))}$.`
            }
          }
          break

        case 'typeE2':
          {
            a = randint(-10, 10, 0)
            m = randint(-10, 10, [0, 1])
            p = randint(-10, 10, 0)
            const choix1 = choice([
              ['<', '>'],
              ['\\leqslant', '\\geqslant'],
              ['>', '<'],
              ['\\geqslant', '\\leqslant'],
            ])
            texte = ` Si $x${choix1[0]} ${a}$, que peut-on dire de $${rienSi1(m)}x${ecritureAlgebrique(p)}$${sp()}?
                `
            if (this.interactif)
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierCompare + ' ' + KeyboardType.clavierNumbers,
                {
                  texteAvant: `<br>On peut dire que${sp()}: $${rienSi1(m)}x${ecritureAlgebrique(p)}$`,
                  texteApres: '.',
                },
              )
            reponse1 = `${m > 0 ? `${choix1[0]}` : `${choix1[1]}`}${texNombre(m * a + p)}`
            handleAnswers(this, i, {
              reponse: { value: reponse1, options: { texteSansCasse: true } },
            })

            texteCorr = `${texteGras(`Méthode${sp()}:`)} en partant de l'inégalité vérifiée par $x$, on forme, avec des opérations successives, $${rienSi1(m)}x${ecritureAlgebrique(p)}$.<br>
$\\begin{aligned}\\phantom{'Ainsi xxxx, '}
x &${choix1[0]} ${a}\\\\`
            texteCorr += `${m}\\times x&${m > 0 ? `${choix1[0]}` : `${choix1[1]}`} ${m}\\times ${ecritureParentheseSiNegatif(a)} ${sp(7)}\\text{ On multiplie par ${m > 0 ? `$${m}> 0$ ` : `$${m}< 0 $`}, le sens des inégalités ${m > 0 ? 'ne change pas' : 'change'}.}\\\\`
            texteCorr += `${m}x&${m > 0 ? `${choix1[0]}` : `${choix1[1]}`}${texNombre(m * a)}   \\\\`
            texteCorr += `${texNombre(m)}x ${ecritureAlgebrique(p)} &${m > 0 ? `${choix1[0]}` : `${choix1[1]}`} ${texNombre(m * a)} ${ecritureAlgebrique(p)} ${sp(7)}\\text{ On  ${p > 0 ? 'ajoute' : 'retranche'} ${abs(p)}.}  \\\\`
            texteCorr += '\\end{aligned}$'
            texteCorr += `<br>Ainsi,  $${texNombre(m)}x ${ecritureAlgebrique(p)} ${miseEnEvidence(reponse1)}$.`
          }
          break
        case 'typeE3':
          {
            a = randint(-10, 10, 0)
            const b = a + randint(1, 10, 0)
            m = randint(-10, 10, [0, 1])
            p = randint(-10, 10, 0)
            const choix1 = choice([
              ['<', '>'],
              ['\\leqslant', '\\geqslant'],
            ])
            const choix2 = choice([
              ['<', '>'],
              ['\\leqslant', '\\geqslant'],
            ])
            const enonceCalcul = `${rienSi1(m)}x${ecritureAlgebrique(p)}`
            texte = ` Sachant que $${a} ${choix1[0]} x ${choix2[0]} ${b}$,
            encadrer, le plus précisément possible,  $${enonceCalcul}$.
                `
            if (this.interactif)
              texte +=
                '<br>' +
                addMultiMathfield(this, i, {
                  dataTemplate: `%{champ1} $${m > 0 ? `${choix1[0]}` : `${choix2[0]}`} ${enonceCalcul} ${m > 0 ? `${choix2[0]}` : `${choix1[0]}`}$ %{champ2}`,
                  dataOptions: {
                    champ1: { keyboard: KeyboardType.clavierDeBase },
                    champ2: { keyboard: KeyboardType.clavierDeBase },
                  },
                })
            const reponseMax = m * a + p
            const reponseMin = m * b + p
            reponse1 = m < 0 ? reponseMin : reponseMax
            reponse2 = m > 0 ? reponseMin : reponseMax

            texteCorr = `${texteGras(`Méthode${sp()}:`)} en partant de l'encadrement initial de $x$,
on forme, avec des opérations successives, $${rienSi1(m)}x${ecritureAlgebrique(p)}$.<br>
$\\begin{aligned}
${a} ${choix1[0]}  x &${choix2[0]} ${b}\\\\`
            texteCorr += `${m}\\times ${ecritureParentheseSiNegatif(a)}
${m > 0 ? `${choix1[0]}` : `${choix1[1]}`} ${m}\\times x &${m > 0 ? `${choix2[0]}` : `${choix2[1]}`} ${m}\\times ${ecritureParentheseSiNegatif(b)}   ${sp(7)}\\text{ On multiplie par ${m > 0 ? `$${m}> 0$ ` : `$${m}< 0 $`}, le sens des inégalités ${m > 0 ? 'ne change pas' : 'change'}.}\\\\`
            texteCorr += `${texNombre(m * a)}${m > 0 ? `${choix1[0]}` : `${choix1[1]}`}${rienSi1(m)}x &${m > 0 ? `${choix2[0]}` : `${choix2[1]}`}  ${texNombre(m * b)}   \\\\`
            texteCorr += `${texNombre(m * a)} ${ecritureAlgebrique(p)} ${m > 0 ? `${choix1[0]}` : `${choix1[1]}`} ${rienSi1(m)}x ${ecritureAlgebrique(p)} &${m > 0 ? `${choix2[0]}` : `${choix2[1]}`}  ${texNombre(m * b)} ${ecritureAlgebrique(p)} ${sp(7)}\\text{ On  ${p > 0 ? 'ajoute' : 'retranche'} ${abs(p)}.}  \\\\`
            const texteCorrBis = `${texNombre(m * a + p)}  ${m > 0 ? `${choix1[0]}` : `${choix1[1]}`} ${rienSi1(m)}x ${ecritureAlgebrique(p)}&${m > 0 ? `${choix2[0]}` : `${choix2[1]}`} ${texNombre(m * b + p)}`
            texteCorr +=
              m > 0
                ? `${miseEnEvidence(texNombre(m * a + p))}  ${choix1[0]} ${rienSi1(m)}x ${ecritureAlgebrique(p)}&${choix2[0]} ${miseEnEvidence(texNombre(m * b + p))}` +
                  '\\\\'
                : texteCorrBis + '\\\\'
            texteCorr += '\\end{aligned}$'
            if (m < 0) {
              texteCorr += `<br>
           Ainsi,  $${miseEnEvidence(texNombre(m * b + p, 2))}  ${choix2[0]} ${rienSi1(m)}x ${ecritureAlgebrique(p)} ${choix1[0]} ${miseEnEvidence(texNombre(m * a + p))}$.`
            }
          }
          break

        case 'typeE4':
        default:
          {
            a = randint(-10, 10, 0)
            const b = a + randint(1, 10, 0)
            const c = randint(-10, 10, 0)
            const d = c + randint(1, 10, 0)
            m = randint(-10, 10, [0, 1])
            p = randint(-10, 10, [0, 1])
            const choix1 = choice([
              ['<', '>'],
              ['\\leqslant', '\\geqslant'],
            ])
            const aEncadrer = `${rienSi1(m)}x${ecritureAlgebriqueSauf1(p)}y`
            texte = `Soit $x$ et $y$ deux réels tels que $${a} ${choix1[0]} x ${choix1[0]} ${b}$ et $${c} ${choix1[0]} y ${choix1[0]} ${d}$.<br>`
            if (this.interactif) {
              texte += `Que peut-on dire, le plus précisément possible, de $${aEncadrer}$${sp()}?`
              texte +=
                '<br>' +
                addMultiMathfield(this, i, {
                  dataTemplate: `%{champ1} $${choix1[0]} ${aEncadrer} ${choix1[0]}$ %{champ2}`,
                  dataOptions: {
                    champ1: { keyboard: KeyboardType.clavierDeBase },
                    champ2: { keyboard: KeyboardType.clavierDeBase },
                  },
                })
            } else if (m > 0 && p > 0)
              texte += `Démontrer que  $${m * a + p * c} ${choix1[0]} ${aEncadrer} ${choix1[0]} ${m * b + p * d}$.`
            else if (m > 0 && p < 0)
              texte += `Démontrer que  $${m * a + p * d} ${choix1[0]} ${aEncadrer} ${choix1[0]} ${m * b + p * c}$.`
            else if (m < 0 && p > 0)
              texte += `Démontrer que  $${m * b + p * c} ${choix1[0]} ${aEncadrer} ${choix1[0]} ${m * a + p * d}$.`
            else if (m < 0 && p < 0)
              texte += `Démontrer que  $${m * b + p * d} ${choix1[0]} ${aEncadrer} ${choix1[0]} ${m * a + p * c}$.<br> `

            texteCorr = `On commence par encadrer $${rienSi1(m)}x$, puis on encadre $${p}y$.<br>`
            texteCorr += ` $\\begin{aligned}
              ${a} ${choix1[0]}  x &${choix1[0]} ${b}\\\\`
            if (m > 0 && p > 0) {
              texteCorr += `${m}\\times ${ecritureParentheseSiNegatif(a)} ${choix1[0]} ${m}\\times x &${choix1[0]} ${m}\\times ${ecritureParentheseSiNegatif(b)} ${sp(7)} \\text{ On multiplie par } ${m} > 0 \\text{, le sens des inégalités ne change pas.}\\\\`
              texteCorr += `${m * a} ${choix1[0]} ${rienSi1(m)}x& ${choix1[0]} ${m * b}\\\\`
              texteCorr += '\\end{aligned}$'
              texteCorr += `<br>De même, <br>
               $\\begin{aligned}
               ${c} ${choix1[0]} y& ${choix1[0]} ${d}\\\\`
              texteCorr += `${p}\\times ${ecritureParentheseSiNegatif(c)} ${choix1[0]} ${p}\\times y &${choix1[0]} ${p}\\times ${ecritureParentheseSiNegatif(d)} ${sp(7)} \\text{ On multiplie par } ${p} > 0 \\text{, le sens des inégalités ne change pas.}\\\\`
              texteCorr += `${p * c} ${choix1[0]} ${rienSi1(p)}y& ${choix1[0]} ${p * d}\\\\`
              texteCorr += '\\end{aligned}$'
              reponse1 = m * a + p * c
              reponse2 = m * b + p * d
              texteCorr += `<br>
              Ainsi, on a${sp()}: $\\begin{cases}    ${m * a} ${choix1[0]} ${rienSi1(m)}x ${choix1[0]} ${m * b}\\\\    ${p * c} ${choix1[0]} ${rienSi1(p)}y ${choix1[0]} ${p * d}     \\end{cases} $.<br>
              Ces inégalités sont de même sens, en faisant les sommes, on obtient${sp()}: $${miseEnEvidence(reponse1)} ${choix1[0]} ${aEncadrer} ${choix1[0]} ${miseEnEvidence(reponse2)}$.`
            } else if (m > 0 && p < 0) {
              texteCorr += `${m}\\times ${ecritureParentheseSiNegatif(a)} ${choix1[0]} ${m}\\times x &${choix1[0]} ${m}\\times ${ecritureParentheseSiNegatif(b)} ${sp(7)} \\text{ On multiplie par } ${m} > 0 \\text{, le sens des inégalités ne change pas.}\\\\`
              texteCorr += `${m * a} ${choix1[0]} ${rienSi1(m)}x& ${choix1[0]} ${m * b}\\\\`
              texteCorr += '\\end{aligned}$'
              texteCorr += `<br>De même, <br>
                 $\\begin{aligned}
                 ${c} ${choix1[0]} y &${choix1[0]} ${d}\\\\`
              texteCorr += `${p}\\times ${ecritureParentheseSiNegatif(c)} ${choix1[1]} ${p}\\times y &${choix1[1]} ${p}\\times ${ecritureParentheseSiNegatif(d)} ${sp(7)} \\text{ On multiplie par } ${p} < 0 \\text{, le sens des inégalités change.}\\\\`
              texteCorr += `${p * c} ${choix1[1]} ${rienSi1(p)}y& ${choix1[1]} ${p * d}\\\\`
              texteCorr += '\\end{aligned}$'
              reponse1 = m * a + p * d
              reponse2 = m * b + p * c
              texteCorr += `<br>
                                Ainsi, on a${sp()}: $\\begin{cases}    ${m * a} ${choix1[0]} ${rienSi1(m)}x ${choix1[0]} ${m * b}\\\\    ${p * d} ${choix1[0]} ${rienSi1(p)}y ${choix1[0]} ${p * c}     \\end{cases} $.<br>
                Ces inégalités sont de même sens, en faisant les sommes, on obtient${sp()}: $${miseEnEvidence(reponse1)} ${choix1[0]} ${aEncadrer} ${choix1[0]} ${miseEnEvidence(reponse2)}$.`
            } else if (m < 0 && p > 0) {
              texteCorr += `${m}\\times ${ecritureParentheseSiNegatif(a)} ${choix1[1]} ${m}\\times x &${choix1[1]} ${m}\\times ${ecritureParentheseSiNegatif(b)} ${sp(7)} \\text{ On multiplie par } ${m} < 0 \\text{, le sens des inégalités change.}\\\\`
              texteCorr += `${m * a} ${choix1[1]} ${rienSi1(m)}x& ${choix1[1]} ${m * b}\\\\`
              texteCorr += '\\end{aligned}$'
              texteCorr += `<br>De même, <br>
                   $\\begin{aligned}
                   ${c} ${choix1[0]} y &${choix1[0]} ${d}\\\\`
              texteCorr += `${p}\\times ${ecritureParentheseSiNegatif(c)} ${choix1[0]} ${p}\\times y &${choix1[0]} ${p}\\times ${ecritureParentheseSiNegatif(d)} ${sp(7)} \\text{ On multiplie par } ${p} > 0 \\text{, le sens des inégalités ne change pas.}\\\\`
              texteCorr += `
                  ${p * c} ${choix1[0]} ${rienSi1(p)}y& ${choix1[0]} ${p * d}\\\\`
              texteCorr += '\\end{aligned}$'
              reponse1 = m * b + p * c
              reponse2 = m * a + p * d
              texteCorr += `<br>
                  Ainsi, on a${sp()}: $\\begin{cases}    ${m * b} ${choix1[0]} ${rienSi1(m)}x ${choix1[0]} ${m * a}\\\\    ${p * c} ${choix1[0]} ${rienSi1(p)}y ${choix1[0]} ${p * d}     \\end{cases} $.<br>
                  Ces inégalités sont de même sens, en faisant les sommes, on obtient${sp()}: $${miseEnEvidence(reponse1)} ${choix1[0]} ${aEncadrer} ${choix1[0]} ${miseEnEvidence(reponse2)}$.`
            } else if (m < 0 && p < 0) {
              texteCorr += `${m}\\times ${ecritureParentheseSiNegatif(a)} ${choix1[1]} ${m}\\times x &${choix1[1]} ${m}\\times ${ecritureParentheseSiNegatif(b)} ${sp(7)} \\text{ On multiplie par } ${m} < 0 \\text{, le sens des inégalités change.}\\\\`
              texteCorr += `
                    ${m * a} ${choix1[1]} ${rienSi1(m)}x& ${choix1[1]} ${m * b}\\\\`
              texteCorr += '\\end{aligned}$'
              texteCorr += `<br>De même, <br>
                    $\\begin{aligned}
                    ${c} ${choix1[0]} y &${choix1[0]} ${d}\\\\`
              texteCorr += `${p}\\times ${ecritureParentheseSiNegatif(c)} ${choix1[1]} ${p}\\times y &${choix1[1]} ${p}\\times ${ecritureParentheseSiNegatif(d)} ${sp(7)} \\text{ On multiplie par } ${p} < 0 \\text{, le sens des inégalités change.}\\\\`
              texteCorr += `
                   ${p * c} ${choix1[1]} ${rienSi1(p)}y& ${choix1[1]} ${p * d}\\\\`
              texteCorr += '\\end{aligned}$'
              reponse1 = m * b + p * d
              reponse2 = m * a + p * c
              texteCorr += `<br>
                  Ainsi, on a${sp()}: $\\begin{cases}    ${m * b} ${choix1[0]} ${rienSi1(m)}x ${choix1[0]} ${m * a}\\\\    ${p * d} ${choix1[0]} ${rienSi1(p)}y ${choix1[0]} ${p * c}     \\end{cases} $.<br>
                  Ces inégalités sont de même sens, en faisant les sommes, on obtient${sp()}: $${miseEnEvidence(reponse1)} ${choix1[0]} ${aEncadrer} ${choix1[0]} ${miseEnEvidence(reponse2)}$.`
            }
          }
          break
      }
      if (listeTypeDeQuestions[i] !== 'typeE2')
        handleAnswers(
          this,
          i,
          {
            bareme: toutAUnPoint,
            champ1: {
              value: reponse1,
              options: { nombreDecimalSeulement: true },
            },
            champ2: {
              value: reponse2,
              options: { nombreDecimalSeulement: true },
            },
          },
          { formatInteractif: 'multi-mathfield' },
        )
      if (this.questionJamaisPosee(i, a, m, p)) {
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
