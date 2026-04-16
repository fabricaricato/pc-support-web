/* ============================
   TechFix Pro — Mis Reparaciones JS
   ============================ */

import './style.css';

// ---------- Navbar (simplified for subpage) ----------
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navLinks');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    navToggle.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
  });

  navMenu.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ---------- Tab Switching ----------
const tabEmail = document.getElementById('tabEmail');
const tabTicket = document.getElementById('tabTicket');
const emailGroup = document.getElementById('emailGroup');
const ticketGroup = document.getElementById('ticketGroup');
const searchEmail = document.getElementById('searchEmail');
const searchTicket = document.getElementById('searchTicket');

let activeTab = 'email';

tabEmail.addEventListener('click', () => {
  activeTab = 'email';
  tabEmail.classList.add('active');
  tabTicket.classList.remove('active');
  emailGroup.style.display = '';
  ticketGroup.style.display = 'none';
  searchEmail.focus();
});

tabTicket.addEventListener('click', () => {
  activeTab = 'ticket';
  tabTicket.classList.add('active');
  tabEmail.classList.remove('active');
  ticketGroup.style.display = '';
  emailGroup.style.display = 'none';
  searchTicket.focus();
});

// ---------- API Configuration ----------
// Cambiá esta URL cuando tengas tu backend andando
const API_BASE_URL = 'http://localhost:3000/api';

// ---------- Estado Labels & Config ----------
const ESTADOS = {
  recibido: {
    label: 'Recibido',
    icon: 'fa-solid fa-inbox',
    color: '#8b8ba0',
    desc: 'Tu equipo fue recibido en el taller.',
    step: 1,
  },
  en_diagnostico: {
    label: 'En diagnóstico',
    icon: 'fa-solid fa-magnifying-glass-chart',
    color: '#f59e0b',
    desc: 'Estamos analizando tu equipo para identificar el problema.',
    step: 2,
  },
  esperando_repuesto: {
    label: 'Esperando repuesto',
    icon: 'fa-solid fa-clock',
    color: '#f97316',
    desc: 'Necesitamos un repuesto que está en camino.',
    step: 3,
  },
  en_reparacion: {
    label: 'En reparación',
    icon: 'fa-solid fa-screwdriver-wrench',
    color: '#0ea5e9',
    desc: 'Tu equipo está siendo reparado en este momento.',
    step: 4,
  },
  listo: {
    label: 'Listo para retirar',
    icon: 'fa-solid fa-circle-check',
    color: '#22c55e',
    desc: '¡Tu equipo está listo! Podés pasar a retirarlo.',
    step: 5,
  },
  entregado: {
    label: 'Entregado',
    icon: 'fa-solid fa-handshake',
    color: '#8b5cf6',
    desc: 'Tu equipo ya fue entregado. ¡Gracias por confiar en nosotros!',
    step: 6,
  },
};

const STEPS_ORDER = ['recibido', 'en_diagnostico', 'esperando_repuesto', 'en_reparacion', 'listo', 'entregado'];

// ---------- Search Form ----------
const searchForm = document.getElementById('searchForm');
const searchBtn = document.getElementById('searchBtn');

const resultsEmpty = document.getElementById('resultsEmpty');
const resultsLoading = document.getElementById('resultsLoading');
const resultsError = document.getElementById('resultsError');
const resultsList = document.getElementById('resultsList');

function showState(state) {
  resultsEmpty.style.display = state === 'empty' ? '' : 'none';
  resultsLoading.style.display = state === 'loading' ? '' : 'none';
  resultsError.style.display = state === 'error' ? '' : 'none';
  resultsList.style.display = state === 'results' ? '' : 'none';
}

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const query = activeTab === 'email'
    ? searchEmail.value.trim()
    : searchTicket.value.trim();

  if (!query) return;

  showState('loading');
  searchBtn.disabled = true;

  try {
    const param = activeTab === 'email' ? `email=${encodeURIComponent(query)}` : `ticket=${encodeURIComponent(query)}`;
    const response = await fetch(`${API_BASE_URL}/estado?${param}`);

    if (!response.ok) {
      throw new Error('API error');
    }

    const data = await response.json();

    if (!data || (Array.isArray(data) && data.length === 0)) {
      showState('error');
      return;
    }

    const reparaciones = Array.isArray(data) ? data : [data];
    renderResults(reparaciones);
    showState('results');
  } catch (err) {
    console.error('Error consultando estado:', err);

    // --- DEMO MODE ---
    // Mientras no tengas el backend, mostramos datos de ejemplo
    const demoData = getDemoData(query);
    if (demoData.length > 0) {
      renderResults(demoData);
      showState('results');
    } else {
      showState('error');
    }
  } finally {
    searchBtn.disabled = false;
  }
});

