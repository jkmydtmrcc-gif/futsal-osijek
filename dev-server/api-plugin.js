/**
 * Vite dodatak koji lokalno poslužuje funkcije iz `api/`.
 *
 * Na Vercelu svaka datoteka u `api/` postaje funkcija sama od sebe. Lokalno
 * toga nema, pa bi se administracija mogla isprobati tek nakon deploya — a to
 * je spor način razvoja. Ovaj dodatak radi isto što i Vercel: mapira putanju
 * datoteke u rutu i poziva istu funkciju, s pravim `Request` objektom.
 *
 * Isti kod, ista provjera — samo bez oblaka.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/* --- .env ------------------------------------------------------------------ */

/**
 * Učitava `.env` u `process.env`.
 *
 * Namjerno bez `dotenv` ovisnosti: format je jednostavan, a manje ovisnosti
 * znači manje toga što može iznenaditi. Postojeće varijable se ne gaze.
 */
function loadEnv(root) {
  for (const name of ['.env.local', '.env']) {
    const file = join(root, name);
    if (!existsSync(file)) continue;

    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const eq = trimmed.indexOf('=');
      if (eq < 1) continue;

      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  }
}

/* --- pronalaženje ruta ------------------------------------------------------ */

function collectRoutes(dir, base = dir, out = new Map()) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    // `_lib` su zajednički moduli, ne rute — isto pravilo vrijedi na Vercelu.
    if (entry.name.startsWith('_')) continue;

    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectRoutes(full, base, out);
    } else if (entry.name.endsWith('.js')) {
      const route = `/api/${relative(base, full).split(sep).join('/').replace(/\.js$/, '')}`;
      out.set(route, full);
    }
  }
  return out;
}

/* --- pretvorba Node ⇄ Web --------------------------------------------------- */

function toRequest(req, origin) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('error', reject);
    req.on('end', () => {
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
        else if (value !== undefined) headers.set(key, value);
      }

      const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
      resolve(
        new Request(new URL(req.url, origin), {
          method: req.method,
          headers,
          body: hasBody ? Buffer.concat(chunks) : undefined,
        })
      );
    });
  });
}

async function writeResponse(res, response) {
  res.statusCode = response.status;

  // `Set-Cookie` može doći više puta, a `Headers.entries()` ih spaja u jedan
  // redak; `getSetCookie()` ih vraća razdvojene.
  const cookies = response.headers.getSetCookie?.() ?? [];
  for (const [key, value] of response.headers.entries()) {
    if (key.toLowerCase() === 'set-cookie') continue;
    res.setHeader(key, value);
  }
  if (cookies.length) res.setHeader('Set-Cookie', cookies);

  const body = response.body ? Buffer.from(await response.arrayBuffer()) : null;
  res.end(body);
}

/* --- dodatak ---------------------------------------------------------------- */

export default function apiPlugin() {
  let routes = new Map();
  let root = process.cwd();

  const middleware = (server) => async (req, res, next) => {
    const path = (req.url ?? '').split('?')[0].replace(/\/+$/, '') || '/';
    const file = routes.get(path);
    if (!file) return next();

    try {
      // Kroz Viteov učitavač modula: izmjena u `api/` se vidi bez ponovnog
      // pokretanja poslužitelja.
      const mod = server?.ssrLoadModule
        ? await server.ssrLoadModule(file)
        : await import(`${file}?t=${Date.now()}`);

      const handler = mod.default;
      if (typeof handler !== 'function') throw new Error(`${path} nema izvezenu funkciju.`);

      const request = await toRequest(req, `http://${req.headers.host ?? 'localhost'}`);
      await writeResponse(res, await handler(request));
    } catch (err) {
      console.error(`[api] ${path}:`, err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: 'Greška na poslužitelju.' }));
    }
    return undefined;
  };

  return {
    name: 'mnk-api-dev',
    apply: 'serve',

    configResolved(config) {
      root = config.root;
      loadEnv(root);
      const dir = join(root, 'api');
      routes = existsSync(dir) ? collectRoutes(dir) : new Map();
      if (routes.size) {
        console.log(`\n  api  ${[...routes.keys()].sort().join('\n       ')}\n`);
      }
    },

    configureServer(server) {
      server.middlewares.use(middleware(server));
    },

    configurePreviewServer(server) {
      server.middlewares.use(middleware(null));
    },
  };
}
