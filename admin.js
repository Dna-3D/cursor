// Assumes firebase, db, storage, auth are already initialized

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('admin-login-section');
  const panelSection = document.getElementById('admin-panel-section');
  const loginForm = document.getElementById('admin-login-form');
  const productForm = document.getElementById('product-form');
  const productListAdmin = document.getElementById('product-list-admin');

  // Simple password login
  function showPanel(loggedIn) {
    if (loggedIn) {
      loginSection.style.display = 'none';
      panelSection.style.display = 'block';
      loadProducts && loadProducts();
      loadBlog && loadBlog();
      loadAbout && loadAbout();
    } else {
      loginSection.style.display = 'block';
      panelSection.style.display = 'none';
    }
  }
  if (localStorage.getItem('adminLoggedIn') === 'true') {
    showPanel(true);
  }
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const password = document.getElementById('admin-password').value;
    if (password === 'Clim@te') {
      localStorage.setItem('adminLoggedIn', 'true');
      showPanel(true);
    } else {
      alert('Incorrect password');
    }
  });
  // Optionally add a logout button
  if (panelSection) {
    let logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Logout';
    logoutBtn.style = 'margin:1rem 0;';
    logoutBtn.onclick = () => {
      localStorage.removeItem('adminLoggedIn');
      showPanel(false);
    };
    panelSection.insertBefore(logoutBtn, panelSection.firstChild);
  }

  // Add Product
  productForm.addEventListener('submit', async e => {
    e.preventDefault();
    const title = document.getElementById('product-title').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const imageFile = document.getElementById('product-image').files[0];
    const whatsapp = document.getElementById('product-whatsapp').value.replace(/[^0-9]/g, '');
    if (!imageFile) return alert('Please select an image.');
    const imageRef = storage.ref('product-images/' + Date.now() + '-' + imageFile.name);
    const snapshot = await imageRef.put(imageFile);
    const imageUrl = await snapshot.ref.getDownloadURL();
    await db.collection('products').add({ title, price, imageUrl, whatsapp });
    productForm.reset();
  });

  // Load Products for Admin (with featured/trending flags)
  function loadProducts() {
    db.collection('products').orderBy('title').onSnapshot(snapshot => {
      productListAdmin.innerHTML = '';
      snapshot.forEach(doc => {
        const product = doc.data();
        const id = doc.id;
        const card = document.createElement('div');
        card.className = 'admin-product-card';
        card.innerHTML = `
          <img src="${product.imageUrl}" alt="${product.title}" />
          <div>
            <div><strong>${product.title}</strong></div>
            <div>$${product.price}</div>
            <div>WhatsApp: ${product.whatsapp}</div>
            <div>
              <label><input type="checkbox" class="featured-flag" ${product.featured ? 'checked' : ''}/> Featured</label>
              <label><input type="checkbox" class="trending-flag" ${product.trending ? 'checked' : ''}/> Trending</label>
            </div>
          </div>
          <div class="admin-actions">
            <button class="edit">Edit</button>
            <button class="delete">Delete</button>
          </div>
        `;
        // Delete
        card.querySelector('.delete').onclick = async () => {
          if (confirm('Delete this product?')) {
            await db.collection('products').doc(id).delete();
          }
        };
        // Edit (simple prompt-based)
        card.querySelector('.edit').onclick = async () => {
          const newTitle = prompt('Edit title:', product.title);
          const newPrice = prompt('Edit price:', product.price);
          const newWhatsapp = prompt('Edit WhatsApp:', product.whatsapp);
          let newImageUrl = product.imageUrl;
          if (confirm('Change image?')) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async e => {
              const file = e.target.files[0];
              if (file) {
                const imageRef = storage.ref('product-images/' + Date.now() + '-' + file.name);
                const snapshot = await imageRef.put(file);
                newImageUrl = await snapshot.ref.getDownloadURL();
                await db.collection('products').doc(id).update({ imageUrl: newImageUrl });
              }
            };
            input.click();
          }
          if (newTitle && newPrice && newWhatsapp) {
            await db.collection('products').doc(id).update({
              title: newTitle,
              price: parseFloat(newPrice),
              whatsapp: newWhatsapp,
              imageUrl: newImageUrl
            });
          }
        };
        // Featured/Trending flags
        card.querySelector('.featured-flag').onchange = e => {
          db.collection('products').doc(id).update({ featured: e.target.checked });
        };
        card.querySelector('.trending-flag').onchange = e => {
          db.collection('products').doc(id).update({ trending: e.target.checked });
        };
        productListAdmin.appendChild(card);
      });
    });
  }

  // Blog Management
  function loadBlog() {
    const blogSection = document.getElementById('admin-blog-section');
    if (!blogSection) return;
    db.collection('blog').orderBy('date', 'desc').onSnapshot(snapshot => {
      let html = '<h2>Manage Blog</h2>';
      html += '<form id="blog-form" enctype="multipart/form-data"><input type="text" id="blog-title" placeholder="Title" required/><textarea id="blog-summary" placeholder="Summary" required></textarea><input type="file" id="blog-image" accept="image/*" required/><button type="submit">Add Blog Post</button></form>';
      html += '<div id="blog-list-admin">';
      snapshot.forEach(doc => {
        const post = doc.data();
        html += `<div class="admin-product-card"><img src="${post.imageUrl || ''}" alt="" style="width:60px;height:60px;object-fit:cover;border-radius:6px;"/><div><strong>${post.title}</strong><div>${post.summary}</div><div style="font-size:0.9rem;opacity:0.7;">${post.date || ''}</div></div><div class="admin-actions"><button class="edit-blog" data-id="${doc.id}">Edit</button><button class="delete-blog" data-id="${doc.id}">Delete</button></div></div>`;
      });
      html += '</div>';
      blogSection.innerHTML = html;
      // Add blog post
      document.getElementById('blog-form').onsubmit = async e => {
        e.preventDefault();
        const title = document.getElementById('blog-title').value;
        const summary = document.getElementById('blog-summary').value;
        const imageFile = document.getElementById('blog-image').files[0];
        let imageUrl = '';
        if (imageFile) {
          const imageRef = storage.ref('blog-images/' + Date.now() + '-' + imageFile.name);
          const snapshot = await imageRef.put(imageFile);
          imageUrl = await snapshot.ref.getDownloadURL();
        }
        const date = new Date().toISOString().split('T')[0];
        await db.collection('blog').add({ title, summary, imageUrl, date });
        e.target.reset();
      };
      // Edit blog post
      blogSection.querySelectorAll('.edit-blog').forEach(btn => {
        btn.onclick = async () => {
          const id = btn.dataset.id;
          const docSnap = await db.collection('blog').doc(id).get();
          const post = docSnap.data();
          const newTitle = prompt('Edit title:', post.title);
          const newSummary = prompt('Edit summary:', post.summary);
          let newImageUrl = post.imageUrl;
          if (confirm('Change image?')) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async e => {
              const file = e.target.files[0];
              if (file) {
                const imageRef = storage.ref('blog-images/' + Date.now() + '-' + file.name);
                const snapshot = await imageRef.put(file);
                newImageUrl = await snapshot.ref.getDownloadURL();
                await db.collection('blog').doc(id).update({ imageUrl: newImageUrl });
              }
            };
            input.click();
          }
          if (newTitle && newSummary) {
            await db.collection('blog').doc(id).update({ title: newTitle, summary: newSummary, imageUrl: newImageUrl });
          }
        };
      });
      // Delete blog post
      blogSection.querySelectorAll('.delete-blog').forEach(btn => {
        btn.onclick = async () => {
          if (confirm('Delete this blog post?')) {
            await db.collection('blog').doc(btn.dataset.id).delete();
          }
        };
      });
    });
    // Demo blog data if empty
    db.collection('blog').get().then(snap => {
      if (snap.empty) {
        db.collection('blog').add({ title: 'Welcome to Our Blog', summary: 'Stay tuned for updates and stories!', imageUrl: '', date: new Date().toISOString().split('T')[0] });
      }
    });
  }

  // About Management
  function loadAbout() {
    const aboutSection = document.getElementById('admin-about-section');
    if (!aboutSection) return;
    db.collection('about').doc('main').get().then(docSnap => {
      let about = docSnap.data();
      if (!about) about = { title: 'About Us', body: 'Edit this about info.' };
      aboutSection.innerHTML = `<h2>Edit About</h2><form id="about-form"><input type="text" id="about-title" value="${about.title}" required/><textarea id="about-body" required>${about.body}</textarea><button type="submit">Save</button></form>`;
      document.getElementById('about-form').onsubmit = async e => {
        e.preventDefault();
        const title = document.getElementById('about-title').value;
        const body = document.getElementById('about-body').value;
        await db.collection('about').doc('main').set({ title, body });
      };
    });
  }

  // Add blog/about admin sections to panel
  if (panelSection) {
    let blogDiv = document.createElement('section');
    blogDiv.id = 'admin-blog-section';
    panelSection.appendChild(blogDiv);
    let aboutDiv = document.createElement('section');
    aboutDiv.id = 'admin-about-section';
    panelSection.appendChild(aboutDiv);
  }
}); 