// ---------- Demo Data (remove when backend is ready) ----------
function getDemoData(query) {
  const demoReparaciones = [
    {
      ticket: 'TF-00042',
      equipo: 'PC Desktop - Intel i5 10400 / 16GB RAM',
      estado: 'en_reparacion',
      presupuesto: 45000,
      created_at: '2026-04-10T14:30:00',
      updated_at: '2026-04-14T09:15:00',
    },
    {
      ticket: 'TF-00038',
      equipo: 'Notebook HP Pavilion 15',
      estado: 'listo',
      presupuesto: 28000,
      created_at: '2026-04-05T10:00:00',
      updated_at: '2026-04-13T16:45:00',
    },
  ];

  // Return demo data for any search to show how it works
  if (query.includes('@') || query.toUpperCase().startsWith('TF')) {
    return demoReparaciones;
  }
  return [];
}

// ---------- Render Results ----------
function renderResults(reparaciones) {
  resultsList.innerHTML = reparaciones.map((rep) => createRepairCard(rep)).join('');

  // Animate cards in
  const cards = resultsList.querySelectorAll('.repair-card');
  cards.forEach((card, i) => {
    card.style.animationDelay = `${i * 120}ms`;
  });
}

function createRepairCard(rep) {
  const estado = ESTADOS[rep.estado] || ESTADOS.recibido;
  const currentStepIndex = STEPS_ORDER.indexOf(rep.estado);

  const createdDate = formatDate(rep.created_at);
  const updatedDate = formatDate(rep.updated_at);

  const presupuesto = rep.presupuesto
    ? `$${rep.presupuesto.toLocaleString('es-AR')}`
    : 'Pendiente';

  // Build progress steps
  const progressSteps = STEPS_ORDER.map((step, i) => {
    const stepData = ESTADOS[step];
    let stepClass = 'progress-step';
    if (i < currentStepIndex) stepClass += ' completed';
    else if (i === currentStepIndex) stepClass += ' current';

    return `
      <div class="${stepClass}" title="${stepData.label}">
        <div class="progress-step__dot">
          <i class="${i <= currentStepIndex ? stepData.icon : 'fa-solid fa-circle'}" style="font-size: 0.5rem;"></i>
        </div>
        <span class="progress-step__label">${stepData.label}</span>
      </div>
    `;
  }).join('');

  return `
    <article class="repair-card">
      <div class="repair-card__header">
        <div class="repair-card__ticket">
          <i class="fa-solid fa-ticket"></i>
          <span>${rep.ticket}</span>
        </div>
        <div class="repair-card__status" style="--status-color: ${estado.color};">
          <i class="${estado.icon}"></i>
          <span>${estado.label}</span>
        </div>
      </div>

      <div class="repair-card__body">
        <div class="repair-card__equipo">
          <i class="fa-solid fa-desktop"></i>
          <span>${rep.equipo}</span>
        </div>

        <div class="repair-card__status-message">
          <p>${estado.desc}</p>
        </div>

        <div class="repair-card__progress">
          <div class="progress-track">
            <div class="progress-track__fill" style="width: ${((currentStepIndex) / (STEPS_ORDER.length - 1)) * 100}%;"></div>
          </div>
          <div class="progress-steps">
            ${progressSteps}
          </div>
        </div>

        <div class="repair-card__details">
          <div class="repair-detail">
            <span class="repair-detail__label">Presupuesto</span>
            <span class="repair-detail__value">${presupuesto}</span>
          </div>
          <div class="repair-detail">
            <span class="repair-detail__label">Fecha de ingreso</span>
            <span class="repair-detail__value">${createdDate}</span>
          </div>
          <div class="repair-detail">
            <span class="repair-detail__label">Última actualización</span>
            <span class="repair-detail__value">${updatedDate}</span>
          </div>
        </div>
      </div>
    </article>
  `;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
