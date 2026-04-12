const blogList    = document.getElementById('blog-list');
const blogDetails = document.getElementById('blog-details');
const homeLink    = document.getElementById('home-link');

let currentPage = 1;
let totalPages  = 1;
let booksCache  = [];   // populated once on load

/* ── Helpers ─────────────────────────────────────────────── */

function formatDate(raw) {
    const d = new Date(raw);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function readingTime(htmlStr) {
    const div = document.createElement('div');
    div.innerHTML = htmlStr;
    const words = (div.textContent || '').trim().split(/\s+/).filter(Boolean).length;
    return `${Math.max(1, Math.round(words / 200))} min read`;
}

/* ── Sidebar: books (dynamic) ────────────────────────────── */

async function loadSidebarBooks() {
    try {
        const res = await fetch('/api/books');
        booksCache = await res.json();

        const readingList = document.getElementById('books-reading');
        const mustList    = document.getElementById('books-must');
        if (!readingList || !mustList) return;

        const reading = booksCache.filter(b => b.category === 'reading');
        const must    = booksCache.filter(b => b.category === 'mustread');

        const renderList = (books, el) => {
            el.innerHTML = '';
            if (!books.length) {
                el.innerHTML = '<li style="color:var(--text-faint);font-size:13px">Nothing added yet.</li>';
                return;
            }
            books.forEach(b => {
                const li = document.createElement('li');
                const a  = document.createElement('a');
                a.href = b.url || '#';
                a.target = '_blank';
                a.rel = 'noopener';
                a.textContent = b.title;
                a.dataset.bookId = b._id;
                li.appendChild(a);
                el.appendChild(li);
            });
        };

        renderList(reading, readingList);
        renderList(must, mustList);
    } catch (err) {
        console.error('books load error:', err);
    }
}

/* ── Sidebar: spotify ────────────────────────────────────── */

async function loadSidebarSpotify() {
    const spotifyList = document.getElementById('spotify-list');
    if (!spotifyList) return;
    try {
        const res   = await fetch('/api/spotify');
        const songs = await res.json();

        spotifyList.innerHTML = '';
        if (!songs.length) {
            spotifyList.innerHTML = '<li class="spotify-track"><span class="spotify-track-title" style="color:var(--text-faint)">Nothing added yet.</span></li>';
            return;
        }

        songs.forEach(song => {
            const li = document.createElement('li');
            li.className = 'spotify-track';

            const inner = song.url
                ? `<a href="${song.url}" target="_blank" rel="noopener">${spotifyIconSVG()}<div class="spotify-track-info"><div class="spotify-track-title">${esc(song.title)}</div><div class="spotify-track-artist">${esc(song.artist || '')}</div></div></a>`
                : `${spotifyIconSVG()}<div class="spotify-track-info"><div class="spotify-track-title">${esc(song.title)}</div><div class="spotify-track-artist">${esc(song.artist || '')}</div></div>`;

            li.innerHTML = inner;
            spotifyList.appendChild(li);
        });
    } catch (err) {
        console.error('spotify load error:', err);
    }
}

function esc(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function spotifyIconSVG() {
    return `<svg class="spotify-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="12" fill="#1db954"/>
        <path d="M16.94 10.61c-2.72-1.61-7.21-1.76-9.81-.97-.42.13-.86-.11-.99-.52-.13-.42.11-.86.52-.99 2.99-.91 7.96-.73 11.1 1.12.37.22.5.7.28 1.07-.22.38-.7.5-1.1.29zm-.12 2.85c-.19.31-.6.41-.91.22-2.27-1.39-5.72-1.8-8.4-1-.35.1-.71-.1-.81-.45-.1-.35.1-.71.45-.81 3.06-.93 6.87-.48 9.46 1.13.31.19.41.6.21.91zm-1.04 2.73c-.15.25-.48.33-.72.18-1.98-1.21-4.48-1.48-7.41-.81-.28.07-.57-.11-.63-.39-.07-.28.11-.57.39-.63 3.21-.73 5.96-.42 8.18.93.25.15.33.48.19.72z" fill="white"/>
    </svg>`;
}

/* ── Blog list ───────────────────────────────────────────── */

function loadBlogPage(page = 1) {
    blogList.innerHTML = '<p class="no-posts" style="opacity:.4">Loading…</p>';

    fetch(`/api/getData?page=${page}&limit=5`)
        .then(res => {
            if (!res.ok) throw new Error('bad response');
            return res.json();
        })
        .then(result => {
            const posts = Array.isArray(result) ? result : (result && result.posts) || [];
            blogList.innerHTML = '';

            if (!posts.length) {
                blogList.innerHTML = '<p class="no-posts">No posts yet.</p>';
                return;
            }

            posts.forEach(entry => {
                const card = document.createElement('div');
                card.className = 'blog-container';

                const dateEl = document.createElement('div');
                dateEl.className = 'blog-date';
                dateEl.textContent = formatDate(entry.publishedDate || entry.createdAt);

                const heading = document.createElement('h2');
                heading.className = 'blog-heading';
                heading.textContent = entry.Heading || 'Untitled';

                const preview = document.createElement('p');
                preview.className = 'blog-preview';
                const tmp   = document.createElement('div');
                tmp.innerHTML = entry.Text || '';
                const plain = (tmp.textContent || tmp.innerText || '').trim();
                preview.textContent = plain.length > 200 ? plain.slice(0, 200) + '…' : plain;

                card.appendChild(dateEl);
                card.appendChild(heading);
                card.appendChild(preview);
                card.addEventListener('click', () => showBlogContent(entry));
                blogList.appendChild(card);
            });

            if (result.pagination) {
                currentPage = result.pagination.currentPage;
                totalPages  = result.pagination.totalPages;
                updatePaginationControls();
            }
        })
        .catch(err => {
            blogList.innerHTML = '<p class="error-message">Could not load posts.</p>';
            console.error(err);
        });
}

/* ── Pagination ──────────────────────────────────────────── */

function updatePaginationControls() {
    let pg = document.getElementById('pagination-controls');
    if (!pg) {
        pg = document.createElement('div');
        pg.id = 'pagination-controls';
        pg.className = 'pagination-controls';
        blogList.parentElement.appendChild(pg);
    }

    pg.innerHTML = '';
    if (totalPages <= 1) { pg.style.display = 'none'; return; }
    pg.style.display = 'flex';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.textContent = '← Prev';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => { if (currentPage > 1) { loadBlogPage(currentPage - 1); scrollTop(); } };

    const info = document.createElement('span');
    info.className = 'page-info';
    info.textContent = `${currentPage} / ${totalPages}`;

    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = 'Next →';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => { if (currentPage < totalPages) { loadBlogPage(currentPage + 1); scrollTop(); } };

    pg.appendChild(prevBtn);
    pg.appendChild(info);
    pg.appendChild(nextBtn);
}

function scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

/* ── Blog detail ─────────────────────────────────────────── */

function showBlogContent(entry) {
    blogList.style.display = 'none';
    const pg = document.getElementById('pagination-controls');
    if (pg) pg.style.display = 'none';

    blogDetails.style.display = 'block';
    blogDetails.innerHTML = '';

    // Back button
    const back = document.createElement('button');
    back.className = 'blog-back-btn';
    back.textContent = '← Back';
    back.addEventListener('click', () => {
        blogDetails.style.display = 'none';
        blogDetails.innerHTML = '';
        blogList.style.display = 'block';
        if (pg) pg.style.display = totalPages > 1 ? 'flex' : 'none';
        scrollTop();
    });

    // Meta
    const meta = document.createElement('div');
    meta.className = 'blog-detail-meta';

    const title = document.createElement('div');
    title.className = 'blog-detail-title';
    title.textContent = entry.Heading || 'Untitled';

    const infoRow = document.createElement('div');
    infoRow.className = 'blog-detail-info';
    const dateSpan = document.createElement('span');
    dateSpan.textContent = formatDate(entry.publishedDate || entry.createdAt);
    const rtSpan = document.createElement('span');
    rtSpan.textContent = readingTime(entry.Text || '');
    infoRow.appendChild(dateSpan);
    infoRow.appendChild(rtSpan);

    meta.appendChild(title);
    meta.appendChild(infoRow);

    // Content
    const body = document.createElement('div');
    body.innerHTML = entry.Text || '<p>No content.</p>';

    blogDetails.appendChild(back);
    blogDetails.appendChild(meta);
    blogDetails.appendChild(body);

    // Linked books
    const postId = String(entry._id);
    const linked = booksCache.filter(b =>
        Array.isArray(b.linkedPostIds) && b.linkedPostIds.includes(postId)
    );
    if (linked.length) {
        const section = document.createElement('div');
        section.className = 'linked-books';
        section.innerHTML = `<div class="linked-books-title">Books mentioned</div>`;
        const ul = document.createElement('ul');
        ul.className = 'linked-books-list';
        linked.forEach(b => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${b.url || '#'}" target="_blank" rel="noopener">${esc(b.title)}</a>`;
            ul.appendChild(li);
        });
        section.appendChild(ul);
        blogDetails.appendChild(section);
    }

    scrollTop();
}

/* ── Init ────────────────────────────────────────────────── */

loadBlogPage(1);
loadSidebarBooks();
loadSidebarSpotify();

homeLink.addEventListener('click', e => {
    e.preventDefault();
    blogDetails.style.display = 'none';
    blogDetails.innerHTML = '';
    blogList.style.display = 'block';
    const pg = document.getElementById('pagination-controls');
    if (pg) pg.style.display = totalPages > 1 ? 'flex' : 'none';
});

/* ── Profile image ───────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', async () => {
    const img = document.querySelector('.profile-photo img');
    if (!img) return;
    try {
        const res  = await fetch('/api/getRandomImage?t=' + Date.now(), { cache: 'no-store' });
        const data = await res.json();
        if (!data || !data.image) throw new Error('no image');
        const path = data.image.startsWith('data:') ? data.image
                   : (data.image.startsWith('/') ? data.image : '/' + data.image);
        img.src = path;
    } catch (err) {
        console.error('fetchRandomImage error:', err);
    }
});
