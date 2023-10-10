
const express = require('express');
const fileUpload = require('express-fileupload');
const ExcelJS = require('exceljs');
const cors = require("cors");
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(fileUpload());
app.use(cors())

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const RANDOMUSER_API_URL = 'https://randomuser.me/api/?results=100';
const API_KEY = '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';  // Remember to use your actual OpenAI API Key

// Existing endpoint for analysis
app.post('/getAnalysis', async (req, res) => {
    const file = req.files.sampleFile;
    const sampleData = file.data.toString('utf8').split('\n').map(line => line.split(','));
    const headers = sampleData[0];
    
    try {
        const prompt = `Provide a brief analysis for a CSV with headers: ${headers.join(", ")}.`;
        
        const openaiResponse = await axios.post(OPENAI_API_URL, {
            model: "gpt-4",
            messages: [{
                role: "user",
                content: prompt
            }],
            temperature: 1,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'User-Agent': 'OpenAI-Node-Client',
            }
        });
        
        let analysis = openaiResponse.data.choices[0].message.content.trim();

        // Limit the analysis to a maximum of 7 lines
        analysis = analysis.split('\\n').slice(0, 7).join('\\n');

        // Append a prompt asking the user for changes
        analysis += "\\n\\nWhat changes or actions would you like to take based on this analysis?";

        res.json({ analysis });

    } catch (error) {
        console.error('Error fetching analysis:', error.response ? error.response.data : error.message);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/generateExcel', async (req, res) => {
    try {
        // Fetch analysis from OpenAI
        const headers = ["Title", "Name", "Email", "Status", "DOB"]; // Modify this based on your CSV headers
        const prompt = `Provide a brief analysis for a CSV with headers: ${headers.join(", ")}.`;
        
        const openaiResponse = await axios.post(OPENAI_API_URL, {
            model: "gpt-4",
            messages: [{
                role: "user",
                content: prompt
            }],
            temperature: 1,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'User-Agent': 'OpenAI-Node-Client',
            }
        });

        let openaiDataText = "";
        if (openaiResponse.data.choices && openaiResponse.data.choices[0].message && openaiResponse.data.choices[0].message.content) {
            openaiDataText = openaiResponse.data.choices[0].message.content.trim();
        }
        const openaiData = openaiDataText.split('\\n').map(line => line.split(','));

        // Fetch random users
        const randomUsersResponse = await axios.get(RANDOMUSER_API_URL);
        const randomUsers = randomUsersResponse.data.results;
        const randomUserData = randomUsers.map((user) => {
            return [
                ["Mr.", "Mrs.", "Dr.", "Miss", "Prof."][Math.floor(Math.random() * 5)],
                `${user.name.first} ${user.name.last}`,
                user.email,
                ["complete", "incomplete"][Math.floor(Math.random() * 2)],
                new Date(user.dob.date).toLocaleDateString('en-GB') // Format: DD/MM/YYYY
            ];
        });

        // Combine OpenAI data with RandomUser data
        const combinedData = [...openaiData, ...randomUserData];

        // Create an Excel workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Generated Data');

        // Add headers to the worksheet
        worksheet.addRow(headers);

        // Add combined data to the worksheet
        combinedData.forEach(row => worksheet.addRow(row));

        // Write the Excel file to a buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Set the response headers and send the buffer
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=out.xlsx');
        res.send(buffer);

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(4028, () => {
    console.log('Server is running on port 4028');
});


