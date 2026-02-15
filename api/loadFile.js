// loadFile.js

import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {

    try {
        const filePath = path.join(process.cwd(), './src/data.json');
        const fileContents = await fs.readFile(filePath, 'utf8');
        const parsed = JSON.parse(fileContents);

        res.status(200).json(parsed);
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to file" });
    }
}