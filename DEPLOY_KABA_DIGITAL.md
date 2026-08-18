# Déploiement Kaba sur `kaba.digital`

Cette configuration utilise un conteneur Node pour Kaba, Nginx comme reverse proxy et Certbot pour le certificat TLS. Elle est destinée à un serveur Linux possédant Docker Compose, une adresse IP publique et les ports 80/443 ouverts. Aucun déploiement ni changement DNS n’est exécuté automatiquement depuis le projet.

## 1. Préparer le DNS

Chez le registrar ou le fournisseur DNS de `kaba.digital`, créer les enregistrements suivants vers l’adresse IP publique du serveur :

| Type | Nom | Valeur | Rôle |
|---|---|---|---|
| A | `@` | `IP_PUBLIQUE_DU_SERVEUR` | Domaine principal |
| A | `www` | `IP_PUBLIQUE_DU_SERVEUR` | Variante www |

Attendre la propagation DNS avant de lancer Certbot. Vérifier avec `dig +short kaba.digital` et `dig +short www.kaba.digital`.

## 2. Installer le projet sur le serveur

Cloner le dépôt dans un répertoire de déploiement, puis créer l’environnement réel à partir du modèle :

```bash
cp .env.production.example .env.production
chmod 600 .env.production
```

Renseigner au minimum `DATABASE_URL`, `MONGODB_URI`, `JWT_SECRET`, les variables de session/OAuth encore utilisées par le serveur, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, les clés Forge réellement utilisées et `PUBLIC_ORIGIN=https://kaba.digital`. Les valeurs secrètes ne doivent jamais être écrites dans Git, dans le Dockerfile ou dans Nginx. Les uploads d’images et de vidéos sont effectués par le serveur vers Cloudinary ; MongoDB ne conserve que les URLs et métadonnées du média.

## 3. Émettre le premier certificat

Le premier démarrage utilise la configuration HTTP de bootstrap afin que Let’s Encrypt puisse vérifier le domaine :

```bash
docker compose -f docker-compose.yml -f docker-compose.bootstrap.yml up -d --build

docker compose run --rm --profile certbot certbot certonly \
  --webroot -w /var/www/certbot \
  --email ADMIN_EMAIL \
  --agree-tos --no-eff-email \
  -d kaba.digital -d www.kaba.digital
```

Remplacer `ADMIN_EMAIL` par une adresse réellement surveillée. Si l’émission réussit, basculer sur Nginx HTTPS :

```bash
docker compose down
docker compose up -d --build
```

La configuration finale redirige HTTP vers HTTPS, redirige `www.kaba.digital` vers `kaba.digital`, transmet les IP et le protocole au serveur Express et conserve les connexions upgrade utiles au runtime.

## 4. Renouvellement du certificat

Les certificats Let’s Encrypt expirent périodiquement. Programmer sur le serveur une tâche externe au conteneur :

```bash
0 3 * * * cd /opt/kaba && docker compose run --rm --profile certbot certbot renew --webroot -w /var/www/certbot && docker compose exec nginx nginx -s reload
```

Le cron doit être configuré sur le serveur hôte, pas dans le conteneur applicatif. Tester le renouvellement avec `certbot renew --dry-run`.

## 5. Exploitation et diagnostic

Les commandes courantes sont :

```bash
docker compose ps
docker compose logs -f app
docker compose logs -f nginx
docker compose restart app nginx
docker compose exec nginx nginx -t
```

Le conteneur applicatif écoute sur le port interne 3000. Nginx est le seul service exposé publiquement sur 80 et 443. MongoDB et MySQL restent externes et doivent autoriser l’IP du serveur avec TLS lorsque le fournisseur le permet.

## 6. Stockage média Cloudinary

Les nouveaux médias sont envoyés par la mutation serveur `uploadMedia`, qui signe la requête avec `CLOUDINARY_API_SECRET`. Le navigateur ne reçoit jamais ce secret. Les URLs `secure_url`, le type de ressource et les métadonnées utiles sont ensuite enregistrés dans le document du bien MongoDB. Les médias legacy restent inchangés tant que l’accès `MONGO_URI2` n’est pas rétabli.

## 7. Sécurité avant mise en production

Utiliser un mot de passe MongoDB dédié à la production, faire tourner les secrets de test déjà partagés, limiter l’allowlist réseau MongoDB à l’IP du serveur et conserver `.env.production` hors du dépôt. Le mot de passe admin temporaire doit également être changé avant l’ouverture publique. Configurer un pare-feu qui n’autorise que SSH administré, HTTP et HTTPS.


## 8. Validation automatisée

Le sandbox de développement ne fournit pas le moteur Docker ni le binaire Nginx, donc l’image et la syntaxe Nginx ne peuvent pas être exécutées localement ici. Le workflow `.github/workflows/validate-deployment.yml` réalise ces contrôles sur un runner Ubuntu avec Docker : configuration Compose, build de l’image, certificat de test éphémère et `nginx -t` pour les configurations HTTPS et bootstrap. Le certificat généré par la CI n’est jamais utilisé en production.
