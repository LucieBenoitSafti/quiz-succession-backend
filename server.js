const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Connexion à Supabase via les variables d'environnement que vous avez configurées dans Render
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint pour recevoir les résultats du quiz
app.post('/submit-quiz', async (req, res) => {
    const { fullName, phone, address, profile, answers } = req.body;

    try {
        const { data, error } = await supabase
            .from('leads')
            .insert([
                { 
                    fullName, 
                    phone, 
                    address, 
                    profile, 
                    answers 
                }
            ]);

        if (error) throw error;

        console.log(`Nouveau lead enregistré : ${fullName}`);
        res.json({ success: true, message: 'Données sauvegardées sur Supabase !' });
    } catch (err) {
        console.error('Erreur Supabase:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Route d'accueil pour vérifier que le serveur tourne
app.get('/', (req, res) => {
    res.send('Serveur Quiz Connecté à Supabase. Vos résultats sont consultables sur votre tableau de bord Supabase.');
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
