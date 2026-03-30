/* ============================================================
   ZENKAI MEDIA — GLOBAL SCRIPT
   ============================================================ */

// ---- Navbar ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (!navbar) return;
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// Active nav link
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) a.classList.add('active');
});

// ---- Hamburger ----
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.nav-mobile');
if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ---- Scroll Reveal ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ---- Count Up ----
function countUp(el) {
  const target = parseInt(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
  }, 16);
}
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('[data-target]').forEach(countUp);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.stats-row, .hero-stats, .hero-bottom').forEach(el => statObserver.observe(el));

// ---- Google Sheet ----
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwMMlqxKdGH9uCu9EX47DxWl7hUJ5lYH0fbg9XQYdfD0EM2pXN7rqorAYzNy8UOFtWS/exec';

function postToSheet(data) {
  var params = new URLSearchParams();
  for (var key in data) { params.append(key, data[key]); }
  return fetch(SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
}

// ---- Audit Modal ----
function openModal() {
  const overlay = document.getElementById('auditModal');
  if (overlay) { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal() {
  const overlay = document.getElementById('auditModal');
  if (overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; }
}
document.querySelectorAll('[data-modal="audit"]').forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); openModal(); }));
const modalClose = document.querySelector('.modal-close');
if (modalClose) modalClose.addEventListener('click', closeModal);
const modalOverlay = document.getElementById('auditModal');
if (modalOverlay) modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

// Exit intent
let exitShown = false;
document.addEventListener('mouseleave', (e) => {
  if (e.clientY <= 0 && !exitShown) { exitShown = true; setTimeout(openModal, 300); }
});

// ---- Audit Form Handlers ----

// Simple (Name + Email only) — about, blog, case-studies, contact, portfolio
window.handleSimpleAudit = function (e) {
  e.preventDefault();
  const form = e.target;
  const nameEl = document.getElementById('simpleAuditName');
  const emailEl = document.getElementById('simpleAuditEmail');
  const btn = form.querySelector('button[type="submit"]');
  let valid = true;
  [nameEl, emailEl].forEach(el => {
    if (!el || !el.value.trim()) {
      if (el) { el.style.borderColor = 'red'; setTimeout(() => { el.style.borderColor = ''; }, 2500); }
      valid = false;
    }
  });
  if (!valid) return;
  btn.textContent = 'SUBMITTING...'; btn.disabled = true;
  const phoneEl = document.getElementById('simpleAuditPhone');

  postToSheet({
    formType: 'Audit - Simple',
    name: nameEl.value.trim(),
    email: emailEl.value.trim(),
    phone: phoneEl ? phoneEl.value.trim() : ""
  })
    .finally(() => { btn.textContent = '✓ BOOKED'; form.reset(); });
};

// Service (Name + Email + Service) — services.html
window.handleServiceAudit = function (e) {
  e.preventDefault();
  const form = e.target;
  const nameEl = document.getElementById('svcName');
  const emailEl = document.getElementById('svcEmail');
  const serviceEl = document.getElementById('svcService');
  const btn = form.querySelector('button[type="submit"]');
  let valid = true;
  [nameEl, emailEl, serviceEl].forEach(el => {
    if (!el || !el.value.trim()) {
      if (el) { el.style.borderColor = 'red'; setTimeout(() => { el.style.borderColor = ''; }, 2500); }
      valid = false;
    }
  });
  if (!valid) return;
  btn.textContent = 'SUBMITTING...'; btn.disabled = true;
  const phoneEl = document.getElementById('svcPhone');

  postToSheet({
    formType: 'Audit - Service',
    name: nameEl.value.trim(),
    email: emailEl.value.trim(),
    service: serviceEl.value,
    phone: phoneEl ? phoneEl.value.trim() : ""
  })
    .finally(() => { btn.textContent = '✓ BOOKED'; form.reset(); });
};

// Full (Name + Email + Company + Budget) — index.html
window.handleAuditSubmit = function (e) {
  e.preventDefault();
  const form = e.target;
  const nameEl = document.getElementById('auditName');
  const emailEl = document.getElementById('auditEmail');
  const companyEl = document.getElementById('auditCompany');
  const budgetEl = document.getElementById('auditBudget');
  const btn = form.querySelector('button[type="submit"]');
  let valid = true;
  [nameEl, emailEl, companyEl].forEach(el => {
    if (!el || !el.value.trim()) {
      if (el) { el.style.borderColor = 'red'; setTimeout(() => { el.style.borderColor = ''; }, 2500); }
      valid = false;
    }
  });
  if (!valid) return;
  btn.textContent = 'SUBMITTING...'; btn.disabled = true;
  const phoneEl = document.getElementById('auditPhone');

  postToSheet({
    formType: 'Audit - Full',
    name: nameEl.value.trim(),
    email: emailEl.value.trim(),
    company: companyEl.value.trim(),
    budget: budgetEl.value,
    phone: phoneEl ? phoneEl.value.trim() : ""
  })
    .finally(() => {
      btn.textContent = '✓ AUDIT BOOKED — CHECK YOUR EMAIL';
      btn.style.background = '#000';
      form.reset();
      setTimeout(() => { btn.disabled = false; btn.textContent = 'CLAIM YOUR FREE AUDIT'; btn.style.background = ''; }, 4000);
    });
};

