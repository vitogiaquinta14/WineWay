// Genera docs/codigos-de-prueba.html con el código de barras de cada vino del catálogo,
// para probar el escáner sin botellas reales. Uso: npm run codigos --prefix backend
import { readFileSync, writeFileSync } from 'node:fs';
import { URL } from 'node:url';

const catalogo = JSON.parse(readFileSync(new URL('../prisma/data/catalogo.json', import.meta.url), 'utf8'));
const destino = new URL('../../docs/codigos-de-prueba.html', import.meta.url);

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const bodegas = catalogo.bodegas.filter((b) => b.activa && b.vinos.length);
const total = bodegas.reduce((n, b) => n + b.vinos.length, 0);

const tarjeta = (v) => `
      <figure>
        <svg class="codigo" data-codigo="${esc(v.codigoBarras)}"></svg>
        <figcaption><strong>${esc(v.nombre)}</strong>${v.codigoDePrueba ? '' : '<br><small>EAN real de la botella</small>'}</figcaption>
      </figure>`;

const secciones = bodegas
  .map(
    (b) => `
    <section>
      <h2>${esc(b.nombre)} <span>${esc(b.zona)}</span></h2>
      <div class="grilla">${b.vinos.map(tarjeta).join('')}
      </div>
    </section>`,
  )
  .join('');

const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Códigos de prueba</title>
  <style>
    :root { --malbec: #722F37; --crema: #F7F2EA; --carbon: #252525; --borde: #E6DED2; --tenue: #8A807A; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 24px 16px; font-family: system-ui, sans-serif; background: var(--crema); color: var(--carbon); }
    header, section { max-width: 1100px; margin: 0 auto 24px; }
    h1 { color: var(--malbec); margin: 0 0 8px; }
    header p { margin: 4px 0; line-height: 1.5; }
    h2 { font-size: 18px; border-bottom: 2px solid var(--malbec); padding-bottom: 6px; }
    h2 span { font-weight: 400; font-size: 13px; color: var(--tenue); }
    .grilla { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
    figure { margin: 0; background: #fff; border: 1px solid var(--borde); border-radius: 10px; padding: 12px; text-align: center; break-inside: avoid; }
    svg.codigo { width: 100%; height: auto; }
    figcaption { font-size: 13px; margin-top: 4px; line-height: 1.4; }
    small { color: var(--tenue); }
    @media print { body { background: #fff; padding: 0; } .pantalla { display: none; } section { break-inside: avoid; } }
  </style>
</head>
<body>
  <header>
    <h1>WineWay · Códigos de prueba del escáner</h1>
    <p>${total} vinos del catálogo. Abrí <strong>Escanear</strong> en la app y apuntá la cámara a un código: tiene que aparecer ese vino.</p>
    <p class="pantalla">Funciona desde la pantalla (con buen brillo) o impreso. Si no lee, acercá o alejá un poco el teléfono.</p>
    <p>Los códigos con prefijo 200 son internos de prueba (no corresponden a botellas reales). Generado desde <code>backend/prisma/data/catalogo.json</code> con <code>npm run codigos --prefix backend</code>.</p>
  </header>${secciones}
  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
  <script>
    document.querySelectorAll('svg.codigo').forEach((svg) => {
      const codigo = svg.dataset.codigo;
      JsBarcode(svg, codigo, { format: /^\\d{13}$/.test(codigo) ? 'EAN13' : 'CODE128', height: 70, margin: 8, fontSize: 16 });
    });
  </script>
</body>
</html>
`;

writeFileSync(destino, html);
console.log(`Generado docs/codigos-de-prueba.html con ${total} códigos.`);
