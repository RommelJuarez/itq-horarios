# LOGICA-HORARIOS.md — Reglas y objetivos del módulo de horarios

---

## Contexto general

El sistema gestiona la planificación académica del Instituto Superior Tecnológico Quito (ITQ).
La carrera activa es **Desarrollo de Software (DS)**.
Hay **2 periodos académicos por año**, cada uno con **3 módulos**.
Este documento define exactamente cómo funciona el módulo de horarios.

---

## 1. Estructura del Excel que el sistema replica

Cada módulo genera una tabla con estas columnas:

```
FECHA INICIO | FECHA FIN | ASIGNATURA | NIVEL | PARALELO | HORAS | HORARIO | DOCENTE | AULA | OBSERVACIÓN
```

### Reglas de esa tabla:
- Solo se muestran asignaturas de **una sola carrera** (ej: Desarrollo de Software)
- Se divide en **5 niveles** (1 al 5)
- Cada nivel tiene **exactamente 2 asignaturas por módulo** (una por cada bloque horario)
- Los paralelos son configurables: actualmente A y B
- La tabla se **repite por cada sede y modalidad**

---

## 2. Sedes y modalidades

| Sede     | Modalidad  | Jornada  |
|----------|------------|----------|
| Quito    | Presencial | Matutina |
| Quito    | Presencial | Nocturna |
| Conocoto | Presencial | Matutina |

- Quito Matutina y Conocoto tienen su propia tabla separada
- Nocturna es solo una tabla (Quito)
- Cada combinación sede+jornada genera su propia planificación independiente

---

## 3. Horarios fijos por jornada

### Matutina (Lunes a Viernes)
| Bloque | Horario       | Duración |
|--------|---------------|----------|
| 1      | 08:00 - 10:00 | 2 horas  |
| 2      | 10:00 - 12:00 | 2 horas  |

### Nocturna (Lunes a Viernes)
| Bloque | Horario       | Duración |
|--------|---------------|----------|
| 1      | 18:30 - 20:00 | 1.5 horas |
| 2      | 20:00 - 21:30 | 1.5 horas |

**Los horarios son fijos. No se pueden modificar.**

---

## 4. Cálculo de horas

### Horas por módulo
Las horas se calculan así:
- Cada asignación ocupa **1 bloque × 5 días (L-V)**
- Horas por semana = `cantidad_asignaciones_docente × horas_por_bloque × 5`
- Horas totales del módulo = `horas_por_semana × semanas_del_módulo`

### Duración de los módulos (Periodo Marzo-Agosto 2026)
| Módulo | Fechas                    | Semanas | Horas mat. | Horas noc. |
|--------|---------------------------|---------|------------|------------|
| I      | 24 Mar → 17 Abr 2026      | ~4      | 36h        | 27h        |
| II     | 28 Abr → 12 Jun 2026      | ~7      | 64h        | 48h        |
| III    | 23 Jun → 17 Jul 2026      | ~4      | 36h        | 27h        |

### Límites de horas por tipo de docente (por periodo completo = 3 módulos)
| Tipo             | Mínimo | Máximo |
|------------------|--------|--------|
| TC (Tiempo Completo) | 272h | 380h |
| MT (Medio Tiempo)    | 136h | 190h |
| TP (Tiempo Parcial)  | Sin límite fijo |

---

## 5. Reglas de asignación de docentes

### Regla 1 — Máximo 3 asignaturas por módulo
- Un docente puede tener **máximo 3 asignaturas en un módulo**
- Esto cuenta sumando **ambas jornadas** (matutina + nocturna)
- Ejemplo: si tiene 2 en matutina y 1 en nocturna = 3 en total → lleno

### Regla 2 — Sin choques de horario
- Un docente **no puede estar en dos lugares al mismo tiempo**
- Si tiene 08:00-10:00 en un paralelo, no puede tener 08:00-10:00 en otro
- Aplica entre matutina y nocturna también (aunque los horarios son distintos, no se cruzan)

### Regla 3 — Misma asignatura, mismo nivel, mismo paralelo = prohibido
- Un docente **no puede dar la misma materia al mismo nivel y mismo paralelo**
- Sí puede dar la misma materia al mismo nivel pero **distinto paralelo**
  - Ejemplo: dar "Desarrollo Web 1" en Nivel 2 Paralelo A y también en Nivel 2 Paralelo B
  - Eso cuenta como **2 asignaciones** en su contador

### Regla 4 — Asignaturas por nivel
- Cada celda de la tabla corresponde a un nivel específico
- Solo se pueden asignar asignaturas del **mismo nivel** que la celda
- No se puede asignar una asignatura de nivel 3 en una celda de nivel 2

---

## 6. Flujo de la interfaz de horarios

### Selector en cascada — 3 pasos

El usuario elige en este orden (cascade stepper):

**Paso 1 — Módulo**
- Cards con los 3 módulos del periodo activo (I, II, III)
- Cada card muestra: nombre, fechas, estado (En curso / Próximo / Completado)

