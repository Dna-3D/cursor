// Assumes firebase, db are already initialized

document.addEventListener('DOMContentLoaded', () => {
  // Hamburger menu
  const hamburger = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.onclick = () => navLinks.classList.toggle('open');
    document.body.onclick = e => {
      if (!e.target.closest('.navbar')) navLinks.classList.remove('open');
    };
  }

  // Dark/Light mode toggle
  const themeToggle = document.getElementById('theme-toggle');
  function setTheme(mode) {
    document.body.classList.toggle('dark', mode === 'dark');
    localStorage.setItem('theme', mode);
    if (themeToggle) themeToggle.textContent = mode === 'dark' ? '☀️' : '🌙';
  }
  if (themeToggle) {
    themeToggle.onclick = () => setTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
    const saved = localStorage.getItem('theme');
    setTheme(saved || 'light');
  }

  // Modern footer
  const footer = document.querySelector('.modern-footer');
  if (footer) {
    footer.innerHTML = `
      <nav class="footer-nav">
        <a href="index.html">Home</a>
        <a href="blog.html">Blog</a>
        <a href="about.html">About</a>
        <a href="admin.html">Admin</a>
      </nav>
      <div class="footer-social">
        <a href="#" title="Instagram">&#x1F4F7;</a>
        <a href="#" title="Twitter">&#x1F426;</a>
        <a href="#" title="WhatsApp">&#x1F4F2;</a>
      </div>
      <div class="footer-copy">&copy; 2024 Modern E-Commerce</div>
    `;
  }

  // Home page logic
  if (document.getElementById('carousel-featured')) {
    // Demo data if Firestore is empty
    db.collection('products').get().then(snap => {
      if (snap.empty) {
        const demoProducts = [
          {title: 'Eco Water Bottle', price: 19.99, imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', whatsapp: '1234567890', featured: true, trending: true},
          {title: 'Wireless Headphones', price: 59.99, imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80', whatsapp: '1234567890', featured: true},
          {title: 'Yoga Mat', price: 29.99, imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80', whatsapp: '1234567890', trending: true},
          {title: 'Smart Watch', price: 99.99, imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80', whatsapp: '1234567890'},
          {title: 'Reusable Bag', price: 9.99, imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=400&q=80', whatsapp: '1234567890'},
        ];
        demoProducts.forEach(p => db.collection('products').add(p));
      }
    });
    // Carousels
    db.collection('products').onSnapshot(snapshot => {
      const featured = [];
      const trending = [];
      const all = [];
      snapshot.forEach(doc => {
        const p = doc.data();
        p.id = doc.id;
        if (p.featured) featured.push(p);
        if (p.trending) trending.push(p);
        all.push(p);
      });
      renderCarousel('carousel-featured', featured);
      renderCarousel('carousel-trending', trending);
      renderHorizontal('horizontal-products', all);
    });
  }

  // Blog page
  if (document.getElementById('blog-list')) {
    db.collection('blog').orderBy('date', 'desc').onSnapshot(snapshot => {
      const blogList = document.getElementById('blog-list');
      blogList.innerHTML = '';
      if (snapshot.empty) {
        blogList.innerHTML = '<p>No blog posts yet.</p>';
        return;
      }
      snapshot.forEach(doc => {
        const post = doc.data();
        const card = document.createElement('div');
        card.className = 'carousel-card';
        card.innerHTML = `
          <h3>${post.title}</h3>
          <p>${post.summary || ''}</p>
          <div style="font-size:0.9rem;opacity:0.7;">${post.date || ''}</div>
        `;
        blogList.appendChild(card);
      });
    });
  }

  // About page
  if (document.getElementById('about-content')) {
    db.collection('about').doc('main').onSnapshot(doc => {
      const about = doc.data();
      document.getElementById('about-content').innerHTML = about ? `<h2>${about.title}</h2><p>${about.body}</p>` : '<p>About info coming soon.</p>';
    });
  }

  // Product page
  if (document.getElementById('product-detail')) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      db.collection('products').doc(id).get().then(doc => {
        const p = doc.data();
        if (!p) return document.getElementById('product-detail').innerHTML = '<p>Product not found.</p>';
        document.getElementById('product-detail').innerHTML = `
          <div class="carousel-card">
            <img src="${p.imageUrl}" alt="${p.title}" />
            <h2>${p.title}</h2>
            <div class="product-price">$${p.price}</div>
            <p>${p.description || ''}</p>
            <a class="order-btn" href="https://wa.me/${p.whatsapp}?text=I'm%20interested%20in%20${encodeURIComponent(p.title)}" target="_blank">Order Now</a>
          </div>
        `;
      });
    }
  }

  // Render carousel
  function renderCarousel(id, products) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '';
    if (!products.length) {
      el.innerHTML = '<p>No products.</p>';
      return;
    }
    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'carousel-card';
      card.innerHTML = `
        <img src="${p.imageUrl}" alt="${p.title}" />
        <div class="product-title">${p.title}</div>
        <div class="product-price">$${p.price}</div>
        <a class="order-btn" href="https://wa.me/${p.whatsapp}?text=I'm%20interested%20in%20${encodeURIComponent(p.title)}" target="_blank">Order Now</a>
      `;
      card.onclick = () => window.location = `product.html?id=${p.id}`;
      el.appendChild(card);
    });
  }
  // Render horizontal scroll
  function renderHorizontal(id, products) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '';
    if (!products.length) {
      el.innerHTML = '<p>No products.</p>';
      return;
    }
    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${p.imageUrl}" alt="${p.title}" />
        <div class="product-title">${p.title}</div>
        <div class="product-price">$${p.price}</div>
        <a class="order-btn" href="https://wa.me/${p.whatsapp}?text=I'm%20interested%20in%20${encodeURIComponent(p.title)}" target="_blank">Order Now</a>
      `;
      card.onclick = () => window.location = `product.html?id=${p.id}`;
      el.appendChild(card);
    });
  }
}); 