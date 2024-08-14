const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const xlsx = require("xlsx");

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const app = express();
const port = 3000;

// Load the Excel file
const workbook = xlsx.readFile("scholarships.xlsx");
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert the Excel data to JSON
const scholarships = xlsx.utils.sheet_to_json(sheet);

// Get generative model
const model = genAI.getGenerativeModel({
  model: "gemini-1.0-pro",
});

app.use(bodyParser.json());
app.use(express.static("public")); // Serve static files from 'public' directory

// API endpoint for handling chat messages
app.post("/api/message", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message field is required" });
    }

    let responseText = "";

    // Check if the user's question is about scholarships
    const matchingScholarships = scholarships.filter(
      (scholarship) =>
        scholarship.category &&
        message.toLowerCase().includes(scholarship.category.toLowerCase())
    );

    if (matchingScholarships.length > 0) {
      responseText = "Here are some scholarships you might be interested in:\n\n";
      matchingScholarships.forEach((scholarship) => {
        responseText += `* ${scholarship.name}: ${scholarship.description}\n`;
      });
    } else {
      // Use the generative AI to generate a response
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
                text: "The difficulty of getting a scholarship depends on several factors...",
              },
            ],
          },
        ],
      });

      try {
        const result = await chatSession.sendMessage(message);
        responseText = result.response.text();
      } catch (chatError) {
        console.error("Error generating response from AI:", chatError);
        responseText = "Sorry, there was an error generating the response.";
      }
    }

    // Send response
    res.json({ reply: responseText });
  } catch (error) {
    console.error("Error handling the request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
