# JYJGestor - Sistema de Gestión de Inventario

> **Proyecto académico** — Sistema web para gestión de inventario, ventas, compras, cotizaciones, cuentas por cobrar y arqueo de caja.

---

## 📋 Descripción General

JYJGestor es una aplicación web full-stack construida con **NestJS** (backend) + **React** (frontend) + **MySQL** (base de datos) que permite a pequeñas y medianas empresas administrar su inventario, facturación, compras a proveedores, cuentas por cobrar y realizar arqueos de caja diarios.

### Funcionalidades principales

| Módulo | Descripción |
|--------|-------------|
| **Dashboard** | Panel principal con indicadores: ventas del día, productos bajos en stock, total clientes, cuentas por cobrar, gráficos de ventas diarias |
| **Clientes** | CRUD completo, gestión de saldos, cuentas por cobrar con abonos |
| **Productos** | CRUD con subida de imágenes, control de stock mínimo, precios de venta, histórico de precios |
| **Categorías** | Clasificación de productos por categorías |
| **Proveedores** | CRUD de proveedores para compras |
| **Compras / Reabastecimiento** | Registro de compras con detalle, actualización automática de costo unitario y stock |
| **Facturación / Ventas** | Creación de ventas con carrito, selección de cliente, método de pago, PDF de recibo, anulación |
| **Cotizaciones** | Creación y conversión a venta |
| **Cuentas por Cobrar** | Abonos a clientes, control de saldos |
| **Arqueo de Caja** | Cierre diario: compara ventas en efectivo vs efectivo declarado, muestra diferencia |
| **Reportes** | Ventas por fecha, por producto, por cliente, ventas diarias, exportación a Excel |
| **Usuarios** | Administración de usuarios con roles, aprobación de registros |
| **Auditoría** | Registro automático de todas las acciones (crear, editar, eliminar) |
| **Exportación** | Todos los módulos exportan a Excel |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│  localhost:5173                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Ant Design UI  │  React Query  │  React Router DOM   │  │
│  │  Axios (API)    │  AuthContext  │  ThemeContext        │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ Proxy Vite (/api → :3000)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (NestJS)                         │
│  localhost:3000/api                                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  JWT Auth  │  Passport  │  Guards  │  ValidationPipe  │  │
│  │  Helmet    │  Throttler │  RolesGuard                 │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  12 Módulos (Clientes, Productos, Ventas, etc.)       │  │
│  │  Prisma ORM  │  Class-validator │  Audit              │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ Prisma
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  MySQL (Base de Datos)                       │
│  12 tablas: Usuario, Cliente, Producto, Categoria,          │
│  Venta, DetalleVenta, Compra, DetalleCompra, Proveedor,     │
│  Cotizacion, Abono, CierreCaja, Movimiento, AuditoriaLog    │
└─────────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 18, TypeScript, Vite 5, Ant Design 5, React Query 5, React Router DOM 6, Axios |
| **Backend** | NestJS 10, TypeScript, Passport.js, JWT, Prisma ORM |
| **Base de Datos** | MySQL 8 |
| **Seguridad** | bcrypt (12 rondas), Helmet, Rate Limiting (30 req/min), Validación (whitelist + forbidNonWhitelisted) |
| **Reportes** | ExcelJS, PDFKit |
| **Despliegue** | PM2 (ecosystem.config.js) |

---

## 🚀 Instalación y Ejecución

### Requisitos

- Node.js >= 18
- MySQL 8
- npm

### 1. Clonar e instalar dependencias

```bash
git clone <url-del-repo>
cd jyjgestor
npm run install:all
```

### 2. Configurar variables de entorno

```bash
# backend/.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=gestor_inventario_db
PORT=3000
JWT_SECRET=clave_secreta_segura
JWT_EXPIRE=7d
DATABASE_URL=mysql://root:tu_password@localhost:3306/gestor_inventario_db
```

### 3. Inicializar base de datos

```bash
cd backend
npx prisma db push
npx prisma db seed
```

### 4. Ejecutar en desarrollo

