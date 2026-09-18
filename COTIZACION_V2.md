# COTIZACIÓN DE SOFTWARE

## Sistema de Gestión de Inventario — JYJGestor

**N° Cotización:** JYJ-2026-001
**Fecha de emisión:** 30 de julio de 2026
**Válida hasta:** 30 de agosto de 2026

---

## 1. INFORMACIÓN DEL PROVEEDOR

| Campo | Detalle |
|-------|---------|
| Nombre | [Nombre del desarrollador / empresa] |
| NIT / CC | [NIT o documento] |
| Dirección | [Dirección] |
| Teléfono | [Teléfono] |
| Email | [Correo electrónico] |

## 2. INFORMACIÓN DEL CLIENTE

| Campo | Detalle |
|-------|---------|
| Empresa | [Nombre del cliente] |
| NIT / CC | [NIT] |
| Contacto | [Nombre del contacto] |
| Dirección | [Dirección] |
| Teléfono | [Teléfono] |
| Email | [Correo electrónico] |

---

## 3. ALCANCE DEL PROYECTO

### 3.1 Objetivo

Desarrollar e implementar un sistema web para la gestión integral de inventario, ventas, compras, cotizaciones, cuentas por cobrar y arqueo de caja, permitiendo a la empresa llevar un control en tiempo real de su operación comercial desde cualquier dispositivo con acceso a internet.

### 3.2 Módulos Incluidos

| # | Módulo | Descripción |
|---|--------|-------------|
| 1 | **Dashboard** | Panel principal con indicadores clave: total productos, clientes, alertas de stock bajo, últimos movimientos, gráfico de stock (top 10), gráfico de productos por categoría y movimientos recientes. |
| 2 | **Clientes** | CRUD con gestión de saldos y cuentas por cobrar. Incremento automático de saldo al registrar ventas. |
| 3 | **Productos** | CRUD con subida de imágenes, control de stock mínimo, historial de precios, búsqueda y filtro por categoría. |
| 4 | **Categorías** | Clasificación de productos. CRUD completo. |
| 5 | **Proveedores** | CRUD con NIT, teléfono, email y dirección. |
| 6 | **Compras / Reabastecimiento** | Registro de compras con detalle. Actualización automática de stock y costo unitario. |
| 7 | **Facturación / Ventas** | Carrito con buscador de productos, selección de cliente, PDF de recibo, impresión, anulación con reversión de stock. |
| 8 | **Cotizaciones** | Creación con carrito, conversión a venta. Estados Pendiente / Convertida. |
| 9 | **Cuentas por Cobrar** | Abonos a clientes, reducción automática de saldo. Historial por cliente. |
| 10 | **Arqueo de Caja** | Cierre diario: compara ventas en efectivo vs efectivo declarado. Historial de cierres. |
| 11 | **Existencias / Movimientos** | Historial completo: entradas, salidas, ajustes. |
| 12 | **Reportes** | Exportación a Excel: ventas por fecha, producto, cliente y ventas diarias. |
| 13 | **Usuarios** | CRUD con roles. Registro con aprobación (cuenta inactiva hasta aprobación del admin). |
| 14 | **Auditoría** | Registro automático de todas las acciones con usuario, entidad, acción y fecha. |

### 3.3 Funcionalidades Transversales

- Diseño responsive (móvil, tablet, escritorio)
- Tema claro y oscuro
- Exportación a Excel en todos los módulos
- Búsqueda y filtros en tiempo real
- Notificaciones de stock bajo
- Manejo de errores global
- Mensajes en español

---

## 4. ESPECIFICACIONES TÉCNICAS

### 4.1 Stack Tecnológico

| Componente | Tecnología |
|------------|-----------|
| Frontend | React 18, TypeScript, Vite 5, Ant Design 5 |
| Backend | NestJS 10, TypeScript, Prisma ORM |
| Base de datos | MySQL 8 |
| Autenticación | JWT + Passport.js + bcrypt |
| Gráficos | Recharts |
| Reportes | ExcelJS |

### 4.2 Seguridad

- JWT con expiración a 7 días
- Contraseñas con bcrypt (12 rondas)
- Roles de usuario (Administrador / Usuario)
- Rate limiting: 300 peticiones/minuto por IP
- Helmet (15 cabeceras HTTP de seguridad)
- Validación estricta de entrada (whitelist + forbidNonWhitelisted)
- Contraseñas: mínimo 8 caracteres, mayúscula, minúscula, número, símbolo, sin espacios
- Protección contra XSS e inyección SQL

