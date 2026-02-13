// loadFile.js

import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {

    try {
        const filePath = path.join(process.cwd(), './src/data.txt');
        const fileContents = await fs.readFile(filePath, 'utf8');

        res.status(200).json(fileContents);
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to file" });
    }
}