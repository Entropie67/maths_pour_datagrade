import { tableauColonneLigne } from '../../lib/2d/tableau'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { AddTabDbleEntryMathlive } from '../../lib/interactif/tableaux/AjouteTableauMathlive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { numAlpha } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenuSansNumero,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
export const titre = "Compléter et utiliser un tableau d'effectif"
export const dateDePublication = '08/01/2024'
export const interactifReady = true

export const dateDeModifImportante = '08/01/2026'
/**
 * Compléter ou utiliser un tableau
 * @author Gilles Mora +Jean-claude Lhote pour l'interactif

 */
export const uuid = '3f39d'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

export default class TableauProportion extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Types de questions',
      'nombres séparés par des tirets\n1 : Tableau à compléter \n2 : Tableau à utiliser\n3 : Mélange',
    ]

    this.spacing = context.isHtml ? 1.5 : 2
    this.spacingCorr = context.isHtml ? 1 : 2
    this.nbQuestions = 1
    this.sup = 2

    this.listeAvecNumerotation = true
    this.exoCustomResultat = true
    this.nbQuestionsModifiable = true
  }

  nouvelleVersion() {
    this.answers = {}

    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })
    const toutPourUn: (l: number[]) => [number, number] = (
      listePoints: number[],
    ) => [Math.min(...listePoints), 1]
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    let index = 0
    let increment = 1
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typesDeQuestions = listeTypeDeQuestions[i]

      let total, totalGA, totalF, totalG, totalT, GAetG, FetG, GAetT, FetT
      let pourcGA, pourcG, pourcGAetG, pourcF, pourcT

      if (typesDeQuestions === 1) {
        // Pour le cas "compléter le tableau", on utilise des combinaisons pré-calculées
        // garantissant que tous les calculs de pourcentages donnent des entiers
        const combinaisons = [
          // total=300: divisible par 2, 3, 4, 5, 6, 10, 12, 15, 20, 25, 30, 50, 60, 75, 100
          { total: 300, pourcGA: 50, pourcG: 60, pourcGAetG: 30 }, // 150, 180, 90
          { total: 300, pourcGA: 48, pourcG: 64, pourcGAetG: 32 }, // 144, 192, 96
          { total: 300, pourcGA: 52, pourcG: 66, pourcGAetG: 34 }, // 156, 198, 102
          { total: 300, pourcGA: 54, pourcG: 68, pourcGAetG: 36 }, // 162, 204, 108

          // total=400: divisible par 2, 4, 5, 8, 10, 16, 20, 25, 40, 50, 80, 100
          { total: 400, pourcGA: 50, pourcG: 65, pourcGAetG: 30 }, // 200, 260, 120
          { total: 400, pourcGA: 45, pourcG: 60, pourcGAetG: 25 }, // 180, 240, 100
          { total: 400, pourcGA: 55, pourcG: 70, pourcGAetG: 35 }, // 220, 280, 140
          { total: 400, pourcGA: 48, pourcG: 62, pourcGAetG: 28 }, // 192, 248, 112

          // total=500: divisible par 2, 4, 5, 10, 20, 25, 50, 100
          { total: 500, pourcGA: 50, pourcG: 60, pourcGAetG: 30 }, // 250, 300, 150
          { total: 500, pourcGA: 48, pourcG: 64, pourcGAetG: 32 }, // 240, 320, 160
          { total: 500, pourcGA: 52, pourcG: 66, pourcGAetG: 34 }, // 260, 330, 170
          { total: 500, pourcGA: 54, pourcG: 68, pourcGAetG: 36 }, // 270, 340, 180
          { total: 500, pourcGA: 56, pourcG: 70, pourcGAetG: 38 }, // 280, 350, 190

          // total=600: divisible par 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 25, 30, 40, 50, 60, 75, 100
          { total: 600, pourcGA: 50, pourcG: 65, pourcGAetG: 30 }, // 300, 390, 180
          { total: 600, pourcGA: 45, pourcG: 60, pourcGAetG: 25 }, // 270, 360, 150
          { total: 600, pourcGA: 55, pourcG: 70, pourcGAetG: 35 }, // 330, 420, 210
          { total: 600, pourcGA: 48, pourcG: 62, pourcGAetG: 28 }, // 288, 372, 168
        ]

        const combi = choice(combinaisons)
        total = combi.total
        pourcGA = combi.pourcGA
        pourcG = combi.pourcG
        pourcGAetG = combi.pourcGAetG

        // Calculer les effectifs (tous sont garantis entiers)
        totalGA = (pourcGA * total) / 100
        totalF = total - totalGA
        totalG = (pourcG * total) / 100
        totalT = total - totalG
        GAetG = (pourcGAetG * total) / 100

        // Calculer les autres valeurs
        FetG = totalG - GAetG
        GAetT = totalGA - GAetG
        FetT = totalF - FetG

        // Calculer les pourcentages pour l'énoncé
        pourcF = arrondi((totalF * 100) / total, 0)
        pourcT = arrondi((totalT * 100) / total, 0)
      } else {
        // Pour le cas "utiliser le tableau", on peut utiliser l'ancienne méthode
        total = choice([240, 280, 320, 342, 360, 420, 450, 480])

        pourcGA = choice([48, 52, 54, 56, 58])
        totalGA = Math.round((pourcGA * total) / 100)
        totalF = total - totalGA

        pourcG = choice([62, 64, 66, 68])
        totalG = Math.round((pourcG * total) / 100)
        totalT = total - totalG

        pourcGAetG = choice([28, 31, 34, 37, 40])
        GAetG = Math.round((pourcGAetG * total) / 100)

        FetG = totalG - GAetG
        GAetT = totalGA - GAetG
        FetT = totalF - FetG
        pourcF = arrondi((totalF * 100) / total, 0)
        pourcT = arrondi((totalT * 100) / total, 0)
      }
      const choix = choice([true, false])
      let texte = ''
      let texteCorr = ''

      const choixEnonce = choice([
        [
          `Dans un lycée, on compte $${total}$ élèves en classe de première dont $${texNombre(pourcGA, 0)} \\,\\%$ sont des garçons et $${texNombre(pourcG, 0)} \\,\\%$ sont dans une filière générale. <br>
      De plus, $${texNombre(pourcGAetG, 0)} \\,\\%$ des élèves sont des garçons en première générale.`,
          `$\\bullet$ $${texNombre(pourcGA, 0)} \\,\\%$ de $${total}=${texNombre(pourcGA / 100, 2)}\\times ${total}=${totalGA}$<br>
      $${totalGA}$ élèves sont des garçons.<br><br>
      $\\bullet$ $${texNombre(pourcG, 0)} \\,\\%$ de $${total}=${texNombre(pourcG / 100, 2)}\\times ${total}=${totalG}$<br>
      $${totalG}$ élèves sont en filière génarale.<br><br>
      $\\bullet$ $${texNombre(pourcGAetG, 0)} \\,\\%$ de $${total}=${texNombre(pourcGAetG / 100, 2)}\\times ${total}=${GAetG}$<br>
      $${GAetG}$ élèves sont des garçons en filière générale.<br><br>`,
        ],
        [
          `Dans un lycée, on compte $${total}$ élèves en classe de première dont $${texNombre(pourcF, 0)} \\,\\%$ sont des filles et $${texNombre(pourcT, 0)} \\,\\%$ sont dans une filière technologique. <br>
      De plus, $${texNombre(pourcGAetG, 0)} \\,\\%$ des élèves sont des garçons en première générale.`,
          `$\\bullet$ $${texNombre(pourcF, 0)} \\,\\%$ de $${total}=${texNombre(pourcF / 100, 2)}\\times ${total}=${totalF}$<br>
      $${totalF}$ élèves sont des filles.<br><br>
      $\\bullet$ $${texNombre(pourcT, 0)} \\,\\%$ de $${total}=${texNombre(pourcT / 100, 2)}\\times ${total}=${totalT}$<br>
      $${totalT}$ élèves sont en filière technologique.<br><br>
      $\\bullet$ $${texNombre(pourcGAetG, 0)} \\,\\%$ de $${total}=${texNombre(pourcGAetG / 100, 2)}\\times ${total}=${GAetG}$<br>
      $${GAetG}$ élèves sont des garçons en filière générale.<br><br>`,
        ],
      ])
      const entetesCol = [
        '~',
        '\\text{Garçons}',
        '\\text{Filles}',
        '\\text{Total}',
      ]
      const entetesLgn = [
        '\\text{Première générale}',
        '\\text{Première technologique}',
        '\\text{Total}',
      ]
      const contenu = ['', '', '', '', '', '', '', '', '']
      switch (typesDeQuestions) {
        case 1: // tableau à compléter
          texte = `${choixEnonce[0]}`
          texte += '<br> Compléter le tableau suivant :<br><br>'
          if (this.interactif) {
            const tableauVide =
              AddTabDbleEntryMathlive.convertTclToTableauMathlive(
                entetesCol,
                entetesLgn,
                ['', '', '', '', '', '', '', '', ''],
              )
            const tabMathlive = AddTabDbleEntryMathlive.create(
              this.numeroExercice ?? 0,
              index,
              tableauVide,
              ' ',
              this.interactif,
              {},
            )
            texte += tabMathlive.output
          } else {
            texte += tableauColonneLigne(
              entetesCol,
              entetesLgn,
              contenu,
              1,
              true,
              this.numeroExercice,
              i,
            )
          }
          texteCorr = `${choixEnonce[1]}`
          texteCorr += 'On en déduit le tableau suivant : <br> <br>'
          texteCorr += tableauColonneLigne(
            ['~', '\\text{Garçons}', '\\text{Filles}', '\\text{Total}'],
            [
              '\\text{Première générale}',
              '\\text{Première technologique}',
              '\\text{Total}',
            ],
            [
              `${miseEnEvidence(GAetG)}`,
              `${miseEnEvidence(FetG)}`,
              `${miseEnEvidence(totalG)}`,
              `${miseEnEvidence(GAetT)}`,
              `${miseEnEvidence(FetT)}`,
              `${miseEnEvidence(totalT)}`,
              `${miseEnEvidence(totalGA)}`,
              `${miseEnEvidence(totalF)}`,
              `${miseEnEvidence(total)}`,
            ],
            1,
            true,
            this.numeroExercice,
            i,
          )
          handleAnswers(this, index, {
            bareme: toutPourUn,
            L1C1: { value: GAetG },
            L1C2: { value: FetG },
            L1C3: { value: totalG },
            L2C1: { value: GAetT },
            L2C2: { value: FetT },
            L2C3: { value: totalT },
            L3C1: { value: totalGA },
            L3C2: { value: totalF },
            L3C3: { value: total },
          })
          increment = 1
          break
        case 2: // tableau à utiliser
          texte = `Dans un lycée, on compte $${total}$ élèves en classe de première.<br>
        Ils sont répartis selon le tableau suivant :<br><br> `
          texte += tableauColonneLigne(
            ['~', '\\text{Garçons}', '\\text{Filles}', '\\text{Total}'],
            [
              '\\text{Filière générale}',
              '\\text{Filière technologique}',
              '\\text{Total}',
            ],
            [
              `${GAetG}`,
              `${FetG}`,
              `${totalG}`,
              `${GAetT}`,
              `${FetT}`,
              `${totalT}`,
              `${totalGA}`,
              `${totalF}`,
              `${total}`,
            ],
          )

          texte += `<br><br>${numAlpha(0)} Quelle est la proportion de ${choix ? 'filles' : 'garçons'} en première technologique parmi les élèves de ce lycée ?<br>`
          handleAnswers(this, index, {
            reponse: {
              value: choix
                ? new FractionEtendue(FetT, total).texFraction
                : new FractionEtendue(GAetT, total).texFraction,
            },
          })
          texte += `Sous la forme d'une fraction : ${this.interactif ? '' : '$\\ldots$'}`
          texte += ajouteChampTexteMathLive(
            this,
            index,
            KeyboardType.clavierDeBaseAvecFraction,
          )
          handleAnswers(this, index + 1, {
            reponse: {
              value: choix
                ? texNombre((FetT * 100) / total, 0)
                : texNombre((GAetT * 100) / total, 0),
            },
          })
          texte += `<br>Sous la forme d'un pourcentage (arrondir à l'unité si besoin) : ${this.interactif ? '' : '$\\ldots\\,\\%$'}`
          texte += ajouteChampTexteMathLive(
            this,
            index + 1,
            KeyboardType.clavierNumbers,
            {
              texteApres: '%',
            },
          )

          texte += `<br><br>${numAlpha(1)} Quelle est la proportion de ${choix ? 'filles' : 'garçons'} en première technologique parmi les élèves en première technologique ?<br>`
          handleAnswers(this, index + 2, {
            reponse: {
              value: choix
                ? new FractionEtendue(FetT, totalT).texFraction
                : new FractionEtendue(GAetT, totalT).texFraction,
            },
          })
          texte += `Sous la forme d'une fraction : ${this.interactif ? '' : '$\\ldots$'}`
          texte += ajouteChampTexteMathLive(
            this,
            index + 2,
            KeyboardType.clavierDeBaseAvecFraction,
          )
          handleAnswers(this, index + 3, {
            reponse: {
              value: choix
                ? arrondi((FetT * 100) / totalT, 0)
                : arrondi((GAetT * 100) / totalT, 0),
            },
          })
          texte += `<br>Sous la forme d'un pourcentage (arrondir à l'unité si besoin) : ${this.interactif ? '' : '$\\ldots\\,\\%$'}`
          texte += ajouteChampTexteMathLive(
            this,
            index + 3,
            KeyboardType.clavierNumbers,
            {
              texteApres: '%',
            },
          )

          texte += `<br><br>${numAlpha(2)} Quelle est la proportion de ${choix ? 'filles' : 'garçons'} en première technologique parmi les ${choix ? 'filles' : 'garçons'} ?<br>`
          handleAnswers(this, index + 4, {
            reponse: {
              value: choix
                ? new FractionEtendue(FetT, totalF).texFraction
                : new FractionEtendue(GAetT, totalGA).texFraction,
            },
          })
          texte += `Sous la forme d'une fraction : ${this.interactif ? '' : '$\\ldots$'}`
          texte += ajouteChampTexteMathLive(
            this,
            index + 4,
            KeyboardType.clavierDeBaseAvecFraction,
          )
          handleAnswers(this, index + 5, {
            reponse: {
              value: choix
                ? arrondi((FetT * 100) / totalF, 0)
                : arrondi((GAetT * 100) / totalGA, 0),
            },
          })
          texte += `<br>Sous la forme d'un pourcentage (arrondir à l'unité si besoin) : ${this.interactif ? '' : '$\\ldots\\,\\%$'}`
          texte += ajouteChampTexteMathLive(
            this,
            index + 5,
            KeyboardType.clavierNumbers,
            {
              texteApres: '%',
            },
          )

          texteCorr = `${numAlpha(0)} La proportion de ${choix ? 'filles' : 'garçons'} en première technologique parmi les élèves de ce lycée est donnée par le quotient : 
          ${choix ? ` $${miseEnEvidence(`\\dfrac{${FetT}}{${total}}`)}$.` : ` $${miseEnEvidence(`\\dfrac{${GAetT}}{${total}}`)}$.`} <br>
         Sous la forme d'un pourcentage, on obtient : ${choix ? ` $${miseEnEvidence(`${texNombre(arrondi((FetT * 100) / total, 1), 1)} \\,\\%`)}$.` : ` $${miseEnEvidence(`${texNombre(arrondi((GAetT * 100) / total, 1), 1)} \\,\\%`)}$.`}<br>
         Arrondi à l'unité : ${choix ? ` $${miseEnEvidence(`${arrondi((FetT * 100) / total, 0)} \\,\\%`)}$.` : ` $${miseEnEvidence(`${arrondi((GAetT * 100) / total, 0)} \\,\\%`)}$.`}<br>`

          texteCorr += `${numAlpha(1)} La proportion de ${choix ? 'filles' : 'garçons'} en première technologique parmi les élèves en première technologique est donnée par le quotient : 
          ${choix ? ` $${miseEnEvidence(`\\dfrac{${FetT}}{${totalT}}`)}$.` : ` $${miseEnEvidence(`\\dfrac{${GAetT}}{${totalT}}`)}$.`} <br>
         Sous la forme d'un pourcentage, on obtient : ${choix ? ` $${miseEnEvidence(`${texNombre(arrondi((FetT * 100) / totalT, 1), 1)} \\,\\%`)}$.` : ` $${miseEnEvidence(`${texNombre(arrondi((GAetT * 100) / totalT, 1), 1)} \\,\\%`)}$.`}<br>
         Arrondi à l'unité : ${choix ? ` $${miseEnEvidence(`${arrondi((FetT * 100) / totalT, 0)} \\,\\%`)}$.` : ` $${miseEnEvidence(`${arrondi((GAetT * 100) / totalT, 0)} \\,\\%`)}$.`}<br>`

          texteCorr += `${numAlpha(2)} La proportion de ${choix ? 'filles' : 'garçons'} en première technologique parmi les ${choix ? 'filles' : 'garçons'} est donnée par le quotient : 
         ${choix ? ` $${miseEnEvidence(`\\dfrac{${FetT}}{${totalF}}`)}$.` : ` $${miseEnEvidence(`\\dfrac{${GAetT}}{${totalGA}}`)}$.`} <br>
        Sous la forme d'un pourcentage, on obtient : ${choix ? ` $${miseEnEvidence(`${texNombre(arrondi((FetT * 100) / totalF, 1), 1)} \\,\\%`)}$.` : ` $${miseEnEvidence(`${texNombre(arrondi((GAetT * 100) / totalGA, 1), 1)} \\,\\%`)}$.`}<br>
        Arrondi à l'unité : ${choix ? ` $${miseEnEvidence(`${arrondi((FetT * 100) / totalF, 0)} \\,\\%`)}$.` : ` $${miseEnEvidence(`${arrondi((GAetT * 100) / totalGA, 0)} \\,\\%`)}$.`}`

          increment = 6
          break
      }

      if (this.questionJamaisPosee(i, total, typesDeQuestions)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
        index += increment
      }
      cpt++
    }
    listeQuestionsToContenuSansNumero(this)
  }
}
