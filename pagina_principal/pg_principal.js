// ==================================================
// 1. CONSTANTES
// ==================================================
const TOKEN_KEY = 'token';
const USER_KEY = 'usuario';
const LOGOUT_REDIRECT_URL = '../login/login.html';

// ==================================================
// 2. FUNCIONES
// ==================================================

function checkAuthentication() {
  const token = localStorage.getItem(TOKEN_KEY);

  console.log('🔐 Verificando autenticación...', token ? '✅ Token encontrado' : '❌ No hay token');

  if (!token) {
    console.log('⚠️ Redirigiendo a login...');
    window.location.href = LOGOUT_REDIRECT_URL;
  }
}

function handleLogout() {
  console.log("🚪 Cerrando sesión...");

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  window.location.href = LOGOUT_REDIRECT_URL;
}

function cargardatos() {
  const userDetailsStr = localStorage.getItem(USER_KEY);
  console.log('👤 Datos de usuario en localStorage:', userDetailsStr);

  const userDetails = userDetailsStr ? JSON.parse(userDetailsStr) : null;

  const userNameElement = document.getElementById('userName');
  const userEmailElement = document.getElementById('userEmail');

  if (userDetails && userNameElement) {
    userNameElement.textContent = userDetails.nombre || 'Usuario Autorizado';
    console.log('✅ Nombre de usuario cargado:', userDetails.nombre);

    if (userEmailElement) {
      userEmailElement.textContent = userDetails.email || 'Email no disponible';
      console.log('✅ Email de usuario cargado:', userDetails.email);
    }
  } else {
    console.warn('⚠️ No se encontraron datos de usuario en localStorage');
  }
}

// ==================================================
// 3. FUNCIONES PARA CHARTS (SEGURAS)
// ==================================================

function initIcons() {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
    console.log("✅ Lucide inicializado");
  } else {
    console.warn("⚠️ Lucide NO está cargado (no afecta el logout)");
  }
}

function initCharts() {
  // Si Chart.js no existe, NO rompas la página
  if (typeof Chart === "undefined") {
    console.warn("⚠️ Chart.js NO está cargado (no afecta el logout)");
    return;
  }

  // Tema oscuro global
  Chart.defaults.color = '#A0A0B0';
  Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

  const neonBlue = '#00FFFF';
  const darkPurple = '#311B92';

  // ===================================
  // 1. GRÁFICO DE LÍNEAS
  // ===================================
  const ctxLine = document.getElementById('lineChart');
  if (ctxLine) {
    new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'],
        datasets: [{
          label: 'Ingresos ($)',
          data: [12000, 19500, 13000, 18000, 22000],
          borderColor: neonBlue,
          backgroundColor: 'rgba(0, 255, 255, 0.2)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true },
          x: { grid: { display: false } }
        },
        plugins: {
          legend: { display: true, labels: { color: '#FFFFFF' } }
        }
      }
    });
  }

  // ===================================
  // 2. GRÁFICO DE BARRAS
  // ===================================
  const ctxBar = document.getElementById('barChart');
  if (ctxBar) {
    new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels: ['Mousepad', 'Teclado Mec.', 'Monitor 27"', 'PC Gaming', 'Cable HDMI'],
        datasets: [{
          label: 'Unidades Vendidas',
          data: [250, 180, 120, 50, 310],
          backgroundColor: [neonBlue, '#9B59B6', '#E67E22', '#16A085', '#E74C3C'],
          borderColor: darkPurple,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: { beginAtZero: true }
        }
      }
    });
  }

  // ===================================
  // 3. GRÁFICO DE TORTA
  // ===================================
  const ctxPie = document.getElementById('pieChart');
  if (ctxPie) {
    new Chart(ctxPie, {
      type: 'doughnut',
      data: {
        labels: ['Minoristas', 'Mayoristas', 'Distribuidores'],
        datasets: [{
          data: [65, 25, 10],
          backgroundColor: [neonBlue, '#2ECC71', '#F39C12'],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#FFFFFF' }
          }
        }
      }
    });
  }

  console.log("✅ Charts inicializados");
}

// ==================================================
// 4. DOMContentLoaded (UNO SOLO)
// ==================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1) Proteger página
  checkAuthentication();

  // 2) Cargar datos del usuario
  cargardatos();

  // 3) Enlazar logout (ESTO SIEMPRE)
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
    console.log("✅ Botón logout enlazado");
  } else {
    console.warn("⚠️ No se encontró el botón logoutBtn");
  }

  // 4) Iconos
  initIcons();

  // 5) Charts
  initCharts();
});
