"""Offline safety boundaries; these do not prove a live database release."""
import importlib.util
from pathlib import Path
import unittest
spec=importlib.util.spec_from_file_location('release',Path(__file__).with_name('publish_editorial.py'))
release=importlib.util.module_from_spec(spec);spec.loader.exec_module(release)
class EditorialReleaseSafety(unittest.TestCase):
    def test_conflicting_entry_rejected(self):
        before={'slug':'example','status':'published','version':4,'zh':{'title':'old'}}
        draft={'slug':'example','expected_version':3,'expected_zh_sha256':release.digest(before['zh'])}
        with self.assertRaisesRegex(ValueError,'changed'):release.replacement('entries',before,draft)
    def test_retains_metadata_and_synchronizes_sources(self):
        before={'slug':'example','status':'published','version':3,'zh':{'title':'old','meta':{'coords':[29,117]},'sources':[{'url':'https://old.example/'}]}}
        draft={'slug':'example','expected_version':3,'expected_zh_sha256':release.digest(before['zh']),'title':'new','summary':'summary','content_html':'<p>new</p>','sources':[{'url':'https://new.example/'}],'metadata_updates':{'importance':'Known contribution'}}
        result=release.replacement('entries',before,draft)
        self.assertEqual(result['zh']['meta']['coords'],[29,117])
        self.assertEqual(result['zh']['sources'],result['sources'])
        self.assertEqual(result['version'],4)
    def test_official_text_never_overwritten(self):
        before={'entry_id':'example','official_summary':'Institution text','updated_at':'2026-10-01'}
        draft={'slug':'example','expected_row_sha256':release.digest(before),'historical_role':'role','relationship_to_jingdezhen':'supported relation','editorial_summary':'Editorial synthesis'}
        result=release.replacement('timeline_context',before,draft)
        self.assertNotIn('official_summary',result)
        self.assertEqual(result['description_source_type'],'editorial_synthesis')
    def test_changed_process_rejected(self):
        before={'slug':'example','description_zh':'concurrent edit'}
        draft={'slug':'example','expected_row_sha256':release.digest({'slug':'example','description_zh':'snapshot'}),'description_zh':'new'}
        with self.assertRaisesRegex(ValueError,'changed'):release.replacement('craft_processes',before,draft)
if __name__=='__main__':unittest.main()
