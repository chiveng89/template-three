"""Build and package the English/Khmer static site without unused template assets."""
from pathlib import Path
import subprocess
import sys
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]
subprocess.run([sys.executable, str(ROOT / 'tools/build_site.py')], check=True)
files = sorted(ROOT.glob('*.html')) + sorted((ROOT / 'km').glob('*.html'))
files += sorted((ROOT / 'en').glob('*.html'))
files += [ROOT / 'assets/css/menglong.css', ROOT / 'assets/js/menglong.js']
files += sorted(path for path in (ROOT / 'assets/images/menglong').iterdir() if path.suffix in {'.jpg', '.png'} and path.name != 'team-illustration.png')
destination = ROOT / 'menglong-website.zip'
with ZipFile(destination, 'w', ZIP_DEFLATED) as archive:
    for path in files:
        archive.write(path, path.relative_to(ROOT))
    archive.writestr('README.txt', '''MENGLONG DOORS & WINDOWS

Open index.html for English (the default language).
Choose ខ្មែរ in the language switch, or open km/index.html, for Khmer.
The en/ directory also remains available for existing English links.
Upload this folder's contents to a static website host to publish.
No package installation or frontend build is needed.

Includes 11 default English pages, English/Khmer directories, 19 legacy redirects, and only
the CSS, JavaScript, authentic Menglong project photos and four AI-generated
individual team portraits used by the website. The fictional portraits are labelled.
Khmer text uses Battambang from Google Fonts; internet access loads the font.
The homepage project gallery is stationary and opens photos on click.

The enquiry form prepares messages locally in the selected language.
Customers review and send using their email app or copy into Messenger.
It does not store leads or send messages to a server.

Phone: 099 881 199
Email: menglongdoorandwindow@gmail.com
Facebook: https://www.facebook.com/MenglongDoorsandWindows/

No live hosting or domain is included.
''')
with ZipFile(destination) as archive:
    assert archive.testzip() is None
    print(f'Packaged {len(archive.namelist())} files: {destination}')
