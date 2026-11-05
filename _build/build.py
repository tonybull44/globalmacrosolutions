#!/usr/bin/env python3
"""Genera el sitio multipágina de Global Macro Solutions a partir de _build/source.html.

Uso:  python3 _build/build.py   (desde la raíz del repo)
Edita los textos en source.html (o en los bloques de este archivo) y vuelve a correrlo.
"""
import re, os, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
B = ROOT / '_build'
src = (B / 'source.html').read_text()

def between(s, a, b, inclusive=True):
    i = s.index(a); j = s.index(b, i) + (len(b) if inclusive else 0)
    return s[i:j]

# ---------- piezas del documento original ----------
head_top = src[:src.index('<style>')]                       # doctype, metas, fuentes
css_main = between(src, '<style>', '</style>')[len('<style>'):-len('</style>')]
intro = between(src, '<!-- INTRO GMS', '<!-- /INTRO GMS -->')
header = between(src, '<header class="nav" id="dmHeader">', '</header>')
templates = src[src.index('<template id="tpl-0">'):src.index('<main id="top">')].strip()
footer = between(src, '<footer class="sgf"', '</footer>')
scripts_tail = src[src.index('</footer>') + len('</footer>'):src.index('</body>')]
i18n_js = re.search(r'<script>\s*(/\* i18n.*?)</script>', scripts_tail, re.S).group(1)
main_js = scripts_tail[scripts_tail.index("document.documentElement.classList.add('js');"):]
main_js = main_js[:main_js.rindex('</script>')]

def sec(marker):
    i = src.index(marker); j = src.index('</section>', i) + len('</section>')
    return src[i:j]

S = {
    'hero': sec('<!-- HERO -->'),
    'mercado': sec('<!-- MERCADO -->'),
    'fx3': sec('<!-- ICEBERG'),
    'ruta': sec('<!-- RUTA -->'),
    'operacion': sec('<!-- OPERACIÓN -->'),
    'planes': sec('<!-- PLANES -->'),
    'inversionistas': sec('<!-- INVERSIONISTAS -->'),
    'equipo': sec('<!-- RED -->'),
    'faq': sec('<!-- FAQ'),
    'cierre': sec('<!-- CIERRE -->'),
}

# ---------- FAQ por página ----------
_fl = S['faq'][S['faq'].index('<div class="fq-item"'):]
_fl = _fl[:_fl.rindex('</div>\n    </div>\n  </section>')]
_fl = _fl[:_fl.rindex('</div>')]  # cierra fq-list
faq_items = [('<div class="fq-item"' + x).rstrip() for x in _fl.split('<div class="fq-item"')[1:]]
assert len(faq_items) == 9, len(faq_items)
faq_open = S['faq'][:S['faq'].index('<div class="fq-item"')]
faq_close = '\n      </div>\n    </div>\n  </section>'
def faq(idx):
    return faq_open + '\n'.join(faq_items[i] for i in idx) + faq_close

# ---------- enlaces entre páginas ----------
LINKS = [
    ('href="#top"', 'href="index.html"'),
    ('href="#planes"', 'href="planes.html"'),
    ('href="#ruta"', 'href="index.html#ruta"'),
    ('href="#inversionistas"', 'href="inversionistas.html"'),
    ('href="#operacion"', 'href="terminal.html#operacion"'),
    ('href="#faq"', 'href="planes.html#faq"'),
    ('href="#trader-macro"', 'href="index.html#trader-macro"'),
    ('href="#equipo"', 'href="nosotros.html#equipo"'),
]
def relink(s):
    for a, b in LINKS: s = s.replace(a, b)
    return s

hdr = relink(header)
tpl = relink(templates)
# La tarjeta de la Terminal del menú lleva a la página propia
tpl = tpl.replace('<a class="mp-term gmt-card" href="https://www.globalmacroterminal.com/">', '<a class="mp-term gmt-card" href="terminal.html">')
tpl = tpl.replace('<span class="gmt-btn">Acceder a la Terminal</span>', '<span class="gmt-btn">Conoce la Terminal</span>')
# Recursos → Compañía: Nosotros
tpl = tpl.replace('<a href="nosotros.html#equipo">Equipo</a>', '<a href="nosotros.html">Nosotros</a><a href="nosotros.html#equipo">Equipo</a>')
ftr = relink(footer)

