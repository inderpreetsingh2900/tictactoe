const express = require('express');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html as the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to handle the AI move calculation
app.post('/calculateMove', (req, res) => {
    const {boardsize,board,combos} = req.body; ////

    // Write input data to `input.txt`
    const inputContent = `${boardsize}\n${board}\n${combos}`; //////
    fs.writeFileSync('input.txt', inputContent);

    // Execute the C program
    exec('minimax.exe', (error) => {
        if (error) {
            console.error("Error executing C program:", error);
            return res.status(500).send("Error running C program");
        }

        // Read output from `output.txt`
        const outputContent = fs.readFileSync('output.txt', 'utf-8').split("\n");
        const bestMove = parseInt(outputContent[0], 10);
        const nodes = parseInt(outputContent[1], 10);
        const depth = parseInt(outputContent[2], 10);
        

        // Send the result back to the client
        res.json({ bestMove, nodes, depth });
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
