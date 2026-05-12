
export default async function handler(req, res) {
  try {
    const { title, desc } = req.body;

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

Returnera JSON:
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
    const text = data.choices[0].message.content;

    res.status(200).json(JSON.parse(text));

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI error" });
  }
}
``
