import { parseFeed } from '@rowanmanning/feed-parser';

import { feedConfiguration } from './feed-configuration';
import { Feed } from '@rowanmanning/feed-parser/lib/feed/base';
import { FeedItem } from '@rowanmanning/feed-parser/lib/feed/item/base';



export type Item = {
    feedIcon: string | null;
    feedTitle: string;
    feedConfiguration: feedConfiguration

    title: string;
    link: string;
    score?: number;

    description?: string;
    image?: string | null;
    pubDate?: string | null;
};


function getImageFromRaw(text: any): string | null {
    // try to extract first <img> from content or content:encoded
    const m = /<img[^>]+src=["']?([^"' >]+)["']?/i.exec(String(text));
    if (m && m[1]) return m[1];
    return null;
}

function getFeedIcon(feed: Feed, feedUrl: string): string | null {
    let feedIcon = feed?.image?.url ?? null;
    if (feedIcon === null) {
        try {
            const url = new URL(feedUrl);
            feedIcon = `${url.origin}/favicon.ico`;
        } catch (err) {
            return null;
        }
    }
    return feedIcon;
}


async function fetchFeedItems(feedConfiguration: feedConfiguration): Promise<Item[]> {
    const response = await fetch(feedConfiguration.url);
    const feed: Feed = parseFeed(await response.text());
    const items: Item[] = (feed.items).map((item: FeedItem) => {
        return {
            feedConfiguration,
            feedTitle: feedConfiguration.name ?? feed.title ?? '',
            feedIcon: getFeedIcon(feed, feedConfiguration.url),

            title: item.title ?? '',
            link: item.url ?? '',
            description: item.description ?? item.content ?? '',
            image: item.image?.url || getImageFromRaw(item.description) || getImageFromRaw(item.content),
            pubDate: item.published ? new Date(item.published).toISOString() : null
        };
    });
    return items;
}

export async function extract(feeds: feedConfiguration[]): Promise<Item[]> {
    const promises = feeds.map(f => fetchFeedItems(f).catch(err => {
        console.warn(`Failed to fetch feed '${f.name}' (${f.url}) : ${err?.message || err}`);
        return [] as Item[];
    }));
    const results = await Promise.all(promises);
    const combined = results.flat();
    // sort by pubDate descending when available
    combined.sort((a, b) => {
        const ta = a.pubDate ? Date.parse(a.pubDate) : 0;
        const tb = b.pubDate ? Date.parse(b.pubDate) : 0;
        return tb - ta;
    });
    return combined;
}
