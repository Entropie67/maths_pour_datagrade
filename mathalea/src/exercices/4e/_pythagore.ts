import { orangeMathalea } from '../../lib/colors'
import { egalOuApprox } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'

/**
 * Crée une rédaction du théorème de Pythagore adaptée à la recherche de l'hypoténuse ou d'un côté de l'angle droit
 * @param {string} [A = 'A'] Nom du sommet de l'angle droit
 * @param {string} [B = 'B'] Nom d'une extrémité de l'hypoténuse (AB étant éventuellement la longueur du côté droit à chercher)
 * @param {string} [C = 'C'] Nom de l'autre extrémité de l'hypoténuse
 * @param {number} [rechercheHypotenuse = 1] Si 1, la rédaction concerne la recherche de l'hypoténuse. Si 2, la rédaction concerne la rédaction d'un côté de l'angle droit. Si autre chose, la rédaction s'arrête à la première égalité.
 * @param {number} [AB = 3] Longueur AB
 * @param {number} [AC = 4] Longueur AC
 * @param {number} [BC = 5] Longueur BC
 * @param {string}  [unite = 'cm'] Unité de la longueur recherchée
 * @param {string} [couleurReponse = orangeMathalea] Couleur de la réponse : du type 'red', du type '#010101' ou du type orangeMathalea
 * @param {boolean} [avecUnites = false] Si true, les unités sont écrites dans les calculs (par exemple $4\text{ cm}\times 4\text{ cm}=16\text{ cm}^2$)
 * @param {number} [precisionArrondi = 2] Nombre de décimales auquel la longueur cherchée est arrondie : détermine si le signe affiché est = ou \approx.
 * @param {boolean} [uniteDansLaReponse = false] Si true, l'unité fait partie de la réponse saisie (valeur et unité mises en évidence ensemble)
 * @param {boolean} [uniteEnEvidence = true] Si false, seule la valeur est mise en évidence, l'unité reste hors de la mise en évidence
 * @example RedactionPythagore()
 * // Crée la rédaction du théorème de Pythagore dans un triangle ABC rectangle en A de dimensions 3-4-5 cm dont on recherche la longueur de l'hypoténuse.
 * @example RedactionPythagore('M','N','P',2,reponse,5,13,'dm')
 * // Crée la rédaction du théorème de Pythagore dans un triangle MNP rectangle en M de dimensions reponse-5-13 dm dont on recherche la longueur de MN.
 * // reponse doit être fournie à la fonction, elle n'est pas calculée par la fonction.
 * @author Éric Elter
 * @return {[string, string]} // Le premier élément du tableau est la rédaction complète, le second élément du tableau est le signe égal (ou arrondi) qui peut être utilisé si besoin pour introduire l'interactif.
 */
export function RedactionPythagore(
  A = 'A',
  B = 'B',
  C = 'C',
  rechercheHypotenuse = 1,
  AB = 3,
  AC = 4,
  BC = 5,
  unite = 'cm',
  couleurReponse = orangeMathalea,
  avecUnites = false,
  precisionArrondi = 2,
  uniteDansLaReponse = false,
  uniteEnEvidence = true,
) {
  const uniteTex = unite === '' ? '' : `\\text{ ${unite}}`
  const uniteCarreeTex = avecUnites && unite !== '' ? `\\text{ ${unite}}^2` : ''
  // Avec les unités, `4^2` s'écrit `4 cm × 4 cm` et le résultat porte l'unité au carré.
  const carre = (x: number, precision = 8) =>
    avecUnites
      ? `${texNombre(x, precision)}${uniteTex}\\times ${texNombre(x, precision)}${uniteTex}`
      : `${texNombre(x, precision)}^2`
  const aire = (x: number, precision = 8) =>
    `${texNombre(x, precision)}${uniteCarreeTex}`

  // Avec `uniteDansLaReponse`, l'unité fait partie de la réponse saisie : la ligne du calcul n'est pas
  // mise en évidence et la conclusion donne valeur et unité en un seul bloc coloré.
  // Sinon, `uniteEnEvidence = false` laisse l'unité hors de la mise en évidence (unité écrite à côté du champ en interactif).
  const reponseEnEvidence = (valeur: string) =>
    uniteDansLaReponse && unite !== ''
      ? `${valeur}${uniteTex}`
      : `${miseEnEvidence(valeur, couleurReponse)}${uniteEnEvidence ? miseEnEvidence(uniteTex, couleurReponse) : uniteTex}`
  const conclusion = (nom: string, valeur: number, signe: string) =>
    uniteDansLaReponse && unite !== ''
      ? `<br>Donc $${nom}${signe}${miseEnEvidence(texNombre(valeur, 2), couleurReponse)}$ ${texteEnCouleurEtGras(unite, couleurReponse)}`
      : ''

  let texte = ``
  let signeEgal = ``
  texte = `Le triangle $${A + B + C}$ est rectangle en $${A}$.`
  texte += `<br> D'après le théorème de Pythagore, on a : <br> <br>`

  if (rechercheHypotenuse === 1 || rechercheHypotenuse === 2) {
    texte += `$\\begin{aligned} ${B + C}^2&=${A + B}^2+${A + C}^2\\\\`
  } else {
    texte += `$ ${miseEnEvidence(`${B + C}^2=${A + B}^2+${A + C}^2`, couleurReponse)}\\\\$`
  }
  if (rechercheHypotenuse === 1) {
    texte += `${B + C}^2&=${carre(AB, 2)}+${carre(AC, 2)}\\\\`
    texte += `${B + C}^2&=${aire(AB ** 2)}+${aire(AC ** 2)}\\\\`
    texte += `${B + C}^2&=${aire(AB ** 2 + AC ** 2, 2)}\\\\`
    texte += `\\text{Donc :}\\\\`
    texte += avecUnites
      ? `${B + C}&=\\sqrt{${aire(AB ** 2 + AC ** 2, 2)}}\\\\`
      : `${B + C}&=\\sqrt{${texNombre(AB ** 2 + AC ** 2, 2)}}${uniteTex}\\\\`
    signeEgal = egalOuApprox(Math.sqrt(AB ** 2 + AC ** 2), precisionArrondi)
    texte += `${B + C} &${signeEgal} ${reponseEnEvidence(texNombre(BC, 2))}\\\\`
    texte += `\\end{aligned}$ `
    texte += conclusion(B + C, BC, signeEgal)
  } else if (rechercheHypotenuse === 2) {
    texte += `${carre(BC, 2)}&=${A + B}^2+${carre(AC)}\\\\`
    texte += `${aire(BC ** 2)}&=${A + B}^2+${aire(AC ** 2)}\\\\`
    texte += `${A + B}^2&=${aire(BC ** 2)} - ${aire(AC ** 2)}\\\\`
    texte += `${A + B}^2&=${aire(BC ** 2 - AC ** 2, 2)}\\\\`
    texte += `\\text{Donc : }\\\\`
    texte += avecUnites
      ? `${A + B}&=\\sqrt{${aire(BC ** 2 - AC ** 2, 2)}}\\\\`
      : `${A + B}&=\\sqrt{${texNombre(BC ** 2 - AC ** 2, 2)}}${uniteTex}\\\\`
    signeEgal = egalOuApprox(Math.sqrt(BC ** 2 - AC ** 2), precisionArrondi)
    texte += `${A + B} &${signeEgal} ${reponseEnEvidence(texNombre(AB, 2))}\\\\`
    texte += `\\end{aligned}$ `
    texte += conclusion(A + B, AB, signeEgal)
  }
  return [texte, signeEgal]
}
