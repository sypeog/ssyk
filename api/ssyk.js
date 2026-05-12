
export default async function handler(req, res) {
  try {
    // ✅ Hantera body
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    // ✅ Om API öppnas direkt
    if (!body || !body.title || !body.desc) {
      return res.status(200).json({
        message: "API is working. Send POST request with title and desc."
      });
    }

    const { title, desc } = body;

    // ✅ Anropa OpenRouter (gratis AI)
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "HTTP-Referer": "https://sypeog.github.io/",
        "X-Title": "SSYK App"
      },
      body: JSON.stringify({
        model: "nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free",
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

    // ✅ Hantera API-fel
    if (!data.choices) {
      return res.status(500).json({
        error: "AI svarade med fel",
        details: data
      });
    }

    const text = data.choices[0].message.content;

    // ✅ EXTRAHERA JSON (detta fixar ditt problem)
    let parsed;

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Ingen JSON hittades");
      }

    } catch (e) {
      console.error("JSON parse error:", text);

      parsed = {
        results: [
          {
            ssyk: "0000",
            title: "AI svarade inte korrekt",
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
