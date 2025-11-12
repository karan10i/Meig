const blogList = document.getElementById('blog-list');
const blogDetails = document.getElementById('blog-details');
const homeLink = document.getElementById('home-link');
const myDropdown = document.getElementById('myDropdown');

// Pagination state
let currentPage = 1;
const postsPerPage = 10;
let totalPages = 1;

if (myDropdown) {
    myDropdown.addEventListener('change', function () {
        const selectedLink = this.value;
        if (selectedLink) {
            window.location.href = selectedLink; 
        }
    });
}

// Fetch blog headings with pagination
function fetchBlogPosts(page = 1) {
    fetch(`/api/getData?page=${page}&limit=${postsPerPage}`)
        .then(response => response.json())
        .then(data => {
            const posts = data.posts || data; // Handle both old and new format
            const pagination = data.pagination || {};
            
            currentPage = pagination.currentPage || page;
            totalPages = pagination.totalPages || 1;
            
            blogList.innerHTML = '';
            
            // Render posts
            posts.forEach((entry) => {
                const container = document.createElement('div');
                container.className = 'blog-container';

                const heading = document.createElement('h2');
                heading.className = 'blog-heading';
                heading.textContent = entry.Heading || 'No Title';
                heading.addEventListener('click', () => {
                    showBlogContent(entry);
                });

                const preview = document.createElement('p');
                preview.className = 'blog-preview';
                preview.textContent = (entry.Text || '').split(' ').slice(0, 15).join(' ') + '...';
                
                // Add publish date if available
                if (entry.publishedDate) {
                    const date = document.createElement('small');
                    date.className = 'blog-date';
                    date.textContent = new Date(entry.publishedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    container.appendChild(date);
                }

                container.appendChild(heading);
                container.appendChild(preview);
                blogList.appendChild(container);
            });
            
            // Render pagination controls
            renderPagination(pagination);
            
            // Change random image on page change
            if (page !== 1) {
                changeRandomImage();
            }
        })
        .catch(err => {
            console.error('Error loading blog posts:', err);
            blogList.textContent = 'Error loading data.';
        });
}

function renderPagination(pagination) {
    // Remove existing pagination
    const existingPagination = document.querySelector('.pagination');
    if (existingPagination) {
        existingPagination.remove();
    }
    
    if (!pagination || totalPages <= 1) return;
    
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination';
    
    // Previous button
    if (pagination.hasPrevPage) {
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '← Previous';
        prevBtn.className = 'pagination-btn';
        prevBtn.onclick = () => fetchBlogPosts(currentPage - 1);
        paginationDiv.appendChild(prevBtn);
    }
    
    // Page info
    const pageInfo = document.createElement('span');
    pageInfo.className = 'page-info';
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    paginationDiv.appendChild(pageInfo);
    
    // Next button
    if (pagination.hasNextPage) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Next →';
        nextBtn.className = 'pagination-btn';
        nextBtn.onclick = () => fetchBlogPosts(currentPage + 1);
        paginationDiv.appendChild(nextBtn);
    }
    
    blogList.appendChild(paginationDiv);
}

// Initial load
fetchBlogPosts(1);

        // Show blog content dynamically
        function showBlogContent(entry) {
            blogList.style.display = 'none';
            blogDetails.style.display = 'block';
            blogDetails.innerHTML = ``;
            const heading = document.createElement('h2');
            heading.textContent = entry.Heading || 'No Title';

            const txt = document.createElement('p');
            txt.textContent = entry.Text || 'No Content';
            
            // Add publish date
            if (entry.publishedDate) {
                const date = document.createElement('small');
                date.className = 'blog-date';
                date.style.display = 'block';
                date.style.marginBottom = '20px';
                date.textContent = 'Published: ' + new Date(entry.publishedDate).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                blogDetails.append(heading);
                blogDetails.append(date);
            } else {
                blogDetails.append(heading);
            }
            
            blogDetails.append(txt);
        }

        // Return to blog headings when clicking Home
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            blogList.style.display = 'block';
            blogDetails.style.display = 'none';
            fetchBlogPosts(currentPage); // Reload current page
        });
        
// Change random image (on page navigation)
function changeRandomImage() {
    const img = document.querySelector('.profile-photo img');
    if (!img) return;
    
    fetch('/api/getRandomImage?t=' + Date.now(), { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
            if (data && data.image) {
                const path = data.image.startsWith('data:') ? data.image : (data.image.startsWith('/') ? data.image : '/' + data.image);
                img.src = path;
            }
        })
        .catch(err => console.error('Error changing image:', err));
}
   document.addEventListener('DOMContentLoaded', async () => {
  const img = document.querySelector('.profile-photo img');
  try {
    const res = await fetch('/api/getRandomImage?t=' + Date.now(), { cache: 'no-store' });
    console.log('GET /getRandomImage status', res.status);
    const data = await res.json();
    console.log('getRandomImage ->', data);
    if (!data || !data.image) throw new Error('no image returned');
    const path = data.image.startsWith('data:') ? data.image : (data.image.startsWith('/') ? data.image : '/' + data.image);
    img.onload = () => console.log('image loaded:', path, img.naturalWidth, img.naturalHeight);
    img.onerror = () => console.error('image failed to load:', path);
    img.src = path;
  } catch (err) {
    console.error('fetchRandomImage error:', err);
  }
});