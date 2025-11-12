const blogList = document.getElementById('blog-list');
        const blogDetails = document.getElementById('blog-details');
        const homeLink = document.getElementById('home-link');
        const myDropdown = document.getElementById('myDropdown');
        
        let currentPage = 1;
        let totalPages = 1;
        
        if (myDropdown) {
            myDropdown.addEventListener('change', function () {
                const selectedLink = this.value;
                if (selectedLink) {
                    window.location.href = selectedLink; 
                }
            });
        }
        
        // Fetch blog headings from API (with pagination structure)
        function loadBlogPage(page = 1) {
            fetch(`/api/getData?page=${page}&limit=5`)
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(result => {
                    const posts = Array.isArray(result) ? result : (result && result.posts) || [];
                    blogList.innerHTML = '';
                    
                    if (!posts.length) {
                        blogList.innerHTML = '<p class="no-posts">No posts available yet.</p>';
                        return;
                    }
                    
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
                        preview.textContent = (entry.Text || '').split(' ').slice(0, 5).join(' ') + '...';

                        container.appendChild(heading);
                        container.appendChild(preview);
                        blogList.appendChild(container);
                    });
                    
                    // Update pagination info
                    if (result.pagination) {
                        currentPage = result.pagination.currentPage;
                        totalPages = result.pagination.totalPages;
                        updatePaginationControls();
                    }
                })
                .catch(err => {
                    blogList.innerHTML = '<p class="error-message">Error loading data.</p>';
                    console.error('Fetch error:', err);
                });
        }
        
        function updatePaginationControls() {
            let paginationDiv = document.getElementById('pagination-controls');
            if (!paginationDiv) {
                paginationDiv = document.createElement('div');
                paginationDiv.id = 'pagination-controls';
                paginationDiv.className = 'pagination-controls';
                blogList.parentElement.appendChild(paginationDiv);
            }
            
            paginationDiv.innerHTML = '';
            
            if (totalPages <= 1) {
                paginationDiv.style.display = 'none';
                return;
            }
            
            paginationDiv.style.display = 'flex';
            
            // Previous button
            const prevBtn = document.createElement('button');
            prevBtn.className = 'pagination-btn';
            prevBtn.textContent = '← Previous';
            prevBtn.disabled = currentPage === 1;
            prevBtn.onclick = () => {
                if (currentPage > 1) {
                    loadBlogPage(currentPage - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            };
            
            // Page indicator
            const pageInfo = document.createElement('span');
            pageInfo.className = 'page-info';
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
            
            // Next button
            const nextBtn = document.createElement('button');
            nextBtn.className = 'pagination-btn';
            nextBtn.textContent = 'Next →';
            nextBtn.disabled = currentPage === totalPages;
            nextBtn.onclick = () => {
                if (currentPage < totalPages) {
                    loadBlogPage(currentPage + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            };
            
            paginationDiv.appendChild(prevBtn);
            paginationDiv.appendChild(pageInfo);
            paginationDiv.appendChild(nextBtn);
        }
        
        // Initial load
        loadBlogPage(1);

        // Show blog content dynamically
        function showBlogContent(entry) {
            blogList.style.display = 'none';
            blogDetails.style.display = 'block';
            blogDetails.innerHTML = ``;
            const heading = document.createElement('h2');
            heading.textContent = entry.Heading || 'No Title';

            const txt = document.createElement('p');
            txt.textContent = entry.Text || 'No Content';
            blogDetails.append(heading);
            blogDetails.append(txt);
        }

        // Return to blog headings when clicking Home
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            blogList.style.display = 'block';
            blogDetails.style.display = 'none';
        });
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