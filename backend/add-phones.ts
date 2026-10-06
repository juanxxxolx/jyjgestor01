import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📱 Agregando teléfonos a clientes existentes...');

  const telefonos: Record<string, string> = {
    'Juan Pérez': '3104567890',
    'María García': '3112345678',
    'Carlos López': '3123456789',
    'Ana Martínez': '3134567890',
    'Pedro Ramírez': '3145678901',
  };

  for (const [nombre, telefono] of Object.entries(telefonos)) {
    const cliente = await prisma.cliente.findFirst({ where: { nombre } });
    if (cliente) {
      await prisma.cliente.update({
        where: { id_cliente: cliente.id_cliente },
        data: { telefono },
      });
      console.log(`✅ ${nombre} → ${telefono}`);
    } else {
      console.log(`⚠️ ${nombre} no encontrado`);
    }
  }

  console.log('✅ Teléfonos agregados');
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());