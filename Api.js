const express = require("express");
const app = express();
const axios = require("axios");
const path = require("path");
require("dotenv").config();

// Middleware
app.use(express.json());

// Serve static files (for CodeMirror and any other frontend files)
app.use("/codemirror-5.65.19", express.static(path.join(__dirname, "codemirror-5.65.19")));
app.use(express.static(path.join(__dirname))); // Serve other assets (style.css, script.js, etc.)

// Serve HTML page
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Compile endpoint
app.post("/compile", async (req, res) => {
    const { code, input, lang } = req.body;

    const languageMap = {
        "C": 50,
        "Cpp": 54,
        "Java": 62,
        "JavaScript": 63,
        "Python": 71,
        "C#": 51,
        "Go": 60,
        "Ruby": 72,
        "Swift": 83,
        "Kotlin": 78,
        "Rust": 73,
        "PHP": 68,
        "TypeScript": 74,
        "R": 80,
        "Scala": 81,
        "Sql": 82
    };

    const language_id = languageMap[lang];
    if (!language_id) {
        return res.status(400).send({ output: "Unsupported language." });
    }

    try {
        const response = await axios.post(
            "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
            {
                source_code: code,
                stdin: input,
                language_id
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
                    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY || "your-api-key-here"
                }
            }
        );

        const result = response.data;

        res.send({
            output: result.stderr || result.compile_output || result.stdout || "No output"
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ output: "Error executing code" });
    }
});

// Start server
app.listen(8003, () => {
    console.log("Server running on http://localhost:8003");
});