// ---- Newsletter Forms ----
document.querySelectorAll('.newsletter-form').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const emailEl = form.querySelector('input[type="email"]');
    if (!emailEl || !emailEl.value.trim()) {
      if (emailEl) { emailEl.style.borderColor = 'red'; setTimeout(() => { emailEl.style.borderColor = ''; }, 2500); }
      return;
    }
    const email = emailEl.value.trim();
    const orig = btn.textContent;
    btn.textContent = 'SUBSCRIBING...';
    btn.disabled = true;
    postToSheet({ formType: 'Newsletter', email: email })
      .finally(() => {
        btn.textContent = 'SUBSCRIBED ✓';
        btn.style.background = '#000'; btn.style.color = '#fff';
        form.reset();
        setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.style.color = ''; btn.disabled = false; }, 3000);
      });
  });
});

// ---- Smooth anchor scroll (safe — skips bare # links) ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    try {
      const target = document.querySelector(href);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    } catch (err) { }
  });
});

async function setPricing() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();

    const country = data.country;

    document.querySelectorAll(".price").forEach(el => {
      const usd = el.getAttribute("data-usd");
      const inr = el.getAttribute("data-inr");

      // Detect if pricing is "once" or "/mo"
      const isOnce = el.innerHTML.toLowerCase().includes("once");
      const suffix = isOnce ? " once" : " /mo";

      let priceHTML;

      // 🇮🇳 Default → INR
      if (country === "IN") {
        priceHTML = `₹${Number(inr).toLocaleString('en-IN')}<span style="font-size:1rem;font-weight:400;">${suffix}</span>`;
      } 
      // 🌍 Outside → USD
      else {
        priceHTML = `$${Number(usd).toLocaleString('en-US')}<span style="font-size:1rem;font-weight:400;">${suffix}</span>`;
      }

      el.innerHTML = priceHTML;
    });

  } catch (error) {
    console.log("Geo error", error);

    // 🔒 Fallback → INR
    document.querySelectorAll(".price").forEach(el => {
      const inr = el.getAttribute("data-inr");
      const isOnce = el.innerHTML.toLowerCase().includes("once");
      const suffix = isOnce ? " once" : " /mo";

      el.innerHTML = `₹${Number(inr).toLocaleString('en-IN')}<span style="font-size:1rem;font-weight:400;">${suffix}</span>`;
    });
  }
}

// Run function
setPricing();

// ---- Careers Form ----
window.handleCareersSubmit = async function (e) {
  e.preventDefault();

  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');

  const fileInput = form.querySelector('input[type="file"]');
  const file = fileInput.files[0];

  if (!file) {
    alert("Please upload CV");
    return;
  }

  btn.textContent = "UPLOADING...";
  btn.disabled = true;

  // Convert file to base64
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = error => reject(error);
  });

  const payload = {
    formType: "Careers",

    Name: form.querySelector('[name="Name"]').value,
    Email: form.querySelector('[name="Email"]').value,
    Mobile: form.querySelector('[name="Mobile"]').value,
    Position: form.querySelector('[name="Position"]').value,
    Experience: form.querySelector('[name="Experience"]').value,
    "Current Company": form.querySelector('[name="Current Company"]').value,
    Location: form.querySelector('[name="Location"]').value,
    "Current CTC": form.querySelector('[name="Current CTC"]').value,
    "Expected CTC": form.querySelector('[name="Expected CTC"]').value,
    Portfolio: form.querySelector('[name="Portfolio"]').value,

    fileData: base64,
    fileName: file.name,
    mimeType: file.type
  };

  fetch(SHEET_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  })
  .then(() => {
    btn.textContent = "✓ SUBMITTED";
    form.reset();
  })
  .catch(() => {
    btn.textContent = "TRY AGAIN";
  })
  .finally(() => {
    setTimeout(() => {
      btn.textContent = "APPLY NOW";
      btn.disabled = false;
    }, 3000);
  });
};

// LOAD FOOTER ON ALL PAGES
function loadFooter() {
  const path = window.location.pathname;

  // fix path for subfolders
  const footerPath = path.includes("/blog/") || path.includes("/case-studies/")
    ? "../footer.html"
    : "footer.html";

  fetch(footerPath)
    .then(res => res.text())
    .then(data => {
      document.getElementById("footer").innerHTML = data;

      // activate accordion
      document.querySelectorAll(".footer-toggle").forEach(toggle => {
        toggle.addEventListener("click", () => {
          toggle.parentElement.classList.toggle("active");
        });
      });
    });
}

document.addEventListener("DOMContentLoaded", loadFooter);