// Cette liste d'imports se construit seul
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs, arrondi } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre = "Calculer le taux moyen d'évolution" // Ce titre est nécessaire et doit commencer par un verbe à l'infinitif

// Les éléménts ci-dessous sont nécessaires pour la prise en compte d'un champ classique pour l'interactivité
export const interactifReady = true

// Toujours utile cette information
export const dateDePublication = '18/10/2025'

/* Les éléments ci-dessous sont indispensables pour le référencement d'un exercice
         - uuid : C'est la plaque d'identité de l'exercice. Cette référence, une fois fournie, ne sera plus jamais changée et permettra
                  de toujours retrouver l'exercice depuis l'interface même s'il disparait (volontairement ou involontairement) du menu
          - refs : c'est l'identité de l'exercice pour être plus facilement identifiable par l'utilisateur.
                  Il y a une référence française et suisse
*/
export const uuid = 'ef3d7' // Cet élement doit être différent d un exercice à l autre. Lancer pnpm start pour copier l uuid
// aléatoire proposé par le moteur
export const refs = {
  'fr-fr': ['TTE-2', 'BP1CF12'], // Cet élément doit être choisi en lien avec le référentiel
  'fr-ch': [], // Cet élément peut rester vide et sera géré ultérieurement par Nathan, qui gère le référentiel suisse.
}

/**
 * Descriptif didacactique de l'exercice : Modèle d'exercice très simple pour la course aux nombres
 * @author Melissa Mansour // Information utile pour retrouver l'auteur d'un exercice

*/
export default class NomExercice extends ExerciceSimple {
  // NomExercice est un nom en CamelCase précisant la classe de l'exercice
  constructor() {
    super()
    this.typeExercice = 'simple' // On ne change pas ce type
    this.nbQuestions = 1 // Le nb de questions affiché à l'ouverture de l'exercice
  }

  nouvelleVersion() {
    const listeObj = [
      'la population de bactéries',
      `la température d'une pièce`,
    ]
    const obj = listeObj[randint(0, listeObj.length - 1)] // choix mot enoncé
    const n = randint(1, 3) // nb heure(s) BP
    const k = n * 60 // nb minutes BP
    const x = randint(10, 80) // pourcentage BP ?
    const coeffX = randint(-1, 1, [0]) // baisse ou augmentation
    const C = 1 + (coeffX * x) / 100 // coeff mult global
    const typeEvolVerbe = coeffX < 0 ? 'baisse' : 'augmente' // pour l'enoncé
    const typeEvolNom = coeffX < 0 ? 'baisse' : 'augmentation' // pour l'enoncé
    let texte1 = `Au bout de $${n}$ `
    texte1 += n > 1 ? 'heures, ' : 'heure, '
    texte1 +=
      obj +
      ` ` +
      typeEvolVerbe +
      ` de $${x}\\,\\%$.<br> Quel est le taux moyen d'évolution par minute de ` +
      obj +
      ` ?<br>`
    if (!this.interactif) texte1 += '<br> Arrondir à $0,1\\,\\%$ près.'
    const Cm = C ** (1 / k) // coeff mult moyen
    const tm = Cm - 1 // taux moyen
    const xm = tm * 100 // pourcentage moyen
    const xmArrondi1 = arrondi(xm, 1)
    const tmArrondi1 = arrondi(tm, 3)
    this.question = texte1
    this.reponse = xmArrondi1
    this.optionsChampTexte = {
      texteAvant: `Taux moyen d'évolution par minute de ${obj} arrondi à $0,1\\,\\%$ près : `,
      texteApres: '%',
    }
    const textcmGlobal =
      coeffX > 0
        ? `$C = 1 + \\dfrac{${x}}{100} = ${texNombre(C)}$.`
        : `$C = 1 - \\dfrac{${x}}{100} = ${texNombre(C)}$.`

    let textCorr = `Soit $t_m$ le taux moyen d'évolution par minute.<br>`
    textCorr += `Il s'agit d'une ${typeEvolNom}.`
    textCorr +=
      ` Donc, le coefficient multiplicateur global vaut ` + textcmGlobal
    textCorr += `<br>Dans $${n}$ ${n > 1 ? 'heures' : 'heure'}, il y a ${n === 1 ? '$60$' : `$${n} \\times 60$` + ' minutes ' + `$= ${k}$`} minutes, donc on résout l'équation suivante d'inconnue $t_m$ : <br><br>`
    textCorr += ` $\\qquad \\; \\; \\, (1+t_m)^{${k}}=C$<br>`
    textCorr += ` $\\iff (1+t_m)^{${k}}=${texNombre(C)}$<br>`
    textCorr += ` $\\iff 1+t_m= ${texNombre(C)}^{\\frac{1}{${k}}}$ car $1+t_m>0$<br> `
    textCorr += ` $\\iff t_m= ${texNombre(C)}^{\\frac{1}{${k}}}-1$<br>`
    textCorr += ` $\\iff t_m \\approx ${texNombre(tmArrondi1)}= ${xmArrondi1 < 0 ? '-' : ''}\\dfrac{${texNombre(abs(xmArrondi1))}}{100}$ <br>`
    textCorr += `Donc le taux moyen d'évolution par minute de `
    textCorr += obj
    textCorr += ` est d'environ $${miseEnEvidence(texNombre(xmArrondi1))}${sp()}\\%$.`
    this.correction = textCorr

    // Quel est le taux mensuel moyen d'évolution de`

    // const texte1 = obj + ' '

    //   switch (
    //     choice(['bactéries', 'température']) //
    //   ) {
    //     case "bactéries d'une culture":
    //       x = randint(10, 80) // pourcentage
    //       n = randint(1, 3) // heure(s)
    //       Cm = (1 + x / 100) ** (1 / (n * 60)) // coeff mult moyen
    //       tm = Cm - 1 // taux moyen
    //       xm = tm * 100 // pouracentage moyen
    //       this.question = `Au bout de $${n}\\,\\%$ heure(s), une population de bactéries augmente de $${x}\\,\\%$.<br>
    //                          En moyenne, quel est le pourcentage d'augmentation de cette population ?<br>`
    //       this.correction = `La population de référence est celle des inscrits sur les listes électorales.<br>
    //                          La sous-population est celle des suffrages exprimés et d'après l'énoncé, $p_1=${b}\\,\\%$.<br>
    //                           Les suffrages du candidat sont une sous-population des suffrages exprimés, qui représentent d'après l'énoncé, $p_2=${c}\\,\\%$. <br>
    //                           <br>Pour connaitre le pourcentage de voix obtenues  par ce candidat par rapport aux nombre d'inscrits, on calcule $p=p_1\\times p_2$, ce qui revient à calculer $${b}\\,\\%$ de $${c}\\,\\%$.<br>
    //                           <br>Ainsi, $p=${texNombre(tauxb, 2)}\\times ${texNombre(tauxc, 2)}=${texNombre(tauxG, 4)}$.<br>
    //                          Ce candidat a donc obtenu $${texNombre(g, 2)}\\,\\%$ des voix des inscrits.`
    //   }
    // }
  }
}
