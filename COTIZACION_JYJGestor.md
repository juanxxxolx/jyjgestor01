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
| Sitio web | [Sitio web] |

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
| 1 | **Dashboard** | Panel principal con indicadores clave: total de productos, clientes, alertas de stock bajo, últimos movimientos, gráfico de stock por producto (top 10), gráfico de productos por categoría y tabla de movimientos recientes. |
| 2 | **Clientes** | Registro, consulta, edición y eliminación de clientes. Gestión de saldos y cuentas por cobrar. Incremento automático de saldo al registrar ventas. |
| 3 | **Productos** | Registro, consulta, edición y eliminación de productos. Subida de imágenes (JPEG, PNG, WebP, GIF), control de stock mínimo, precio de venta, asociación a categoría, historial de precios. Búsqueda por nombre y filtro por categoría. |
| 4 | **Categorías** | Clasificación de productos por categorías. CRUD completo. |
| 5 | **Proveedores** | Registro de proveedores con nombre, NIT, teléfono, email y dirección. CRUD completo. |
| 6 | **Compras / Reabastecimiento** | Registro de compras a proveedores con detalle de productos, cantidades y costos unitarios. Actualización automática del stock y costo unitario del producto. Historial de compras. |
| 7 | **Facturación / Ventas** | Carrito de compras con buscador de productos por nombre, selección de cliente (opcional), múltiples líneas con cantidad y precio. Cálculo automático de subtotales y total. Generación de recibo en PDF, impresión y anulación de ventas con reversión de stock. |
| 8 | **Cotizaciones / Presupuestos** | Creación de cotizaciones con carrito de productos y selección de cliente. Conversión a venta que descuenta automáticamente del stock. Historial con estados Pendiente y Convertida. |
| 9 | **Cuentas por Cobrar** | Registro de abonos a clientes. Reducción automática del saldo pendiente. Historial de abonos por cliente. |
| 10 | **Arqueo de Caja** | Cierre diario de caja: compara el total de ventas en efectivo del día contra el efectivo declarado por el usuario y calcula la diferencia. Historial completo de cierres anteriores. |
| 11 | **Existencias / Movimientos** | Visibilidad de todos los movimientos de inventario: entradas por compras, salidas por ventas, ajustes. Historial con producto, tipo de movimiento, cantidad, cliente asociado, motivo y fecha. |
| 12 | **Reportes** | Exportación a Excel de: ventas por fecha, ventas por producto, ventas por cliente y ventas diarias. Filtros por rango de fechas en todos los reportes. |
| 13 | **Usuarios** | Administración de usuarios del sistema con roles (Administrador / Usuario). Registro con aprobación: las cuentas nuevas se crean inactivas y requieren aprobación manual del administrador. Tabla de usuarios pendientes con botones Aprobar y Rechazar. |
| 14 | **Auditoría** | Registro automático de todas las acciones del sistema: creación, actualización y eliminación de registros, con usuario responsable, entidad afectada, tipo de acción y fecha. |

### 3.3 Funcionalidades Transversales

- Diseño responsive adaptado a dispositivos móviles, tablets y escritorio
- Tema claro y oscuro con persistencia de preferencia
- Exportación a Excel en todos los módulos
- Búsqueda y filtros en tiempo real en todas las tablas
- Paginación en todas las tablas con navegación
- Notificaciones de stock bajo con badge en el menú y modal de detalle desde el Dashboard
- Mensajes de error descriptivos en español
- Manejo de errores global con Error Boundary

---

## 4. ESPECIFICACIONES TÉCNICAS

### 4.1 Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| Frontend | React | 18.x |
| Lenguaje Frontend | TypeScript | 5.x |
| Bundler | Vite | 5.x |
| UI Kit | Ant Design | 5.x |
| Gráficos | Recharts | 2.x |
| Peticiones HTTP | Axios + React Query | 5.x |
| Backend | NestJS | 10.x |
| Lenguaje Backend | TypeScript | 5.x |
| ORM | Prisma | 5.x |
| Autenticación | JWT + Passport.js | — |
| Encriptación | bcrypt | 12 rondas |
| Base de Datos | MySQL | 8.x |
| Reportes | ExcelJS | — |

### 4.2 Seguridad

| Medida | Implementación |
|--------|---------------|
| Autenticación | JWT con expiración a 7 días |
| Contraseñas | Hash con bcrypt (12 rondas de sal) |
| Autorización | Guards por rol (Administrador / Usuario) |
| Rate Limiting | 300 peticiones por minuto por IP |
| Cabeceras HTTP | Helmet (15 cabeceras de seguridad) |
| Validación de entrada | class-validator con whitelist + forbidNonWhitelisted |
| Validación de contraseñas | Mín. 8 caracteres, mayúscula, minúscula, número, símbolo, sin espacios |
| Validación de email | Formato con @ y dominio válido, sin espacios |
| Protección XSS | React (escape automático de HTML) |
| Inyección SQL | Prevenido por Prisma ORM |
| Subida de archivos | Solo imágenes, validación de tipo MIME |

---

## 5. ESTRUCTURA DE COSTOS

### 5.1 Inversión Única (Desarrollo)

| Concepto | Valor (COP) |
|----------|------------|
| Configuración de infraestructura y base de datos (2 días) | $500.000 |
| Desarrollo del backend (API RESTful, 14 módulos) (15 días) | $3.750.000 |
| Desarrollo del frontend (interfaz de usuario, 14 pantallas) (12 días) | $3.000.000 |
| Integración y pruebas (3 días) | $600.000 |
| Documentación técnica y manual de usuario (2 días) | $400.000 |
| Despliegue en producción y configuración (1 día) | $300.000 |
| **Total inversión única** | **$8.550.000** |

