const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const filePath = path.join(__dirname, 'results.json');

// Dictionnaire de traduction des réponses
const translations = {
    q1: {
        "attachment": "💝 Attachement affectif",
        "stress": "😰 Stress lié aux démarches",
        "relief": "😌 Soulagement / Tourner la page"
    },
    q2: {
        "alone": "👤 Seul(e)",
        "agreement": "🤝 Plusieurs, en accord",
        "disagreement": "⚖️ Plusieurs, avis divergents"
    },
    q3: {
        "good": "✨ Très bon état",
        "refresh": "🎨 Rafraîchissement",
        "renovate": "🛠️ Gros travaux"
    },
    q4: {
        "yes_clear": "✅ Tout est clair",
        "yes_vague": "🤔 Encore flou",
        "no": "❌ Pas encore discuté",
        "divergent": "⚠️ Pas d'accord"
    },
    q5: {
        "quickly": "⚡ Le plus vite possible",
        "months": "📅 Dans les 6 mois",
        "nohurry": "🐢 Aucune urgence"
    },
    q6: {
        "admin": "📝 Administratif / Notaire",
        "emotional": "💔 Émotionnel / Vider la maison",
        "family": "👨‍👩‍👧‍👦 Relations familiales",
        "value": "💰 Incertitude sur le prix"
    },
    q7: {
        "yes": "🙋 Oui, j'en ai besoin",
        "maybe": "🧐 Peut-être plus tard",
        "no": "🙅 Non, je gère seul(e)"
    }
};

const getSubmissions = () => {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) { console.error(err); }
    return [];
};

app.post('/submit-quiz', (req, res) => {
    const results = req.body;
    results.timestamp = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
    let submissions = getSubmissions();
    submissions.push(results);
    try {
        fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2));
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.get('/voir-les-resultats-secrets', (req, res) => {
    const submissions = getSubmissions();
    
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Résultats Quiz Succession</title>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f0f2f5; }
            h1 { color: #1a73e8; text-align: center; }
            .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow-x: auto; }
            table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
            th { background: #1a73e8; color: white; padding: 12px; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #eee; vertical-align: top; }
            tr:hover { background: #f9f9f9; }
            .contact { min-width: 180px; }
            .profile { font-weight: bold; color: #1967d2; }
            .answer { color: #555; font-style: italic; }
        </style>
    </head>
    <body>
        <h1>📊 Tableau de Bord des Quiz</h1>
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
        html += '<tr><td colspan="10" style="text-align:center;padding:20px;">Aucun résultat.</td></tr>';
    } else {
        submissions.reverse().forEach(s => {
            const ans = s.answers || {};
            html += `
                <tr>
                    <td style="white-space:nowrap;">${s.timestamp || '-'}</td>
                    <td class="contact">
                        <strong>${s.fullName || '-'}</strong><br>
                        ${s.phone || '-'}<br>
                        <small>${s.address || '-'}</small>
                    </td>
                    <td class="profile">${s.profile || '-'}</td>
                    <td class="answer">${translations.q1[ans.q1] || ans.q1 || '-'}</td>
                    <td class="answer">${translations.q2[ans.q2] || ans.q2 || '-'}</td>
                    <td class="answer">${translations.q3[ans.q3] || ans.q3 || '-'}</td>
                    <td class="answer">${translations.q4[ans.q4] || ans.q4 || '-'}</td>
                    <td class="answer">${translations.q5[ans.q5] || ans.q5 || '-'}</td>
                    <td class="answer">${translations.q6[ans.q6] || ans.q6 || '-'}</td>
                    <td class="answer">${translations.q7[ans.q7] || ans.q7 || '-'}</td>
                </tr>
            `;
        });
    }

    html += `</tbody></table></div></body></html>`;
    res.send(html);
});

app.get('/', (req, res) => { res.send('Actif. <a href="/voir-les-resultats-secrets">Résultats</a>'); });
app.listen(PORT, () => console.log(`Port ${PORT}`));
