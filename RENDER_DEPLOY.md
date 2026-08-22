# Déploiement Kaba sur Render

## Point important

Kaba est une application **Node/Express + Vite**, et non un site statique. Dans Render, elle doit être créée comme **Web Service**. L’erreur `Empty build command` suivie de `Publish directory public does not exist` indique que le dépôt a été configuré comme Static Site ; ce mode cherche un dossier `public` et ne lance pas le serveur Express.

Le fichier `render.yaml` du dépôt configure automatiquement le service Web avec les commandes adaptées :

```text
Build Command: corepack enable && pnpm install --frozen-lockfile && pnpm build
Start Command: pnpm start
Health Check Path: /
```

Render fournit automatiquement la variable `PORT`. Le serveur Kaba l’utilise déjà et ne doit pas être remplacé par un port fixe.

## Mise en place

Dans Render, choisissez **New → Blueprint** et sélectionnez le dépôt GitHub `Cheikh-Kanteye/kaba-digital`. Render détectera `render.yaml`. Si le service existe déjà en Static Site, créez un nouveau **Web Service** depuis le même dépôt ou recréez le service avec le type Web Service ; changer uniquement le dossier de publication ne suffit pas.

Les trois secrets Cloudinary, l’URI MongoDB et l’identité propriétaire doivent être ajoutés dans **Environment**. Les valeurs sensibles ne doivent pas être écrites dans `render.yaml` ni dans GitHub. Le serveur OAuth attendu par l’infrastructure est déclaré avec `OAUTH_SERVER_URL=https://api.manus.im`; il ne faut pas le remplacer par l’URL publique Render `https://kaba-digital.onrender.com`.

| Variable | Requise | Utilisation |
|---|---:|---|
| `OAUTH_SERVER_URL` | Oui | URL du serveur OAuth : `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | Non | Portail OAuth : `https://auth.manus.im` |
| `MONGODB_URI` | Oui | Connexion MongoDB Atlas |
| `JWT_SECRET` | Oui | Sessions locales ; le Blueprint peut générer une valeur |
| `CLOUDINARY_CLOUD_NAME` | Oui | Environnement média Cloudinary |
| `CLOUDINARY_API_KEY` | Oui | Uploads signés côté serveur |
| `CLOUDINARY_API_SECRET` | Oui | Signature Cloudinary côté serveur |
| `OWNER_NAME` | Oui | Profil propriétaire/admin |
| `OWNER_OPEN_ID` | Oui | Association du compte admin |
| `VITE_APP_TITLE` | Non | Titre affiché |
| `VITE_APP_LOGO` | Non | `/assets/kaba/icon-kaba.webp` |

Après le premier déploiement, vérifiez la route `/`, puis `/login`, `/register`, `/selection` et `/admin`. Pour les uploads, vérifiez aussi que les trois valeurs Cloudinary appartiennent au même product environment et que la clé possède la permission de création/upload.

## Assets et stockage

Les petits logos et images critiques sont servis depuis `client/public/assets/kaba` et sont inclus dans `dist/public` au build. Les vidéos et médias de biens ne doivent pas être ajoutés au dépôt lorsqu’ils sont volumineux : ils sont servis depuis Cloudinary ou le stockage persistant. Le dossier `public` Render n’est donc pas un dossier de publication séparé ; il est généré par Vite dans `dist/public` et servi par Express.

## Configuration manuelle équivalente

Si vous ne passez pas par Blueprint, créez un **Web Service** avec les paramètres suivants :

| Champ Render | Valeur |
|---|---|
| Runtime | Node |
| Branch | `main` |
| Build Command | `corepack enable && pnpm install --frozen-lockfile && pnpm build` |
| Start Command | `pnpm start` |
| Health Check Path | `/` |
| Publish Directory | Laisser vide |

Le champ **Publish Directory** doit rester vide pour un Web Service Node. Le serveur Express sert lui-même le build Vite et les routes de l’application.
