import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AGSpeQ6 from '../../src/exercices/EAMPremiere/EAM-AGSpe-2026-Q6'
import AGSpeQ8 from '../../src/exercices/EAMPremiere/EAM-AGSpe-2026-Q8'
import AGnonSpeQ3 from '../../src/exercices/EAMPremiere/EAM-AGnonSpe-2026-Q3'
import Exercice from '../../src/exercices/Exercice'
import { miseEnEvidence } from '../../src/lib/outils/embellissements'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

function genere(Classe: new () => Exercice, graine: string, versionQcm: boolean) {
  seedrandom(graine, { global: true })
  const exercice = new Classe()
  exercice.interactif = true
  exercice.numeroExercice = 0
  exercice.nbQuestions = 4
  exercice.sup3 = versionQcm
  exercice.nouvelleVersion()
  return exercice
}

const valeurAttendue = (exercice: Exercice, i: number) =>
  (
    exercice.autoCorrection[i] as unknown as {
      valeur: { reponse: { value: string } }
    }
  ).valeur.reponse.value

describe('annales : mise en évidence de la saisie libre', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.notify = vi.fn()
    window.notifyLocal = vi.fn()
  })

  it('EAM-AGnonSpe-2026-Q3 : seul le numéro k de la droite (d_k) est mis en évidence', () => {
    for (let graine = 1; graine <= 20; graine++) {
      const exercice = genere(AGnonSpeQ3, `q3-${graine}`, false)
      exercice.listeCorrections.forEach((correction, i) => {
        const k = valeurAttendue(exercice, i)
        expect(correction).toContain(`d_{${miseEnEvidence(k)}}`)
        expect(correction).not.toContain(miseEnEvidence(`d_{${k}}`))
      })
    }
  })

  it('EAM-AGSpe-2026-Q8 : seul le second membre a^{k} est mis en évidence', () => {
    for (let graine = 1; graine <= 20; graine++) {
      const exercice = genere(AGSpeQ8, `q8-${graine}`, false)
      exercice.listeCorrections.forEach((correction, i) => {
        const droite = valeurAttendue(exercice, i)
        expect(correction).toContain(` = ${miseEnEvidence(droite)}`)
        expect(correction).not.toMatch(/boldsymbol\{[^}]*\} = a\^/)
      })
    }
  })

  it('EAM-AGSpe-2026-Q8 : en QCM, toute l’égalité vraie reste mise en évidence', () => {
    for (let graine = 1; graine <= 10; graine++) {
      const exercice = genere(AGSpeQ8, `q8-${graine}`, true)
      exercice.listeQuestions.forEach((question, i) => {
        const propositions = JSON.parse(
          question.match(/propositions="([^"]*)"/)![1].replaceAll('&quot;', '"'),
        ) as { texte: string; statut: boolean }[]
        const bonne = propositions.find((p) => p.statut)!
        expect(exercice.listeCorrections[i]).toContain(
          miseEnEvidence(bonne.texte.replace(/^\$|\$$/g, '')),
        )
      })
    }
  })

  it('EAM-AGSpe-2026-Q6 : le taux global est le même dans la proposition, la correction et la saisie libre', () => {
    const nombre = (texte: string) =>
      Number(texte.match(/(\d+(?:,\d+)?)\\,\\%/)![1].replace(',', '.'))
    const miseEnEvidenceDe = (correction: string) =>
      correction.match(/boldsymbol\{([^}]*\\,\\%)\}\}/)![1]
    let demiPourcents = 0
    for (let graine = 1; graine <= 60; graine++) {
      const qcm = genere(AGSpeQ6, `q6-${graine}`, true)
      const libre = genere(AGSpeQ6, `q6-${graine}`, false)
      qcm.listeQuestions.forEach((question, i) => {
        const propositions = JSON.parse(
          question.match(/propositions="([^"]*)"/)![1].replaceAll('&quot;', '"'),
        ) as { texte: string; statut: boolean }[]
        const bonne = nombre(propositions.find((p) => p.statut)!.texte)
        // QCM : la mise en évidence de la correction est celle de la bonne proposition
        expect(nombre(miseEnEvidenceDe(qcm.listeCorrections[i])), `QCM ${graine} q${i}`).toBe(bonne)
        if (!Number.isInteger(bonne)) demiPourcents++
      })
      libre.listeCorrections.forEach((correction, i) => {
        // saisie libre : la valeur attendue (signée) est celle de la mise en évidence
        const attendu = valeurAttendue(libre, i)
        expect(correction, `libre ${graine} q${i} : ${attendu}`).toContain(
          miseEnEvidence(attendu),
        )
      })
      // première question : même tirage dans les deux modes
      const propositions0 = JSON.parse(
        qcm.listeQuestions[0].match(/propositions="([^"]*)"/)![1].replaceAll('&quot;', '"'),
      ) as { texte: string; statut: boolean }[]
      expect(
        Math.abs(Number(valeurAttendue(libre, 0).replace(',', '.'))),
        `q0 ${graine}`,
      ).toBe(nombre(propositions0.find((p) => p.statut)!.texte))
    }
    expect(demiPourcents).toBeGreaterThan(0)
  })
})