```bash
# Terminal 1 - Backend
cd backend && npm run start:dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 5. Acceder

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api

### Usuarios por defecto

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@jyjgestor.com | Admin1234$ | Administrador |
| usuario@jyjgestor.com | Admin1234$ | Usuario |

---

## 📁 Estructura del Proyecto

```
jyjgestor/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Modelo de datos (12 tablas)
│   │   └── seed.ts                # Datos de prueba
│   ├── src/
│   │   ├── main.ts                # Punto de entrada, configuración global
│   │   ├── app.module.ts          # Módulo raíz
│   │   ├── prisma/                # Servicio Prisma (conexión BD)
│   │   ├── auth/                  # Autenticación (JWT, login, registro)
│   │   │   ├── dto/               # DTOs de validación
│   │   │   ├── guards/            # Guards de autenticación
│   │   │   └── strategies/        # Estrategia JWT
│   │   ├── usuarios/              # CRUD de usuarios
│   │   ├── clientes/              # CRUD de clientes
│   │   ├── productos/             # CRUD de productos + subida imágenes
│   │   ├── categorias/            # CRUD de categorías
│   │   ├── proveedores/           # CRUD de proveedores
│   │   ├── ventas/                # Facturación + PDF + anulación
│   │   ├── compras/               # Compras con detalle
│   │   ├── cotizaciones/          # Cotizaciones + conversión a venta
│   │   ├── movimientos/           # Movimientos de inventario
│   │   ├── abonos/                # Abonos / Cuentas por cobrar
│   │   ├── cierres-caja/          # Arqueo de caja
│   │   ├── reportes/              # Reportes y estadísticas
│   │   ├── precios-historicos/    # Historial de precios
│   │   ├── audit/                 # Auditoría de eventos
│   │   └── common/                # Utilidades compartidas
│   └── uploads/                   # Imágenes subidas
├── frontend/
│   └── src/
│       ├── api/                   # Clientes API (Axios)
│       ├── components/            # Componentes compartidos
│       ├── context/               # Contextos (Auth, Theme)
│       ├── pages/                 # Páginas del sistema
│       ├── types/                 # Interfaces TypeScript
│       └── utils/                 # Utilidades
├── ecosystem.config.js            # Configuración PM2
└── package.json                   # Scripts globales
```

---

## 🔒 Seguridad

| Medida | Implementación |
|--------|---------------|
| Contraseñas | Hashing con bcrypt (12 rondas) |
| Autenticación | JWT + Passport.js |
| Autorización | Guards por rol (Admin/Usuario) |
| Validación | class-validator con whitelist + forbidNonWhitelisted |
| Rate Limiting | 30 peticiones/minuto por IP (@nestjs/throttler) |
| Cabeceras HTTP | Helmet (X-Content-Type-Options, HSTS, CSP, etc.) |
| Archivos | Solo imágenes (JPEG, PNG, WebP, GIF), máximo 5MB |
| SQL Injection | Prevenido por Prisma ORM |
| XSS | Prevenido por React (escape automático) |
| Registro | Pendiente de aprobación por admin |

---

## 📊 Modelo de Datos (12 tablas)

| Tabla | Descripción |
|-------|-------------|
| `Usuario` | Usuarios del sistema (admin, usuario) |
| `Cliente` | Clientes con saldo para cuentas por cobrar |
| `Producto` | Productos con stock, precio, imagen, categoría |
| `Categoria` | Categorías de productos |
| `Proveedor` | Proveedores para compras |
| `Venta` | Cabecera de factura/venta |
| `DetalleVenta` | Líneas de detalle de cada venta |
| `Compra` | Cabecera de compra a proveedor |
| `DetalleCompra` | Líneas de detalle de cada compra |
| `Cotizacion` | Cotizaciones convertibles a venta |
| `Abono` | Abonos a cuentas por cobrar de clientes |
| `CierreCaja` | Arqueos de caja diarios |
| `Movimiento` | Movimientos de inventario (entrada/salida) |
| `AuditoriaLog` | Registro de auditoría de acciones |
| `PasswordResetToken` | Tokens de recuperación de contraseña |
| `PrecioHistorico` | Historial de cambios de precios |

---

## 📄 Licencia

Proyecto académico - Universidad
