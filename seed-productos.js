const http = require('http');

const productos = [
  // Electrónica (cat 2)
  { nombre: 'Smart TV 55" 4K', referencia: 'ELE-001', precio_venta: 2499900, stock: 15, stock_minimo: 3, id_categoria: 2 },
  { nombre: 'Tablet 10" 128GB', referencia: 'ELE-002', precio_venta: 899900, stock: 20, stock_minimo: 5, id_categoria: 2 },
  { nombre: 'Audífonos Bluetooth Pro', referencia: 'ELE-003', precio_venta: 249900, stock: 50, stock_minimo: 10, id_categoria: 2 },
  { nombre: 'Cargador Inalámbrico', referencia: 'ELE-004', precio_venta: 89900, stock: 80, stock_minimo: 15, id_categoria: 2 },
  { nombre: 'Teclado Mecánico RGB', referencia: 'ELE-005', precio_venta: 199900, stock: 35, stock_minimo: 8, id_categoria: 2 },
  { nombre: 'Mouse Gaming 8000DPI', referencia: 'ELE-006', precio_venta: 149900, stock: 40, stock_minimo: 10, id_categoria: 2 },
  { nombre: 'Monitor 27" IPS', referencia: 'ELE-007', precio_venta: 1299900, stock: 12, stock_minimo: 3, id_categoria: 2 },
  { nombre: 'Parlante Bluetooth Portátil', referencia: 'ELE-008', precio_venta: 179900, stock: 45, stock_minimo: 10, id_categoria: 2 },
  { nombre: 'Hub USB-C 7 puertos', referencia: 'ELE-009', precio_venta: 129900, stock: 30, stock_minimo: 8, id_categoria: 2 },
  { nombre: 'Webcam HD 1080p', referencia: 'ELE-010', precio_venta: 159900, stock: 25, stock_minimo: 5, id_categoria: 2 },
  { nombre: 'Router WiFi 6', referencia: 'ELE-011', precio_venta: 349900, stock: 18, stock_minimo: 4, id_categoria: 2 },
  { nombre: 'Disco SSD 1TB', referencia: 'ELE-012', precio_venta: 399900, stock: 22, stock_minimo: 5, id_categoria: 2 },
  { nombre: 'Memoria USB 64GB', referencia: 'ELE-013', precio_venta: 49900, stock: 100, stock_minimo: 20, id_categoria: 2 },
  { nombre: 'Cable HDMI 2m', referencia: 'ELE-014', precio_venta: 29900, stock: 150, stock_minimo: 30, id_categoria: 2 },
  { nombre: 'Adaptador Bluetooth USB', referencia: 'ELE-015', precio_venta: 39900, stock: 60, stock_minimo: 15, id_categoria: 2 },
  { nombre: 'Estabilizador de Voltaje', referencia: 'ELE-016', precio_venta: 89900, stock: 20, stock_minimo: 5, id_categoria: 2 },
  { nombre: 'UPS 600VA', referencia: 'ELE-017', precio_venta: 399900, stock: 8, stock_minimo: 2, id_categoria: 2 },
  { nombre: 'Laptop HP 15.6"', referencia: 'ELE-018', precio_venta: 3499900, stock: 10, stock_minimo: 2, id_categoria: 2 },

  // Periféricos (cat 1)
  { nombre: 'Mouse Pad XXL', referencia: 'PER-001', precio_venta: 59900, stock: 40, stock_minimo: 10, id_categoria: 1 },
  { nombre: 'Soporte Monitor Ajustable', referencia: 'PER-002', precio_venta: 199900, stock: 15, stock_minimo: 4, id_categoria: 1 },
  { nombre: 'Reposapiés Ergonómico', referencia: 'PER-003', precio_venta: 129900, stock: 20, stock_minimo: 5, id_categoria: 1 },
  { nombre: 'Funda para Laptop 15.6"', referencia: 'PER-004', precio_venta: 79900, stock: 30, stock_minimo: 8, id_categoria: 1 },
  { nombre: 'Limpieza Kit Pantallas', referencia: 'PER-005', precio_venta: 29900, stock: 50, stock_minimo: 10, id_categoria: 1 },
  { nombre: 'Organizador de Cables', referencia: 'PER-006', precio_venta: 39900, stock: 60, stock_minimo: 15, id_categoria: 1 },
  { nombre: 'Lámpara LED Escritorio', referencia: 'PER-007', precio_venta: 149900, stock: 25, stock_minimo: 5, id_categoria: 1 },
  { nombre: 'Silla Ergonómica', referencia: 'PER-008', precio_venta: 899900, stock: 8, stock_minimo: 2, id_categoria: 1 },
  { nombre: 'Escritorio Eléctrico', referencia: 'PER-009', precio_venta: 1499900, stock: 5, stock_minimo: 1, id_categoria: 1 },

  // Ropa y Accesorios (cat 3)
  { nombre: 'Camiseta Algodón M', referencia: 'ROP-001', precio_venta: 69900, stock: 80, stock_minimo: 20, id_categoria: 3 },
  { nombre: 'Camiseta Algodón L', referencia: 'ROP-002', precio_venta: 69900, stock: 75, stock_minimo: 20, id_categoria: 3 },
  { nombre: 'Camiseta Algodón S', referencia: 'ROP-003', precio_venta: 69900, stock: 60, stock_minimo: 15, id_categoria: 3 },
  { nombre: 'Pantalón Jean Clásico', referencia: 'ROP-004', precio_venta: 149900, stock: 40, stock_minimo: 10, id_categoria: 3 },
  { nombre: 'Chaqueta Impermeable', referencia: 'ROP-005', precio_venta: 249900, stock: 25, stock_minimo: 5, id_categoria: 3 },
  { nombre: 'Gorra Deportiva', referencia: 'ROP-006', precio_venta: 39900, stock: 100, stock_minimo: 20, id_categoria: 3 },
  { nombre: 'Bufanda Lana', referencia: 'ROP-007', precio_venta: 59900, stock: 35, stock_minimo: 8, id_categoria: 3 },
  { nombre: 'Guantes Térmicos', referencia: 'ROP-008', precio_venta: 49900, stock: 45, stock_minimo: 10, id_categoria: 3 },
  { nombre: 'Medias Algodón Pack x6', referencia: 'ROP-009', precio_venta: 39900, stock: 120, stock_minimo: 30, id_categoria: 3 },
  { nombre: 'Zapatos Deportivos', referencia: 'ROP-010', precio_venta: 299900, stock: 30, stock_minimo: 8, id_categoria: 3 },
  { nombre: 'Cinturón Cuero', referencia: 'ROP-011', precio_venta: 89900, stock: 50, stock_minimo: 10, id_categoria: 3 },
  { nombre: 'Mochila Ejecutiva', referencia: 'ROP-012', precio_venta: 199900, stock: 20, stock_minimo: 5, id_categoria: 3 },
  { nombre: 'Reloj Deportivo Digital', referencia: 'ROP-013', precio_venta: 159900, stock: 30, stock_minimo: 8, id_categoria: 3 },
  { nombre: 'Gafas de Sol Polarizadas', referencia: 'ROP-014', precio_venta: 129900, stock: 40, stock_minimo: 10, id_categoria: 3 },

  // Hogar (cat 4)
  { nombre: 'Set Sartenes Antiadherentes', referencia: 'HOG-001', precio_venta: 199900, stock: 20, stock_minimo: 5, id_categoria: 4 },
  { nombre: 'Olla a Presión 6L', referencia: 'HOG-002', precio_venta: 159900, stock: 15, stock_minimo: 4, id_categoria: 4 },
  { nombre: 'Cafetera Eléctrica', referencia: 'HOG-003', precio_venta: 129900, stock: 25, stock_minimo: 6, id_categoria: 4 },
  { nombre: 'Licuadora 3 Velocidades', referencia: 'HOG-004', precio_venta: 179900, stock: 18, stock_minimo: 5, id_categoria: 4 },
  { nombre: 'Horno Microondas 20L', referencia: 'HOG-005', precio_venta: 399900, stock: 12, stock_minimo: 3, id_categoria: 4 },
  { nombre: 'Aspiradora Ciclónica', referencia: 'HOG-006', precio_venta: 599900, stock: 10, stock_minimo: 2, id_categoria: 4 },
  { nombre: 'Plancha Vapor 1500W', referencia: 'HOG-007', precio_venta: 129900, stock: 22, stock_minimo: 5, id_categoria: 4 },
  { nombre: 'Ventilador Torre 40"', referencia: 'HOG-008', precio_venta: 299900, stock: 15, stock_minimo: 4, id_categoria: 4 },
  { nombre: 'Cortina Blackout 1.5m', referencia: 'HOG-009', precio_venta: 89900, stock: 30, stock_minimo: 8, id_categoria: 4 },
  { nombre: 'Toalla Microfibra Pack x3', referencia: 'HOG-010', precio_venta: 59900, stock: 60, stock_minimo: 15, id_categoria: 4 },
  { nombre: 'Juego Sábanas Queen', referencia: 'HOG-011', precio_venta: 199900, stock: 25, stock_minimo: 6, id_categoria: 4 },
  { nombre: 'Cobertor Edredón 2 plazas', referencia: 'HOG-012', precio_venta: 299900, stock: 18, stock_minimo: 4, id_categoria: 4 },
  { nombre: 'Almohada Viscoelástica', referencia: 'HOG-013', precio_venta: 129900, stock: 35, stock_minimo: 8, id_categoria: 4 },
  { nombre: 'Organizador Cocina 3 piezas', referencia: 'HOG-014', precio_venta: 79900, stock: 40, stock_minimo: 10, id_categoria: 4 },
  { nombre: 'Báscula Digital', referencia: 'HOG-015', precio_venta: 69900, stock: 28, stock_minimo: 7, id_categoria: 4 },
  { nombre: 'Extractor Jugos 500W', referencia: 'HOG-016', precio_venta: 249900, stock: 12, stock_minimo: 3, id_categoria: 4 },

  // Deportes (cat 5)
  { nombre: 'Pelota Fútbol #5', referencia: 'DEP-001', precio_venta: 129900, stock: 40, stock_minimo: 10, id_categoria: 5 },
  { nombre: 'Pelota Baloncesto #7', referencia: 'DEP-002', precio_venta: 149900, stock: 25, stock_minimo: 6, id_categoria: 5 },
  { nombre: 'Raqueta Tenis', referencia: 'DEP-003', precio_venta: 299900, stock: 15, stock_minimo: 4, id_categoria: 5 },
  { nombre: 'Bicicleta Montaña 21v', referencia: 'DEP-004', precio_venta: 1499900, stock: 8, stock_minimo: 2, id_categoria: 5 },
  { nombre: 'Pesas 5kg Par', referencia: 'DEP-005', precio_venta: 89900, stock: 30, stock_minimo: 8, id_categoria: 5 },
  { nombre: 'Esterilla Yoga 6mm', referencia: 'DEP-006', precio_venta: 69900, stock: 35, stock_minimo: 9, id_categoria: 5 },
  { nombre: 'Cuerda Saltar Ajustable', referencia: 'DEP-007', precio_venta: 39900, stock: 50, stock_minimo: 12, id_categoria: 5 },
  { nombre: 'Botella Agua 750ml', referencia: 'DEP-008', precio_venta: 29900, stock: 100, stock_minimo: 25, id_categoria: 5 },
  { nombre: 'Guantes Boxeo 12oz', referencia: 'DEP-009', precio_venta: 199900, stock: 20, stock_minimo: 5, id_categoria: 5 },
  { nombre: 'Patines 4 ruedas Ajustables', referencia: 'DEP-010', precio_venta: 399900, stock: 12, stock_minimo: 3, id_categoria: 5 },
  { nombre: 'Rodilleras Protección Par', referencia: 'DEP-011', precio_venta: 59900, stock: 40, stock_minimo: 10, id_categoria: 5 },
  { nombre: 'Termo Acero 1L', referencia: 'DEP-012', precio_venta: 79900, stock: 45, stock_minimo: 10, id_categoria: 5 },
  { nombre: 'Tenis Running', referencia: 'DEP-013', precio_venta: 399900, stock: 20, stock_minimo: 5, id_categoria: 5 },

  // Alimentos (cat 6)
  { nombre: 'Café Premium 500g', referencia: 'ALI-001', precio_venta: 69900, stock: 60, stock_minimo: 15, id_categoria: 6 },
  { nombre: 'Arroz Integral 1kg', referencia: 'ALI-002', precio_venta: 29900, stock: 100, stock_minimo: 25, id_categoria: 6 },
  { nombre: 'Aceite Oliva Extra 500ml', referencia: 'ALI-003', precio_venta: 59900, stock: 40, stock_minimo: 10, id_categoria: 6 },
  { nombre: 'Miel Pura 350g', referencia: 'ALI-004', precio_venta: 39900, stock: 50, stock_minimo: 12, id_categoria: 6 },
  { nombre: 'Chocolate 70% 200g', referencia: 'ALI-005', precio_venta: 29900, stock: 70, stock_minimo: 15, id_categoria: 6 },
  { nombre: 'Granola Artesanal 500g', referencia: 'ALI-006', precio_venta: 39900, stock: 45, stock_minimo: 10, id_categoria: 6 },
  { nombre: 'Té Verde Caja x30', referencia: 'ALI-007', precio_venta: 24900, stock: 80, stock_minimo: 20, id_categoria: 6 },
  { nombre: 'Frutos Secos Mix 250g', referencia: 'ALI-008', precio_venta: 34900, stock: 55, stock_minimo: 12, id_categoria: 6 },
  { nombre: 'Avena Integral 500g', referencia: 'ALI-009', precio_venta: 19900, stock: 90, stock_minimo: 20, id_categoria: 6 },
  { nombre: 'Salsa Tomate Gourmet 300g', referencia: 'ALI-010', precio_venta: 19900, stock: 65, stock_minimo: 15, id_categoria: 6 },
  { nombre: 'Fideos Integrales 500g', referencia: 'ALI-011', precio_venta: 14900, stock: 85, stock_minimo: 20, id_categoria: 6 },
  { nombre: 'Atún Lata 180g x3', referencia: 'ALI-012', precio_venta: 39900, stock: 75, stock_minimo: 15, id_categoria: 6 },
  { nombre: 'Queso Crema 250g', referencia: 'ALI-013', precio_venta: 24900, stock: 50, stock_minimo: 12, id_categoria: 6 },
  { nombre: 'Leche Almendras 1L', referencia: 'ALI-014', precio_venta: 39900, stock: 40, stock_minimo: 10, id_categoria: 6 },
  { nombre: 'Yogur Griego 500g', referencia: 'ALI-015', precio_venta: 29900, stock: 45, stock_minimo: 10, id_categoria: 6 },
  { nombre: 'Barra Energética Pack x12', referencia: 'ALI-016', precio_venta: 59900, stock: 60, stock_minimo: 15, id_categoria: 6 },
  { nombre: 'Agua Coco 500ml', referencia: 'ALI-017', precio_venta: 14900, stock: 120, stock_minimo: 30, id_categoria: 6 },
  { nombre: 'Jugo Natural 1L', referencia: 'ALI-018', precio_venta: 19900, stock: 80, stock_minimo: 20, id_categoria: 6 },
  // Extras para llegar a 100
  { nombre: 'Cable USB-C 1m', referencia: 'ELE-019', precio_venta: 19900, stock: 200, stock_minimo: 40, id_categoria: 2 },
  { nombre: 'Mouse Inalámbrico', referencia: 'ELE-020', precio_venta: 89900, stock: 35, stock_minimo: 8, id_categoria: 2 },
  { nombre: 'Base Notebook Ajustable', referencia: 'PER-010', precio_venta: 159900, stock: 18, stock_minimo: 4, id_categoria: 1 },
  { nombre: 'Vestido Casual M', referencia: 'ROP-015', precio_venta: 199900, stock: 25, stock_minimo: 6, id_categoria: 3 },
  { nombre: 'Sandalias Verano', referencia: 'ROP-016', precio_venta: 79900, stock: 40, stock_minimo: 10, id_categoria: 3 },
  { nombre: 'Cuchillo Chef 8"', referencia: 'HOG-017', precio_venta: 149900, stock: 20, stock_minimo: 5, id_categoria: 4 },
  { nombre: 'Tabla Picar Bambú', referencia: 'HOG-018', precio_venta: 49900, stock: 35, stock_minimo: 8, id_categoria: 4 },
  { nombre: 'Bandas Elásticas Fitness', referencia: 'DEP-014', precio_venta: 39900, stock: 55, stock_minimo: 12, id_categoria: 5 },
  { nombre: 'Colchoneta Yoga', referencia: 'DEP-015', precio_venta: 129900, stock: 22, stock_minimo: 5, id_categoria: 5 },
  { nombre: 'Cereal Integral 500g', referencia: 'ALI-019', precio_venta: 34900, stock: 70, stock_minimo: 15, id_categoria: 6 },
  { nombre: 'Galletas Avena Pack x12', referencia: 'ALI-020', precio_venta: 24900, stock: 90, stock_minimo: 20, id_categoria: 6 },
];

let token = '';
let created = 0;

function login() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email: 'admin@jyjgestor.com', password: 'Admin1234$' });
    const req = http.request({ hostname: 'localhost', port: 3000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length } }, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => { const j = JSON.parse(body); token = j.token; resolve(); });
    });
    req.write(data);
    req.end();
  });
}

function createProduct(p) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(p);
    const req = http.request({ hostname: 'localhost', port: 3000, path: '/api/productos', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token, 'Content-Length': data.length } }, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => { created++; process.stdout.write(`\r${created}/${productos.length} productos creados`); resolve(); });
    });
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Iniciando sesión...');
  await login();
  console.log(`Token obtenido. Creando ${productos.length} productos...\n`);
  for (const p of productos) {
    await createProduct(p);
  }
  console.log(`\n\n✅ ${created} productos creados exitosamente.`);
}
main();
