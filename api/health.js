module.exports = async function handler(req, res) {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ ok:false, openaiConfigured:false });
  }

  const transcript = "Haut ass et sonneg zu Lëtzebuerg. D'Temperaturen leien am Nomëtteg bei 24 Grad. Zu Esch ass eng nei Buslinn opgaangen, déi d'Gare mam Spidol verbënnt. Vill Leit hunn de Service schonn haut benotzt.";
  const prompt = `Tu crées un exercice de compréhension pour une apprenante débutante de luxembourgeois. À partir UNIQUEMENT de la transcription ci-dessous, produis exactement 3 QCM en français. Chaque QCM a 3 réponses, une seule correcte. Réponds uniquement en JSON valide au format {"questions":[{"question":"...","options":["...","...","..."],"answer":0,"explanation":"..."}]}. Transcription luxembourgeoise:\n${transcript}`;

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
        max_output_tokens: 1000
      })
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ ok:false, openaiConfigured:true, apiError:data?.error?.message || 'Erreur OpenAI' });
    }
    const text = (data.output || []).flatMap(x => x.content || []).filter(x => x.type === 'output_text').map(x => x.text).join('').trim();
    const clean = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(clean);
    return res.status(200).json({ ok:true, openaiConfigured:true, model:process.env.OPENAI_MODEL || 'gpt-5', questions:parsed.questions || [] });
  } catch (e) {
    return res.status(500).json({ ok:false, openaiConfigured:true, error:String(e.message || e) });
  }
};
