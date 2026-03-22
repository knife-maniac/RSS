import { Item } from './feed-extractor';


export function transform(items: Item[]): Item[] {
    // Remove duplicate items (URL is used as a unique identifier)
    const uniqueItems = items.filter((item, index, self) => {
        return index === self.findIndex((t) => t.link === item.link);
    });

    // Limit items to the last 36 hours
    const recentItems = uniqueItems.reduce((acc, item) => {
        if (item.pubDate) {
            const ageInHours = (Date.now() - Date.parse(item.pubDate)) / (1000 * 60 * 60);
            if (ageInHours <= 36) acc.push(item);
        }
        return acc;
    }, [] as Item[]);

    // Limit number of items from each feed according to its own configuration
    const limitedItems = recentItems.reduce((acc, item) => {
        const sourceItems = acc.filter((i) => i.feedTitle === item.feedTitle);
        const limitNumberTo = item.feedConfiguration.limitNumberTo;
        if (!limitNumberTo || sourceItems.length < limitNumberTo) {
            acc.push(item);
        }
        return acc;
    }, [] as Item[]);

    return limitedItems;
}
