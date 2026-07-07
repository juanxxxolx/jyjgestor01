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

  const productosData = [
    { nombre: 'Smartphone X200', referencia: 'ELE-001', precio_venta: 899.99, stock: 25, stock_minimo: 5, id_categoria: 1 },
    { nombre: 'Auriculares Bluetooth', referencia: 'ELE-002', precio_venta: 49.99, stock: 3, stock_minimo: 10, id_categoria: 1 },
    { nombre: 'Cargador USB-C 65W', referencia: 'ELE-003', precio_venta: 29.99, stock: 50, stock_minimo: 10, id_categoria: 1 },
    { nombre: 'Camiseta Algodón M', referencia: 'ROP-001', precio_venta: 19.99, stock: 100, stock_minimo: 20, id_categoria: 2 },
    { nombre: 'Jeans Clásico Azul', referencia: 'ROP-002', precio_venta: 39.99, stock: 45, stock_minimo: 10, id_categoria: 2 },
    { nombre: 'Lámpara LED Escritorio', referencia: 'HOG-001', precio_venta: 34.99, stock: 2, stock_minimo: 8, id_categoria: 3 },
    { nombre: 'Set Sartenes Antiadherentes', referencia: 'HOG-002', precio_venta: 59.99, stock: 15, stock_minimo: 5, id_categoria: 3 },
    { nombre: 'Pelota Fútbol Profesional', referencia: 'DEP-001', precio_venta: 24.99, stock: 30, stock_minimo: 10, id_categoria: 4 },
    { nombre: 'Pesa 10kg', referencia: 'DEP-002', precio_venta: 44.99, stock: 0, stock_minimo: 5, id_categoria: 4 },
    { nombre: 'Café Premium 500g', referencia: 'ALI-001', precio_venta: 12.99, stock: 80, stock_minimo: 20, id_categoria: 5 },
  ];

  const productos = [];
  for (const p of productosData) {
    const prod = await prisma.producto.create({ data: p });
    productos.push(prod);
  }

  const clientes = await Promise.all(
    ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Pedro Ramírez'].map((nombre) =>
      prisma.cliente.create({ data: { nombre } }),
    ),
  );

  await prisma.movimiento.create({
    data: {
      id_producto: productos[0].id_producto,
      tipo_movimiento: 'ENTRADA',
      cantidad: 25,
      motivo: 'Compra a proveedor',
      id_usuario: admin.id_usuario,
    },
  });

  await prisma.movimiento.create({
    data: {
      id_producto: productos[1].id_producto,
      tipo_movimiento: 'ENTRADA',
      cantidad: 20,
      motivo: 'Compra a proveedor',
      id_usuario: admin.id_usuario,
    },
  });

  await prisma.movimiento.create({
    data: {
      id_producto: productos[0].id_producto,
      tipo_movimiento: 'SALIDA',
      cantidad: 5,
      motivo: 'Venta #1',
      id_usuario: admin.id_usuario,
      id_cliente: clientes[0].id_cliente,
    },
  });

  const venta = await prisma.venta.create({
    data: {
      id_usuario: admin.id_usuario,
      id_cliente: clientes[0].id_cliente,
      total: 89.97,
      detalle: {
        create: [
          { id_producto: productos[3].id_producto, cantidad: 3, precio_unitario: 19.99, subtotal: 59.97 },
          { id_producto: productos[9].id_producto, cantidad: 2, precio_unitario: 12.99, subtotal: 25.98 },
        ],
      },
    },
  });

  await prisma.movimiento.create({
    data: {
      id_producto: productos[3].id_producto,
      tipo_movimiento: 'SALIDA',
      cantidad: 3,
      motivo: `Venta #${venta.id_venta}`,
      id_usuario: admin.id_usuario,
      id_cliente: clientes[0].id_cliente,
    },
  });

  await prisma.movimiento.create({
    data: {
      id_producto: productos[9].id_producto,
      tipo_movimiento: 'SALIDA',
      cantidad: 2,
      motivo: `Venta #${venta.id_venta}`,
      id_usuario: admin.id_usuario,
      id_cliente: clientes[0].id_cliente,
    },
  });

  await prisma.producto.update({ where: { id_producto: productos[3].id_producto }, data: { stock: { decrement: 3 } } });
  await prisma.producto.update({ where: { id_producto: productos[9].id_producto }, data: { stock: { decrement: 2 } } });

  console.log('✅ Seed completado');
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