# ---------- bloques nuevos ----------
CAL = 'https://calendly.com/camilo-pacheco-globalmacrosolutions/30min'
ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8l4 4-4 4M2 12h20"/></svg>'
def page_hero(eb, h1, sub, ctas):
    btns = ''.join(f'<a class="btn {c}" href="{h}">{t} {ARROW}</a>' for t, h, c in ctas)
    return f'''  <section class="dark-2 hero page-hero">
    <div class="wrap hero-in">
      <span class="eb rise">{eb}</span>
      <h1 class="rise d1">{h1}</h1>
      <p class="sub rise d2">{sub}</p>
      <div class="ctas rise d3">{btns}</div>
    </div>
  </section>'''

paths = '''  <!-- DOS CAMINOS -->
  <section class="dark band" id="caminos">
    <div class="wrap">
      <span class="eb">El ecosistema</span>
      <h2 class="h2">Dos caminos. Una misma metodología.</h2>
      <p class="sub">Desarrolla tu propio criterio como trader o explora una solución de gestión profesional para tu capital.</p>
      <div class="paths-grid">
        <a class="path-card" href="terminal.html">
          <span class="path-k">Para traders</span>
          <h3>Global Macro Terminal</h3>
          <p>Macro, posicionamiento institucional, sentimiento y tendencia de forex, índices y commodities en una sola plataforma.</p>
          <span class="path-shot"><img loading="lazy" decoding="async" src="img/3e613b1dca.webp" alt="Vista de Global Macro Terminal" width="560" height="318"></span>
          <span class="path-go">Conoce la Terminal <i>→</i></span>
        </a>
        <a class="path-card alt" href="inversionistas.html">
          <span class="path-k">Para inversionistas</span>
          <h3>Global Macro Invest</h3>
          <p>Estrategias basadas en análisis del contexto económico, selección de activos, construcción de portafolios y control de riesgos.</p>
          <div class="path-facts">
            <div><b>USD 100,000</b><span>Global Macro Trend · capital mínimo publicado</span></div>
            <div><b>USD 50,000</b><span>Global Macro Select · capital mínimo publicado</span></div>
          </div>
          <span class="path-go">Conoce Global Macro Invest <i>→</i></span>
        </a>
      </div>
    </div>
  </section>'''

cierre = relink(S['cierre'])

PAGES = {
    'index.html': dict(
        title='Global Macro Solutions — Inteligencia financiera para traders e inversionistas',
        desc='Global Macro Solutions — Inteligencia financiera para entender, operar e invertir en los mercados globales.',
        intro=True, nav=None,
        body=[relink(S['hero']), relink(S['fx3']), relink(S['ruta']), paths, cierre]),
    'terminal.html': dict(
        title='Global Macro Terminal — Global Macro Solutions',
        desc='Macro, posicionamiento institucional, sentimiento y tendencia de forex, índices y commodities en una sola plataforma.',
        nav=None,
        body=[page_hero('Global Macro Terminal', 'Entiende qué mueve <em class="s">los mercados.</em>',
                        'Macro, posicionamiento institucional, sentimiento y tendencia de forex, índices y commodities en una sola plataforma.',
                        [('Acceder a la Terminal', 'https://www.globalmacroterminal.com/', 'btn-cream'), ('Ver planes', 'planes.html', 'btn-outline')]),
              relink(S['operacion']), relink(S['mercado']), cierre]),
    'planes.html': dict(
        title='Planes — Global Macro Solutions',
        desc='Club de Traders, Plan Mensual, Acelerador y Trading Floor: elige tu nivel dentro de la ruta de Global Macro.',
        nav='planes.html',
        body=[page_hero('Planes · USD', 'Elige tu nivel <em class="s">dentro de la ruta.</em>',
                        'Desde el Club de Traders gratuito hasta el Trading Floor anual: una misma metodología, distintos niveles de acompañamiento.',
                        [('Únete al Club de Traders', 'https://comunidad.globalmacroterminal.com', 'btn-cream'), ('Agenda una llamada', CAL, 'btn-outline')]),
              relink(S['planes']), faq([2, 3, 4, 5, 6, 7]), cierre]),
    'inversionistas.html': dict(
        title='Global Macro Invest — Global Macro Solutions',
        desc='Global Macro Invest: gestión de capital con metodología macroeconómica. Global Macro Trend y Global Macro Select.',
        nav=None,
        body=[page_hero('Global Macro Invest', 'Tu capital, gestionado <em class="s">con contexto macro.</em>',
                        'Estrategias basadas en análisis del contexto económico, selección de activos, construcción de portafolios y control de riesgos.',
                        [('Agenda una sesión', CAL, 'btn-cream')]),
              relink(S['inversionistas']), faq([7, 8, 0]), cierre]),
    'nosotros.html': dict(
        title='Nosotros — Global Macro Solutions',
        desc='Global Macro Solutions: análisis macro, tecnología, formación y gestión de capital en México, Ecuador y Colombia.',
        nav=None,
        body=[page_hero('Nosotros', 'Inteligencia financiera <em class="s">con metodología.</em>',
                        'Un ecosistema de análisis macro, tecnología, formación y gestión de capital, con presencia en México, Ecuador y Colombia.',
                        [('Agenda una sesión', CAL, 'btn-cream'), ('Únete al Club de Traders', 'https://comunidad.globalmacroterminal.com', 'btn-outline')]),
              relink(S['equipo']), faq([0, 1, 7]), cierre]),
}

