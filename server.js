const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const dotenv = require('dotenv').config()

const MODEL_NAME = "gemini-1.0-pro-vision-latest";
const API_KEY = "AIzaSyAvhqP1P_FQy2K1nriMwduYlzuhSr-2gAE";

app.post('/generate', upload.single('image'), async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).send('No image file provided.');
        }

        if (!req.body.text) {
            return res.status(400).send('No text provided.');
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const generationConfig = {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
        };

        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        const imageBuffer = req.file.buffer;
        const text = req.body.text;

        const parts = [
            { inlineData: { mimeType: "image/png", data: imageBuffer.toString("base64") } },
            { text: `\n${text}` },
        ];

        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig,
            safetySettings,
        });

        const response = result.response;
        res.send(response.text());
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
