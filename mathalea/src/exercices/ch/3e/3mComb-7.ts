import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import {
    factorielle,
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Dénombrer des nombres avec contraintes sur les chiffres'
export const dateDePublication = '05/02/2026'
export const interactifReady = true

export const uuid = 'brt23'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['3mComb-7'],
}

/**
 * Arrangements - Nombres avec contraintes sur les chiffres
 * @author Nathan Scheinmann
 */

function arrangement(n: number, k: number): number {
  if (k < 0 || k > n) return 0
  return Math.round(factorielle(n) / factorielle(n - k))
}

export default class NombresContraintes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Nombres à chiffres tous utilisés (perm. sans rép.)',
        '2 : Nombres avec chiffres imposés (arr. avec rép.)',
        '3 : Nombres dans un ensemble restreint (arr. avec rép.)',
        '4 : Nombres à chiffres distincts (arr. sans rép.)',
        '5 : Nombres pairs/impairs (arr. sans rép.)',
        '6 : Mélange',
      ].join('\n'),
    ]
    this.sup = '6'
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 5,
      melange: 6,
      defaut: 6,
      listeOfCase: ['ensemble', 'imposes', 'restreint', 'distincts', 'parite'],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse = 0

      const typeQuestion = listeTypeDeQuestions[i]

      if (typeQuestion === 'distincts') {
        const nbChiffres = randint(3, 5)
        const variante = choice(['tous', 'impairs'])

        if (variante === 'tous') {
          reponse = 9 * arrangement(9, nbChiffres - 1)

          texte = `Combien de nombres à $${nbChiffres}$ chiffres ont tous leurs chiffres distincts ?`

          texteCorr = `Le premier chiffre ne peut pas être $0$, donc $9$ choix.<br>`
          texteCorr += `Les $${nbChiffres - 1}$ chiffres suivants sont choisis parmi les $9$ restants (sans répétition).<br>`
          texteCorr += `C'est un arrangement sans répétition pour les $${nbChiffres - 1}$ derniers parmi $9$ :<br>`
          texteCorr += `$9 \\times A_{${nbChiffres - 1}}^{9} = 9 \\times \\dfrac{9!}{${9 - nbChiffres + 1}!} = 9 \\times ${texNombre(arrangement(9, nbChiffres - 1))} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else {
          reponse = arrangement(5, nbChiffres)

          texte = `Combien de nombres à $${nbChiffres}$ chiffres peut-on former avec des chiffres impairs tous distincts ?`

          texteCorr = `Les chiffres impairs sont $\\{1, 3, 5, 7, 9\\}$, soit $5$ chiffres (tous non nuls).<br>`
          texteCorr += `On arrange $${nbChiffres}$ chiffres parmi $5$, tous distincts :<br>`
          texteCorr += `$A_{${nbChiffres}}^{5} = \\dfrac{5!}{${5 - nbChiffres}!} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        }
      } else if (typeQuestion === 'ensemble') {
        const taille = randint(4, 7)
        const chiffresDisponibles = [1, 2, 3, 4, 5, 6, 7, 8, 9].slice(0, taille)
        const chiffresAffichés = chiffresDisponibles.join(', ')

        reponse = factorielle(taille)

        texte = `Combien de nombres à $${taille}$ chiffres peut-on former en utilisant une et une seule fois chacun des chiffres $\\{${chiffresAffichés}\\}$ ?`

        texteCorr = `On permute les $${taille}$ chiffres disponibles (tous non nuls, donc pas de contrainte sur le premier).<br>`
        texteCorr += `$P_{${taille}} = ${taille}! = ${miseEnEvidence(texNombre(reponse, 0))}$`
      } else if (typeQuestion === 'parite') {
        const nbChiffres = randint(3, 5)
        const variante = choice(['pair', 'impair', 'divisiblePar5'])

        if (variante === 'pair') {
          const avecZeroFinal = arrangement(9, nbChiffres - 1)
          const sansZeroFinal = 4 * 8 * arrangement(8, nbChiffres - 2)
          reponse = avecZeroFinal + sansZeroFinal

          texte = `Combien de nombres pairs à $${nbChiffres}$ chiffres ont tous leurs chiffres distincts ?`

          texteCorr = `Un nombre pair se termine par $0, 2, 4, 6$ ou $8$.<br><br>`
          texteCorr += `$\\bullet$ Dernier chiffre vaut $0$ :<br>`
          texteCorr += `$\\quad$ Les $${nbChiffres - 1}$ premiers : arrangement parmi $\\{1,\\ldots,9\\}$ : $A_{${nbChiffres - 1}}^{9} = ${avecZeroFinal}$<br><br>`
          texteCorr += `$\\bullet$ Dernier chiffre $\\in \\{2, 4, 6, 8\\}$ (4 choix) :<br>`
          texteCorr += `$\\quad$ Pour le premier chiffre : 8 choix (pas 0, pas le dernier)<br>`
          texteCorr += `$\\quad$ Milieu : $A_{${nbChiffres - 2}}^{8}$ choix<br>`
          texteCorr += `$\\quad$ Sous-total : $4 \\times 8 \\times A_{${nbChiffres - 2}}^{8} = ${sansZeroFinal}$<br><br>`
          texteCorr += `Total : $${avecZeroFinal} + ${sansZeroFinal} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else if (variante === 'impair') {
          const rep = 5 * 8 * arrangement(8, nbChiffres - 2)
          reponse = rep

          texte = `Combien de nombres impairs à $${nbChiffres}$ chiffres ont tous leurs chiffres distincts ?`

          texteCorr = `Un nombre impair se termine par $1, 3, 5, 7$ ou $9$ : $5$ choix.<br>`
          texteCorr += `Pour le premier chiffre : $8$ choix (pas $0$, pas le dernier).<br>`
          texteCorr += `${nbChiffres === 3 ? 'Celui ' : `Les $${nbChiffres - 2}$`} du milieu : $A_{${nbChiffres - 2}}^{8}$.<br><br>`
          texteCorr += `$5 \\times 8 \\times A_{${nbChiffres - 2}}^{8} = 5 \\times 8 \\times ${arrangement(8, nbChiffres - 2)} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else {
          const avecZeroFinal = arrangement(9, nbChiffres - 1)
          const avecCinqFinal = 8 * arrangement(8, nbChiffres - 2)
          reponse = avecZeroFinal + avecCinqFinal

          texte = `Combien de nombres à $${nbChiffres}$ chiffres distincts sont divisibles par $5$ ?`

          texteCorr = `Divisible par $5$ $\\Rightarrow$ se termine par $0$ ou $5$.<br><br>`
          texteCorr += `$\\bullet$ Termine par $0$ : $A_{${nbChiffres - 1}}^{9} = ${texNombre(avecZeroFinal)}$<br>`
          texteCorr += `$\\bullet$ Termine par $5$ : $8$ possibilités pour le premier chiffre (car différent de $5$ et $0$), milieu $A_{${nbChiffres - 2}}^{8}$ : $8 \\times A_{${nbChiffres - 2}}^{8} = ${texNombre(avecCinqFinal)}$<br><br>`
          texteCorr += `Total : $${texNombre(avecZeroFinal)} + ${texNombre(avecCinqFinal)} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        }
      } else if (typeQuestion === 'imposes') {
        const variante = choice(['contient', 'commence', 'position'])

        if (variante === 'contient') {
          const nbChiffres = randint(3, 7)
          const chiffreImpose = randint(1, 9)

          const total = 9 * Math.pow(10, nbChiffres - 1)
          const sansChiffre = 8 * Math.pow(9, nbChiffres - 1)
          reponse = total - sansChiffre

          texte = `Combien de nombres à $${nbChiffres}$ chiffres contiennent au moins une fois le chiffre $${chiffreImpose}$ ?`

          texteCorr = `On calcule le complémentaire : nombres sans le chiffre $${chiffreImpose}$.<br><br>`
          texteCorr += `$\\bullet$ Total de nombres à $${nbChiffres}$ chiffres : $9 \\times \\overline{A}_{${nbChiffres - 1}}^{10} = 9 \\times 10^{${nbChiffres - 1}} = ${texNombre(total)}$<br>`
          texteCorr += `$\\bullet$ Sans $${chiffreImpose}$ : premier parmi $8$ (pas $0$, pas $${chiffreImpose}$), les autres parmi $9$ : $8 \\times 9^{${nbChiffres - 1}} = ${texNombre(sansChiffre)}$<br><br>`
          texteCorr += `Avec au moins un $${chiffreImpose}$ : $${texNombre(total)} - ${texNombre(sansChiffre)} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else if (variante === 'commence') {
          const nbChiffres = randint(4, 7)
          const debut = randint(1, 9)

          reponse = Math.pow(10, nbChiffres - 1)

          texte = `Combien de nombres à $${nbChiffres}$ chiffres commencent par le chiffre $${debut}$ ?`

          texteCorr = `Le premier chiffre est fixé à $${debut}$.<br>`
          texteCorr += `Les $${nbChiffres - 1}$ suivants sont libres (arrangement avec répétition parmi $10$) :<br>`
          texteCorr += `$\\overline{A}_{${nbChiffres - 1}}^{10} = 10^{${nbChiffres - 1}} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else {
          const nbChiffres = randint(4, 6)
          const position = randint(2, nbChiffres - 1)
          const chiffre = randint(0, 9)
          const noms = [
            '',
            'première',
            'deuxième',
            'troisième',
            'quatrième',
            'cinquième',
            'sixième',
          ]

          reponse = 9 * Math.pow(10, nbChiffres - 2)

          texte = `Combien de nombres à $${nbChiffres}$ chiffres ont un $${chiffre}$ en ${noms[position]} position ?`

          texteCorr = `La ${noms[position]} position est fixée à $${chiffre}$.<br>`
          texteCorr += `Pour le premier chiffre : $9$ choix (pas $0$). Les $${nbChiffres - 2}$ autres : $\\overline{A}_{${nbChiffres - 2}}^{10} = 10^{${nbChiffres - 2}}$.<br>`
          texteCorr += `$9 \\times 10^{${nbChiffres - 2}} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        }
      } else {
        // Ensemble restreint
        const variante = choice(['superieur', 'inferieur', 'sousEnsemble'])

        if (variante === 'superieur') {
          const nbChiffres = randint(3, 7)
          const seuil = randint(3, 7)

          const chiffresDisponibles = 10 - seuil
          reponse = Math.pow(chiffresDisponibles, nbChiffres)

          texte = `Combien de nombres à $${nbChiffres}$ chiffres ne s'écrivent qu'avec des chiffres $\\geqslant ${seuil}$ ?`

          texteCorr = `Les chiffres disponibles sont $\\{${seuil}, ${seuil + 1}, \\ldots, 9\\}$, soit $${chiffresDisponibles}$ chiffres (tous $\\geqslant 1$).<br>`
          texteCorr += `Arrangement avec répétition :<br>`
          texteCorr += `$\\overline{A}_{${nbChiffres}}^{${chiffresDisponibles}} = ${chiffresDisponibles}^{${nbChiffres}} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else if (variante === 'inferieur') {
          const nbChiffres = randint(3, 4)
          const seuil = randint(4, 7)

          const chiffresDisponibles = seuil
          reponse =
            (chiffresDisponibles - 1) *
            Math.pow(chiffresDisponibles, nbChiffres - 1)

          texte = `Combien de nombres à $${nbChiffres}$ chiffres ne s'écrivent qu'avec des chiffres strictement inférieurs à $${seuil}$ ?`

          texteCorr = `Chiffres disponibles : $\\{0, 1, \\ldots, ${seuil - 1}\\}$, soit $${chiffresDisponibles}$ chiffres.<br>`
          texteCorr += `Le premier chiffre $\\neq 0$ : $${chiffresDisponibles - 1}$ choix.<br>`
          texteCorr += `Les autres : $\\overline{A}_{${nbChiffres - 1}}^{${chiffresDisponibles}} = ${chiffresDisponibles}^{${nbChiffres - 1}}$.<br><br>`
          texteCorr += `$${chiffresDisponibles - 1} \\times ${chiffresDisponibles}^{${nbChiffres - 1}} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        } else {
          const nbChiffres = randint(3, 5)
          const chiffres = [1, 2, 3, 4, 5].slice(0, randint(3, 5))
          const nbDisponibles = chiffres.length
          reponse = Math.pow(nbDisponibles, nbChiffres)

          texte = `Combien de nombres à $${nbChiffres}$ chiffres peut-on écrire en n'utilisant que les chiffres $\\{${chiffres.join(', ')}\\}$ (avec répétition autorisée) ?`

          texteCorr = `On a $${nbDisponibles}$ chiffres disponibles (tous non nuls). Arrangement avec répétition :<br>`
          texteCorr += `$\\overline{A}_{${nbChiffres}}^{${nbDisponibles}} = ${nbDisponibles}^{${nbChiffres}} = ${miseEnEvidence(texNombre(reponse, 0))}$`
        }
      }

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
          texteAvant: '<br>',
        })
        handleAnswers(this, i, {
          reponse: { value: reponse.toString() },
        })
      }

      if (this.questionJamaisPosee(i, typeQuestion, reponse)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
