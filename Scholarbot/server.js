const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");  // Add this line to import dotenv

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

dotenv.config();  // Ensure dotenv is loaded early

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const app = express();
const port = 3000;

const model = genAI.getGenerativeModel({
  model: "gemini-1.0-pro",
});

app.use(bodyParser.json());
app.use(express.static("public")); // Serve static files from the 'public' directory

// API endpoint
app.post("/api/message", async (req, res) => {
  const { message } = req.body;

  const generationConfig = {
    temperature: 0.7,
    topP: 0.8,
    maxOutputTokens: 1024,
    responseMimeType: "text/plain",
  };

  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [{ text: "How hard is it to get a scholarship?" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "The difficulty of getting a scholarship depends on several factors:\n\n**1. Scholarship Availability:**\n* The number of scholarships available for a particular category (e.g., academic merit, athletic ability, financial need)\n* The competition for those scholarships\n\n**2. Scholarship Requirements:**\n* GPA and academic achievements\n* Standardized test scores (e.g., SAT, ACT)\n* Extracurricular activities and leadership roles\n* Essay submissions or personal statements\n* Financial need (for need-based scholarships)\n\n**3. Applicant Pool:**\n* The number and qualifications of other applicants applying for the same scholarship\n* The selectivity of the scholarship program\n\n**4. Scholarship Value:**\n* The amount of money awarded by the scholarship\n* Whether the scholarship is renewable or for a single year\n\n**Generally, obtaining a scholarship can be competitive:**\n\n* For highly prestigious scholarships with large awards, the competition is often intense.\n* Scholarships with more specific requirements (e.g., for a particular major or demographic group) may have fewer applicants, making them slightly easier to obtain.\n* Financial need-based scholarships typically have a lower applicant pool, but the eligibility criteria can be strict.\n\nHowever, with extensive preparation, a strong application, and a strategic approach, it is possible to increase your chances of receiving a scholarship.",
          },
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(message);
  console.log(result.response.text());

  // Send response
  res.json({ reply: result.response.text() });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
