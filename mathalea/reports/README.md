# Rapports et exports

Ce dossier regroupe les artefacts générés ou archivés. La documentation durable reste dans [documentation/README.md](../documentation/README.md).

| Titre | Rôle | Public | Source / statut | Lien |
| --- | --- | --- | --- | --- |
| Rapport interactif | Lister les exercices interactifs avec problèmes détectés au runtime | Développeurs d'exercices | Généré par `src/lib/amc/report-interactif.test.ts` | [interactif-report.md](interactif-report.md) |
| Rapport AMCNum | Lister les exercices AMCNum avec correction AMC invalide ou notifications | Développeurs d'exercices | Généré par `src/lib/amc/report-amcnum.test.ts` | [amcnum-report.md](amcnum-report.md) |
| Rapport d'accessibilité | Défauts détectés par axe-core sur 20 vues et évolution, sans taux de conformité | Développeurs, mainteneurs | Généré par `pnpm a11y:report` ([documentation](../documentation/tests/rapport-accessibilite.md)) | [a11y-report.md](a11y-report.md), [a11y-status.json](a11y-status.json) |
| AMC ready par niveau | État des exercices `amcReady=true` groupés par niveau | Développeurs AMC | Rapport archivé | [amcReady-true-par-niveau.md](amcReady-true-par-niveau.md) |
| Export CI GitLab HTML | Export HTML de l'ancien rapport CI | Mainteneurs | Artefact archivé | [gitlab-ci-report.html](gitlab-ci-report.html) |
| Export CI GitLab PDF | Export PDF de l'ancien rapport CI | Mainteneurs | Artefact archivé | [gitlab-ci-report.pdf](gitlab-ci-report.pdf) |

