
export default async function handler(req, res) {
  try {
    // ✅ Hantera body korrekt
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const { title, desc } = body;

    // ✅ Anropa OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: "Du är expert på svensk SSYK-klassificering."
          },
          {
            role: "user",
            content: `
Matcha denna roll till SSYK.

Titel: ${title}
Beskrivning: ${desc}

Returnera ENDAST JSON i detta format:
{
  "results": [
    {
      "ssyk": "xxxx",
      "title": "...",
      "confidence": 90,
      "p10": 30000
    }
  ]
}
`
          }
        ]
      })
    });

    // ✅ Kolla om OpenAI svarade korrekt
    const data = await response.json();
    console.log("OpenAI response:", data);

    if (!data.choices) {
      return res.status(500).json({
        error: "OpenAI svarade med fel",
        details: data
      });
    }

    const text = data.choices[0].message.content;

    // ✅ Försök tolka JSON säkert
    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("JSON parse error:", text);

      parsed = {
        results: [
          {
            ssyk: "0000",
            title: "Kunde inte tolka AI-svar",
            confidence: 0,
            p10: 0
          }
        ]
      };
    }

    res.status(200).json(parsed);

  } catch (error) {
    console.error("FULL ERROR:", error);

    res.status(500).json({
      error: "Server error",
      message: error.message
    });
  }
}
``
