import { fixeBordures } from '../../lib/2d/fixeBordures'
import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { MetaInteractif2d } from '../../lib/2d/interactif2d'
import { Latex2d } from '../../lib/2d/textes'
import { troisPointsProportionnels } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  ajouteChampTexteMathLive,
  ajouteFeedback,
} from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import { Arbre } from '../../modules/arbres'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer la probabilité d’un événement à partir de probabilités conditionnelles'
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '08/11/2026'

/**
 * Trois données : P(B), P_A(B) et P_{non A}(non B). On cherche P(A).
 * @author Stéphane Guyon
 */
export const uuid = '077ad'

export const refs = {
  'fr-fr': ['1P10-6'],
  'fr-ch': [],
}

export default class ProbaDepuisProbaTotale extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireCaseACocher = ["Demander l'arbre pondéré", true]
    this.sup = true
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    const bar = (s: string) => `\\overline{${s}}`
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const ev = choice([
        ['R', 'S'],
        ['A', 'B'],
        ['E', 'F'],
        ['M', 'N'],
        ['C', 'D'],
      ])
      const [A, B] = ev
      const pA = randint(2, 8) / 10
      const pBsachantA = randint(1, 9) / 10
      const pBsachantAb = randint(1, 9, [Math.round(pBsachantA * 10)]) / 10
      const pBbsachantAb = Math.round((1 - pBsachantAb) * 10) / 10
      const pBbsachantA = Math.round((1 - pBsachantA) * 10) / 10
      const pAb = Math.round((1 - pA) * 10) / 10
      const pB = Math.round((pA * pBsachantA + pAb * pBsachantAb) * 100) / 100

      // mode 'donnees' : les quatre probabilités conditionnelles, P(A) et P(Ā) masquées (« … »)
      // mode 'inconnue' : P(A) et P(Ā) notées x et 1-x ; mode 'complet' : tout est connu
      // mode 'aCompleter' : interactif, quatre champs (P(A), P(Ā), P_A(B̄), P_Ā(B)) posés dans l'arbre
      // Ordre : P(A), P(Ā), P_A(B), P_A(B̄), P_Ā(B), P_Ā(B̄) ; les indices pairs sont les branches du haut
      const marqueurs = ['@0', '@1', '@2', '@3', '@4', '@5']
      const construitFigure = (
        mode: 'donnees' | 'inconnue' | 'complet' | 'aCompleter',
        description: string,
      ) => {
        const premierNiveau = (
          nom: string,
          proba: number,
          alter: string,
          marqueur: string,
        ) => ({
          rationnel: false,
          nom,
          proba,
          ...(mode === 'complet'
            ? {}
            : {
                visible: false,
                alter:
                  mode === 'donnees'
                    ? '\\ldots'
                    : mode === 'aCompleter'
                      ? marqueur
                      : alter,
              }),
        })
        // Branche de second niveau : masquée par un marqueur en mode 'aCompleter' si elle est à compléter
        const secondNiveauArbre = (
          nom: string,
          proba: number,
          marqueur?: string,
        ) =>
          new Arbre({
            rationnel: false,
            nom,
            proba,
            ...(mode === 'aCompleter' && marqueur
              ? { visible: false, alter: marqueur }
              : {}),
          })
        const arbre = new Arbre({
          racine: true,
          nom: '',
          proba: 1,
          visible: false,
          alter: '',
          enfants: [
            new Arbre({
              ...premierNiveau(A, pA, 'x', '@0'),
              enfants: [
                secondNiveauArbre(B, pBsachantA, '@2'),
                secondNiveauArbre(bar(B), pBbsachantA, '@3'),
              ],
            }),
            new Arbre({
              ...premierNiveau(bar(A), pAb, '1-x', '@1'),
              enfants: [
                secondNiveauArbre(B, pBsachantAb, '@4'),
                secondNiveauArbre(bar(B), pBbsachantAb, '@5'),
              ],
            }),
          ],
        })
        arbre.setTailles()
        // Échelle plus grande avec les champs, pour laisser la place aux saisies
        let objets = arbre.represente(
          0,
          9,
          0,
          mode === 'aCompleter' ? 4 : 2,
          true,
          1,
          2,
        )
        if (mode === 'aCompleter') {
          // Les marqueurs repèrent les emplacements des probabilités à compléter :
          // chacun est remplacé par un champ MathLive à la même position.
          const positions: { x: number; y: number; index: number }[] = []
          const retire = (liste: unknown[]): unknown[] =>
            liste
              .filter((o) => {
                if (o instanceof Latex2d && marqueurs.includes(o.latex)) {
                  const index = marqueurs.indexOf(o.latex)
                  // Le champ est posé au-dessus (branche du haut) ou au-dessous (branche du bas) de la branche, pas dessus
                  positions.push({
                    x: o.x,
                    y: o.y + (index % 2 === 0 ? 1.6 : -1.6),
                    index,
                  })
                  return false
                }
                return true
              })
              .map((o) => (Array.isArray(o) ? retire(o) : o))
          objets = retire(objets) as typeof objets
          objets.push(
            new MetaInteractif2d(
              positions.map(({ x, y, index }) => ({
                x,
                y,
                content: '%{champ1}',
                classe: KeyboardType.clavierDeBaseAvecFraction,
                blanc: '\\ldots',
                opacity: 1,
                index,
              })),
              { exercice: this, question: i },
            ),
          )
        }
        return mathalea2d(
          Object.assign(
            { scale: 0.7, display: 'block', description } as const,
            fixeBordures(objets),
          ),
          objets,
        )
      }
      const secondNiveau = `Deuxième niveau, après ${A} : ${B} avec ${stringNombre(pBsachantA)} et ${bar(B)} avec ${stringNombre(pBbsachantA)}. Deuxième niveau, après ${bar(A)} : ${B} avec ${stringNombre(pBsachantAb)} et ${bar(B)} avec ${stringNombre(pBbsachantAb)}.`
      const figureDonnees = construitFigure(
        'donnees',
        `Arbre pondéré à deux niveaux. Les probabilités du premier niveau, pour ${A} et ${bar(A)}, sont à déterminer. ${secondNiveau}`,
      )
      const figureInconnue = construitFigure(
        'inconnue',
        `Arbre pondéré à deux niveaux. Premier niveau : ${A} avec la probabilité x et ${bar(A)} avec la probabilité 1 moins x. ${secondNiveau}`,
      )
      const figureComplete = construitFigure(
        'complet',
        `Arbre pondéré à deux niveaux. Premier niveau : ${A} avec la probabilité ${stringNombre(pA)} et ${bar(A)} avec la probabilité ${stringNombre(pAb)}. ${secondNiveau}`,
      )

      const enonce = `On considère deux événements $${A}$ et $${B}$ tels que $P(${B})=${texNombre(pB, 2)}$, $P_{${A}}(${B})=${texNombre(pBsachantA, 1)}$ et $P_{${bar(A)}}(${bar(B)})=${texNombre(pBbsachantAb, 1)}$.`
      const questionArbre = 'Représenter la situation par un arbre pondéré.'
      const questionP = `Calculer la probabilité de l'événement $${A}$.`
      // Interactif avec arbre demandé : une seule question, l'arbre à compléter
      const arbreInteractif = Boolean(this.sup && this.interactif)
      let texte: string
      if (arbreInteractif) {
        const figureACompleter = construitFigure(
          'aCompleter',
          `Arbre pondéré à deux niveaux, sans aucune probabilité écrite. Six champs de saisie : les probabilités de ${A} et de ${bar(A)}, puis celles de ${B} et de ${bar(B)} après ${A}, puis celles de ${B} et de ${bar(B)} après ${bar(A)}.`,
        )
        texte =
          `${enonce}<br>Compléter l'arbre pondéré ci-dessous.<br>${figureACompleter}` +
          `<span id="resultatCheckEx${this.numeroExercice}Q${i}"></span>` +
          ajouteFeedback(this, i)
        handleAnswers(
          this,
          i,
          {
            field0: { value: texNombre(pA, 1) },
            field1: { value: texNombre(pAb, 1) },
            field2: { value: texNombre(pBsachantA, 1) },
            field3: { value: texNombre(pBbsachantA, 1) },
            field4: { value: texNombre(pBsachantAb, 1) },
            field5: { value: texNombre(pBbsachantAb, 1) },
            bareme: troisPointsProportionnels,
          },
          { formatInteractif: 'MetaInteractif2d' },
        )
      } else {
        const champ = ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierDeBaseAvecFraction,
          { texteAvant: `<br>$P(${A})=$` },
        )
        handleAnswers(this, i, {
          reponse: { value: texNombre(pA, 1) },
          bareme: troisPointsProportionnels,
        })
        texte = this.sup
          ? enonce +
            createList({
              items: [questionArbre, questionP + champ],
              style: 'nombres',
            })
          : `${enonce}<br>${questionP}${champ}`
      }
      const complements = `Comme $P_{${bar(A)}}(${bar(B)})=${texNombre(pBbsachantAb, 1)}$, on a $P_{${bar(A)}}(${B})=1-${texNombre(pBbsachantAb, 1)}=${texNombre(pBsachantAb, 1)}$.<br>
De même, comme $P_{${A}}(${B})=${texNombre(pBsachantA, 1)}$, on a $P_{${A}}(${bar(B)})=1-${texNombre(pBsachantA, 1)}=${texNombre(pBbsachantA, 1)}$.<br>
On place ces valeurs sur l'arbre${sp()}:<br>${figureDonnees}`
      const calcul = `Notons $x=P(${A})$, avec $x\\in[0\\,;\\,1]$. Alors $P(${bar(A)})=1-x$.<br>${figureInconnue}
$${A}$ et $${bar(A)}$ forment une partition de l'univers. D'après la formule des probabilités totales${sp()}:<br>
$\\begin{aligned}
P(${B})&=P(${A})\\times P_{${A}}(${B})+P(${bar(A)})\\times P_{${bar(A)}}(${B})\\\\
${texNombre(pB, 2)}&=x\\times ${texNombre(pBsachantA, 1)}+(1-x)\\times ${texNombre(pBsachantAb, 1)}\\\\
${texNombre(pB, 2)}&=${texNombre(pBsachantAb, 1)}+x\\times(${texNombre(pBsachantA, 1)}-${texNombre(pBsachantAb, 1)})\\\\
x&=\\dfrac{${texNombre(pB, 2)}-${texNombre(pBsachantAb, 1)}}{${texNombre(pBsachantA, 1)}-${texNombre(pBsachantAb, 1)}}=${miseEnEvidence(texNombre(pA, 1))}
\\end{aligned}$`
      const arbreFinal = `<br>Une fois toutes les probabilités connues, on obtient l'arbre pondéré complet${sp()}:<br>${figureComplete}`
      const texteCorr =
        this.sup && !arbreInteractif
          ? createList({
              items: [complements, calcul + arbreFinal],
              style: 'nombres',
            })
          : `${complements}<br>${calcul}${arbreFinal}`

      if (this.questionJamaisPosee(i, pA, pBsachantA, pBsachantAb)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
