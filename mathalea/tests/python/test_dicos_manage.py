"""Vérifie la synchronisation de la moulinette dans des fichiers temporaires."""

import importlib.util
import json
import os
from pathlib import Path
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location(
    'dicosManage', ROOT / 'tasks/dicosDnbBacE3c/dicosManage.py'
)
SCRIPT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(SCRIPT)


class SessionsTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.dictionary = self.root / 'dictionnaire.ts'
        self.sessions = self.root / 'sessions.json'
        self.table = {'sessions': {}, 'numeroOverrides': {}, 'entryOverrides': {}}
        self.sessions.write_text(json.dumps(self.table), encoding='utf8')

    def sync(self, entries):
        self.dictionary.write_text(
            'export const dictionnaireTEST = {\n' + ''.join(
                f'  {uuid}: {json.dumps(entry, ensure_ascii=False, indent=2)},\n'
                for uuid, entry in entries.items()
            ) + '}\n',
            encoding='utf8',
        )
        SCRIPT.syncSessions(str(self.dictionary), self.sessions)
        return json.loads(self.sessions.read_text(encoding='utf8'))

    def entry(self, **changes):
        entry = dict(annee='2026', mois='Septembre', lieu='Métropole',
                     numeroInitial='1', typeExercice='dnb', tags=['Géométrie'])
        entry.update(changes)
        return entry

    def test_decoupage_completes_dictionary_and_sessions(self):
        folder = self.root / 'dnb/2026/tex'
        folder.mkdir(parents=True)
        for filename in ['dnb_2026_09_metropole_1.tex',
                         'dnb_2026_09_metropole_automatismes.tex',
                         'dnb_2026_09_metropole_1_cor.tex']:
            (folder / filename).touch()
        original = self.entry()
        self.sync({'dnb_2026_09_metropole_1': original})
        cwd = os.getcwd()
        try:
            os.chdir(self.root)
            SCRIPT.manageDico(str(self.dictionary), 'dnb', self.sessions)
            first = self.dictionary.read_bytes(), self.sessions.read_bytes()
            SCRIPT.manageDico(str(self.dictionary), 'dnb', self.sessions)
            self.assertEqual(first, (self.dictionary.read_bytes(), self.sessions.read_bytes()))
        finally:
            os.chdir(cwd)
        self.assertIn('Géométrie', self.dictionary.read_text())
        self.assertIn('dnb_2026_09_metropole_automatismes:', self.dictionary.read_text())
        self.assertNotIn('_cor:', self.dictionary.read_text())
        table = json.loads(self.sessions.read_text())
        self.assertEqual(len(table['sessions']), 1)

    def test_bac_and_eam_keep_optional_metadata(self):
        bac = self.entry()
        bac.update(typeExercice='bac', jour='J2')
        eam = self.entry()
        eam.update(typeExercice='eam', filiere='Technologique')
        table = self.sync({'bac_2026_09_sujet2_metropole_1': bac,
                           'eam_technologique_2026_09_metropole_1': eam})
        self.assertEqual(table['sessions']['bac_2026_09_sujet2_metropole']['jour'], 'J2')
        self.assertEqual(table['sessions']['eam_technologique_2026_09_metropole']['filiere'],
                         'Technologique')
        first = self.sessions.read_bytes()
        self.sync({'bac_2026_09_sujet2_metropole_1': bac,
                   'eam_technologique_2026_09_metropole_1': eam})
        self.assertEqual(first, self.sessions.read_bytes())

    def test_existing_session_conflict_does_not_write(self):
        self.sync({'dnb_2026_09_metropole_1': self.entry()})
        first = self.sessions.read_bytes()
        conflict = self.entry()
        conflict['lieu'] = 'Polynésie'
        with self.assertRaisesRegex(ValueError, 'conflit avec la session'):
            self.sync({'dnb_2026_09_polynesie_1': conflict,
                       'dnb_2026_09_metropole_1': conflict})
        self.assertEqual(first, self.sessions.read_bytes())

    def test_crpe_decoding_and_exceptions(self):
        entries = {}
        for code, number in [('ex01', '1'), ('pb', 'Problème'), ('algo', 'Algo')]:
            entry = self.entry()
            entry.update(typeExercice='crpe', numeroInitial=number)
            entries['crpe_2026_g1_' + code] = entry
        table = self.sync(entries)
        self.assertEqual(table['numeroOverrides'], {'crpe_2026_g1_algo': 'Algo'})
        entries['crpe_2026_g1_algo']['numeroInitial'] = 'Autre'
        first = self.sessions.read_bytes()
        with self.assertRaisesRegex(ValueError, 'conflit avec numeroOverrides'):
            self.sync(entries)
        self.assertEqual(first, self.sessions.read_bytes())

    def test_shared_session_uses_entry_override(self):
        other = self.entry(typeExercice='crpe')
        other['lieu'] = 'Clermont'
        entries = {'crpe_blanc_2026_algo': self.entry(typeExercice='crpe'),
                   'crpe_blanc_2026_clermont': other}
        table = self.sync(entries)
        self.assertEqual(table['entryOverrides']['crpe_blanc_2026_clermont']['lieu'], 'Clermont')
        self.sync(entries)
        first = self.sessions.read_bytes()
        other['lieu'] = 'Paris'
        with self.assertRaisesRegex(ValueError, 'conflit avec entryOverrides'):
            self.sync(entries)
        self.assertEqual(first, self.sessions.read_bytes())

    def test_flashbac_is_not_in_static_referential(self):
        entry = self.entry()
        entry['typeExercice'] = 'flashbac'
        first = self.sessions.read_bytes()
        self.sync({'QCM_bac_2026_09_sujet2_metropole_1_q1': entry})
        self.assertEqual(first, self.sessions.read_bytes())


if __name__ == '__main__':
    unittest.main()
