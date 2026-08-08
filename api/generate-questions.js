module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée.' });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'La génération automatique n’est pas encore activée sur le serveur.' });

  const transcript = String(req.body?.transcript || '').trim();
  const level = Number(req.body?.level || 0);
  if (transcript.length < 80 || transcript.length > 12000) return res.status(400).json({ error: 'Transcription trop courte ou trop longue.' });

  const difficulty = level < 9 ? 'A1-A2, vocabulaire très simple' : level < 18 ? 'A2-B1, compréhension globale et détails simples' : 'B1, proche de la compréhension attendue au Sproochentest';
  const prompt = `Tu crées un exercice de compréhension pour une apprenante de luxembourgeois. Niveau: ${difficulty}. À partir UNIQUEMENT de la transcription ci-dessous, produis exactement 5 QCM en français. Chaque QCM a 3 réponses, une seule correcte. Évite les pièges artificiels. Les questions doivent tester le sens, les personnes, lieux, nombres, actions ou idée principale. Réponds uniquement en JSON valide avec ce format: {"questions":[{"question":"...","options":["...","...","..."],"answer":0,"explanation":"courte explication en français"}]}. Transcription luxembourgeoise:\n${transcript}`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5',
        input: prompt,
        store: false,
        max_output_tokens: 1800
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || 'Erreur OpenAI');
    const text = (data.output || []).flatMap(x => x.content || []).filter(x => x.type === 'output_text').map(x => x.text).join('').trim();
    const clean = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(clean);
    const questions = Array.isArray(parsed.questions) ? parsed.questions.slice(0, 5).map(q => ({
      question: String(q.question || ''),
      options: Array.isArray(q.options) ? q.options.slice(0, 3).map(String) : [],
      answer: Math.max(0, Math.min(2, Number(q.answer) || 0)),
      explanation: String(q.explanation || '')
    })).filter(q => q.question && q.options.length === 3) : [];
    if (!questions.length) throw new Error('Réponse inutilisable');
    res.status(200).json({ questions });
  } catch (e) {
    res.status(500).json({ error: 'Impossible de créer les questions pour le moment.' });
  }
};