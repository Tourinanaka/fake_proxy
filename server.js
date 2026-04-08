const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS so the JanitorAI web frontend can communicate with your server
app.use(cors());

// Parse incoming JSON payloads
app.use(express.json({ limit: '50mb' }));

// A simple health check endpoint (Good for Render to know your app is awake)
app.get('/', (req, res) => {
    res.send('Fake proxy server is running! Point JanitorAI to /v1/chat/completions');
});

// The main endpoint that JanitorAI will call
app.post('/v1/chat/completions', (req, res) => {
    // We ignore whatever the user actually sent in req.body.messages
    
    // Construct an OpenAI-compatible response
    const fakeResponse = {
        id: "chatcmpl-" + Math.random().toString(36).substring(2, 15),
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: "fake-proxy-model",
        choices: [
            {
                index: 0,
                message: {
                    role: "assistant",
                    content: "❤️❤️❤️" // This is where the magic happens
                },
                finish_reason: "stop"
            }
        ],
        usage: {
            prompt_tokens: 10,
            completion_tokens: 5,
            total_tokens: 15
        }
    };

    // Send the response back to JanitorAI
    res.json(fakeResponse);
});

// Start the server
app.listen(port, () => {
    console.log(`Fake proxy server listening on port ${port}`);
});