**Paso 2 — Jornada / Sede** *(aparece al seleccionar módulo)*
- Cards dinámicas: se muestran las sedes+jornadas activas configuradas en Configuración → Sedes
- Ejemplos: Quito Matutina, Quito Nocturna, Conocoto Matutina

**Paso 3 — Carrera** *(aparece al seleccionar jornada)*
- Lista de carreras activas desde la BD

→ Navega a `/dashboard/horarios/[moduloId]?carreraId=X&jornada=Y&sede=Z`

### Vista de tabla editable
La tabla muestra:
- **Columnas:** Nivel/Par. + un bloque por cada horario de la jornada (2 bloques)
- **Filas:** una por cada NivelParalelo activo (N1-A, N1-B, N2-A... N5-B)
- **Celda vacía:** área de drop con borde dashed
- **Celda con contenido:** chip de asignatura + fila de docente

### Panel lateral de drag & drop

**Tab Asignaturas:**
- Chips arrastrables agrupados por nivel con colores:
  - Nivel 1: Rojo · Nivel 2: Azul · Nivel 3: Verde · Nivel 4: Naranja · Nivel 5: Morado
- Solo se puede soltar en celdas del **mismo nivel**

**Tab Docentes:**
- Indicador visual de carga: **3 dots** (sin texto X/3)
  - ○ ○ ○ — Libre (gris)
  - ● ○ ○ — 1 asignación (azul)
  - ● ● ○ — 2 asignaciones (amarillo)
  - ● ● ● — 3 asignaciones, bloqueado (rojo, cursor not-allowed, opacity 0.5)
- Drag & drop hacia celda con asignatura (no hacia celda vacía)
- Validaciones en tiempo real: RF03, RF05, nivel, choque

### Guardar / IA
- Botón **Generar con IA** disponible en cualquier momento
- Las sugerencias aparecen en estado PENDIENTE, editables
- El usuario confirma o ajusta y guarda

---

## 7. Vistas dinámicas de carga horaria

### Vista 1 — Carga semanal
Tabla que muestra por **módulo activo**:

| Docente | Lunes | Martes | Miércoles | Jueves | Viernes | Total/semana |
|---------|-------|--------|-----------|--------|---------|--------------|
| GABRIEL HOYOS | 4h | 4h | 4h | 4h | 4h | 20h |
| KEVIN CHAVEZ  | 4h | 4h | 4h | 4h | 4h | 20h |

- Las horas por día = `asignaciones_del_docente × horas_por_bloque`
- Se repite igual todos los días L-V (no varía por día)
- Total semana = horas/día × 5

### Vista 2 — Carga total por módulos
Tabla que muestra el **acumulado del periodo completo**:

| Docente | Tipo | Módulo I | Módulo II | Módulo III | Total | Estado |
|---------|------|----------|-----------|------------|-------|--------|
| GABRIEL HOYOS | TC | 99h | 176h | 72h | 347h | OK |
| EDUARDO AVILES | TC | 36h | 176h | 27h | 239h | Bajo mínimo |
| ELVIS PACHACAMA | TC | 99h | 128h | 63h | 290h | OK |

**Semáforo de estado:**
- Verde `OK`: cumple mínimo y no supera máximo
- Amarillo `Bajo mínimo`: totalPeriodo < horasMin
- Rojo `Supera máximo`: totalPeriodo > horasMax
- Gris: docente TP sin límites

---

## 8. Exportación Excel (RF06 y RF07)

El sistema debe generar un archivo `.xlsx` con **exactamente 5 hojas**:

### Hoja 1 — Módulo I
Tabla igual al Excel original con columnas:
`FECHA INICIO | FECHA FIN | ASIGNATURA | NIVEL | PARALELO | HORAS | HORARIO | DOCENTE | AULA | OBSERVACIÓN`

Separada por secciones:
- MODALIDAD PRESENCIAL QUITO — MATUTINO
- MODALIDAD PRESENCIAL QUITO — NOCTURNO
- MODALIDAD PRESENCIAL CONOCOTO (si aplica)

### Hoja 2 — Módulo II
Misma estructura que Módulo I

### Hoja 3 — Módulo III
Misma estructura que Módulo I

### Hoja 4 — Carga horaria por módulos
Por cada módulo, tabla con:
`DOCENTE | LUNES | MARTES | MIÉRCOLES | JUEVES | VIERNES | SÁBADO | TOTAL | HORAS TC | HORAS TP | VALOR HORAS`

### Hoja 5 — Carga horaria total
Tabla resumen del periodo completo:
`DOCENTE | MÓDULO 1 | MÓDULO 2 | MÓDULO 3 | TOTAL`
Con indicadores de mínimo (272h TC) y máximo (380h TC)

---

## 9. Configuración de parámetros (RNF01)

Todo debe ser configurable desde la UI sin tocar código:

