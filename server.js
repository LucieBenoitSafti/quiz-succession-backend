const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const filePath = path.join(__dirname, 'results.json');

const getSubmissions = () => {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Erreur de lecture:', err);
    }
    return [];
};

// Dictionnaire pour rendre les réponses lisibles
const labels = {
    q1: "Sentiment",
    q2: "Nb Héritiers",
    q3: "État Bien",
    q4: "Discussion",
    q5: "Délai",
    q6: "Obstacle",
    q7: "Avis Pro"
};

app.post('/submit-quiz', (req, res) => {
    const results = req.body;
    results.timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

    let submissions = getSubmissions();
    submissions.push(results);

    try {
        fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

app.get('/voir-les-resultats-secrets', (req, res) => {
    const submissions = getSubmissions();
    
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Détails des Résultats - Quiz Succession</title>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f0f2f5; color: #1c1e21; }
            .container { max-width: 100%; overflow-x: auto; }
            h1 { color: #1a73e8; text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); font-size: 0.9rem; }
            th { background-color: #1a73e8; color: white; padding: 15px 10px; text-align: left; white-space: nowrap; }
            td { padding: 12px 10px; border-bottom: 1px solid #e4e6eb; vertical-align: top; }
            tr:hover { background-color: #f8f9fa; }
            .profile-tag { display: inline-block; padding: 4px 8px; border-radius: 4px; background: #e8f0fe; color: #1967d2; font-weight: bold; font-size: 0.8rem; }
            .answer-cell { font-size: 0.8rem; color: #4b4b4b; max-width: 150px; overflow: hidden; text-overflow: ellipsis; }
            .no-data { padding: 40px; text-align: center; color: #65676b; font-style: italic; }
            .header-info { margin-bottom: 15px; font-size: 0.9rem; color: #65676b; }
        </style>
    </head>
    <body>
        <h1>📊 Tableau de Bord des Résultats</h1>
        <div class="header-info">Dernières soumissions en haut. Les réponses aux questions sont abrégées pour la lisibilité.</div>
        <div class="container">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Contact</th>
                        <th>Profil</th>
                        <th>Q1: Sentiment</th>
                        <th>Q2: Héritiers</th>
                        <th>Q3: État</th>
                        <th>Q4: Accord</th>
                        <th>Q5: Délai</th>
                        <th>Q6: Obstacle</th>
                        <th>Q7: Aide</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (submissions.length === 0) {
        html += '<tr><td colspan="10" class="no-data">Aucune donnée enregistrée pour le moment.</td></tr>';
    } else {
        submissions.reverse().forEach(s => {
            const ans = s.answers || {};
            html += `
                <tr>
                    <td style="white-space: nowrap;">${s.timestamp || 'N/A'}</td>
                    <td>
                        <strong>${s.fullName || 'N/A'}</strong><br>
                        <small>📞 ${s.phone || 'N/A'}</small><br>
                        <small>📍 ${s.address || '-'}</small>
                    </td>
                    <td><span class="profile-tag">${s.profile || 'N/A'}</span></td>
                    <td class="answer-cell">${ans.q1 || '-'}</td>
                    <td class="answer-cell">${ans.q2 || '-'}</td>
                    <td class="answer-cell">${ans.q3 || '-'}</td>
                    <td class="answer-cell">${ans.q4 || '-'}</td>
                    <td class="answer-cell">${ans.q5 || '-'}</td>
                    <td class="answer-cell">${ans.q6 || '-'}</td>
                    <td class="answer-cell">${ans.q7 || '-'}</td>
                </tr>
            `;
        });
    }

    html += `
                </tbody>
            </table>
        </div>
        <footer style="margin-top: 30px; text-align: center; font-size: 0.8rem; color: #65676b;">
            Données stockées temporairement sur Render. Pensez à les copier régulièrement.
        </footer>
    </body>
    </html>
    `;
    
    res.send(html);
});

app.get('/', (req, res) => {
    res.send('Serveur Quiz Actif. <a href="/voir-les-resultats-secrets">Voir les résultats</a>');
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
