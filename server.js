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

// Dictionnaire de mappage pour convertir les codes en texte complet
const answerMapping = {
    // Question 1 : Sentiment
    'attachment': '💝 Attachement affectif',
    'stress': '😰 Stress lié aux démarches',
    'relief': '😌 Soulagement à l\'idée de tourner la page',
    
    // Question 2 : Héritiers
    'alone': '👤 Je suis seul(e)',
    'agreement': '👥 Nous sommes plusieurs mais en accord',
    'disagreement': '⚡ Nous sommes plusieurs et il y a des désaccords',
    
    // Question 3 : État du bien
    'inhabited': '🏡 Habité par un héritier',
    'maintained': '🧹 Vide mais entretenu',
    'expensive': '💸 Vide et coûte cher en entretien/taxes',
    'rented': '🏠 Loué',
    
    // Question 4 : Discussion familiale
    'agreed': '✅ Oui, et tout le monde est d\'accord',
    'divergent': '🤔 Oui, mais il y a des divergences',
    'notyet': '❓ Pas encore',
    
    // Question 5 : Délai
    'quickly': '⚡ Rapidement (1 à 3 mois)',
    'months': '📅 D\'ici quelques mois',
    'nohurry': '🕐 Pas d\'urgence',
    
    // Question 6 : Obstacle
    'emotional': '💔 L\'attachement émotionnel',
    'administrative': '📋 Les démarches administratives/juridiques',
    'time': '⏰ Le manque de temps',
    
    // Question 7 : Consultation
    'yes': '😊 Oui, avec plaisir',
    'maybe': '🤔 Peut-être, j\'aimerais en savoir plus',
    'no': '🚫 Non, pas pour le moment'
};

// Fonction pour transformer les réponses
function transformAnswers(answers) {
    const transformed = {};
    for (const [key, value] of Object.entries(answers)) {
        transformed[key] = answerMapping[value] || value;
    }
    return transformed;
}

// Endpoint pour recevoir les résultats du quiz
app.post('/submit-quiz', async (req, res) => {
    const { fullName, phone, address, profile, answers } = req.body;

    try {
        // Transformer les réponses en texte complet
        const transformedAnswers = transformAnswers(answers);

        const { data, error } = await supabase
            .from('leads')
            .insert([
                { 
                    fullName, 
                    phone, 
                    address, 
                    profile, 
                    answers: transformedAnswers
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
