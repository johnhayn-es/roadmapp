const express = require('express');
const { OpenAIAPI } = require('openai');
const app = express();
app.use(express.json());

const openai = new OpenAIAPI({
    apiKey: process.env.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, // Set your API key in environment variables for security
});

app.post('/generate-response', async (req, res) => {
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003", // or whichever model you prefer
            prompt: req.body.prompt,
            max_tokens: 150
        });
        res.send(response.data.choices[0].text);
    } catch (error) {
        res.status(500).send(error);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
