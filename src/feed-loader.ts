import 'dotenv/config';
import { Client } from 'basic-ftp';

import { Item } from './feed-extractor.js';


async function saveToFile(items: Item[]): Promise<string> {
    // save to local file (include fetch timestamp)
    const fs = await import('fs/promises');
    const cwd = process.cwd();
    const path = cwd + '/dist/feed.json';
    await fs.mkdir(cwd + '/dist', { recursive: true });
    const payload = {
        fetchedAt: new Date().toISOString(),
        items
    };
    await fs.writeFile(path, JSON.stringify(payload, null, 2));
    return path;
}

async function deployWithFtp(feedPath: string): Promise<void> {
    const client = new Client();
    try {
        // Read FTP configuration from environment variables
        const host = process.env.FTP_HOST;
        const user = process.env.FTP_USER;
        const password = process.env.FTP_PASSWORD;
        // FTP_SECURE should be the string 'true' or 'false' in the .env file.
        const secure = ((): boolean => {
            const val = process.env.FTP_SECURE;
            if (!val) return false;
            return val.toLowerCase() === 'true';
        })();
        await client.access({ host, user, password, secure });
        await client.uploadFrom(feedPath, `${process.env.FTP_PATH}/feed.json`);
        console.log('FTP upload successful');
    }
    catch (err) {
        console.log('FTP error:', err);
    }
    client.close();
}


export async function load(items: Item[]) {
    const filePath = await saveToFile(items);
    await deployWithFtp(filePath);
}
