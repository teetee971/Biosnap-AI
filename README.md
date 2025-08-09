# BioSnap AI — Reconnaissance de la faune & de la flore (PWA)

**BioSnap AI** est une application web installable (PWA) dont l’objectif principal est l’**identification d’espèces végétales et animales à partir d’images**.  
La version actuelle inclut l’interface PWA, la gestion des médias, les pages légales, un module **partenaires/affiliation** (pour matériel & ressources) et une pipeline de déploiement **Cloudflare Pages + Worker** (tracking).

> **Mission** : fournir une base PWA robuste et sécurisée pour la reconnaissance faune/flore, avec un module IA **activable** (on-device ou via API) selon les besoins et les contraintes.

---

## 🐾 Fonctionnalités (présent & à activer)

### Cœur (reconnaissance faune/flore)
- **Module IA activable** :
  - **On-device (navigateur)** via ONNX Runtime Web ou TensorFlow.js (WebGL/WebGPU).
  - **API Cloud** (ex. service d’inférence dédié) si vous préférez externaliser le calcul.
- **Import photo / caméra** (mobile & desktop).
- **Fiches espèce** (nom commun/latin, taxon, liens ressources).
- **Historique d’observations** (localStorage/IndexedDB côté client).

> ℹ️ Par défaut, la reconnaissance n’est pas activée dans le code livré pour éviter d’embarquer un modèle générique inadapté. Voir **Activer la reconnaissance IA** ci-dessous.

### Module partenaires (optionnel)
- Liste de **partenaires/affiliés** (jardinage, semences, ouvrages, matériel d’observation).
- **UTM automatiques** + `aff_id` via `.env`.
- **Tracking des clics** local + **Webhook/Worker Cloudflare** (KV) prêt.

### Plateforme & PWA
- PWA installable (manifest, service worker, **offline** & **404**).
- UI **React + Vite + Tailwind** (sombre, responsive).
- **SEO** : robots.txt, sitemap.xml, OpenGraph.
- **Sécurité** : CSP, HSTS, COOP/COEP, frame-ancestors: deny (via `_headers`).
- **CI/CD** : GitHub → Cloudflare Pages (workflow inclus).

---

## 🧱 Architecture

- **Frontend** : React (Vite, Tailwind).  
- **PWA** : Service Worker (cache versionné, `offline.html`), manifest & icônes.  
- **Tracking** : Cloudflare **Worker** + **KV** (collecte des clics & formulaires partenaires).  
- **Affiliation** : fichiers `src/data/partners.json` + overrides via `.env.local`.

---

## 🚀 Installation & démarrage

```bash
# 1) Dépendances
npm i

# 2) Variables (optionnel)
cp .env.example .env.local
# renseignez VITE_DEFAULT_AFF_ID, VITE_CLICK_WEBHOOK si Worker déployé, etc.

# 3) Dev
npm run dev

# 4) Build prod
npm run build   # sortie dans dist/
```

**Cloudflare Pages**  
- Build command : `npm run build`  
- Output : `dist`  
- Node : 20+  
- `_headers` et `_redirects` sont pris en charge.

---

## 🤖 Activer la reconnaissance IA

Deux approches possibles (au choix) :

### 1) On-device (navigateur)
- Avantages : **vie privée** (les images ne quittent pas l’appareil), fonctionnement partiel **hors-ligne**, pas de latence réseau.
- Étapes :
  1. Choisir un modèle (ex. modèle plantes ou oiseaux au format **ONNX**/TFJS) adapté à votre cas d’usage.
  2. Installer un runtime :
     ```bash
     npm i onnxruntime-web
     ```
  3. Créer un fichier `src/ai/model.js` (exemple minimal) :
     ```js
     import * as ort from 'onnxruntime-web';

     let session;
     export async function loadModel(url='/models/model.onnx') {
       session = await ort.InferenceSession.create(url, { executionProviders: ['wasm','webgl'] });
     }

     export async function classify(tensorInput) {
       if (!session) throw new Error('Model not loaded');
       const feeds = { input: tensorInput }; // adapter nom/shape à votre modèle
       const results = await session.run(feeds);
       return results; // mappez vers labels/espèces
     }
     ```
  4. **Pré/post-processing** : redimensionner l’image, normaliser, puis mapper la sortie vers des **labels d’espèces** (table de correspondance à fournir selon votre modèle).

