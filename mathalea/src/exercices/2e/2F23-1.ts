import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { extraireRacineCarree } from '../../lib/outils/calculs'
import { texFractionReduite } from '../../lib/outils/deprecatedFractions'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import Exercice from '../Exercice'

import {
  lireFormulaireComplexe,
  serialiseFormulaireComplexe,
  valeursParDefaut,
  type FormulaireComplexe,
} from '../../lib/formulaireComplexe'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
export const titre =
  'Résoudre algébriquement une équation $f(x)=k$ avec une fonction de référence'
export const dateDePublication = '07/01/2022'
export const dateDeModifImportante = '16/05/2024'
export const interactifReady = true

/**
 *
 *
 * @author Gilles Mora // suppression des calcul des texNombre et simplification des racines carrées de fration par Jean-claude Lhote // adaptation été 2026 : Stéphane Guyon
 *
 */
export const uuid = 'de0d1'

export const refs = {
  'fr-fr': ['2F23-1'],
  'fr-ch': [],
}

const formulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'liste',
      nom: 'fonctions',
      label: 'Fonctions de référence',
      items: [
        { nom: 'carre', label: '$x^2=k$', actif: true },
        { nom: 'inverse', label: '$\\dfrac{1}{x}=k$', actif: true },
        { nom: 'valeurAbsolue', label: '$|x|=k$', actif: true },
        {
          nom: 'cube',
          label: '$x^3=k$ (année de transition)',
          actif: false,
        },
        {
          nom: 'racineCarree',
          label: '$\\sqrt{x}=k$ (année de transition)',
          actif: false,
        },
      ],
    },
    {
      type: 'selection',
      nom: 'typeEquation',
      label: 'Choix des questions',
      options: [
        { valeur: 'directe', label: 'Équation directe' },
        { valeur: 'indirecte', label: 'Équation indirecte' },
        { valeur: 'melange', label: 'Mélange' },
      ],
      defaut: 'directe',
    },
  ],
}

