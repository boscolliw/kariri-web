const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração Supabase KARIRI
const SUPABASE_URL = "https://tehlejnqykjbtzjzrnit.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlaGxlam5xeWtqYnR6anpybml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NjE4OTMsImV4cCI6MjEwNDQzNzg5M30.UlbzIDeRzbgvBYJMFrqpwQKRtabO6i1nGP6s1yf6M84";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rota para o frontend carregar a página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Produtos
app.get('/api/produtos', async (req, res) => {
    const { data, error } = await supabase.from('produtos').select('*').eq('ativo', true);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// API: Comunicados/Mural
app.get('/api/comunicados', async (req, res) => {
    const { data, error } = await supabase.from('comunicados').select('*').order('id', { ascending: false }).limit(1);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data ? data[0] : null);
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor KARIRI rodando na porta ${PORT}`);
});