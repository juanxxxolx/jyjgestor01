import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando base de datos...');

  const hash = await bcrypt.hash('Admin1234$', 12);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@jyjgestor.com' },
    update: {},
    create: { nombre: 'Admin', email: 'admin@jyjgestor.com', password_hash: hash, id_rol: 1 },
  });

  const usuario = await prisma.usuario.upsert({
    where: { email: 'usuario@jyjgestor.com' },
    update: {},
    create: { nombre: 'Usuario', email: 'usuario@jyjgestor.com', password_hash: hash, id_rol: 2 },
  });

  const categoriasNombres = ['Electrónica', 'Ropa y Accesorios', 'Hogar', 'Deportes', 'Alimentos'];
  const categorias: any[] = [];
  for (const nombre of categoriasNombres) {
    let cat = await prisma.categoria.findFirst({ where: { nombre_categoria: nombre } });
    if (!cat) cat = await prisma.categoria.create({ data: { nombre_categoria: nombre } });
    categorias.push(cat);
  }

  const productosNombres = [
    'Smartphone X200', 'Auriculares Bluetooth', 'Cargador USB-C 65W', 'Camiseta Algodón M',
    'Jeans Clásico Azul', 'Lámpara LED Escritorio', 'Set Sartenes Antiadherentes',
    'Pelota Fútbol Profesional', 'Pesa 10kg', 'Café Premium 500g',
    'Tablet 10 pulgadas', 'Mouse Inalámbrico', 'Teclado Mecánico', 'Monitor 24 pulgadas',
    'Disco Duro Externo 1TB', 'Memoria USB 64GB', 'Router WiFi 6', 'Auriculares Gaming',
    'Silla Gamer', 'Escritorio Elevable', 'Monitor Curvo 27"', 'Teclado Inalámbrico',
    'Mouse Pad XL', 'Webcam 1080p', 'Micrófono USB', 'Hub USB 7 puertos',
    'Power Bank 20000mAh', 'Cable HDMI 2m', 'Adaptador USB-C', 'Soporte Monitor',
    'Alfombrilla Ratón', 'Lámpara USB', 'Ventilador Portátil', 'Cargador Inalámbrico',
    'Auriculares Cancelación Ruido', 'Smartwatch', 'Pulsera Actividad', 'Báscula Digital',
    'Termómetro Infrarrojo', 'Purificador Aire', 'Humidificador', 'Difusor Aceites',
    'Cafetera Automática', 'Tostadora', 'Batidora', 'Licuadora', 'Freidora Aire',
    'Horno Microondas', 'Nevera Mini', 'Lavadora Portable', 'Secadora Ropa',
  ];

  const precios = [
    899990, 49990, 29990, 19990, 39990, 34990, 59990, 24990, 44990, 12990,
    499990, 29990, 149990, 399990, 89990, 19990, 149990, 89990, 299990, 149990,
    299990, 14990, 9990, 19990, 12990, 29990, 4990, 24990, 39990, 19990,
    89990, 129990, 99990, 149990, 199990, 129990, 399990, 249990, 89990, 129990,
    199990, 249990, 149990, 89990, 129990, 199990,
  ];

  const stocks = [
    25, 3, 50, 100, 45, 2, 15, 30, 0, 80,
    15, 50, 30, 20, 10, 100, 20, 15, 10, 5,
    25, 40, 60, 30, 50, 20, 15, 40, 25, 30,
    15, 10, 20, 10, 5, 8, 12, 15, 25, 20,
    8, 5, 10, 15, 12, 8, 5, 10, 8, 5,
  ];

  const productosData = [];
  for (let i = 0; i < productosNombres.length; i++) {
    productosData.push({
      nombre: productosNombres[i],
      codigo: String(1000000001 + i),
      precio_venta: precios[i] || 10000,
      stock: stocks[i] || 10,
      stock_minimo: Math.floor((stocks[i] || 10) / 3) + 1,
      id_categoria: categorias[i % categorias.length].id_categoria,
    });
  }

  const productos = [];
  for (const p of productosData) {
    const prod = await prisma.producto.create({ data: p });
    productos.push(prod);
  }

  const nombresClientes = [
    'Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Pedro Ramírez',
    'Laura González', 'Jorge Rodríguez', 'Sofía Hernández', 'Diego Martín', 'Paula Jiménez',
    'Andrés Ruiz', 'Carolina Díaz', 'Fernando Torres', 'Valeria Flores', 'Ricardo Vargas',
    'Gabriela Castro', 'Sergio Morales', 'Andrea Ortiz', 'Miguel Ruiz', 'Natalia Herrera',
    'Pablo Medina', 'Camila Rojas', 'Roberto Silva', 'Daniela Gutiérrez', 'Fernanda Molina',
    'Gonzalo Peña', 'Mariana Soto', 'Sebastián Herrera', 'Lucía Vargas', 'Alejandro Ríos',
    'Isabel Medina', 'Nicolás Torres', 'Fernanda Jiménez', 'Raúl González', 'Daniela Ruiz',
    'Adrián Martínez', 'Constanza López', 'Matías González', 'Javiera Pérez', 'Cristóbal Soto',
    'Antonia Flores', 'Vicente Herrera', 'Emilia Vargas', 'Tomás Medina', 'Francisca Ruiz',
    'Benjamín González', 'Amanda López', 'Lucas Torres', 'Renata Jiménez', 'Emilio Herrera',
  ];

  const clientes = await Promise.all(
    nombresClientes.map((nombre, i) =>
      prisma.cliente.create({
        data: {
          nombre,
          email: `cliente${i + 1}@email.com`,
          telefono: String(900000000 + i),
          direccion: `Dirección ${i + 1}`,
        },
      }),
    ),
  );

  console.log('✅ 50 clientes y 50 productos creados');

  await prisma.movimiento.create({
    data: {
      id_producto: (await prisma.producto.findFirst()).id_producto,
      tipo_movimiento: 'ENTRADA',
      cantidad: 25,
      motivo: 'Compra a proveedor',
      id_usuario: admin.id_usuario,
    },
  });

  console.log('✅ Seed completado');
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());