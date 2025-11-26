// front-end JS — front-only (aucune connexion au backend dans ce fichier)

// Si le script est exécuté en dehors d'un navigateur (ex: `node home.js`),
// démarrer un petit serveur statique et ouvrir la page dans le navigateur.
if (typeof window === 'undefined' || typeof document === 'undefined') {
	/* eslint-disable no-console */
	// Démarre un serveur HTTP simple pour servir les fichiers du dossier courant.
	const http = require('http');
	const fs = require('fs');
	const path = require('path');
	const { exec } = require('child_process');

	const port = process.env.PORT || 8000;
	const root = process.cwd();

	const mime = {
		'.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
		'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
		'.json': 'application/json', '.txt': 'text/plain'
	};

	const server = http.createServer((req, res) => {
		try {
			let urlPath = decodeURIComponent(req.url.split('?')[0]);
			if (urlPath === '/') urlPath = '/index.html';
			const filePath = path.join(root, urlPath);
			fs.stat(filePath, (err, stats) => {
				if (err || !stats.isFile()) {
					res.statusCode = 404;
					res.setHeader('Content-Type', 'text/plain; charset=utf-8');
					res.end('404 - Not Found');
					return;
				}
				const ext = path.extname(filePath).toLowerCase();
				res.statusCode = 200;
				res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
				const stream = fs.createReadStream(filePath);
				stream.pipe(res);
			});
		} catch (e) {
			res.statusCode = 500;
			res.end('Server error');
		}
	});

	server.listen(port, () => {
		const url = `http://localhost:${port}/index.html`;
		console.log(`Serving ${root} at ${url}`);
		// Ouvre le navigateur par défaut (Windows/macOS/Linux)
		const plat = process.platform;
		let cmd;
		if (plat === 'win32') cmd = `start "" "${url}"`;
		else if (plat === 'darwin') cmd = `open "${url}"`;
		else cmd = `xdg-open "${url}"`;
		exec(cmd, (err) => {
			if (err) console.log('Impossible d\'ouvrir automatiquement le navigateur:', err.message);
		});
	});
} else {
	const fileInput = document.getElementById('file-input');
	const dropArea = document.getElementById('drop-area');
	const preview = document.getElementById('preview');
	const previewWrapper = document.getElementById('preview-wrapper');
	const uploadBtn = document.getElementById('upload-btn');
	const simulateBtn = document.getElementById('simulate-btn');
	const resultEl = document.getElementById('result');
	const spinner = document.getElementById('spinner');

	let currentFile = null;

	function showSpinner(show) {
		spinner.classList.toggle('hidden', !show);
		spinner.setAttribute('aria-hidden', String(!show));
	}

	function setResult(text, isDeepfake = null, score = null) {
		let html = `<p>${text}</p>`;
		if (isDeepfake !== null) {
			html += `<p class="badge ${isDeepfake ? 'deep' : 'real'}">${isDeepfake ? 'Deepfake' : 'Authentique'}</p>`;
		}
		if (score !== null) html += `<p>Score: ${Number(score).toFixed(3)}</p>`;
		resultEl.innerHTML = html;
	}

	function resetResult() {
		resultEl.innerHTML = '';
	}

	fileInput.addEventListener('change', (e) => {
		const f = e.target.files && e.target.files[0];
		if (!f) return;
		previewFile(f);
	});

	dropArea.addEventListener('dragover', (e) => {
		e.preventDefault();
		dropArea.classList.add('dragover');
	});
	dropArea.addEventListener('dragleave', () => dropArea.classList.remove('dragover'));
	dropArea.addEventListener('drop', (e) => {
		e.preventDefault();
		dropArea.classList.remove('dragover');
		const f = e.dataTransfer.files && e.dataTransfer.files[0];
		if (f) previewFile(f);
	});

	function previewFile(file) {
		if (!file.type.startsWith('image/')) {
			alert('Veuillez sélectionner une image.');
			return;
		}
		currentFile = file;
		const reader = new FileReader();
		reader.onload = () => {
			preview.src = reader.result;
			previewWrapper.classList.add('has-image');
			resetResult();
		};
		reader.readAsDataURL(file);
	}

	// Mode front-only : masquer complètement le bouton "Envoyer au backend"
	// (conserve le bouton de simulation pour tester l'interface)
	uploadBtn.style.display = 'none';

	// Simuler un résultat (utile si pas de backend en place)
	simulateBtn.addEventListener('click', () => {
		if (!currentFile) {
			alert('Sélectionnez d\'abord une image pour simuler.');
			return;
		}
		showSpinner(true);
		setResult('Simulation en cours...');
		setTimeout(() => {
			showSpinner(false);
			const mockScore = Math.random();
			const isDeep = mockScore > 0.5;
			setResult(isDeep ? 'Simulation: deepfake probable.' : 'Simulation: image probablement authentique.', isDeep, mockScore);
		}, 900);
	});

	// accessibility: allow clicking the drop area to open file chooser
	dropArea.addEventListener('click', () => fileInput.click());
}
