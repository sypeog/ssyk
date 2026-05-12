
export default async function handler(req, res) {
  const { title, desc } = req.body;

  res.status(200).json({
    results: [
      {
        ssyk: "2512",
        title: "Utvecklare (testdata)",
        confidence: 95,
        p10: 35000
      }
    ]
  });
}
``
