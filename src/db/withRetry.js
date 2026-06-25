// Helper interne : reessaie une fonction async plusieurs fois avant d'abandonner.
// Les bases sont normalement deja "healthy" grace au depends_on de docker-compose,
// mais le retry rend l'app robuste en lancement local hors Docker.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function withRetry(label, fn, { retries = 10, delay = 2000 } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      console.warn(`[${label}] tentative ${attempt}/${retries} echouee: ${err.message}`);
      await sleep(delay);
    }
  }
  throw new Error(
    `[${label}] connexion impossible apres ${retries} tentatives: ${lastErr?.message}`
  );
}
