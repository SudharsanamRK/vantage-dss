// backend/src/routes/aiRoutes.js
// Proxies Groq API calls so the API key stays server-side only
const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");

// POST /api/ai/chat
router.post("/chat", auth, async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0)
      return res.status(400).json({ success: false, message: "messages[] required." });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey)
      return res.status(503).json({
        success: false,
        message: "AI assistant not configured. Add GROQ_API_KEY to your .env file.",
      });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:       "llama-3.3-70b-versatile",  // free, fast, smart
        max_tokens:  1024,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt || "You are Vantage AI, an expert aquaculture advisor." },
          ...messages.map(m => ({
            role:    m.role === "assistant" ? "assistant" : "user",
            content: m.content || m.text || "",
          })),
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        success: false,
        message: err.error?.message || `Groq API error: ${response.status}`,
      });
    }

    const data  = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No response from AI.";

    res.json({ success: true, reply });
  } catch (err) {
    console.error("AI chat error:", err);
    res.status(500).json({ success: false, message: "AI service unavailable. Try again." });
  }
});

module.exports = router;