> ⚠️ Un modèle “générique” donnera des résultats limités. Préférez un modèle **spécifique** (végétaux locaux, oiseaux d’Europe, etc.).

### 2) API Cloud (serveur d’inférence)
- Avantages : modèles lourds possibles, mises à jour centralisées.
- Étapes :
  1. Exposez un endpoint (ex. `/classify`) qui reçoit l’image (base64/form-data) et renvoie `{ label, score }`.
  2. Ajoutez un client minimal côté app :
     ```js
     export async function classifyViaAPI(fileOrBlob) {
       const body = new FormData();
       body.append('image', fileOrBlob);
       const res = await fetch(import.meta.env.VITE_CLASSIFY_ENDPOINT, { method: 'POST', body });
       if (!res.ok) throw new Error('API error');
       return await res.json();
     }
     ```
  3. Déclarez `VITE_CLASSIFY_ENDPOINT` dans `.env.local`.

---

## ⚙️ Configuration (env)

`.env.local` :
```
# UTM / affiliation
VITE_DEFAULT_AFF_ID=AFF_XXXX
VITE_DEFAULT_UTM_SOURCE=biosnap
VITE_DEFAULT_UTM_MEDIUM=affiliate
VITE_DEFAULT_UTM_CAMPAIGN=launch

# Webhook de tracking (URL de votre Worker)
VITE_CLICK_WEBHOOK=

# Overrides d’URL d’affiliation (remplacent partners.json si renseignés)
VITE_AFF_URL_BOTANIC=
VITE_AFF_URL_TRUFFAUT=
VITE_AFF_URL_BAKKER=
VITE_AFF_URL_MANOMANO=
VITE_AFF_URL_AMAZON=

# (optionnel) API reconnaissance si mode Cloud
VITE_CLASSIFY_ENDPOINT=
```

---

## 🛰️ Déploiement du Worker (tracking)

```bash
cd worker
wrangler login
wrangler kv namespace create BIOSNAP_KV
wrangler deploy
# récupérez l’URL du Worker et placez-la dans VITE_CLICK_WEBHOOK
```

Vous pouvez ensuite consulter les événements stockés dans KV (clé/valeur JSON).

---

## 🔒 Données & vie privée

- **On-device** : les images restent **locales** (préférable pour la vie privée).  
- **API Cloud** : les images transitent vers votre serveur — ajoutez une politique de **rétention** et de **sécurité** adaptées (HTTPS, chiffrement, logs minimaux).  
- L’historique utilisateur est stocké en **IndexedDB/localStorage** côté client (et peut être vidé).

---

## 🧭 Conformité & éthique

- Respect de la **protection des espèces** et de la **réglementation** (espèces protégées, invasives, export/import, phytosanitaire).  
- Ne jamais inciter à la capture ou au dérangement d’animaux sauvages.  
- Le module partenaires est destiné à du matériel/ouvrages **légaux** (pas d’animaux).

---

## 🗺️ Roadmap

- [ ] Intégration d’un modèle plantes **on-device** (pack léger).  
- [ ] “Fiches espèce” enrichies (images de référence, habitats, statut UICN).  
- [ ] Export/partage d’observations (CSV/GeoJSON).  
- [ ] Mode **offline avancé** (cache des fiches/étiquettes).  
- [ ] Tableau admin partenaires (avec analytics agrégées).

---

## 🧾 Licence

À définir par le propriétaire du dépôt.

---

## 🔗 Liens utiles

- Prod : `https://biosnap-ai.pages.dev/`  
- Support/contact : `contact@biosnap.ai` (exemple)

---

### Comment contribuer ?
Issues, PRs et discussions sont bienvenues : corrections, modèles plus adaptés à votre région, amélioration UX, etc.
