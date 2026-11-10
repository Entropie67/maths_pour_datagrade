import { fixeBordures } from '../../lib/2d/fixeBordures'
import { tableau, type StyledText } from '../../lib/2d/tableau'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { lister } from '../../lib/outils/ecritures'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Traduire la relation de dépendance entre deux grandeurs par un tableau de valeur'
export const dateDePublication = '28/05/2024'

/**
 *
 * @author Guillaume Valmont
 */
export const uuid = '01387'
export const refs = {
  'fr-fr': ['5N5B-6'],
  'fr-2016': ['5L17'],
  'fr-ch': ['1mF1-1', '10LCFA4C-7', '10LSFA4C-7', '11CTFA3C-7', '11LCFA3C-7', '11LSFA3C-7', 'PRQAL01B-7', 'PRQPF04C-4'],
}
export default class TraduireDependanceGrandeursTableau extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = 3
    this.besoinFormulaireNumerique = ['Nombre de calculs par question ', 10]
  }

  nouvelleVersion() {
    const nbCalculsParQuestion = Number(this.sup)

    const typeQuestionsDisponibles = [
      'Température ressentie',
      'Distance de freinage',
      'Pression en pascals',
      'Pression en bars',
      'Energie cinétique',
      "Prix d'un spectacle",
    ]

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    let ligne1: StyledText[] = []
    let ligne2: StyledText[] = []
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      switch (listeTypeQuestions[i]) {
        case 'Température ressentie': {
          // https://fr.wikipedia.org/wiki/Temp%C3%A9rature_ressentie
          const vitesseDuVent = randint(1, 50)
          const a =
            vitesseDuVent > 4.8
              ? arrondi(0.6215 + 0.3965 * vitesseDuVent ** 0.16, 2)
              : arrondi(1 + 0.2 * 0.1345 * vitesseDuVent, 2)
          const b =
            vitesseDuVent > 4.8
              ? arrondi(13.12 - 11.37 * vitesseDuVent ** 0.16, 2)
              : arrondi(-0.2 * 1.59 * vitesseDuVent, 2)
          const temperaturesACalculer: number[] = []
          for (let i = 0; i < nbCalculsParQuestion; i++) {
            temperaturesACalculer.push(randint(0, 10, temperaturesACalculer))
          }
          temperaturesACalculer.sort((a, b) => a - b)
          texte = `La température ressentie dépend de la vitesse du vent et de la température ambiante.<br>
Pour un vent de $${vitesseDuVent}\\text{ km/h}$, on peut calculer la Température Ressentie ($T_R$) à partir de la Température Ambiante ($T_A$) à l'aide de la formule suivante : $T_R = ${texNombre(a, 2)}T_A ${texNombre(b, 2)}$.<br>
En s'aidant d'un tableau, calculer les températures ressenties correspondant à des températures ambiantes de ${lister(temperaturesACalculer.map((t) => ` $${t}$ °C`))}.`
          ligne1 = makeLine(
            '\\text{Température Ambiante en °C } (T_A)',
            temperaturesACalculer.map((t) => t.toString()),
          )
          ligne2 = makeLine(
            '\\text{Température Ressentie en °C } (T_R)',
            temperaturesACalculer.map((t) => texNombre(a * t + b, 2, true)),
          )
          break
        }
        case 'Distance de freinage': {
          // https://fr.wikipedia.org/wiki/Distance_d%27arr%C3%AAt
          const secheOuMouillee = choice(['sèche', 'mouillée'])
          const msOuKmh = choice(['m/s', 'km/h'])
          const a0 = secheOuMouillee === 'sèche' ? -11 : -8.5
          const denominateur =
            msOuKmh === 'm/s' ? -2 * a0 : arrondi(-2 * a0 * 3.6 ** 2, 2)
          const vitesses: number[] = []
          for (let i = 0; i < nbCalculsParQuestion; i++) {
            vitesses.push(randint(10, msOuKmh === 'm/s' ? 36 : 130, vitesses))
          }
          vitesses.sort((a, b) => a - b)
          texte = `La distance de freinage d'un véhicule dépend de l'état de la route et de la vitesse à laquelle il roulait avant de commencer à freiner.<br>
Sur une route ${secheOuMouillee}, on peut calculer la Distance de Freinage $(DF)$ en mètres à partir de sa vitesse initiale $(v_0)$ en $\\text{${msOuKmh}}$ à l'aide de la formule $DF = \\dfrac{v_0^2}{${texNombre(denominateur, 2)}}$.<br>
En s'aidant d'un tableau, calculer les distances de freinage correspondant à des vitesses de ${lister(vitesses.map((t) => ` $${t}\\text{ ${msOuKmh}}$`))}.`
          ligne1 = makeLine(
            `\\text{Vitesse initiale en ${msOuKmh}} (v_0)`,
            vitesses,
          )
          ligne2 = makeLine(
            '\\text{Distance de Freinage en m} (DF)',
            vitesses.map((v0) => texNombre(v0 ** 2 / denominateur, 2, true)),
          )
          break
        }
        case 'Pression en pascals': {
          const profondeurs: number[] = []
          for (let i = 0; i < nbCalculsParQuestion; i++) {
            profondeurs.push(randint(1, 50, profondeurs))
          }
          profondeurs.sort((a, b) => a - b)
          texte = `La pression de l'eau dépend de la profondeur à laquelle on se trouve.<br>
On peut calculer la Pression $(P)$ en Pascal à partir de la Profondeur $(d)$ en mètres à l'aide de la formule $P = ${texNombre(1013)} + 980d$.<br>
En s'aidant d'un tableau, calculer les pressions correspondant à des profondeurs de ${lister(profondeurs.map((t) => ` $${t}\\text{ m}$`))}.`
          ligne1 = makeLine('\\text{Profondeur en m} (d)', profondeurs)
          ligne2 = makeLine(
            '\\text{Pression en Pa} (P)',
            profondeurs.map((d) => texNombre(1013 + 980 * d)),
          )
          break
        }
        case 'Pression en bars': {
          const profondeurs: number[] = []
          for (let i = 0; i < nbCalculsParQuestion; i++) {
            profondeurs.push(randint(1, 50, profondeurs))
          }
          profondeurs.sort((a, b) => a - b)
          texte = `La pression de l'eau dépend de la profondeur à laquelle on se trouve.<br>
On peut calculer la Pression $(P)$ en Bars à partir de la Profondeur $(d)$ en mètres à l'aide de la formule $P = 1,013 + 0,98d$.<br>
En s'aidant d'un tableau, calculer les pressions correspondant à des profondeurs de ${lister(profondeurs.map((t) => ` $${t}\\text{ m}$`))}.`
          ligne1 = makeLine('\\text{Profondeur en m} (d)', profondeurs)
          ligne2 = makeLine(
            '\\text{Pression en Bars} (P)',
            profondeurs.map((d) => texNombre(1.013 + 0.98 * d)),
          )
          break
        }
        case 'Energie cinétique': {
          const masse = randint(1, 50)
          const vitesses: number[] = []
          for (let i = 0; i < nbCalculsParQuestion; i++) {
            vitesses.push(randint(1, 50, vitesses))
          }
          vitesses.sort((a, b) => a - b)
          texte = `L'énergie cinétique dépend de la masse d'un objet et de sa vitesse.<br>
On peut calculer l'énergie cinétique $(E_c)$ en joules à partir de la masse $(m)$ en kg et de la vitesse $(v)$ en $\\text{m/s}$ à l'aide de la formule $E_c = \\dfrac{1}{2}mv^2$.<br>
En s'aidant d'un tableau, calculer les énergies cinétiques correspondant à des vitesses de ${lister(vitesses.map((t) => ` $${t}\\text{ m/s}$`))} pour une masse de $${masse}$ kg.`
          ligne1 = makeLine('\\text{Vitesse en m/s} (v)', vitesses)
          ligne2 = makeLine(
            '\\text{Energie Cinétique en J} (E_c)',
            vitesses.map((v) => texNombre(0.5 * masse * v ** 2, 2)),
          )
          break
        }
        case "Prix d'un spectacle": {
          const prixAbonnement = randint(10, 50)
          const prixUnitaire = randint(2, 7)
          const nombreDeSeances: number[] = []
          for (let i = 0; i < nbCalculsParQuestion; i++) {
            nombreDeSeances.push(randint(1, 50, nombreDeSeances))
          }
          nombreDeSeances.sort((a, b) => a - b)
          texte = `Après avoir payé un abonnement à ${prixAbonnement} €, on peut assister à des séances au tarif préférentiel de ${prixUnitaire} € la séance.<br>
On peut calculer le Prix Total $(P_T)$ en € à partir du Nombre de séances $(n)$ à l'aide de la formule $P_T = ${prixAbonnement} + ${prixUnitaire}n$.<br>
En s'aidant d'un tableau, calculer les prix totaux correspondant à ${lister(nombreDeSeances.map((t) => ` $${t}$`))} séances.`
          ligne1 = makeLine('\\text{Nombre de séances} (n)', nombreDeSeances)
          ligne2 = makeLine(
            '\\text{Prix Total en €} (P_T)',
            nombreDeSeances.map((n) =>
              texNombre(prixAbonnement + prixUnitaire * n),
            ),
          )
          break
        }
      }
      const monTableau = tableau({
        ligne1,
        ligne2,
        largeur: 3,
        largeurTitre: 13,
      })
      const bordures = fixeBordures([monTableau])
      texteCorr = mathalea2d(
        Object.assign(bordures, {
          scale: 0.6,
          display: 'block' as const,
        }),
        monTableau,
      )
      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
    function makeLine(
      label: string,
      values: (string | number)[],
    ): StyledText[] {
      return [label]
        .concat(values.map((t) => t.toString()))
        .map((texte) => ({ texte, latex: true, math: true }))
    }
  }
}
