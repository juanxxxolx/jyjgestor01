


let charts = {};

function inicializarGraficos() {
    // Gráfico de Líneas - Ventas vs Costo
    const ctxLine = document.getElementById('lineChart').getContext('2d');
    charts.line = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
            datasets: [
                {
                    label: 'Ventas',
                    data: [28000, 32000, 29500, 35000, 38000, 42000],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3b82f6',
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Costo',
                    data: [17000, 19000, 18000, 21000, 22000, 25000],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#ef4444',
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: { size: 12 },
                        padding: 15,
                        usePointStyle: true
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });

    // Gráfico de Barras - Top 5 Productos
    const ctxBar = document.getElementById('barChart').getContext('2d');
    charts.bar = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['Producto A', 'Producto B', 'Producto C', 'Producto D', 'Producto E'],
            datasets: [{
                label: 'Unidades Vendidas',
                data: [450, 380, 320, 280, 210],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)'
                ],
                borderRadius: 8,
                borderSkipped: false,
                hoverBackgroundColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(236, 72, 153, 1)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + ' unidades';
                        }
                    }
                }
            }
        }
    });

    // Gráfico de Torta - Distribución de Inventario
    const ctxPie = document.getElementById('pieChart').getContext('2d');
    charts.pie = new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: ['Electrónica', 'Ropa', 'Alimentos', 'Libros', 'Otros'],
            datasets: [{
                data: [2500, 1800, 1200, 800, 700],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)'
                ],
                borderColor: 'white',
                borderWidth: 3,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 12 },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + ' unidades';
                        }
                    }
                }
            }
        }
    });

    // Gráfico de Dona - Categorías
    const ctxDoughnut = document.getElementById('doughnutChart').getContext('2d');
    charts.doughnut = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
            labels: ['Entradas', 'Salidas', 'Devoluciones', 'Ajustes'],
            datasets: [{
                data: [1200, 1900, 340, 280],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(59, 130, 246, 0.8)'
                ],
                borderColor: 'white',
                borderWidth: 3,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 12 },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    });

    // Gráfico de Radar - Desempeño
    const ctxRadar = document.getElementById('radarChart').getContext('2d');
    charts.radar = new Chart(ctxRadar, {
        type: 'radar',
        data: {
            labels: ['Ventas', 'Clientes', 'Calidad', 'Entrega', 'Precio'],
            datasets: [
                {
                    label: 'Este Mes',
                    data: [85, 75, 80, 90, 70],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Mes Anterior',
                    data: [70, 65, 75, 80, 75],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: '#fff',
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 12 },
                        padding: 15,
                        usePointStyle: true
                    }
                }
            }
        }
    });

    // Gráfico de Área - Tendencia
    const ctxArea = document.getElementById('areaChart').getContext('2d');
    charts.area = new Chart(ctxArea, {
        type: 'line',
        data: {
            labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Semana 5', 'Semana 6'],
            datasets: [{
                label: 'Ventas Diarias',
                data: [5000, 6500, 5200, 7800, 8500, 9200],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.3)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#10b981',
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });

    // Gráfico de Burbujas
    const ctxBubble = document.getElementById('bubbleChart').getContext('2d');
    charts.bubble = new Chart(ctxBubble, {
        type: 'bubble',
        data: {
            datasets: [
                {
                    label: 'Productos Electrónica',
                    data: [
                        { x: 15, y: 450, r: 20 },
                        { x: 25, y: 380, r: 15 },
                        { x: 12, y: 320, r: 18 }
                    ],
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Productos Ropa',
                    data: [
                        { x: 8, y: 280, r: 14 },
                        { x: 18, y: 210, r: 12 },
                        { x: 20, y: 300, r: 16 }
                    ],
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Precio ($)',
                        font: { size: 12, weight: 'bold' }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Demanda (unidades)',
                        font: { size: 12, weight: 'bold' }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        font: { size: 12 },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Precio: $' + context.raw.x + ', Demanda: ' + context.raw.y + ' unidades, Stock: ' + context.raw.r;
                        }
                    }
                }
            }
        }
    });

    // Gráfico Mixto - Barras y Línea
    const ctxMixed = document.getElementById('mixedChart').getContext('2d');
    charts.mixed = new Chart(ctxMixed, {
        type: 'bar',
        data: {
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
            datasets: [
                {
                    type: 'bar',
                    label: 'Ventas Reales',
                    data: [28000, 32000, 29500, 35000, 38000, 42000],
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderRadius: 8,
                    hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)'
                },
                {
                    type: 'line',
                    label: 'Proyección',
                    data: [30000, 33000, 32000, 37000, 40000, 44000],
                    borderColor: '#ef4444',
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    borderDash: [5, 5],
                    pointBackgroundColor: '#ef4444',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: { size: 12 },
                        padding: 15,
                        usePointStyle: true
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function actualizarDatos() {
    const filtro = document.getElementById('timeFilter').value;
    const datosNuevos = {
        mes: {
            income: '$25,350.50',
            margin: '38.2%',
            lowstock: '18',
            newclients: '45'
        },
        trimestre: {
            income: '$76,050.00',
            margin: '36.8%',
            lowstock: '24',
            newclients: '128'
        },
        año: {
            income: '$305,250.00',
            margin: '37.5%',
            lowstock: '32',
            newclients: '512'
        }
    };

    const datos = datosNuevos[filtro];
    document.getElementById('income').textContent = datos.income;
    document.getElementById('margin').textContent = datos.margin;
    document.getElementById('lowstock').textContent = datos.lowstock;
    document.getElementById('newclients').textContent = datos.newclients;
}

function descargarReporte() {
    const filtro = document.getElementById('timeFilter').value;
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Reporte_Analiticas_${filtro}_${fecha}.txt`;

    const contenido = `=====================================
        REPORTE DE ANALÍTICAS
=====================================

Periodo: ${filtro}
Fecha de Generación: ${new Date().toLocaleDateString('es-ES')}
Hora: ${new Date().toLocaleTimeString('es-ES')}

-------------------------------------
INDICADORES CLAVE DE DESEMPEÑO (KPI)
-------------------------------------

Ingresos Netos: ${document.getElementById('income').textContent}
Margen Bruto: ${document.getElementById('margin').textContent}
Productos con Stock Bajo: ${document.getElementById('lowstock').textContent}
Nuevos Clientes: ${document.getElementById('newclients').textContent}

-------------------------------------
GRÁFICOS INCLUIDOS
-------------------------------------

1. Ventas vs. Costo por Mes (Gráfico de Líneas)
2. Top 5 Productos Vendidos (Gráfico de Barras)
3. Distribución de Inventario (Gráfico de Torta)
4. Categorías de Productos (Gráfico de Dona)
5. Análisis de Desempeño (Gráfico de Radar)
6. Tendencia de Ventas (Gráfico de Área)
7. Análisis de Productos (Gráfico de Burbujas)
8. Comparativa Ventas y Proyección (Gráfico Mixto)

-------------------------------------
NOTAS
-------------------------------------

Este reporte ha sido generado automáticamente por el sistema de analíticas.
Para obtener información más detallada, consulte el dashboard interactivo.

=====================================`;

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', nombreArchivo);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Inicializar gráficos cuando carga la página
window.addEventListener('load', inicializarGraficos);