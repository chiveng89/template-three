"""Render static Khmer pages with translated text and portable relative links."""
from html import escape
from html.parser import HTMLParser
from pathlib import Path
import json
import re

TRANSLATIONS = json.loads((Path(__file__).with_name('km.json')).read_text())
LOOKUP = {key.casefold(): value for key, value in TRANSLATIONS.items()}
MISSING = set()
PRESERVE = {'EN', 'MENGLONG', 'Facebook', 'Messenger'}

def translate(text):
    key = text.strip()
    if not key or not re.search('[A-Za-z]', key) or key in PRESERVE or re.fullmatch(r'[^\s@]+@[^\s@]+', key) or key.startswith(('http:', 'https:', 'mailto:')):
        return text
    translated = LOOKUP.get(key.casefold())
    if translated is None:
        for separator in (' | ', ' — ', ' / '):
            if separator in key:
                translated = separator.join(translate(part) for part in key.split(separator))
                break
    if translated is None and key.endswith((' ↗', ' ↘')):
        translated = translate(key[:-2]) + key[-2:]
    if translated is None and key.startswith('Enlarge '):
        translated = 'ពង្រីករូបភាព៖ ' + translate(key[8:])
    if translated is None:
        MISSING.add(key)
        return text
    return text[:len(text)-len(text.lstrip())] + translated + text[len(text.rstrip()):]

class KhmerHTML(HTMLParser):
    def __init__(self, filename):
        super().__init__(convert_charrefs=True)
        self.filename = filename
        self.output = []
        self.in_script = False

    def handle_decl(self, declaration):
        self.output.append('<!' + declaration + '>')

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == 'html':
            attrs['lang'] = 'km'
        if tag == 'script':
            self.in_script = True
        language = attrs.get('data-language')
        if language:
            attrs['href'] = ('../' if language == 'en' else '') + self.filename
            attrs.pop('aria-current', None)
            if tag == 'a' and language == 'km':
                attrs['aria-current'] = 'true'
        for name in ('src', 'href'):
            if attrs.get(name, '').startswith('assets/'):
                attrs[name] = '../' + attrs[name]
        for name in ('alt', 'title', 'placeholder', 'aria-label', 'data-caption'):
            if name in attrs:
                attrs[name] = translate(attrs[name])
        if tag == 'meta':
            if attrs.get('name') == 'description' or attrs.get('property') in ('og:title', 'og:description'):
                attrs['content'] = translate(attrs['content'])
            elif attrs.get('property') == 'og:image':
                attrs['content'] = '../' + attrs['content']
        rendered = ''.join(' ' + name + ('' if value is None else '="' + escape(value, quote=True) + '"') for name, value in attrs.items())
        self.output.append('<' + tag + rendered + '>')

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.output[-1] = self.output[-1][:-1] + '/>'

    def handle_endtag(self, tag):
        self.output.append('</' + tag + '>')
        if tag == 'script':
            self.in_script = False

    def handle_data(self, data):
        if self.in_script:
            record = json.loads(data)
            record['name'] = 'ម៉េង ឡុង ទ្វារ និងបង្អួច'
            record['description'] = 'ទ្វារ និងបង្អួចអាលុយមីញ៉ូម នៅរាជធានីភ្នំពេញ ប្រទេសកម្ពុជា។'
            self.output.append(json.dumps(record, ensure_ascii=False))
        else:
            self.output.append(escape(translate(data), quote=False))

def localize(html, filename):
    parser = KhmerHTML(filename)
    parser.feed(html)
    return ''.join(parser.output)
