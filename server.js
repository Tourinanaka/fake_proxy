const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Allow all CORS requests and headers
app.use(cors({ origin: '*' }));
app.use(express.json());

// 1. Health Check
app.get('/', (req, res) => {
    res.send('Fake proxy server is running!');
});

// 2. Fake Models Endpoint
// JanitorAI sometimes checks this to make sure the API is valid
app.get(['/v1/models', '/models'], (req, res) => {
    res.json({
        object: "list",
        data: [{
            id: "fake-proxy-model",
            object: "model",
            created: Math.floor(Date.now() / 1000),
            owned_by: "system"
        }]
    });
});

// 3. The Chat Completions Endpoint (Supports both streaming and non-streaming)
// The wildcard (*) ensures it works no matter what base URL you put in JanitorAI
app.post(['/v1/chat/completions', '/chat/completions', '/*/chat/completions'], (req, res) => {
    const isStream = req.body.stream;
    const responseText = "❤️❤️❤️";
    const fakeId = "chatcmpl-" + Math.random().toString(36).substring(2, 15);
    const timestamp = Math.floor(Date.now() / 1000);

    if (isStream) {
        // --- STREAMING RESPONSE ---
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Send the hearts
        const chunk = {
            id: fakeId,
            object: "chat.completion.chunk",
            created: timestamp,
            model: "fake-proxy-model",
            choices: [{ index: 0, delta: { content: responseText }, finish_reason: null }]
        };
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);

        // Tell JanitorAI the message is finished
        const endChunk = {
            id: fakeId,
            object: "chat.completion.chunk",
            created: timestamp,
            model: "fake-proxy-model",
            choices: [{ index: 0, delta: {}, finish_reason: "stop" }]
        };
        
        // Small delay to ensure the frontend processes the chunks properly
        setTimeout(() => {
            res.write(`data: ${JSON.stringify(endChunk)}\n\n`);
            res.write(`data: [DONE]\n\n`);
            res.end();
        }, 100);

    } else {
        // --- NORMAL JSON RESPONSE ---
        res.json({
            id: fakeId,
            object: "chat.completion",
            created: timestamp,
            model: "fake-proxy-model",
            choices: [{
                index: 0,
                message: { role: "assistant", content: responseText },
                finish_reason: "stop"
            }],
            usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 }
        });
    }
});

app.listen(port, () => {
    console.log(`Fake proxy server listening on port ${port}`);
});
