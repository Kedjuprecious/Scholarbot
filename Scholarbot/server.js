const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const app = express();
const port = 3000;

// Array to hold the custom data
let scholarships = [];

// Load CSV data into scholarships array
fs.createReadStream(path.join(__dirname, "scholarships.csv"))
  .pipe(csv())
  .on("data", (data) => scholarships.push(data))
  .on("end", () => {
    console.log("CSV data loaded:", scholarships);
  });

app.use(bodyParser.json());

// Middleware
app.use(bodyParser.json());
app.use("/styles", express.static(path.join(__dirname, "styles")));
app.use("/scripts", express.static(path.join(__dirname, "scripts")));
app.use(express.static(path.join(__dirname)));

// Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

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

      try {
        const result = await genAI.getGenerativeModel({
          model: "gemini-1.0-pro",
          prompt: message,
          generationConfig,
        });

        // Ensure the response is well-structured and contains the expected output
        if (result && result.candidates && result.candidates.length > 0) {
          responseText = result.candidates[0].content || "Sorry, I couldn't find an answer.";
        } else {
          responseText = "Sorry, no response was generated.";
        }
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