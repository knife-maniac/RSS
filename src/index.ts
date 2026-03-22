import { FEEDS } from './feed-configuration.js';
import { extract } from './feed-extractor.js';
import { transform } from './feed-transformer.js';
import { load } from './feed-loader.js';


(async () => {
    try {
        const items = await extract(FEEDS);         // Fetch, parse, format and aggregate RSS feeds
        const transformedItems = transform(items);  // Grade, elect and sort RSS feeds items
        await load(transformedItems);               // Deploy transformed RSS feeds items via FTP
    } catch (err) {
        console.error('Error fetching feeds', err);
    }
})();