| Parámetro | Dónde se configura |
|-----------|-------------------|
| Número de paralelos por nivel | Configuración → Paralelos |
| Sedes activas | Configuración → Sedes |
| Horas mínimas/máximas TC | Configuración → Límites de carga |
| Horas mínimas/máximas MT | Configuración → Límites de carga |
| Fechas de módulos | Periodos → Editar módulo |
| Horas matutino/nocturno por módulo | Periodos → Editar módulo |

---

## 10. Reglas de validación — resumen técnico

Estas validaciones se aplican en el backend (actions) Y en la BD (constraints):

| # | Regla | Dónde valida |
|---|-------|-------------|
| RF03 | Máx. 3 asignaturas por docente por módulo | Action + Trigger BD |
| RF04 | TC: 272h mín / 380h máx por periodo | Action |
| RF04 | MT: 136h mín / 190h máx por periodo | Action |
| RF05 | Sin choque de horario mismo docente | Action + UNIQUE BD |
| RF05 | Sin choque de paralelo mismo horario | UNIQUE BD |
| Nivel | Asignatura debe ser del mismo nivel que la celda | Frontend + Action |
| Duplicado | No misma asignatura, nivel y paralelo para mismo docente | Action |

---

## 11. Integración con IA

### Endpoint
```
POST /api/ia/generar-horarios
Body: { moduloId: number }
```

### Qué recibe la IA
- Contexto completo del módulo (fechas, horas)
- Lista de docentes activos con tipo y límites
- Lista de asignaturas por nivel y carrera
- Slots libres disponibles (nivelParaleloId + horario no ocupados)
- Disponibilidad registrada de docentes
- Asignaciones ya existentes (para no sobreescribir)

### Qué devuelve la IA
```json
{
  "asignaciones": [
    {
      "moduloId": 1,
      "docenteId": 3,
      "asignaturaId": 7,
      "nivelParaleloId": 2,
      "horario": "08:00-10:00",
      "jornada": "MATUTINA",
      "estado": "PENDIENTE"
    }
  ],
  "advertencias": ["string"]
}
```

### Comportamiento post-IA
- Las sugerencias se muestran en la tabla con estado `PENDIENTE`
- El usuario puede mover, cambiar o eliminar cualquier celda
- El botón Guardar persiste el estado final

---

## 12. Archivos del módulo de horarios

```
app/dashboard/horarios/
  page.tsx                        ← Selector: carrera + módulo + modalidad
  [moduloId]/
    page.tsx                      ← Tabla principal con tabs de vista

components/horarios/
  types.ts                        ← Tipos e interfaces compartidas
  tabla-horario-dnd.tsx           ← Tabla con drag & drop + modal docente
  panel-ia-dnd.tsx                ← Panel lateral asignaturas/docentes + botón IA
  resumen-carga.tsx               ← Vista semanal y vista por módulos

lib/
  actions/asignaciones.ts         ← CRUD de asignaciones con validaciones
  ia.ts                           ← Prompt y llamada a Anthropic SDK
  excel.ts                        ← Generación de las 5 hojas Excel

app/api/
  ia/generar-horarios/route.ts    ← Endpoint POST para la IA
  exportar/horarios/route.ts      ← Endpoint GET para descarga Excel
```

---

## 13. Lo que NO hace este módulo

---

## 14. Filosofía UI — Canvas style

**Una vista = una responsabilidad.** Sin tarjetas densas con múltiples acciones.

- Listas simples de filas en lugar de grids de cards con muchos datos
- Acciones en contexto: el botón aparece en la fila relevante
- Formularios en páginas propias (no modales con más de 3 campos)
- Feedback inmediato: toast/inline error, sin alert boxes
- Si una sección tiene demasiadas opciones → dividir en vistas o tabs separadas

### Jerarquía: título de sección → lista → detalle

---

## 15. Gestión de sedes

Las sedes son pares **sede + jornada** configurables desde `Configuración → Sedes`.

- Cada sede es una combinación: `{ nombre: "Quito", jornada: "MATUTINA" }`
- Se pueden agregar, activar o desactivar desde la UI
- Las sedes activas alimentan dinámicamente el Paso 2 del selector de horarios
- Los paralelos son independientes por sede+jornada y se pueden incrementar (A, B, C, D...)
- `NivelParalelo` tiene campo `sede: string` que almacena el nombre de la sede

---

## 16. Integración IA — API key

- La API key se lee **siempre** de `process.env.ANTHROPIC_API_KEY` en `lib/ia.ts`
- El `.env` tiene `ANTHROPIC_API_KEY=` listo para completar — **nunca hardcodeada**
- El contexto enviado a la IA es JSON puro construido desde la BD (ver §11)
- Para cambiar de modelo: solo modificar el campo `model:` en `lib/ia.ts`

---

- No modifica los horarios fijos (08:00-10:00, 10:00-12:00, 18:30-20:00, 20:00-21:30)
- No permite asignar asignaturas de otras carreras
- No permite modificar el nivel de un paralelo desde la tabla de horarios
- No calcula variaciones por día (siempre L-V uniforme)
- No gestiona feriados ni excepciones de calendario