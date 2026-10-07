"""Preserve citations and reading paths without admitting executable attributes."""
import unittest
from generate_entry_pages import sanitize, plain

class EntrySanitizer(unittest.TestCase):
    def test_reading_path_and_footnotes_survive(self):
        text = sanitize('<a href="/jingdezhen-porcelain-wiki/entry/hutian-kiln/">湖田窑</a><sup id="fnref:1"><a href="#fn:1">1</a></sup><li id="fn:1">资料<a href="#fnref:1">返回</a></li>')
        self.assertIn('href="/jingdezhen-porcelain-wiki/entry/hutian-kiln/"', text)
        self.assertIn('<sup id="fnref:1">', text)
        self.assertIn('href="#fn:1"', text)
        self.assertIn('<li id="fn:1">', text)

    def test_executable_attributes_and_unapproved_urls_removed(self):
        text = sanitize('<a href="javascript:alert(1)" onclick="alert(1)" id="__drawer">x</a><img src=x onerror=alert(1)><a href="//evil.example">y</a>')
        for forbidden in ['javascript:', 'onclick', 'onerror', '__drawer', '<img', '//evil.example']:
            self.assertNotIn(forbidden, text)

    def test_plain_text_collapses_actual_whitespace(self):
        self.assertEqual(plain('<p>青花\n  瓷</p>'), '青花 瓷')

if __name__ == '__main__':
    unittest.main()