*Precios expresados en pesos colombianos (COP). Incluye IVA.*

### 5.2 Costos de Infraestructura Mensual (Producción)

| Concepto | Valor mensual (USD) | Valor mensual (COP aprox.) |
|----------|--------------------|--------------------------|
| Hosting backend + base de datos MySQL (Railway) | $5 USD | $20.000 |
| Hosting frontend (Vercel) | $0 USD | $0 |
| Dominio (.com.co) | $1.25 USD/mes ($15/año) | $5.000 |
| **Total mensual** | **~$6.25 USD** | **~$25.000** |

### 5.3 Mantenimiento y Soporte (Opcional)

| Plan | Incluye | Valor mensual (COP) |
|------|---------|--------------------|
| **Básico** | Corrección de errores, soporte por email, uptime monitoring, backups semanales | $250.000 |
| **Estándar** | Todo lo del plan Básico + actualizaciones menores, soporte telefónico, backups diarios | $450.000 |
| **Premium** | Todo lo del plan Estándar + nuevas funcionalidades (hasta 8 horas/mes), SLA 24h | $800.000 |

---

## 6. CRONOGRAMA DE ENTREGA

| Hito | Fecha estimada | Duración |
|------|---------------|----------|
| Firma del contrato y anticipo | Día 1 | — |
| Configuración de infraestructura | Día 1-2 | 2 días |
| Modelado de base de datos | Día 3-4 | 2 días |
| Módulo de autenticación y seguridad | Día 5-7 | 3 días |
| Módulos funcionales (Clientes, Productos, Categorías, Proveedores) | Día 8-13 | 6 días |
| Módulos de ventas, cotizaciones y compras | Día 14-19 | 6 días |
| Módulos de cuentas por cobrar, arqueo de caja, existencias y reportes | Día 20-24 | 5 días |
| Módulos administrativos (Usuarios, Auditoría) | Día 25-26 | 2 días |
| Integración, pruebas y correcciones | Día 27-29 | 3 días |
| Documentación y despliegue | Día 30 | 1 día |
| **Entrega final** | **Día 30** | **30 días hábiles (~6 semanas)** |

---

## 7. CONDICIONES COMERCIALES

### 7.1 Forma de Pago

| Cuota | Porcentaje | Valor (COP) | Evento |
|------|-----------|-------------|--------|
| 1 | 40% | $3.420.000 | Firma del contrato |
| 2 | 30% | $2.565.000 | Entrega de avance (módulos funcionales listos, día 15) |
| 3 | 30% | $2.565.000 | Entrega final y aceptación del sistema |
| **Total** | **100%** | **$8.550.000** | — |

### 7.2 Términos y Condiciones

- **Forma de pago:** Transferencia electrónica o consignación bancaria.
- **Plazo de pago:** Cada cuota debe cancelarse dentro de los 5 días hábiles siguientes a la fecha de facturación.
- **Propiedad intelectual:** El código fuente y los derechos de propiedad intelectual del software serán transferidos al cliente una vez cancelado el 100% del valor del proyecto.
- **Capacitación:** Se incluye una sesión de capacitación de 2 horas para los usuarios del sistema (vía remota o presencial).
- **Garantía:** 30 días hábiles de garantía sobre errores de funcionamiento posteriores a la entrega final.
- **Soporte post-entrega:** El plan de mantenimiento no está incluido en la inversión única y debe contratarse por separado (ver punto 5.3).
- **Incumplimiento:** En caso de retraso en los pagos, el desarrollo se suspenderá hasta recibir el pago correspondiente.

---

## 8. BENEFICIOS DEL SISTEMA

- ✅ **Centralización de la información:** Todos los datos de inventario, ventas y clientes en un solo lugar.
- ✅ **Reducción de pérdidas por inventario:** Control de stock mínimo y alertas tempranas.
- ✅ **Ahorro de tiempo:** Automatización de procesos manuales (generación de recibos, actualización de stock, reportes).
- ✅ **Toma de decisiones:** Dashboard con indicadores clave y reportes exportables a Excel.
- ✅ **Control financiero:** Cuentas por cobrar, arqueo de caja y auditoría de acciones.
- ✅ **Acceso desde cualquier lugar:** Sistema web responsive, funciona en celular, tablet y computador.
- ✅ **Seguridad:** Autenticación robusta, roles de usuario y registro de auditoría.
- ✅ **Sin costos de licencias:** Software de desarrollo propio, sin pagos recurrentes por licencias de terceros.

---

## 9. REQUERIMIENTOS TÉCNICOS DEL CLIENTE

Para el correcto funcionamiento del sistema, el cliente debe contar con:

- **Servidor:** Un equipo o servicio en la nube con acceso a internet (puede ser contratado mensualmente por ~$5 USD).
- **Conexión a internet:** Mínimo 2 Mbps de descarga (funciona con conexiones lentas).
- **Navegadores compatibles:** Google Chrome, Mozilla Firefox, Microsoft Edge, Safari (versiones actualizadas).
- **Dispositivos:** Computador, tablet o smartphone con acceso a internet.

El sistema no requiere instalación de software adicional en los equipos de los usuarios, solo un navegador web moderno.

---

## 10. FIRMAS

| | |
|---|-----|
| **Proveedor** | **Cliente** |
| | |
| Nombre: _________________________ | Nombre: _________________________ |
| Cargo: __________________________ | Cargo: __________________________ |
| Firma: __________________________ | Firma: __________________________ |
| Fecha: __________________________ | Fecha: __________________________ |

---

*Documento generado el 30 de julio de 2026. Cotización válida por 30 días calendario.*

**Fin del documento**
