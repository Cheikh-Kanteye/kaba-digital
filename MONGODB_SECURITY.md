# MongoDB — règles de sécurité Kaba

La connexion MongoDB de Kaba est fournie au backend par la variable d’environnement `MONGODB_URI`. Cette variable doit rester dans le gestionnaire de secrets du projet ou dans un fichier `.env` local non versionné. Elle ne doit jamais être copiée dans le frontend, les logs, les captures d’écran, les tests, la documentation publique ou le dépôt Git.

Le helper serveur `server/mongodb.ts` ouvre une connexion MongoDB à la demande et expose uniquement des opérations applicatives contrôlées. Le test `server/mongodb.connection.test.ts` vérifie le ping du serveur sans afficher la valeur de la variable.

Le fichier Atlas fourni ne doit plus être relu ni copié dans le projet après migration. Supprimez-le de votre espace local lorsque vous n’en avez plus besoin.

Le secret MongoDB actuellement configuré est conservé uniquement pour l’environnement de test et de prévisualisation. Il doit être révoqué et remplacé manuellement avant toute mise en production ou avant la diffusion/récupération publique du code.

Avant toute mise en production, le mot de passe Atlas utilisé pour les tests doit être **révoqué et renouvelé**. Il faudra ensuite mettre à jour `MONGODB_URI` dans le gestionnaire de secrets, limiter l’IP Access List aux environnements nécessaires et vérifier que les droits de l’utilisateur MongoDB sont limités au périmètre Kaba.

Aucune donnée client, aucun mot de passe et aucune chaîne de connexion ne doivent être ajoutés aux fixtures ou aux données de démonstration.
