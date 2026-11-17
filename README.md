# 🎈 Et si on…?

Une webapp qui propose aux parents des jeux, bricolages, recettes et sorties **sans écran**. Les idées sont adaptées à l'âge des enfants (de 0 à 18 ans), au nombre d'adultes, au matériel disponible et à **la météo du jour**.

- **Trilingue : français, English, Deutsch.** La langue est détectée automatiquement et peut être changée à tout moment (sélecteur FR/EN/DE)
- Un questionnaire : enfants, adultes, matériel
- La météo automatique (position ou ville, via [Open-Meteo](https://open-meteo.com), gratuit, sans clé API) ou choisie à la main
- 78 activités illustrées, avec des variantes par tranche d'âge
- Un bouton « Surprends-moi », des favoris, un historique et un carnet de souvenirs avec photos
- Une PWA : on peut l'installer sur le téléphone, et elle fonctionne hors ligne

Il n'y a aucune dépendance et aucune étape de build : ce sont uniquement des fichiers statiques.

---

## 📁 Fichiers (tous au même niveau, aucun dossier)

| Fichier | Rôle |
|---|---|
| `index.html` | Page principale |
| `app.css` | Styles |
| `data.js` | **Les activités** en français (source principale) |
| `data.en.js` / `data.de.js` | Traductions anglaises et allemandes des activités |
| `i18n.js` | Textes de l'interface (FR / EN / DE) |
| `app.js` | Logique de l'app |
| `sw.js` | Service worker (mode hors ligne) |
| `manifest.webmanifest` | Installation sur mobile |
| `favicon.svg`, `icon-*.png`, `apple-touch-icon.png` | Icônes |
| `netlify.toml` | Configuration Netlify |

---

## 🚀 Mise en ligne : GitHub + Netlify

### Étape 1 : mettre les fichiers sur GitHub
1. Sur [github.com](https://github.com), cliquez sur **New repository**, nom `et-si-on`, puis **Create repository** (sans README).
2. Cliquez sur **uploading an existing file**.
3. Dézippez le zip, **sélectionnez les 16 fichiers** (Ctrl+A / Cmd+A dans le dossier dézippé) et glissez-les dans la page GitHub.
4. Cliquez sur **Commit changes**.

👉 Si vous aviez déjà un dépôt avec les anciens dossiers (`css`, `js`, `icons`), le plus simple est de supprimer ce dépôt (**Settings**, tout en bas : **Delete this repository**) et d'en recréer un neuf. Ensuite, reconnectez-le dans Netlify.

### Étape 2 : brancher Netlify
1. Connectez-vous sur [app.netlify.com](https://app.netlify.com) (le bouton « Sign up with GitHub » est le plus simple).
2. Cliquez sur **Add new site**, puis **Import an existing project**, puis **GitHub**.
3. Autorisez Netlify et choisissez le dépôt `et-si-on`.
4. Paramètres de build : **laissez tout vide** (le fichier `netlify.toml` s'en charge). Branche : `main`.
5. Cliquez sur **Deploy**. Au bout d'environ 30 secondes, le site est en ligne sur une adresse du type `https://xxx.netlify.app`.
6. Pour une adresse plus lisible, allez dans **Site configuration**, puis **Change site name**, et choisissez par exemple `et-si-on`, ce qui donne `https://et-si-on.netlify.app`.

✅ Ensuite, **chaque modification envoyée sur GitHub est redéployée automatiquement.**

### Variante express, sans GitHub
Glissez-déposez le dossier dézippé sur [app.netlify.com/drop](https://app.netlify.com/drop). C'est en ligne immédiatement, mais sans mise à jour automatique.

### Nom de domaine personnalisé (facultatif)
Dans Netlify : **Domain management**, puis **Add a domain** (par exemple `etsion.ch`). Netlify indique les réglages DNS à faire chez votre registrar. Le HTTPS est automatique et gratuit.

---

## ✏️ Ajouter ou modifier des activités

Tout se trouve dans `data.js`. Copiez un bloc existant et adaptez-le :

```js
{id:"mon-activite", t:"Titre", cat:"bricolage", e:["🎨","✂️","⭐"],
 a:[3,10],            // âge min et max
 w:"in",              // "in" dedans | "out" dehors | "both"
 ok:["sun","cloud"],  // météos où l'extérieur convient (si out/both) : sun, cloud, rain, snow, hot, cold
 en:"k",              // énergie : c=calme, k=créatif, d=défoulement
 d:30, p:1, ad:0,     // durée (min), préparation 1 à 3, adulte indispensable (1/0)
 m:["papier","colle"],// matériel : papier, crayons, peinture, colle, ciseaux, scotch, carton, recup, ficelle, tissu, cuisine, craies, ballon, eau
 desc:"Une phrase qui donne envie.",
 s:["Étape 1","Étape 2","Étape 3"],
 v:{b:"0-2 ans",p:"3-5 ans",e:"6-11 ans",a:"12-18 ans"}}, // variantes (laisser "" si non concerné)
```

- `id` doit être unique (minuscules et tirets).
- `cat` prend l'une de ces valeurs : `bricolage`, `jeu`, `cuisine`, `nature`, `science`, `sport`, `scene`.
- `e` contient 3 émojis : le premier est l'élément principal de l'illustration, les deux autres sont décoratifs.

**Traductions :** ajoutez la même `id` dans `data.en.js` et `data.de.js` avec `t`, `desc`, `s` (le même nombre d'étapes) et `v`. Si une traduction manque, l'app affiche simplement le texte français.

**Ajouter une langue** (par exemple l'italien) : copiez le bloc `fr:{…}` de `i18n.js` en `it:{…}`, créez `data.it.js` (`const TR_IT = {…}`), puis ajoutez `"it"` dans les sélecteurs de langue de `app.js` et le script dans `index.html`.

Après une modification, **augmentez `VERSION` dans `sw.js`** (par exemple `"v4"` devient `"v5"`), pour que les téléphones qui ont installé l'app récupèrent la nouvelle version.

---

## 🧪 Tester en local

Le service worker et la géolocalisation ont besoin d'un serveur, pas d'un double-clic sur le fichier :

```bash
python3 -m http.server 8000
# ouvrir http://localhost:8000
```

---

## 🔒 Données et vie privée

- Aucune donnée n'est envoyée à un serveur. Le profil, les favoris et le carnet (photos comprises) restent dans le **navigateur** de l'utilisateur (localStorage).
- La météo n'envoie à Open-Meteo que des coordonnées arrondies (environ 100 m) ou le nom de la ville.
- Attention : vider les données du navigateur efface le carnet. Les photos sont compressées (640 px), ce qui permet d'en stocker environ 50 à 80.

## 🗺️ Pistes pour la suite
Badges et défis de la semaine · activités saisonnières (Noël, Pâques, Halloween) · 200 activités ou plus · comptes et synchronisation (Supabase ou Firebase) · partage d'idées entre parents · vraies photos ou illustrations.
