
export default async function handler(req, res) {
  try {
    // ✅ Hantera body
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    // ✅ Om man öppnar API direkt
    if (!body || !body.title || !body.desc) {
      return res.status(200).json({
        message: "API is working. Send POST request with title and desc."
      });
    }

    const { title, desc } = body;

    // ✅ OpenRouter call (GRATIS AI)
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "HTTP-Referer": "https://sypeog.github.io/",
        "X-Title": "SSYK App"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
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

    const data = await response.json();
    console.log("OpenRouter response:", data);

    // ✅ Om AI svarar med fel
    if (!data.choices) {
      return res.status(500).json({
        error: "AI svarade med fel",
        details: data
      });
    }

    const text = data.choices[0].message.content;

    // ✅ Försök tolka JSON
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
