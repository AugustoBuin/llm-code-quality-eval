# Gera os PDFs do relatório (PT e EN) a partir dos .md.
#   2-resultados/relatorio-final.md     -> relatorio-final.pdf
#   2-resultados/relatorio-final.en.md  -> relatorio-final.en.pdf
#
# Pipeline: Markdown -> HTML + CSS de impressão -> Microsoft Edge headless (--print-to-pdf).
# Requisitos: Python com 'markdown' (pip install markdown) e Microsoft Edge instalado (Windows).
# O HTML temporário é gravado na pasta do .md para que os caminhos relativos das imagens
# (graficos/... e graficos/en/...) resolvam. O banner de troca de idioma do topo é removido.
#
# Uso: python gerar_pdf.py   (pode rodar de qualquer diretório)
import os
import sys
import subprocess
import markdown

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
RES = os.path.join(REPO, '2-resultados')

EDGE_CANDIDATES = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
]

CSS = """
@page { size: A4; margin: 18mm 16mm; }
* { box-sizing: border-box; }
body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.45;
       color: #1a1a1a; margin: 0; }
h1 { font-size: 20pt; border-bottom: 2px solid #4C72B0; padding-bottom: 4px; }
h2 { font-size: 15pt; color: #34495e; border-bottom: 1px solid #ddd; padding-bottom: 2px; margin-top: 1.3em; }
h3 { font-size: 12.5pt; color: #34495e; }
p, li { orphans: 2; widows: 2; }
table { border-collapse: collapse; width: 100%; font-size: 9.3pt; margin: 0.6em 0; }
th, td { border: 1px solid #bbb; padding: 4px 7px; text-align: left; vertical-align: top; }
th { background: #eef2f7; }
img { max-width: 100%; height: auto; display: block; margin: 0.6em auto; page-break-inside: avoid; }
code { background: #f4f4f4; padding: 1px 4px; border-radius: 3px; font-family: Consolas, monospace; font-size: 9pt; }
pre { background: #f6f8fa; padding: 10px; border-radius: 5px; overflow: auto; page-break-inside: avoid; }
pre code { background: none; padding: 0; }
blockquote { border-left: 4px solid #c9d3e0; margin: 0.6em 0; padding: 2px 12px; color: #444; background: #fafbfc; }
a { color: #2a5db0; text-decoration: none; }
hr { border: none; border-top: 1px solid #ddd; margin: 1.1em 0; }
"""


def strip_banner(md):
    """Remove a primeira linha se for o banner de troca de idioma (e a linha em branco seguinte)."""
    lines = md.split('\n')
    if lines and lines[0].lstrip().startswith('>') and ('🇧🇷' in lines[0] or '🇬🇧' in lines[0]):
        lines = lines[1:]
        if lines and lines[0].strip() == '':
            lines = lines[1:]
    return '\n'.join(lines)


def md_to_pdf(md_path, pdf_path):
    edge = next((p for p in EDGE_CANDIDATES if os.path.exists(p)), None)
    if not edge:
        sys.exit('ERRO: Microsoft Edge não encontrado. Instale o Edge ou ajuste EDGE_CANDIDATES.')

    md_text = strip_banner(open(md_path, encoding='utf-8').read())
    html_body = markdown.markdown(md_text, extensions=['tables', 'fenced_code', 'sane_lists', 'attr_list'])
    html = f'<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"><style>{CSS}</style></head><body>{html_body}</body></html>'

    tmp_html = os.path.join(os.path.dirname(md_path), '_tmp_pdf.html')
    with open(tmp_html, 'w', encoding='utf-8') as f:
        f.write(html)
    url = 'file:///' + tmp_html.replace('\\', '/')

    try:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        # Tenta variantes de headless até sair um PDF válido (compatibilidade entre versões do Edge).
        ok = False
        for hl in ('--headless=old', '--headless', '--headless=new'):
            subprocess.run(
                [edge, hl, '--disable-gpu', '--no-pdf-header-footer', f'--print-to-pdf={pdf_path}', url],
                timeout=180, capture_output=True,
            )
            if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 8000:
                ok = True
                print(f'ok  {os.path.basename(pdf_path)}  ({os.path.getsize(pdf_path)//1024} KB)  [{hl}]')
                break
        if not ok:
            print(f'FALHOU: {os.path.basename(pdf_path)} não foi gerado (ou ficou vazio).')
    finally:
        if os.path.exists(tmp_html):
            os.remove(tmp_html)


if __name__ == '__main__':
    md_to_pdf(os.path.join(RES, 'relatorio-final.md'), os.path.join(RES, 'relatorio-final.pdf'))
    md_to_pdf(os.path.join(RES, 'relatorio-final.en.md'), os.path.join(RES, 'relatorio-final.en.pdf'))
    print('PDFs gerados em', RES)