---

## 5. ESTRUCTURA DE COSTOS

**Tarifa por hora:** $14.500 COP

### 5.1 Inversión Única (Desarrollo)

| Concepto | Horas | Valor (COP) |
|----------|-------|-------------|
| Configuración de infraestructura y base de datos | 16 h | $232.000 |
| Desarrollo del backend (API RESTful, 14 módulos) | 120 h | $1.740.000 |
| Desarrollo del frontend (14 pantallas) | 96 h | $1.392.000 |
| Integración y pruebas | 24 h | $348.000 |
| Documentación técnica | 16 h | $232.000 |
| Despliegue en producción | 8 h | $116.000 |
| **Total** | **280 h** | **$4.060.000** |

### 5.2 Infraestructura Mensual (Producción)

| Concepto | Valor mensual (COP) |
|----------|---------------------|
| Hosting backend + base de datos MySQL | $20.000 |
| Hosting frontend | $0 |
| Dominio (.com.co) | $1.250 |
| **Total** | **~$21.250/mes** |

### 5.3 Mantenimiento Opcional

| Plan | Horas/mes | Valor mensual (COP) |
|------|-----------|---------------------|
| Básico (errores, soporte email, backups semanales) | 4 h | $58.000 |
| Estándar (básico + actualizaciones, soporte telefónico, backups diarios) | 8 h | $116.000 |
| Premium (estándar + nuevas funciones, SLA 24h) | 16 h | $232.000 |

---

## 6. CRONOGRAMA

| Hito | Días | Horas |
|------|------|-------|
| Configuración de infraestructura | 1-2 | 16 h |
| Autenticación y seguridad | 3-5 | 24 h |
| Módulos: Clientes, Productos, Categorías, Proveedores | 6-11 | 48 h |
| Módulos: Ventas, Cotizaciones, Compras | 12-18 | 56 h |
| Módulos: Cuentas por cobrar, Arqueo, Existencias, Reportes | 19-24 | 48 h |
| Módulos: Usuarios, Auditoría | 25-26 | 16 h |
| Integración y pruebas | 27-29 | 24 h |
| Documentación y despliegue | 30 | 8 h |
| **Entrega final** | **30 días** | **240 h** |

---

## 7. CONDICIONES COMERCIALES

### Forma de Pago

| Cuota | % | Valor (COP) | Evento |
|------|---|-------------|--------|
| 1 | 40% | $1.624.000 | Firma del contrato |
| 2 | 30% | $1.218.000 | Avance (día 15) |
| 3 | 30% | $1.218.000 | Entrega final |
| **Total** | **100%** | **$4.060.000** | |

### Términos

- Pago: transferencia o consignación bancaria
- Plazo: 5 días hábiles por cuota
- Propiedad intelectual: se transfiere al 100% del pago
- Capacitación: 2 horas incluidas
- Garantía: 30 días hábiles en errores de funcionamiento
- Mantenimiento: no incluido, se contrata aparte

---

## 8. BENEFICIOS

- Información centralizada en un solo sistema
- Reducción de pérdidas con alertas de stock mínimo
- Automatización de procesos (recibos, stock, reportes)
- Dashboard con indicadores clave y reportes Excel
- Control financiero: cuentas por cobrar y arqueo de caja
- Acceso desde cualquier dispositivo
- Seguridad con autenticación, roles y auditoría
- Sin licencias de terceros

---

## 9. REQUISITOS TÉCNICOS

- Servidor en la nube (~$21.250 COP/mes)
- Internet mínimo 2 Mbps
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Sin instalación de software adicional

---

## 10. RESUMEN

| Concepto | Valor (COP) |
|----------|-------------|
| Desarrollo (280 horas × $14.500/h) | $4.060.000 |
| Infraestructura mensual | ~$21.250/mes |
| Mantenimiento opcional | Desde $58.000/mes |

---

## 11. FIRMAS

| | |
|---|-----|
| **Proveedor** | **Cliente** |
| Nombre: _________________________ | Nombre: _________________________ |
| Cargo: __________________________ | Cargo: __________________________ |
| Firma: __________________________ | Firma: __________________________ |
| Fecha: __________________________ | Fecha: __________________________ |

---

*Documento generado el 30 de julio de 2026. Cotización válida por 30 días calendario.*
