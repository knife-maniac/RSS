function timeAgo(dateAsString) {
    const date = new Date(dateAsString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years === 1 ? '' : 's'} ago`;
}

function createItemElement(item) {
    const li = document.createElement('li');

    // Header div with feed icon, feed title and score
    const header = document.createElement('div');
    header.className = 'item-header';

    // Feed icon (small)
    const icon = document.createElement('img');
    icon.src = item.feedIcon;
    icon.alt = item.feedTitle ? `${item.feedTitle} icon` : 'Feed icon';
    icon.className = 'feed-icon';
    icon.onerror = () => { icon.onerror = null; icon.src = '/placeholder.webp'; };
    header.appendChild(icon);

    // Feed title
    const feedTitle = document.createElement('span');
    feedTitle.textContent = item.feedTitle || 'Unknown Feed';
    feedTitle.className = 'feed-title';
    header.appendChild(feedTitle);

    // Score badge (if score is available)
    if (item.score !== undefined) {
        const scoreBadge = document.createElement('span');
        scoreBadge.textContent = Math.round(item.score);
        scoreBadge.className = 'score-badge';
        header.appendChild(scoreBadge);
    }

    // Append header to list item
    li.appendChild(header);

    // Description row: left = main text, right = optional thumbnail
    const description = document.createElement('div');
    description.className = 'item-description';

    const main = document.createElement('div');
    main.className = 'item-main';

    // Title as a link
    const a = document.createElement('a');
    a.href = item.link || '#';
    a.textContent = item.title || '(no title)';
    a.target = '_blank';
    a.className = 'item-title';
    main.appendChild(a);

    // Optional description snippet
    if (item.description) {
        const span = document.createElement('span');
        span.className = 'snippet';
        // Truncate description to ~300 chars for preview
        const txt = String(item.description).replace(/<[^>]+>/g, '');
        span.textContent = txt.length > 300 ? txt.slice(0, 300) + '…' : txt;
        main.appendChild(span);
    }

    // Footer with publication date (show relative time)
    const footer = document.createElement('div');
    footer.className = 'item-footer';
    if (item.pubDate) {
        footer.textContent = timeAgo(item.pubDate);
    }
    main.appendChild(footer);

    description.appendChild(main);

    // Thumbnail on the right (optional)
    if (item.image) {
        const thumbWrap = document.createElement('div');
        thumbWrap.className = 'item-thumb';
        const thumb = document.createElement('img');
        thumb.src = item.image || '/placeholder.webp';
        thumb.alt = item.title || '';
        thumb.onerror = () => { thumb.onerror = null; thumb.src = '/placeholder.webp'; };
        thumbWrap.appendChild(thumb);
        description.appendChild(thumbWrap);
    }

    // Append description to list item
    li.appendChild(description);

    return li;
}

async function load() {
    const status = document.getElementById('status');
    const list = document.getElementById('items');
    const fetchedEl = document.getElementById('fetched');

    try {
        // fetch the feed items from the backend API
        const res = await fetch('/projects/shrapnel/feed.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(await res.text());

        // parse the JSON response
        const { items, fetchedAt } = await res.json();
        status.textContent = `Loaded ${items.length} items`;
        if (fetchedAt && fetchedEl) {
            fetchedEl.textContent = `Fetched ${timeAgo(fetchedAt)} (${new Date(fetchedAt).toLocaleString()})`;
        } else if (fetchedEl) {
            fetchedEl.textContent = '';
        }

        // create and append list items for each feed item
        items.forEach(it => {
            const li = createItemElement(it);
            list.appendChild(li);
        });
    } catch (err) {
        status.textContent = 'Failed to load feeds';
        console.error(err);
    }
}

window.addEventListener('DOMContentLoaded', load);