ICONS = '''<link rel="icon" href="favicon.ico?v=3" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="img/favicon-32.png?v=3">
<link rel="apple-touch-icon" href="img/apple-touch-icon.png?v=3">
<link rel="manifest" href="site.webmanifest">'''
SPEC = '''<script type="speculationrules">{"prefetch":[{"source":"document","where":{"href_matches":"/*.html"},"eagerness":"moderate"}]}</script>'''

def build(name, p):
    h = head_top
    h = re.sub(r'<title>.*?</title>', f'<title>{p["title"]}</title>', h, flags=re.S)
    h = re.sub(r'(<meta name="description" content=")[^"]*(")', lambda m: m.group(1) + p['desc'] + m.group(2), h)
    nav = hdr
    if p['nav']:
        nav = nav.replace(f'class="dm-trig dm-link" href="{p["nav"]}"', f'class="dm-trig dm-link" href="{p["nav"]}" aria-current="page"')
        nav = nav.replace(f'class="dm-mlink" href="{p["nav"]}"', f'class="dm-mlink" href="{p["nav"]}" aria-current="page"')
    out = [h.rstrip(), ICONS, '<link rel="stylesheet" href="assets/site.css">', SPEC, '</head>', '<body>']
    if p.get('intro'): out.append(intro)
    out += [nav, tpl, '<main id="top">', '\n\n'.join(p['body']), '</main>', ftr,
            '<script src="assets/i18n.js"></script>',
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>',
            '<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>',
            '<script src="assets/site.js"></script>',
            '</body>', '</html>']
    html = '\n'.join(out) + '\n'
    assert '<head>' in html or '<html' in html
    (ROOT / name).write_text(html)
    return len(html)

# ---------- recursos compartidos ----------
(ROOT / 'assets').mkdir(exist_ok=True)
(ROOT / 'assets' / 'site.css').write_text(css_main.strip() + '\n\n' + (B / 'motion.css').read_text())
import json as _json
_X = _json.loads((B / 'i18n_extra.json').read_text())
_inj = 'Object.keys(%s).forEach(function(l){if(D[l])Object.assign(D[l],%s[l])});\n' % ('__X', '__X')
i18n_js = i18n_js.replace('var REV={};', 'var __X=' + _json.dumps(_X, ensure_ascii=False) + ';' + _inj + 'var REV={};', 1)
assert '__X' in i18n_js
(ROOT / 'assets' / 'i18n.js').write_text(i18n_js.strip() + '\n')

js = main_js
# robustez: bloques que asumían que todo estaba en una sola página
js = js.replace("plan(1);", "if(det)plan(1);", 1)
js = js.replace("function plan(i){", "function plan(i){if(!det)return;", 1)
# shaders WebGL: cargar solo cuando las tarjetas se acercan a la pantalla
js = js.replace("const cards=[...document.querySelectorAll('.fsc-card')];if(!cards.length)return;",
                "const cards=[...document.querySelectorAll('.fsc-card')];if(!cards.length)return;\n"
                "  await new Promise(r=>{const o=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){o.disconnect();r()}},{rootMargin:'300px'});cards.forEach(c=>o.observe(c))});", 1)
(ROOT / 'assets' / 'site.js').write_text(js.strip() + '\n\n' + (B / 'motion.js').read_text())

import hashlib as _h
def _v(f): return _h.sha1((ROOT / f).read_bytes()).hexdigest()[:8]
VER = {f: _v(f) for f in ['assets/site.css', 'assets/i18n.js', 'assets/site.js']}
for n, p in PAGES.items():
    print(n, build(n, p))
    x = (ROOT / n).read_text()
    for f, v in VER.items(): x = x.replace(f'"{f}"', f'"{f}?v={v}"')
    (ROOT / n).write_text(x)
print('site.css', (ROOT / 'assets/site.css').stat().st_size, 'site.js', (ROOT / 'assets/site.js').stat().st_size)
