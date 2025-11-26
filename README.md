# Front-end simple pour upload d'images

Ceci est un petit front-end (HTML/CSS/JS) qui permet :
- de sélectionner ou glisser/déposer une image
- de prévisualiser l'image
- d'envoyer l'image vers un backend via POST (FormData)
- ou de simuler un résultat localement

Configuration rapide
- Ouvrir `index.html` dans un navigateur pour tester l'interface.
- Modifier la constante `BACKEND_URL` dans `home.js` pour pointer vers votre endpoint réel si besoin (ex: `http://localhost:5000/api/detect`).

Format attendu côté backend
- Requête: POST `BACKEND_URL` avec `FormData` contenant la clé `image`.
- Réponse JSON attendue: `{"is_deepfake": true|false, "score": 0.87}`.

Test sans backend
- Utilisez le bouton "Simuler résultat" après avoir sélectionné une image.
