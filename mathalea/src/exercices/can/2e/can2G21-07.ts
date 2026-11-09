import { bleuMathalea } from '../../../lib/colors'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import {
  texteEnCouleur,
  texteEnCouleurEtGras,
} from '../../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
import { sp } from '../../../lib/outils/outilString'
export const titre = 'Reconnaitre des vecteurs colinéaires (V/F)'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '30/10/2021' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export const uuid = '2ba42'

export const refs = {
  'fr-fr': ['can2G21-07', '2G27-flash2'],
  'fr-ch': ['3G93-3'],
}
export default class VecteursColineairesVF extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let ux, uy, vx, vy, k

    for (
      let i = 0, texte, texteCorr, monQcm, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (
        choice([1, 2, 3, 4, 5]) //
      ) {
        case 1:
          ux = randint(-3, 3, 0) * 2
          uy = randint(-3, 3, [0, ux / 2]) * 2
          k = choice([0.5, 1.5, 3, 2.5, 3.5]) * choice([-1, 1])
          vx = k * ux
          vy = k * uy
          texte = `Dans un repère, on considère les vecteurs $\\vec{u}\\begin{pmatrix}${ux} \\\\ ${uy} \\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}${vx} \\\\ ${vy} \\end{pmatrix}$.<br>
        Les vecteurs $\\vec{u}$ et $\\vec{v}$ sont colinéaires.`
          this.canEnonce = `Dans un repère, on considère les vecteurs $\\vec{u}(${ux}\\;;\\; ${uy})$ et $\\vec{v}(${vx}\\;;\\;${vy})$.<br>

        Les vecteurs $\\vec{u}$ et $\\vec{v}$ sont colinéaires.`
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: 'Vrai',
                statut: ux * vy === uy * vx,
              },
              {
                texte: 'Faux',
                statut: ux === 50,
              },
            ],
            options: { ordered: true, radio: true },
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte

          texteCorr =
            monQcm.texteCorr +
            `Deux vecteurs $\\vec{u}$ et $\\vec{v}$
        sont colinéaires si et seulement si leur déterminant $det\\left(\\vec{u}\\,;\\,\\vec{v}\\right)=0$.<br>
        Si $\\vec{u}\\begin{pmatrix}x_{\\vec{u}} \\\\ x_{\\vec{v}} \\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}x_{\\vec{v}} \\\\ y_{\\vec{v}} \\end{pmatrix}$,
        alors $det\\left(\\vec{u}\\,;\\,\\vec{v}\\right)=x_{\\vec{u}}\\times y_{\\vec{v}}-y_{\\vec{u}}\\times x_{\\vec{v}}$.<br>
        En utilisant les données de l'énoncé, on obtient : <br>
        $det\\left(\\vec{u}\\,;\\,\\vec{v}\\right)=
        ${ecritureParentheseSiNegatif(ux)}\\times ${ecritureParentheseSiNegatif(vy)}-${ecritureParentheseSiNegatif(uy)}\\times ${ecritureParentheseSiNegatif(vx)}
        =${ux * vy}-${ecritureParentheseSiNegatif(uy * vx)}=${ux * vy - uy * vx}$.<br>
        On en déduit que les vecteurs $\\vec{u}$ et $\\vec{v}$ sont colinéaires, il fallait donc cocher «${sp()}${texteEnCouleurEtGras('Vrai')}${sp()}».`
          texteCorr += texteEnCouleur(
            `<br><br> Mentalement : <br>
        On compare les produits en croix : $${ecritureParentheseSiNegatif(ux)}\\times ${ecritureParentheseSiNegatif(vy)}=${ux * vy}$ et $${ecritureParentheseSiNegatif(uy)}\\times ${ecritureParentheseSiNegatif(vx)}=${uy * vx}$.<br>
        Ils sont égaux, donc les vecteurs sont colinéaires.`,
            bleuMathalea,
          )
          break
        case 2:
          vx = randint(-3, 3, 0) * 2
          vy = randint(-3, 3, [0, vx / 2]) * 2
          k = choice([0.5, 1.5, 3, 2.5, 3.5]) * choice([-1, 1])
          ux = k * vx
          uy = k * vy
          texte = `Dans un repère, on considère les vecteurs $\\overrightarrow{u}\\begin{pmatrix}${ux} \\\\ ${uy} \\end{pmatrix}$ et $\\overrightarrow{v}\\begin{pmatrix}${vx} \\\\ ${vy} \\end{pmatrix}$.<br>
        Les vecteurs $\\vec{u}$ et $\\vec{v}$ sont colinéaires.`
          this.canEnonce = `Dans un repère, on considère les vecteurs $\\vec{u}(${ux}\\;;\\; ${uy})$ et $\\vec{v}(${vx}\\;;\\;${vy})$.<br>
       
        Les vecteurs $\\vec{u}$ et $\\vec{v}$ sont colinéaires.`
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: 'Vrai',
                statut: ux * vy === uy * vx,
              },
              {
                texte: 'Faux',
                statut: ux === 50,
              },
            ],
            options: { ordered: true },
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte

          texteCorr =
            monQcm.texteCorr +
            `Deux vecteurs $\\vec{u}$ et $\\vec{v}$
            sont colinéaires si et seulement si leur déterminant $det\\left(\\vec{u}\\,;\\,\\vec{v}\\right)=0$.<br>
            Si $\\vec{u}\\begin{pmatrix}x_{\\vec{u}} \\\\ x_{\\vec{v}} \\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}x_{\\vec{v}} \\\\ y_{\\vec{v}} \\end{pmatrix}$,
            alors $det\\left(\\vec{u}\\,;\\,\\vec{v}\\right)=x_{\\vec{u}}\\times y_{\\vec{v}}-y_{\\vec{u}}\\times x_{\\vec{v}}$.<br>
            En utilisant les données de l'énoncé, on obtient : <br>
            $det\\left(\\vec{u}\\,;\\,\\vec{v}\\right)=
            ${ecritureParentheseSiNegatif(ux)}\\times ${ecritureParentheseSiNegatif(vy)}-${ecritureParentheseSiNegatif(uy)}\\times ${ecritureParentheseSiNegatif(vx)}
            =${ux * vy}-${ecritureParentheseSiNegatif(uy * vx)}=${ux * vy - uy * vx}$.<br>
            On en déduit que les vecteurs $\\vec{u}$ et $\\vec{v}$ sont colinéaires, il fallait donc cocher «${sp()}${texteEnCouleurEtGras('Vrai')}${sp()}».`
          texteCorr += texteEnCouleur(
            `<br><br> Mentalement : <br>
            On compare les produits en croix : $${ecritureParentheseSiNegatif(ux)}\\times ${ecritureParentheseSiNegatif(vy)}=${ux * vy}$ et $${ecritureParentheseSiNegatif(uy)}\\times ${ecritureParentheseSiNegatif(vx)}=${uy * vx}$.<br>
            Ils sont égaux, donc les vecteurs sont colinéaires.`,
            bleuMathalea,
          )
          break

        case 3:
          ux = randint(-3, 3, 0) * 2
          uy = randint(-3, 3, [0, ux / 2]) * 2
          k = choice([0.5, 1.5, 3, 2.5, 3.5]) * choice([-1, 1])
          vx = k * ux
          vy = k * uy + 1
          texte = `Dans un repère, on considère les vecteurs $\\vec{u}\\begin{pmatrix}${ux} \\\\ ${uy} \\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}${vx} \\\\ ${vy} \\end{pmatrix}$.<br>
            Les vecteurs $\\vec{u}$ et $\\vec{v}$ sont colinéaires.`
          this.canEnonce = `Dans un repère, on considère les vecteurs $\\vec{u}(${ux}\\;;\\; ${uy})$ et $\\vec{v}(${vx}\\;;\\;${vy})$.<br>

            Les vecteurs $\\vec{u}$ et $\\vec{v}$ sont colinéaires.`
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: 'Vrai',
                statut: ux === 100,
              },
              {
                texte: 'Faux',
                statut: ux * vy !== uy * vx,
              },
            ],
            options: { ordered: true },
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte

          texteCorr =
            monQcm.texteCorr +
            `Deux vecteurs $\\vec{u}$ et $\\vec{v}$
            sont colinéaires si et seulement si leur déterminant $det\\left(\\vec{u}\\,;\\,\\vec{v}\\right)=0$.<br>
            Si  $\\vec{u}\\begin{pmatrix}x_{\\vec{u}} \\\\ x_{\\vec{v}} \\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}x_{\\vec{v}} \\\\ y_{\\vec{v}} \\end{pmatrix}$,
            alors $det\\left(\\vec{u}\\,;\\,\\vec{v}\\right)=x_{\\vec{u}}\\times y_{\\vec{v}}-y_{\\vec{u}}\\times x_{\\vec{v}}$.<br>
            En utilisant les données de l'énoncé, on obtient : <br>
            $det\\left(\\vec{u}\\,;\\,\\vec{v}\\right)=
            ${ecritureParentheseSiNegatif(ux)}\\times ${ecritureParentheseSiNegatif(vy)}-${ecritureParentheseSiNegatif(uy)}\\times ${ecritureParentheseSiNegatif(vx)}
            =${ux * vy}-${ecritureParentheseSiNegatif(uy * vx)}=${ux * vy - uy * vx}\\neq0$.<br>
            On en déduit que les vecteurs $\\vec{u}$ et $\\vec{v}$ ne sont pas colinéaires, il fallait donc cocher «${sp()}${texteEnCouleurEtGras('Faux')}${sp()}».`
          texteCorr += texteEnCouleur(
            `<br><br> Mentalement : <br>
            On compare les produits en croix : $${ecritureParentheseSiNegatif(ux)}\\times ${ecritureParentheseSiNegatif(vy)}=${ux * vy}$ et $${ecritureParentheseSiNegatif(uy)}\\times ${ecritureParentheseSiNegatif(vx)}=${uy * vx}$.<br>
            Ils ne sont pas égaux, donc les vecteurs ne sont pas colinéaires.`,
            bleuMathalea,
          )
          break

        case 4:
          ux = randint(-3, 3, 0) * 2
          uy = randint(-3, 3, [0, ux / 2]) * 2
          k = choice([0.5, 1.5, 3, 2.5, 3.5]) * choice([-1, 1])
          vx = k * ux + 1
          vy = k * uy
          texte = `Dans un repère, on considère les vecteurs $\\vec{u}\\begin{pmatrix}${ux} \\\\ ${uy} \\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}${vx} \\\\ ${vy} \\end{pmatrix}$.<br>
            Les vecteurs $\\vec{u}$ et $\\vec{v}$ sont colinéaires.`
          this.canEnonce = `Dans un repère, on considère les vecteurs $\\vec{u}(${ux}\\;;\\; ${uy})$ et $\\vec{v}(${vx}\\;;\\;${vy})$.<br>

            Les vecteurs $\\vec{u}$ et $\\vec{v}$ sont colinéaires.`
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: 'Vrai',
                statut: ux === 100,
              },
              {
                texte: 'Faux',
                statut: ux * vy !== uy * vx,
              },
            ],
            options: { ordered: true },
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte

          texteCorr =
            monQcm.texteCorr +
            `Deux vecteurs $\\vec{u}$ et $\\vec{v}$
            sont colinéaires si et seulement si leur déterminant $det\\left(\\vec{u}\\,;\\,\\vec{v}\\right)=0$.<br>
            Si  $\\vec{u}\\begin{pmatrix}x_{\\vec{u}} \\\\ x_{\\vec{v}} \\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}x_{\\vec{v}} \\\\ y_{\\vec{v}} \\end{pmatrix}$,
            alors $det\\left(\\vec{u}\\,;\\,\\vec{v}\\right)=x_{\\vec{u}}\\times y_{\\vec{v}}-y_{\\vec{u}}\\times x_{\\vec{v}}$.<br>
            En utilisant les données de l'énoncé, on obtient : <br>
            $det\\left(\\vec{u}\\,;\\,\\vec{v}\\right)=
            ${ecritureParentheseSiNegatif(ux)}\\times ${ecritureParentheseSiNegatif(vy)}-${ecritureParentheseSiNegatif(uy)}\\times ${ecritureParentheseSiNegatif(vx)}
            =${ux * vy}-${ecritureParentheseSiNegatif(uy * vx)}=${ux * vy - uy * vx}\\neq0$.<br>
            On en déduit que les vecteurs $\\vec{u}$ et $\\vec{v}$ ne sont pas colinéaires, il fallait donc cocher «${sp()}${texteEnCouleurEtGras('Faux')}${sp()}».`
          texteCorr += texteEnCouleur(
            `<br><br> Mentalement : <br>
            On compare les produits en croix : $${ecritureParentheseSiNegatif(ux)}\\times ${ecritureParentheseSiNegatif(vy)}=${ux * vy}$ et $${ecritureParentheseSiNegatif(uy)}\\times ${ecritureParentheseSiNegatif(vx)}=${uy * vx}$.<br>
            Ils ne sont pas égaux, donc les vecteurs ne sont pas colinéaires.`,
            bleuMathalea,
          )
          break
        case 5:
        default:
          ux = randint(-3, 3, 0) * 2
          uy = randint(-3, 3, [0, ux / 2]) * 2
          k = choice([0.5, 1.5, 3, 2.5, 3.5]) * choice([-1, 1])
          vx = k * ux
          vy = k * uy * -1
          texte = `Dans un repère, on considère les vecteurs $\\vec{u}\\begin{pmatrix}${ux} \\\\ ${uy} \\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}${vx} \\\\ ${vy} \\end{pmatrix}$.<br>
            Les vecteurs $\\vec{u}$ et $\\vec{v}$ sont colinéaires.`
          this.canEnonce = `Dans un repère, on considère les vecteurs $\\vec{u}(${ux}\\;;\\; ${uy})$ et $\\vec{v}(${vx}\\;;\\;${vy})$.<br>
        
            Les vecteurs $\\vec{u}$ et $\\vec{v}$ sont colinéaires.`
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: 'Vrai',
                statut: ux === 100,
              },
              {
                texte: 'Faux',
                statut: ux * vy !== uy * vx,
              },
            ],
            options: { ordered: true },
          }
          monQcm = propositionsQcm(this, i)
          texte += monQcm.texte

          texteCorr =
            monQcm.texteCorr +
            `Deux vecteurs $\\vec{u}$ et $\\vec{v}$
            sont colinéaires si et seulement si leur déterminant $det\\left(\\vec{u}\\,;\\,\\vec{v}\\right)=0$.<br>
            Si  $\\vec{u}\\begin{pmatrix}x_{\\vec{u}} \\\\ x_{\\vec{v}} \\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}x_{\\vec{v}} \\\\ y_{\\vec{v}} \\end{pmatrix}$,
            alors $det\\left(\\vec{u}\\,;\\,\\vec{v}\\right)=x_{\\vec{u}}\\times y_{\\vec{v}}-y_{\\vec{u}}\\times x_{\\vec{v}}$.<br>
            En utilisant les données de l'énoncé, on obtient : <br>
            $det\\left(\\vec{u}\\,;\\,\\vec{v}\\right)=
            ${ecritureParentheseSiNegatif(ux)}\\times ${ecritureParentheseSiNegatif(vy)}-${ecritureParentheseSiNegatif(uy)}\\times ${ecritureParentheseSiNegatif(vx)}
            =${ux * vy}-${ecritureParentheseSiNegatif(uy * vx)}=${ux * vy - uy * vx}\\neq0$.<br>
            On en déduit que les vecteurs $\\vec{u}$ et $\\vec{v}$ ne sont pas colinéaires, il fallait donc cocher «${sp()}${texteEnCouleurEtGras('Faux')}${sp()}».`
          texteCorr += texteEnCouleur(
            `<br><br> Mentalement : <br>
            On compare les produits en croix : $${ecritureParentheseSiNegatif(ux)}\\times ${ecritureParentheseSiNegatif(vy)}=${ux * vy}$ et $${ecritureParentheseSiNegatif(uy)}\\times ${ecritureParentheseSiNegatif(vx)}=${uy * vx}$.<br>
            Ils ne sont pas égaux, donc les vecteurs ne sont pas colinéaires.`,
            bleuMathalea,
          )
          break
      }
      if (this.questionJamaisPosee(i, ux, uy, vx, vy)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      this.canReponseACompleter = monQcm.texte
      this.listeCanEnonces.push(this.canEnonce)
      this.listeCanReponsesACompleter.push(this.canReponseACompleter)
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
