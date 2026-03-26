# ITQ Horarios

Sistema web de planificación académica para el Instituto Superior Tecnológico Quito. Permite gestionar periodos, módulos, docentes y asignaturas, y genera horarios académicos mediante una interfaz visual de arrastrar y soltar o asistencia de inteligencia artificial.

---

## Características principales

- Generación de horarios por carrera, módulo, jornada y sede
- Interfaz drag & drop para asignar asignaturas y docentes
- Generación automática de propuestas con IA (Google Gemini)
- Validación en tiempo real de reglas de negocio
- Control de carga horaria por docente con semáforo visual
- Exportación a Excel con 5 hojas (3 módulos + carga semanal + carga total)
- Roles y permisos: Administrador, Coordinador, Docente, Administrativo
- Soporte para múltiples carreras, sedes y paralelos configurables
- Modo oscuro incluido

---

## Stack

| Tecnología | Uso |
|---|---|
| Next.js 14 (App Router) | Framework full-stack |
| TypeScript 5 | Lenguaje |
| PostgreSQL | Base de datos |
| Prisma 5 | ORM |
| NextAuth v5 | Autenticación |
| Tailwind CSS | Estilos |
| ExcelJS | Exportación Excel |
| Google Gemini | Generación de horarios con IA |
| Zod | Validación de esquemas |
| bcryptjs | Hash de contraseñas |

---

## Requisitos

- Node.js 18+
- pnpm 8+
- PostgreSQL 15+ (o cuenta en Supabase)
- API key de Google AI Studio (para la función de IA)

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/RommelJuarez/itq-horarios.git
cd itq-horarios
```

### 2. Instalar dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos PostgreSQL
DATABASE_URL=""

# NextAuth
AUTH_SECRET=
AUTH_URL=

# Google Gemini (opcional — para generación con IA)
GEMINI_API_KEY=
```

### 4. Generar el cliente Prisma

```bash
pnpm prisma generate
```

> La base de datos debe estar ya creada con el script SQL incluido en `docs/schema.sql`.
> No ejecutar `prisma migrate` — las tablas ya existen.

### 5. Arrancar en desarrollo

```bash
pnpm dev
```

---

## Estructura del proyecto

```
├── app/
│   ├── api/                  Endpoints HTTP (IA y exportación Excel)
│   └── dashboard/            Módulos del sistema (protegidos por sesión)
│       ├── horarios/         Generación y edición de horarios
│       ├── docentes/         Gestión de docentes y carga horaria
│       ├── asignaturas/      Gestión de asignaturas por nivel
│       ├── periodos/         Periodos académicos y módulos
│       ├── carreras/         Carreras e información institucional
│       ├── reportes/         Exportación de reportes Excel
│       └── configuracion/    Paralelos, sedes y parámetros
├── components/
│   ├── horarios/             Tabla DnD, panel IA, resumen de carga
│   ├── layout/               Sidebar de navegación
│   └── ui/                   Componentes base reutilizables
├── lib/
│   ├── actions/              Server Actions por entidad
│   ├── ia.ts                 Integración con Google Gemini
│   ├── excel.ts              Generación de archivos Excel
│   └── validaciones.ts       Reglas de negocio RF03–RF05
├── prisma/
│   └── schema.prisma         Modelo de datos
└── docs/
    └── schema.sql            Script SQL de referencia
```

---

## Usuarios por defecto

| Email | Contraseña | Rol |
|---|---|---|
| admin@itq.edu.ec | *(configurar al desplegar)* | ADMIN |

Para establecer la contraseña del administrador, ejecuta en la consola de base de datos:

## Despliegue en Vercel

1. Conecta el repositorio en [vercel.com](https://vercel.com)
2. Agrega las variables de entorno en el panel de Vercel
3. El comando de build ya incluye la generación de Prisma:

```json
"build": "prisma generate && next build"
```

4. Despliega — Vercel detecta Next.js automáticamente

---

## Reglas de negocio principales

- Máximo **3 asignaturas por docente por módulo** (matutina + nocturna combinadas)
- Docentes TC: entre **272h mínimo y 380h máximo** por periodo (3 módulos)
- Docentes MT: entre **136h mínimo y 190h máximo** por periodo
- Sin choques de horario: un docente no puede estar en dos lugares al mismo tiempo
- Horarios fijos — Matutina: `08:00-10:00` y `10:00-12:00` | Nocturna: `18:30-20:00` y `20:00-21:30`
- Los paralelos son configurables por nivel y periodo (A, B, C...)

---

## Licencia

MIT License — Copyright (c) 2026 Rommel Juarez

Consulta el archivo [LICENSE](LICENSE) para más detalles.
