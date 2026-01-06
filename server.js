const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Autorise GitHub Pages
app.use(express.json()); // Parse JSON des formulaires

// Endpoint pour recevoir les résultats du quiz
app.post('/submit-quiz', (req, res) => {
  const results = req.body; // { nom: "Lucie", score: 8, reponses: [...] }
  const timestamp = new Date().toISOString();
  
  // Ajoute timestamp
  results.timestamp = timestamp;
  
  // Charge le fichier existant ou crée un nouveau
  let submissions = [];
  const filePath = path.join(__dirname, 'results.json');
  
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      submissions = JSON.parse(data);
    }
  } catch (err) {
    console.log('Nouveau fichier results.json');
  }
  
  // Ajoute le nouveau résultat
  submissions.push(results);
  
  // Sauvegarde
  fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2));
  
  console.log(`Quiz soumis: ${results.nom} - Score: ${results.score}`);
  res.json({ success: true, message: 'Résultats sauvegardés !' });
});

// Endpoint de test
app.get('/test', (req, res) => {
  res.json({ status: 'Backend OK', url: `https://${req.get('host')}` });
});

app.listen(PORT, () => {
  console.log(`Backend sur port ${PORT}`);
});
