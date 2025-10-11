const blogList = document.getElementById('blog-list');
        const blogDetails = document.getElementById('blog-details');
        const homeLink = document.getElementById('home-link');
        const myDropdown = document.getElementById('myDropdown');
        if (myDropdown) {
            myDropdown.addEventListener('change', function () {
                const selectedLink = this.value;
                if (selectedLink) {
                    window.location.href = selectedLink; 
                }
            });
        }
        // Fetch blog headings
        fetch('/getData')
            .then(response => response.json())
            .then(data => {
                blogList.innerHTML = '';
                data.forEach((entry) => {
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
            })
            .catch(err => {
                blogList.textContent = 'Error loading data.';
            });

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
    const res = await fetch('/api?t=' + Date.now(), { cache: 'no-store' });
    console.log('GET /api/status', res.status);
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