export default class EquationsFonctionsRef extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireComplexe = formulaire
    this.sup = serialiseFormulaireComplexe(
      formulaire,
      valeursParDefaut(formulaire),
    )
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = false

    this.nbQuestions = 3
  }

  nouvelleVersion() {
    const parametres = lireFormulaireComplexe(formulaire, this.sup)
    const numerosParFonction: Record<string, number> = {
      carre: 1,
      racineCarree: 2,
      inverse: 3,
      cube: 4,
      valeurAbsolue: 5,
    }
    const fonctionsCochees = parametres.listeActive('fonctions')
    const fonctionsDisponibles =
      fonctionsCochees.length > 0
        ? fonctionsCochees
        : parametres.declares('fonctions').filter((item) => item.poids > 0)
    const listeTypeDeQuestions = combinaisonListes(
      fonctionsDisponibles.map((fonction) => numerosParFonction[fonction.nom]),
      this.nbQuestions,
    )

    let sousChoix
    // ça c'est casse-gueule ! Il faut que chaque type de question ait le même nombre de sous-choix !!!
    const typeEquation = parametres.selection('typeEquation')
    if (typeEquation === 'directe') {
      sousChoix = combinaisonListes([0], this.nbQuestions) // On ne prend que la première question de chaque catégorie
    } else if (typeEquation === 'indirecte') {
      sousChoix = combinaisonListes([1, 2, 3], this.nbQuestions) // pour choisir aléatoirement des questions dans chaque catégorie
    } else {
      sousChoix = combinaisonListes([0, 1, 2, 3], this.nbQuestions)
    }
    for (
      let i = 0,
        texte,
        texteCorr,
        a,
        b,
        c,
        k,
        k1,
        f1,
        listeaEtb,
        choix,
        enonce,
        correction,
        reponse,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // on ne choisit que des nombres compris entre 1 et 20

      switch (listeTypeDeQuestions[i]) {
        case 1: // x^2=k
          switch (
            sousChoix[i] //
          ) {
            case 0:
              a = randint(0, 15) ** 2
              b = 0
              k = choice([
                choice([2, 3, 5, 7, 10, 11, 13, 15, 17, 19, 21, 23, 26]) *
                  choice([-1, 1]),
                a,
              ])
              enonce = `Résoudre, dans $\\mathbb{R}$, :<br>
              ${sp(50)} $x^2=${k}$`
              correction = ''
              if (this.correctionDetaillee) {
                correction += `L'équation $x^2=k$ admet :<br>
                $\\bullet~$ deux solutions lorsque $k>0$ : $-\\sqrt{k}$ et $\\sqrt{k}$  ;<br>
                $\\bullet~$ une unique solution égale à $0$ lorsque $k=0$ ; <br>
                $\\bullet~$ aucune solution lorsque $k<0$.<br><br>
        `
              }
              if (k > 0) {
                correction += `L'équation est de la forme $x^2=k$ avec $k=${k}$. Comme  $${k}>0$ alors l'équation admet deux solutions : $-\\sqrt{${k}}$ et $\\sqrt{${k}}$.<br>
                `
                if (k === a) {
                  reponse = `\\{-${Math.sqrt(k)};${Math.sqrt(k)}\\}`

                  correction += `Comme $-\\sqrt{${k}}=-${Math.sqrt(k)}$ et $\\sqrt{${k}}=${Math.sqrt(k)}$ alors
                les solutions de l'équation peuvent s'écrire plus simplement : $-${Math.sqrt(k)}$ et $${Math.sqrt(k)}$.<br>
                Ainsi,  $S=${miseEnEvidence(`\\{-${Math.sqrt(k)};${Math.sqrt(k)}\\}`)}$.`
                } else {
                  reponse = `\\{-\\sqrt{${k}};\\sqrt{${k}}\\}`
                  correction += `Ainsi,  $S=${miseEnEvidence(`\\{-\\sqrt{${k}};\\sqrt{${k}}\\}`)}$.`
                }
              } else {
                if (k === 0) {
                  reponse = '\\{0\\}'
                  correction += `L'équation est de la forme $x^2=k$ avec $k=${k}$. Comme $k=${k}$ alors L'équation admet une unique solution : $0$.<br>
                Ainsi, $S=${miseEnEvidence('\\{0\\}')}$.`
                } else {
                  correction += `L'équation est de la forme $x^2=k$ avec $k=${k}$. Comme $${k}<0$, alors l'équation n'admet aucune solution.<br>
                  Ainsi, $S=${miseEnEvidence('\\emptyset')}$.`
                  reponse = '\\emptyset'
                }
              }

              break
            case 1: // x^2+b=c
              b = randint(-15, 15, 0)
              a = randint(0, 15) ** 2
              k = choice([
                choice([2, 3, 5, 7, 10, 11, 13, 15, 17, 19, 21, 23, 26]) *
                  choice([-1, 1]),
                a,
              ])
              c = k + b
              enonce = `Résoudre, dans $\\mathbb{R}$, :<br>
              ${sp(50)} $x^2${ecritureAlgebrique(b)}=${c}$`
              correction =
                'On isole $x^2$ dans le membre de gauche pour obtenir une équation du type $x^2=k$.<br> '
              if (b > 0) {
                correction += `$\\begin{aligned}
             x^2${ecritureAlgebrique(b)}&=${c}\\\\
             x^2${ecritureAlgebrique(b)}-${miseEnEvidence(b)}&=${c}-${miseEnEvidence(b)}\\\\
             x^2&=${c - b}
             \\end{aligned}$`
              } else {
                correction += `$\\begin{aligned}
             x^2${ecritureAlgebrique(b)}&=${c}\\\\
             x^2${ecritureAlgebrique(b)}+${miseEnEvidence(-b)}&=${c}+${miseEnEvidence(-b)}\\\\
             x^2&=${c - b}
             \\end{aligned}$`
              }
              if (k > 0) {
                if (k === a) {
                  correction += `<br>L'équation est de la forme $x^2=k$ avec $k=${texNombre(k, 0)}$. Comme $${texNombre(k, 0)}>0$,  l'équation a deux solutions : $-\\sqrt{${texNombre(k, 0)}}$ et $\\sqrt{${texNombre(k, 0)}}$.<br> Comme $-\\sqrt{${texNombre(k, 0)}}=-${extraireRacineCarree(k)[0]}$ et $\\sqrt{${k}}=${extraireRacineCarree(k)[0]}$ alors
                les solutions de l'équation peuvent s'écrire plus simplement : $-${extraireRacineCarree(k)[0]}$ et $${extraireRacineCarree(k)[0]}$.<br>
                Ainsi,  $S=${miseEnEvidence(`\\{-${extraireRacineCarree(k)[0]};${extraireRacineCarree(k)[0]}\\}`)}$.`
                  reponse = `\\{-${extraireRacineCarree(k)[0]};${extraireRacineCarree(k)[0]}\\}`
                } else {
                  if (extraireRacineCarree(k)[1] !== k) {
                    correction += `<br>L'équation est de la forme $x^2=k$ avec $k=${texNombre(k, 0)}$. Comme $${texNombre(k, 0)}>0$, l'équation a deux solutions : $-\\sqrt{${texNombre(k, 0)}}$ et $\\sqrt{${texNombre(k, 0)}}$. <br>
                    Comme $-\\sqrt{${k}}=-${extraireRacineCarree(k)[0]}\\sqrt{${extraireRacineCarree(k)[1]}}$ et $\\sqrt{${k}}=${extraireRacineCarree(k)[0]}\\sqrt{${extraireRacineCarree(k)[1]}}$ alors
                    les solutions de l'équation peuvent s'écrire plus simplement : $-${extraireRacineCarree(k)[0]}\\sqrt{${extraireRacineCarree(k)[1]}}$ et $${extraireRacineCarree(k)[0]}\\sqrt{${extraireRacineCarree(k)[1]}}$.<br>
                    Ainsi,  $S=${miseEnEvidence(`\\{-${extraireRacineCarree(k)[0]}\\sqrt{${extraireRacineCarree(k)[1]}};${extraireRacineCarree(k)[0]}\\sqrt{${extraireRacineCarree(k)[1]}}\\}`)}$.`
                    reponse = `\\{-${extraireRacineCarree(k)[0]}\\sqrt{${extraireRacineCarree(k)[1]}};${extraireRacineCarree(k)[0]}\\sqrt{${extraireRacineCarree(k)[1]}}\\}`
                  } else {
                    correction += `<br>L'équation est de la forme $x^2=k$ avec $k=${c - b}$. Comme $${c - b}>0$, l'équation a deux solutions : $-\\sqrt{${c - b}}$ et $\\sqrt{${c - b}}$.<br>
                    Ainsi,  $S=${miseEnEvidence(`\\{-\\sqrt{${c - b}};\\sqrt{${c - b}}\\}`)}$.`
                    reponse = `\\{-\\sqrt{${c - b}};\\sqrt{${c - b}}\\}`
                  }
                }
              } else if (k === 0) {
                correction += `<br>L'équation est de la forme $x^2=k$ avec $k=${texNombre(k, 0)}$, alors l'équation a une solution : $0$.<br>
              Ainsi, $S=${miseEnEvidence('\\{0\\}')}$. `
                reponse = '\\{0\\}'
              } else {
                correction += `<br>L'équation est de la forme $x^2=k$ avec $k=${texNombre(c - b, 0)}$. Comme $${texNombre(c - b, 0)}<0$, l'équation n'a pas de solution.<br>Ainsi, $S=${miseEnEvidence('\\emptyset')}$. `
                reponse = '\\emptyset'
              }
              break
            case 2: // -x^2+b=c
              b = randint(-15, 15, 0)
              a = randint(0, 15) ** 2
              k = choice([
                choice([2, 3, 5, 7, 10, 11, 13, 15, 17, 19, 21, 23, 26]) *
                  choice([-1, 1]),
                a,
              ])
              c = b - k
              enonce = `Résoudre, dans $\\mathbb{R}$, :<br>
              ${sp(50)} $-x^2${ecritureAlgebrique(b)}=${c}$`
              correction =
                'On isole $x^2$ dans le membre de gauche pour obtenir une équation du type $x^2=k$.<br> '
              if (b > 0) {
                correction += `$\\begin{aligned}
             -x^2+${b}&=${c}\\\\
             -x^2${ecritureAlgebrique(b)}-${miseEnEvidence(b)}&=${c}-${miseEnEvidence(b)}\\\\
             -x^2&=${c - b}\\\\
             x^2&=${b - c}
             \\end{aligned}$`
              } else {
                correction += `$\\begin{aligned}
             -x^2${ecritureAlgebrique(b)}&=${c}\\\\
             -x^2${ecritureAlgebrique(b)}+${miseEnEvidence(-b)}&=${c}+${miseEnEvidence(-b)}\\\\
             -x^2&=${c - b}\\\\
             x^2&=${b - c}
             \\end{aligned}$`
              }

              if (k > 0) {
                if (k === a) {
                  correction += `<br>L'équation est de la forme $x^2=k$ avec $k=${texNombre(k, 0)}$. Comme $${texNombre(k, 0)}>0$, l'équation a deux solutions : $-\\sqrt{${texNombre(k, 0)}}$ et $\\sqrt{${texNombre(k, 0)}}$.<br>Comme $-\\sqrt{${texNombre(k, 0)}}=-${extraireRacineCarree(k)[0]}$ et $\\sqrt{${k}}=${extraireRacineCarree(k)[0]}$ alors
                les solutions de l'équation peuvent s'écrire plus simplement : $-${extraireRacineCarree(k)[0]}$ et $${extraireRacineCarree(k)[0]}$.<br>
                Ainsi,  $S=${miseEnEvidence(`\\{-${extraireRacineCarree(k)[0]};${extraireRacineCarree(k)[0]}\\}`)}$.`
                  reponse = `\\{-${extraireRacineCarree(k)[0]};${extraireRacineCarree(k)[0]}\\}`
                } else {
                  if (extraireRacineCarree(k)[1] !== k) {
                    correction += `<br>L'équation est de la forme $x^2=k$ avec $k=${texNombre(k, 0)}$. Comme $${texNombre(k, 0)}>0$, l'équation a deux solutions : $-\\sqrt{${texNombre(k, 0)}}$ et $\\sqrt{${texNombre(k, 0)}}$.<br>Comme $-\\sqrt{${k}}=-${extraireRacineCarree(k)[0]}\\sqrt{${extraireRacineCarree(k)[1]}}$ et $\\sqrt{${k}}=${extraireRacineCarree(k)[0]}\\sqrt{${extraireRacineCarree(k)[1]}}$ alors
                    les solutions de l'équation peuvent s'écrire plus simplement : $-${extraireRacineCarree(k)[0]}\\sqrt{${extraireRacineCarree(k)[1]}}$ et $${extraireRacineCarree(k)[0]}\\sqrt{${extraireRacineCarree(k)[1]}}$.<br>
                    Ainsi,  $S=${miseEnEvidence(`\\{-${extraireRacineCarree(k)[0]}\\sqrt{${extraireRacineCarree(k)[1]}};${extraireRacineCarree(k)[0]}\\sqrt{${extraireRacineCarree(k)[1]}}\\}`)}$.`
                    reponse = `\\{-${extraireRacineCarree(k)[0]}\\sqrt{${extraireRacineCarree(k)[1]}};${extraireRacineCarree(k)[0]}\\sqrt{${extraireRacineCarree(k)[1]}}\\}`
                  } else {
                    correction += `<br>L'équation est de la forme $x^2=k$ avec $k=${texNombre(k, 0)}$. Comme $${texNombre(k, 0)}>0$, alors l'équation a deux solutions : $-\\sqrt{${texNombre(k, 0)}}$ et $\\sqrt{${texNombre(k, 0)}}$.<br>
                    Ainsi,  $S=${miseEnEvidence(`\\{-\\sqrt{${k}};\\sqrt{${k}}\\}`)}$.`
                    reponse = `\\{-\\sqrt{${k}};\\sqrt{${k}}\\}`
                  }
                }
              } else if (k === 0) {
                correction += `<br>L'équation est de la forme $x^2=k$ avec $k=${texNombre(k, 0)}$, donc l'équation a une solution : $0$.<br>
              Ainsi, $S=${miseEnEvidence('\\{0\\}')}$. `
                reponse = '\\{0\\}'
              } else {
                correction += `<br>L'équation est de la forme $x^2=k$ avec $k=${texNombre(b - c)}$. Comme $${texNombre(b - c)}<0$, l'équation n'a pas de solution.<br> Ainsi, $S=${miseEnEvidence('\\emptyset')}$. `
                reponse = '\\emptyset'
              }
              break

            case 3: // ax^2+b=c
            default:
              a = randint(-10, 10, [-1, 0, 1])
              b = randint(-10, 10, 0)
              c = randint(-10, 10, 0)
              k = (c - b) / a
              f1 = new FractionEtendue(c - b, a)
              enonce = `Résoudre, dans $\\mathbb{R}$, :<br>
              ${sp(50)} $${a}x^2${ecritureAlgebrique(b)}=${c}$`
              correction =
                'On isole $x^2$ dans le membre de gauche pour obtenir une équation du type $x^2=k$.<br> '
              if (b > 0) {
                correction += `$\\begin{aligned}
              ${a}x^2${ecritureAlgebrique(b)}&=${c}\\\\
              ${a}x^2${ecritureAlgebrique(b)}-${miseEnEvidence(b)}&=${c}-${miseEnEvidence(b)}\\\\
              ${a}x^2&=${c - b}\\\\
                         x^2&=${f1.texFractionSimplifiee}
             \\end{aligned}$`
              } else {
                correction += `$\\begin{aligned}
             ${a}x^2${ecritureAlgebrique(b)}&=${c}\\\\
             ${a}x^2${ecritureAlgebrique(b)}+${miseEnEvidence(-b)}&=${c}+${miseEnEvidence(-b)}\\\\
             ${a}x^2&=${c - b}\\\\
                        x^2&=${f1.texFractionSimplifiee}
            \\end{aligned}$`
              }
              if (k > 0) {
                if (
                  c - b === a ||
                  c - b === 4 * a ||
                  c - b === 9 * a ||
                  c - b === 16 * a ||
                  c - b === 25 * a
                ) {
                  correction += `<br>L'équation est de la forme $x^2=k$ avec $k=${texNombre(k, 0)}$. Comme $${texNombre(k, 0)}>0$, alors l'équation a deux solutions : $-\\sqrt{${texNombre(k, 0)}}$ et $\\sqrt{${texNombre(k, 0)}}$.<br>  Comme $-\\sqrt{${texNombre(k, 0)}}=-${extraireRacineCarree(k)[0]}$ et $\\sqrt{${k}}=${extraireRacineCarree(k)[0]}$ alors
                les solutions de l'équation peuvent s'écrire plus simplement : $-${extraireRacineCarree(k)[0]}$ et $${extraireRacineCarree(k)[0]}$.<br> Ainsi, $S=${miseEnEvidence(`\\left\\{-${extraireRacineCarree(k)[0]};${extraireRacineCarree(k)[0]}\\right\\}`)}$.`
                  reponse = `\\{-${extraireRacineCarree(k)[0]};${extraireRacineCarree(k)[0]}\\}`
                } else {
                  if (
                    (c - b === 4 && a === 9) ||
                    (c - b === 9 && a === 4) ||
                    (c - b === 16 && a === 9) ||
                    (c - b === 9 && a === 16)
                  ) {
                    correction += `<br>L'équation est de la forme $x^2=k$ avec $k=${f1.texFractionSimplifiee}$. Comme $${texFractionReduite(c - b, a)}>0$, alors l'équation a deux solutions : $-\\sqrt{${texFractionReduite(c - b, a)}}$ et $\\sqrt{${texFractionReduite(c - b, a)}}$.<br>
                      Comme $-\\sqrt{${f1.texFractionSimplifiee}}=-\\dfrac{${extraireRacineCarree(c - b)[0]}}{${extraireRacineCarree(a)[0]}}$ et $\\sqrt{${f1.texFractionSimplifiee}}=\\dfrac{${extraireRacineCarree(c - b)[0]}}{${extraireRacineCarree(a)[0]}}$ alors
                  les solutions de l'équation peuvent s'écrire plus simplement : $-\\dfrac{${extraireRacineCarree(c - b)[0]}}{${extraireRacineCarree(a)[0]}}$ et $\\dfrac{${extraireRacineCarree(c - b)[0]}}{${extraireRacineCarree(a)[0]}}$.<br>
                  Ainsi, $S=${miseEnEvidence(`\\left\\{-\\dfrac{${extraireRacineCarree(c - b)[0]}}{${extraireRacineCarree(a)[0]}};\\dfrac{${extraireRacineCarree(c - b)[0]}}{${extraireRacineCarree(a)[0]}}\\right\\}`)}$`
                    reponse = `\\{-\\dfrac{${extraireRacineCarree(c - b)[0]}}{${extraireRacineCarree(a)[0]}};\\dfrac{${extraireRacineCarree(c - b)[0]}}{${extraireRacineCarree(a)[0]}}\\}`
                  } else {
                    correction += `<br>L'équation est de la forme $x^2=k$ avec $k=${f1.texFractionSimplifiee}$. Comme $${f1.texFractionSimplifiee}>0$, alors l'équation a deux solutions :
                  $-\\sqrt{${f1.texFractionSimplifiee}}$ et $\\sqrt{${f1.texFractionSimplifiee}}$. <br>
                  Ainsi, $S=${miseEnEvidence(`\\left\\{-\\sqrt{${f1.texFractionSimplifiee}};\\sqrt{${f1.texFractionSimplifiee}}\\right\\}`)}$`
                    reponse = `\\{-\\sqrt{${f1.texFractionSimplifiee}};\\sqrt{${f1.texFractionSimplifiee}}\\}`
                  }
                }
              } else {
                if (c - b === 0) {
                  correction += `<br>L'équation est de la forme $x^2=k$ avec $k=0$. Alorsl'équation a une solution : $0$.<br>
                Ainsi, $S=${miseEnEvidence('\\{0\\}')}$. `
                  reponse = '\\{0\\}'
                } else {
                  correction += `<br>L'équation est de la forme $x^2=k$ avec $k=${f1.texFractionSimplifiee}$. Comme $${f1.texFractionSimplifiee}<0$, alors l'équation n'a pas de solution. <br>
                Ainsi, $S=${miseEnEvidence('\\emptyset')}$. `
                  reponse = '\\emptyset'
                }
              }

              break
          }
          break
        case 2: // 'sqrt(x)=k'
          switch (sousChoix[i]) {
            case 0: // sqrt(x)=k
              a = 0
              b = 0
              k = randint(-25, 25, 0)
              enonce = `Résoudre dans $[0${sp(1)};${sp(1)}+\\infty[$ :<br>
                            ${sp(50)} $\\sqrt{x}=${k}$`
              correction = ''
              if (this.correctionDetaillee) {
                correction += `Pour tout réel $x$ positif ou nul, l'équation $\\sqrt{x}=k$ admet :<br>
                $\\bullet~$ une solution  si $k\\geqslant 0$ : $k^2$ ;<br>
                $\\bullet~$  aucune solution si $k<0$.<br>
               `
              }
              if (k < 0) {
                correction += `L'équation est de la forme $\\sqrt{x}=k$. Comme $k=${k}$ et $${k}<0$ alors l'équation n'admet pas de solution.<br>
              Ainsi,   $S=${miseEnEvidence('\\emptyset')}$.
              `
                reponse = '\\emptyset'
              } else {
                correction += `$k=${k}$ et $${k}>0$ donc l'équation admet une solution : $${k}^2=${k ** 2}$.<br>
               Ainsi $S=${miseEnEvidence(`\\{${k ** 2}\\}`)}$.
              `
                reponse = `\\{${k ** 2}\\}`
              }
              break

            case 1: // sqrt(x)+b=c
              a = 0
              b = randint(-10, 10, 0)
              c = randint(-10, 10)
              k = c - b
              enonce = `Résoudre dans $[0${sp(1)};${sp(1)}+\\infty[$ :<br>
                ${sp(50)} $\\sqrt{x}${ecritureAlgebrique(b)}=${c}$`

              if (b > 0) {
                correction = `On isole $\\sqrt{x}$ dans le membre de gauche pour obtenir une équation du type $\\sqrt{x}=k$.<br>
                $\\begin{aligned}
                \\sqrt{x}${ecritureAlgebrique(b)}&=${c}\\\\
                \\sqrt{x}${ecritureAlgebrique(b)}-${miseEnEvidence(b)}&=${c}-${miseEnEvidence(b)}\\\\
                \\sqrt{x}&=${c - b}
                               \\end{aligned}$<br>`
              } else {
                correction = `On isole $\\sqrt{x}$ dans le membre de gauche pour obtenir une équation du type $\\sqrt{x}=k$.<br>
                               $\\begin{aligned}
                               \\sqrt{x}${ecritureAlgebrique(b)}&=${c}\\\\
                               \\sqrt{x}${ecritureAlgebrique(b)}+${miseEnEvidence(-b)}&=${c}+${miseEnEvidence(-b)}\\\\
                               \\sqrt{x}&=${c - b}
                                              \\end{aligned}$<br>`
              }
              if (c - b < 0) {
                correction += `L'équation est de la forme $\\sqrt{x}=k$ avec $k=${k}$. Comme $${k}<0$ alors l'équation n'admet pas de solution. <br>
Ainsi,   $S=${miseEnEvidence('\\emptyset')}$.<br>
`
                reponse = '\\emptyset'
              } else {
                correction += `L'équation est de la forme $\\sqrt{x}=k$ avec $k=${c - b}$. Comme $${c - b}\\geqslant 0$ alors l'équation admet une solution : $${k}^2=${k ** 2}$.<br>
   Ainsi $S=${miseEnEvidence(`\\{${k ** 2}\\}`)}$.
  `
                reponse = `\\{${k ** 2}\\}`
              }

              break
            case 2: // -sqrt(x)+b=c
              a = 0 // ça ne sert à rien sauf pour différentier les questions
              b = randint(-10, 10, 0)
              c = randint(-10, 10)
              k = b - c
              enonce = `Résoudre dans $[0${sp(1)};${sp(1)}+\\infty[$ :<br>
                ${sp(50)} $-\\sqrt{x}${ecritureAlgebrique(b)}=${c}$`
              if (b > 0) {
                correction = `On isole $\\sqrt{x}$ dans le membre de gauche pour obtenir une équation du type $\\sqrt{x}=k$.<br>
                $\\begin{aligned}
                -\\sqrt{x}${ecritureAlgebrique(b)}&=${c}\\\\
                -\\sqrt{x}${ecritureAlgebrique(b)}-${miseEnEvidence(b)}&=${c}-${miseEnEvidence(b)}\\\\
                -\\sqrt{x}&=${c - b}\\\\
                \\sqrt{x}&=${b - c}
                               \\end{aligned}$<br>`
              } else {
                correction = `On isole $\\sqrt{x}$ dans le membre de gauche pour obtenir une équation du type $\\sqrt{x}=k$.<br>
                               $\\begin{aligned}
                               -\\sqrt{x}${ecritureAlgebrique(b)}&=${c}\\\\
                               -\\sqrt{x}${ecritureAlgebrique(b)}+${miseEnEvidence(-b)}&=${c}+${miseEnEvidence(-b)}\\\\
                               -\\sqrt{x}&=${c - b}\\\\
                               \\sqrt{x}&=${b - c}
                                              \\end{aligned}$<br>`
              }
              if (k < 0) {
                correction += `L'équation est de la forme $\\sqrt{x}=k$ avec $k=${k}$. Comme $${k}<0$ alors l'équation n'admet pas de solution. <br>
Ainsi,   $S=${miseEnEvidence('\\emptyset')}$.<br>
`
                reponse = '\\emptyset'
              } else {
                correction += `L'équation est de la forme $\\sqrt{x}=k$ avec $k=${b - c}$. Comme $${b - c}\\geqslant0$ alors l'équation admet une solution : $${k}^2=${k ** 2}$.<br>
   Ainsi $S=${miseEnEvidence(`\\{${k ** 2}\\}`)}$.
  `
                reponse = `\\{${k ** 2}\\}`
              }

              break
            case 3: // a*sqrt(x)+b=c
            default:
              a = randint(-10, 10, [0, -1, 1])
              b = randint(-10, 10, 0)
              c = randint(-10, 10)
              k = (c - b) / a
              enonce = `Résoudre dans $[0${sp(1)};${sp(1)}+\\infty[$ :<br>
                ${sp(50)} $${a}\\sqrt{x}${ecritureAlgebrique(b)}=${c}$`
              if (b > 0) {
                correction = `On isole $\\sqrt{x}$ dans le membre de gauche pour obtenir une équation du type $\\sqrt{x}=k$.<br>
                $\\begin{aligned}
                ${a}\\sqrt{x}${ecritureAlgebrique(b)}&=${c}\\\\
                ${a}\\sqrt{x}${ecritureAlgebrique(b)}-${miseEnEvidence(b)}&=${c}-${miseEnEvidence(b)}\\\\
                ${a}\\sqrt{x}&=${c - b}\\\\
                \\sqrt{x}&=${texFractionReduite(c - b, a)}
                               \\end{aligned}$<br>`
              } else {
                correction = `On isole $\\sqrt{x}$ dans le membre de gauche pour obtenir une équation du type $\\sqrt{x}=k$.<br>
                               $\\begin{aligned}
                               ${a}\\sqrt{x}${ecritureAlgebrique(b)}&=${c}\\\\
                               ${a}\\sqrt{x}${ecritureAlgebrique(b)}+${miseEnEvidence(-b)}&=${c}+${miseEnEvidence(-b)}\\\\
                               ${a}\\sqrt{x}&=${c - b}\\\\
                               \\sqrt{x}&=${texFractionReduite(c - b, a)}
                                              \\end{aligned}$<br>`
              }
              if (k < 0) {
                correction += `L'équation est de la forme $\\sqrt{x}=k$ avec $k=${texFractionReduite(c - b, a)}$. Comme $${texFractionReduite(c - b, a)}<0$ alors l'équation n'admet pas de solution. <br>
Ainsi,    $S=${miseEnEvidence('\\emptyset')}$.<br>
`
                reponse = '\\emptyset'
              } else {
                correction += `L'équation est de la forme $\\sqrt{x}=k$ avec $k=${texFractionReduite(c - b, a)}$. Comme $${texFractionReduite(c - b, a)}\\geqslant0$ alors l'équation admet une solution : $\\left(${texFractionReduite(c - b, a)}\\right)^2=${texFractionReduite((c - b) ** 2, a ** 2)}$.<br>
   Ainsi $S=${miseEnEvidence(`\\left\\{${texFractionReduite((c - b) ** 2, a ** 2)}\\right\\}`)}$.
  `
                reponse = `\\{${texFractionReduite((c - b) ** 2, a ** 2)}\\}`
              }

              break
          }
          break
        case 3: // '1/x=k'
          switch (
            sousChoix[i] // sousChoix[i] = randint(0, 5)
          ) {
            case 0:
              b = 0
              a = 0
              k = choice([
                -3, -7, -6, 3, 6, 7, 9, -9, 0, -11, 11, -12, 12, -8, 8, -13, 13,
              ])

              enonce = `Résoudre dans $\\mathbb{R}^*$ :<br>
                ${sp(50)} $\\dfrac{1}{x}=${k}$`
              correction = ''
              if (this.correctionDetaillee) {
                correction += `L'équation $\\dfrac{1}{x}=k$ admet :<br>
                $\\bullet~$ si $k\\neq 0$, l'équation a une unique solution  : $\\dfrac{1}{k}$.<br>
                $\\bullet~$ si $k= 0$, l'équation n'admet pas de solution.<br>`
              }
              correction += ''
              if (k === 0) {
                correction += `L'équation est de la forme $\\dfrac{1}{x}=k$ avec $k=${k}$. Comme $k=${k}$, alors l'équation n'admet pas de solution.<br>
              Ainsi,   $S=${miseEnEvidence('\\emptyset')}$.
              `
                reponse = '\\emptyset'
              } else {
                correction += `L'équation est de la forme $\\dfrac{1}{x}=k$ avec $k=${k}$. Comme $${k}\\neq 0$ alors l'équation admet une solution :
                $${texFractionReduite(1, k)}$.<br>
               Ainsi $S=${miseEnEvidence(`\\left\\{${texFractionReduite(1, k)}\\right\\}`)}$.
              `
                reponse = `\\{${texFractionReduite(1, k)}\\}`
              }

              break

            case 1:
              a = 0
              k = choice([
                -3, -7, -6, 3, 6, 7, 9, -9, 0, -11, 11, -12, 12, -8, 8, -13, 13,
              ])
              b = randint(-10, 10, 0)
              c = k + b
              // k = c - b
              enonce = `Résoudre dans $\\mathbb{R}^*$ :<br>
                   ${sp(50)} $\\dfrac{1}{x}${ecritureAlgebrique(b)}=${c}$`
              correction = ''
              if (b > 0) {
                correction += `On isole $\\dfrac{1}{x}$ dans le membre de gauche pour obtenir une équation du type $\\dfrac{1}{x}=k$.<br>
                    $\\begin{aligned}
                    \\dfrac{1}{x}${ecritureAlgebrique(b)}&=${c}\\\\
                    \\dfrac{1}{x}${ecritureAlgebrique(b)}-${miseEnEvidence(b)}&=${c}-${miseEnEvidence(b)}\\\\
                    \\dfrac{1}{x}&=${c - b}
                                                \\end{aligned}$<br>`
              } else {
                correction += `On isole $\\dfrac{1}{x}$ dans le membre de gauche pour obtenir une équation du type $\\dfrac{1}{x}=k$.<br>
                                                $\\begin{aligned}
                                                \\dfrac{1}{x}${ecritureAlgebrique(b)}&=${c}\\\\
                                                \\dfrac{1}{x}${ecritureAlgebrique(b)}+${miseEnEvidence(-b)}&=${c}+${miseEnEvidence(-b)}\\\\
                                                \\dfrac{1}{x}&=${c - b}
                                                                            \\end{aligned}$<br>`
              }
              if (k === 0) {
                correction += `L'équation est de la forme $\\dfrac{1}{x}=k$ avec $k=${k}$. Donc l'équation n'admet pas de solution.<br>
                 Ainsi,   $S=${miseEnEvidence('\\emptyset')}$.
                 `
                reponse = '\\emptyset'
              } else {
                correction += `$k=${k}$ et $${k}\\neq 0$, donc l'équation est de la forme $\\dfrac{1}{x}=k$ avec $k=${k}$. Donc l'équation admet une solution :
                   $${texFractionReduite(1, k)}$.<br>
                  Ainsi $S=${miseEnEvidence(`\\left\\{${texFractionReduite(1, k)}\\right\\}`)}$.
                 `
                reponse = `\\{${texFractionReduite(1, k)}\\}`
              }
              break
            case 2:
              listeaEtb = [
                [5, 0],
                [3, 0],
                [10, 5],
                [6, 3],
                [2, 14],
                [1, 7],
                [2, 9],
                [3, 9],
                [9, 3],
                [2, 7],
                [4, 3],
                [10, 6],
                [5, 3],
                [4, 7],
                [10, 3],
                [6, 9],
                [4, 2],
              ]
              choix = choice(listeaEtb)
              a = choix[0] * choice([-1, 1])
              b = choix[1] * choice([-1, 1])
              k = b / a
              enonce = `Résoudre dans $\\mathbb{R}^*$ :<br>
                   ${sp(50)} $\\dfrac{${a}}{x}=${b}$`
              correction = ''
              correction += `On isole $\\dfrac{1}{x}$ dans le membre de gauche pour obtenir une équation du type $\\dfrac{1}{x}=k$.<br>
                    $\\begin{aligned}
                    \\dfrac{${a}}{x}&=${b}\\\\
                    \\dfrac{1}{x}&=${texFractionReduite(b, a)}${sp(20)}\\text{En divisant par } ${a} \\text{ dans chaque membre}\\\\
                                                \\end{aligned}$<br>`
              if (k === 0) {
                correction += `L'équation est de la forme $\\dfrac{1}{x}=k$ avec $k=${k}$. Donc l'équation n'admet pas de solution.<br>
                 Ainsi,   $S=${miseEnEvidence('\\emptyset')}$.
                 `
                reponse = '\\emptyset'
              } else {
                if (k % 1 === 0) {
                  correction += `L'équation est de la forme $\\dfrac{1}{x}=k$ avec $k=${texFractionReduite(b, a)}$. Donc l'équation admet une solution :
                   $\\dfrac{1}{${texFractionReduite(b, a)}}$.<br>
                  Ainsi $S=${miseEnEvidence(`\\left\\{${texFractionReduite(a, b)}\\right\\}`)}$.
                 `
                  reponse = `\\{${texFractionReduite(a, b)}\\}`
                } else {
                  correction += `L'équation est de la forme $\\dfrac{1}{x}=k$ avec $k=${texFractionReduite(b, a)}$. Donc l'équation admet une solution :
                 $\\dfrac{1}{${texFractionReduite(b, a)}}=${texFractionReduite(a, b)}$.<br>
                Ainsi $S=${miseEnEvidence(`\\left\\{${texFractionReduite(a, b)}\\right\\}`)}$.
               `
                  reponse = `\\{${texFractionReduite(a, b)}\\}`
                }
              }
              break
            case 3:
            default:
              a = randint(-10, 10, 0)
              b = randint(-10, 10, 0)
              // c = randint(-10, 10, 0)
              k = choice([
                -3, -7, -6, 3, 6, 7, 9, -9, 0, -11, 11, -12, 12, -8, 8, -13, 13,
              ])
              c = a * k + b
              // k = (c - b) / a
              enonce = `Résoudre dans $\\mathbb{R}^*$ :<br>
                   ${sp(50)} $\\dfrac{${a}}{x}${ecritureAlgebrique(b)}=${c}$`
              correction = ''
              if (b > 0) {
                correction += `On isole $\\dfrac{1}{x}$ dans le membre de gauche pour obtenir une équation du type $\\dfrac{1}{x}=k$.<br>
                    $\\begin{aligned}
                    \\dfrac{${a}}{x}${ecritureAlgebrique(b)}&=${c}\\\\
                    \\dfrac{${a}}{x}${ecritureAlgebrique(b)}-${miseEnEvidence(b)}&=${c}-${miseEnEvidence(b)}\\\\
                    \\dfrac{${a}}{x}&=${c - b}\\\\
                    \\dfrac{1}{x}&=${texFractionReduite(c - b, a)}${sp(20)}\\text{En divisant par } ${a} \\text{ dans chaque membre}
                                                \\end{aligned}$<br>`
              } else {
                correction += `On isole $\\dfrac{1}{x}$ dans le membre de gauche pour obtenir une équation du type $\\dfrac{1}{x}=k$.<br>
                                                $\\begin{aligned}
                                                \\dfrac{${a}}{x}${ecritureAlgebrique(b)}&=${c}\\\\
                                                \\dfrac{${a}}{x}${ecritureAlgebrique(b)}+${miseEnEvidence(-b)}&=${c}+${miseEnEvidence(-b)}\\\\
                                                \\dfrac{${a}}{x}&=${c - b}\\\\
                    \\dfrac{1}{x}&=${texFractionReduite(c - b, a)}${sp(20)}\\text{En divisant par } ${a} \\text{ dans chaque membre}\\\\
                                                                            \\end{aligned}$<br>`
              }
              if (k === 0) {
                correction += `L'équation est de la forme $\\dfrac{1}{x}=k$ avec $k=${texFractionReduite(c - b, a)}$. Donc l'équation n'admet pas de solution.<br>
                 Ainsi,   $S=${miseEnEvidence('\\emptyset')}$.
                 `
                reponse = '\\emptyset'
              } else {
                if (k % 1 === 0) {
                  correction += `L'équation est de la forme $\\dfrac{1}{x}=k$ avec $k=${texFractionReduite(c - b, a)}$. Donc l'équation  admet une solution :
                   $\\dfrac{1}{${texFractionReduite(c - b, a)}}$.<br>
                  Ainsi $S=${miseEnEvidence(`\\left\\{${texFractionReduite(a, c - b)}\\right\\}`)}$.
                 `
                  reponse = `\\{${texFractionReduite(a, c - b)}\\}`
                } else {
                  correction += `L'équation est de la forme $\\dfrac{1}{x}=k$ avec $k=${texFractionReduite(c - b, a)}$. Donc l'équation  admet une solution :
                 $\\dfrac{1}{${texFractionReduite(c - b, a)}}=${texFractionReduite(a, c - b)}$.<br>
                Ainsi $S=${miseEnEvidence(`\\left\\{${texFractionReduite(a, c - b)}\\right\\}`)}$.
               `
                  reponse = `\\{${texFractionReduite(a, c - b)}\\}`
                }
              }
              break
          }
          break

        case 4: // 'x^3=k'
          switch (
            sousChoix[i] // sousChoix[i] = randint(0, 5)
          ) {
            case 0:
              a = 0
              b = 0
              k1 = choice([-10, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 10])
              k = k1 ** 3

              enonce = `Résoudre, dans $\\mathbb{R}$, :<br>
                ${sp(50)} $x^3=${k}$`
              correction = ''
              if (this.correctionDetaillee) {
                correction += `Pour tout réel $k$, l'équation $x^3=k$ admet pour unique solution le nombre dont le cube est égal à $k$. <br>
                On peut noter ce nombre : $\\sqrt[3]{k}$. <br>`
              }
              correction += `L'équation est de la forme $x^3=k$ avec $k=${k}$. <br>
              Le nombre dont le cube est $${k}$ est $${k1}$ car $${ecritureParentheseSiNegatif(k1)}^3=${k}$.<br>
              Ainsi,   $S=\\{${k1}\\}$.
              `
              reponse = `\\{${k1}\\}`

              break

            case 1:
              a = 0
              b = randint(-10, 10, 0)
              k1 = choice([-10, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 10])
              k = k1 ** 3
              c = k + b
              enonce = `Résoudre, dans $\\mathbb{R}$, :<br>
                   ${sp(50)} $x^3${ecritureAlgebrique(b)}=${c}$`
              correction = ''
              if (b > 0) {
                correction += `On isole $x^3$ dans le membre de gauche pour obtenir une équation du type $x^3=k$.<br>
                    $\\begin{aligned}
                    x^3${ecritureAlgebrique(b)}&=${c}\\\\
                    x^3${ecritureAlgebrique(b)}-${miseEnEvidence(b)}&=${c}-${miseEnEvidence(b)}\\\\
                    x^3&=${c - b}
                                                \\end{aligned}$<br>`
              } else {
                correction += `On isole $x^3$ dans le membre de gauche pour obtenir une équation du type $x^3=k$.<br>
                                                $\\begin{aligned}
                                                x^3${ecritureAlgebrique(b)}&=${c}\\\\
                                                x^3${ecritureAlgebrique(b)}+${miseEnEvidence(-b)}&=${c}+${miseEnEvidence(-b)}\\\\
                                                x^3&=${c - b}
                                                                            \\end{aligned}$<br>`
              }
              correction += `L'équation est de la forme $x^3=k$ avec $k=${k}$. <br>
              Le nombre dont le cube est $${k}$ est $${k1}$ car $${ecritureParentheseSiNegatif(k1)}^3=${k}$.<br>
              Ainsi,   $S=\\{${k1}\\}$.
              `
              reponse = `\\{${k1}\\}`

              break
            case 2:
              a = randint(-10, 10, [0, -1, 1])
              b = 0
              k1 = choice([-10, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 10])
              k = k1 ** 3
              c = k * a
              enonce = `Résoudre, dans $\\mathbb{R}$, :<br>
                     ${sp(50)} $${a}x^3=${c}$`
              correction = ''

              correction += `On isole $x^3$ dans le membre de gauche pour obtenir une équation du type $x^3=k$.<br>
                      $\\begin{aligned}
                      ${a}x^3&=${c}\\\\
                      x^3&=${texFractionReduite(c, a)}\\\\
                                                  \\end{aligned}$<br>`

              correction += `L'équation est de la forme $x^3=k$ avec $k=${k}$. <br>
              Le nombre dont le cube est $${k}$ est $${k1}$ car $${ecritureParentheseSiNegatif(k1)}^3=${k}$.<br>
              Ainsi,   $S=\\{${k1}\\}$.
              `
              reponse = `\\{${k1}\\}`
              break
            case 3:
            default:
              a = randint(-10, 10, [0, -1, 1])
              b = randint(-10, 10, [0, -1, 1])
              k1 = choice([-10, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 10])
              k = k1 ** 3
              c = k * a + b
              enonce = `Résoudre, dans $\\mathbb{R}$, :<br>
                     ${sp(50)} $${a}x^3${ecritureAlgebrique(b)}=${c}$`
              correction = ''

              if (b > 0) {
                correction += `On isole $x^3$ dans le membre de gauche pour obtenir une équation du type $x^3=k$.<br>
                      $\\begin{aligned}
                      ${a}x^3${ecritureAlgebrique(b)}&=${c}\\\\
                      ${a}x^3${ecritureAlgebrique(b)}-${miseEnEvidence(b)}&=${c}-${miseEnEvidence(b)}\\\\
                      ${a}x^3&=${texNombre(c - b, 0)}\\\\
                      x^3&=${texFractionReduite(c - b, a)}\\\\
                                                  \\end{aligned}$<br>`
              } else {
                correction += `On isole $x^3$ dans le membre de gauche pour obtenir une équation du type $x^3=k$.<br>
                      $\\begin{aligned}
                      ${a}x^3${ecritureAlgebrique(b)}&=${c}\\\\
                      ${a}x^3${ecritureAlgebrique(b)}+${miseEnEvidence(-b)}&=${c}+${miseEnEvidence(-b)}\\\\
                      ${a}x^3&=${texNombre(c - b, 0)}\\\\
                      x^3&=${texFractionReduite(c - b, a)}\\\\
                                                  \\end{aligned}$<br>`
              }

              correction += `L'équation est de la forme $x^3=k$ avec $k=${k}$. <br>
              Le nombre dont le cube est $${k}$ est $${k1}$ car $${ecritureParentheseSiNegatif(k1)}^3=${k}$.<br>
              Ainsi,   $S=\\{${k1}\\}$.
              `
              reponse = `\\{${k1}\\}`
              break
          }
          break

        case 5: // '|x|=k'
        default:
          switch (sousChoix[i]) {
            case 0:
              a = 1
              b = 0
              k = randint(-10, 10)
              c = k
              enonce = `Résoudre, dans $\\mathbb{R}$, :<br>
                ${sp(50)} $|x|=${k}$`
              correction = `L'équation est de la forme $|x|=k$ avec $k=${k}$.<br>`
              break

            case 1:
              a = 1
              b = randint(-10, 10, 0)
              k = randint(-10, 10)
              c = k + b
              enonce = `Résoudre, dans $\\mathbb{R}$, :<br>
                ${sp(50)} $|x|${ecritureAlgebrique(b)}=${c}$`
              correction =
                'On isole $|x|$ dans le membre de gauche pour obtenir une équation du type $|x|=k$.<br>'
              if (b > 0) {
                correction += `$\\begin{aligned}
                  |x|${ecritureAlgebrique(b)}&=${c}\\\\
                  |x|${ecritureAlgebrique(b)}-${miseEnEvidence(b)}&=${c}-${miseEnEvidence(b)}\\\\
                  |x|&=${k}
                \\end{aligned}$<br>`
              } else {
                correction += `$\\begin{aligned}
                  |x|${ecritureAlgebrique(b)}&=${c}\\\\
                  |x|${ecritureAlgebrique(b)}+${miseEnEvidence(-b)}&=${c}+${miseEnEvidence(-b)}\\\\
                  |x|&=${k}
                \\end{aligned}$<br>`
              }
              break

            case 2:
              a = -1
              b = randint(-10, 10, 0)
              k = randint(-10, 10)
              c = b - k
              enonce = `Résoudre, dans $\\mathbb{R}$, :<br>
                ${sp(50)} $-|x|${ecritureAlgebrique(b)}=${c}$`
              correction = `On isole $|x|$ dans le membre de gauche pour obtenir une équation du type $|x|=k$.<br>
                $\\begin{aligned}
                  -|x|${ecritureAlgebrique(b)}&=${c}\\\\
                  -|x|&=${c - b}\\\\
                  |x|&=${b - c}
                \\end{aligned}$<br>`
              break

            case 3:
            default:
              a = randint(-10, 10, [-1, 0, 1])
              b = randint(-10, 10, 0)
              k = randint(-10, 10)
              c = a * k + b
              enonce = `Résoudre, dans $\\mathbb{R}$, :<br>
                ${sp(50)} $${a}|x|${ecritureAlgebrique(b)}=${c}$`
              correction = `On isole $|x|$ dans le membre de gauche pour obtenir une équation du type $|x|=k$.<br>`
              if (b > 0) {
                correction += `$\\begin{aligned}
                  ${a}|x|${ecritureAlgebrique(b)}&=${c}\\\\
                  ${a}|x|&=${c}-${b}\\\\
                  |x|&=${texFractionReduite(c - b, a)}
                \\end{aligned}$<br>`
              } else {
                correction += `$\\begin{aligned}
                  ${a}|x|${ecritureAlgebrique(b)}&=${c}\\\\
                  ${a}|x|&=${c}+${-b}\\\\
                  |x|&=${texFractionReduite(c - b, a)}
                \\end{aligned}$<br>`
              }
              break
          }

          if (k > 0) {
            reponse = `\\{-${k};${k}\\}`
            correction += `Comme $${k}>0$, les nombres dont la valeur absolue est égale à $${k}$ sont $-${k}$ et $${k}$.<br>
              Ainsi, $S=${miseEnEvidence(`\\{-${k};${k}\\}`)}$.`
          } else if (k === 0) {
            reponse = '\\{0\\}'
            correction += `Le seul nombre dont la valeur absolue est nulle est $0$.<br>
              Ainsi, $S=${miseEnEvidence('\\{0\\}')}$.`
          } else {
            reponse = '\\emptyset'
            correction += `Une valeur absolue est toujours positive ou nulle. Comme $${k}<0$, l'équation n'admet donc aucune solution.<br>
              Ainsi, $S=${miseEnEvidence('\\emptyset')}$.`
          }
          break
      }
      handleAnswers(this, i, {
        reponse: { value: reponse, options: { ensembleDeNombres: true } },
      })
      texte =
        enonce +
        ajouteChampTexteMathLive(this, i, KeyboardType.clavierEnsemble, {
          texteAvant: '<br>$S=$',
          texteApres: '<br>$\\textit{Respecter les notations}$.',
        })
      texteCorr = correction
      if (this.questionJamaisPosee(i, listeTypeDeQuestions[i], a, b, k)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
