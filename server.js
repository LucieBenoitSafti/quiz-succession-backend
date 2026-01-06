const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Autorise GitHub Pages
app.use(express.json()); // Parse JSON des formulaires

const filePath = path.join(__dirname, 'results.json');

// Fonction pour lire les résultats
const getSubmissions = () => {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Erreur de lecture du fichier:', err);
    }
    return [];
};

// Endpoint pour recevoir les résultats du quiz
app.post('/submit-quiz', (req, res) => {
    const results = req.body;
    const timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
    
    results.timestamp = timestamp;

    let submissions = getSubmissions();
    submissions.push(results);

    try {
        fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2));
        console.log(`Quiz soumis par: ${results.fullName || 'Anonyme'}`);
        res.json({ success: true, message: 'Résultats sauvegardés !' });
    } catch (err) {
        console.error('Erreur de sauvegarde:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur lors de la sauvegarde.' });
    }
});

// Endpoint SECRET pour voir les résultats
// URL: https://quiz-succession-backend.onrender.com/voir-les-resultats-secrets
app.get('/voir-les-resultats-secrets', (req, res) => {
    const submissions = getSubmissions();
    
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Résultats du Quiz Succession</title>
        <meta charset="UTF-8">
        <style>
            body { font-family: sans-serif; margin: 20px; background: #f4f7f6; }
            h1 { color: #2c3e50; }
            table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #667eea; color: white; }
            tr:hover { background-color: #f5f5f5; }
            .no-data { padding: 20px; text-align: center; color: #7f8c8d; }
        </style>
    </head>
    <body>
        <h1>Liste des participations au Quiz</h1>
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Nom</th>
                    <th>Téléphone</th>
                    <th>Adresse du bien</th>
                    <th>Profil</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (submissions.length === 0) {
        html += '<tr><td colspan="5" class="no-data">Aucun résultat pour le moment.</td></tr>';
    } else {
        // Afficher les plus récents en premier
        submissions.reverse().forEach(s => {
            html += `
                <tr>
                    <td>${s.timestamp || 'N/A'}</td>
                    <td>${s.fullName || 'N/A'}</td>
                    <td>${s.phone || 'N/A'}</td>
                    <td>${s.address || 'N/A'}</td>
                    <td><strong>${s.profile || 'N/A'}</strong></td>
                </tr>
            `;
        });
    }

    html += `
            </tbody>
        </table>
        <p style="margin-top: 20px; font-size: 0.8em; color: #95a5a6;">Note : Les données sont effacées si le serveur Render redémarre (version gratuite).</p>
    </body>
    </html>
    `;
    
    res.send(html);
});

// Endpoint de test
app.get('/', (req, res) => {
    res.json({ status: 'Backend OK', message: 'Le serveur fonctionne. Utilisez /voir-les-resultats-secrets pour voir les données.' });
});

app.listen(PORT, () => {
    console.log(`Backend sur port ${PORT}`);
});
