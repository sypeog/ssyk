
export default function handler(req, res) {
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
