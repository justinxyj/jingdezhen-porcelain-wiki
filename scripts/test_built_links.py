"""An internal URL escaping the Pages prefix must block publication."""
import subprocess,tempfile,unittest
from pathlib import Path
CHECK=Path(__file__).with_name('check_built_links.py').resolve()
class BuiltLinkBoundaries(unittest.TestCase):
 def test_project_escape_rejected(self):
  with tempfile.TemporaryDirectory() as folder:
   root=Path(folder);(root/'contemporary').mkdir();(root/'museum/timeline').mkdir(parents=True);(root/'museum/timeline/index.html').write_text('ok')
   page=root/'contemporary/index.html';page.write_text('<a href="../../museum/timeline/">wrong</a>')
   bad=subprocess.run(['python3',str(CHECK),str(root)],capture_output=True,text=True);self.assertEqual(bad.returncode,1);self.assertIn('outside project path',bad.stdout)
   page.write_text('<a href="../museum/timeline/">right</a><a href="https://example.org/">external</a>')
   good=subprocess.run(['python3',str(CHECK),str(root)],capture_output=True,text=True);self.assertEqual(good.returncode,0,good.stdout)
if __name__=='__main__':unittest.main()
