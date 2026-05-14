# Sistema de Créditos - Gestión de Préstamos

Sistema completo de gestión de préstamos con frontend React y backend FastAPI. Incluye autenticación JWT, roles (USER/ADMIN), PostgreSQL, gestión de cuotas, reportes con gráficos y Docker para despliegue.

## 🚀 Stack Tecnológico

### Frontend
- **React 18** + TypeScript
- **Material-UI** - Componentes UI
- **Vite** - Build tool
- **Zustand** - State management
- **React Router v6** - Navegación
- **Chart.js** - Gráficos
- **Axios** - Cliente HTTP
- **Docker** + Nginx

### Backend
- **FastAPI** + Pydantic v2
- **SQLAlchemy 2** + PostgreSQL 16
- **Alembic** - Migraciones
- **JWT** - Autenticación
- **Docker**

## 🎯 Características

- ✅ **Autenticación JWT** con refresh token
- ✅ **Roles**: USER y ADMIN con permisos diferenciados
- ✅ **Dashboard interactivo** con gráficos y estadísticas
- ✅ **Gestión de préstamos** completa (solicitud, aprobación, seguimiento)
- ✅ **Sistema de cuotas** con registro de pagos
- ✅ **Cuentas bancarias** CRUD para usuarios
- ✅ **Upload de archivos** (comprobantes, documentos)
- ✅ **Reportes** mensuales y semanales
- ✅ **Responsive** - Mobile, tablet y desktop
- ✅ **Docker** - Despliegue con un comando

## 🚀 Inicio Rápido

### Requisitos Previos
- Docker y Docker Compose instalados
- Puertos disponibles: 3000, 8000, 5432, 5050

### Levantar el Sistema Completo

```bash
# 1. Clonar el repositorio
cd "Proyecto Anfi"

# 2. Configurar variables de entorno del backend
cp backendFastApi/.env.example backendFastApi/.env

# 3. Levantar todos los servicios
docker compose up -d

# 4. Esperar a que los servicios estén listos (30-60 segundos)
docker compose ps

# 5. Crear las tablas de la base de datos
docker compose exec backend python -c "from app.db.session import engine; from app.models import *; from app.db.base import Base; Base.metadata.create_all(bind=engine)"

# 6. Crear usuario administrador
docker compose exec backend python -c "
from app.db.session import SessionLocal
from app.models.enums import UserRole
from app.models.user import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
db = SessionLocal()

admin = User(
    first_name='Admin',
    last_name='Sistema',
    email='admin@example.com',
    username='admin',
    hashed_password=pwd_context.hash('admin123'),
    phone='+56900000000',
    document_id='ADMIN-1',
    role=UserRole.ADMIN,
    is_active=True
)
db.add(admin)
db.commit()
print('✅ Admin user created: admin / admin123')
db.close()
"
```

### Acceder al Sistema

Una vez levantados los servicios, accede a:

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Frontend React** | http://localhost:3000 | admin / admin123 |
| **Backend API** | http://localhost:8000 | - |
| **Swagger Docs** | http://localhost:8000/docs | - |
| **PostgreSQL** | localhost:5432 | postgres / postgres |
| **pgAdmin** | http://localhost:5050 | admin@admin.com / admin |

## 📁 Estructura del Proyecto

```
Proyecto Anfi/
├── frontendReact/          # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── layouts/        # Layouts (Sidebar, Header)
│   │   ├── pages/          # Páginas (auth, user, admin)
│   │   ├── services/       # Servicios API
│   │   ├── store/          # Zustand stores
│   │   └── guards/         # Protección de rutas
│   ├── Dockerfile
│   └── nginx.conf
│
├── backendFastApi/         # Backend FastAPI
│   ├── app/
│   │   ├── api/            # Endpoints
│   │   ├── models/         # Modelos SQLAlchemy
│   │   ├── schemas/        # Schemas Pydantic
│   │   ├── services/       # Lógica de negocio
│   │   └── repositories/   # Acceso a datos
│   ├── alembic/            # Migraciones
│   └── Dockerfile
│
└── docker-compose.yml      # Orquestación de servicios
```

## Stack

- FastAPI + Pydantic v2
- SQLAlchemy 2
- PostgreSQL 16
- Alembic
- JWT con `python-jose`
- Passlib/bcrypt para hash de contraseñas
- Docker y Docker Compose

## Estructura

```text
backendFastApi/
├── app/
│   ├── api/
│   ├── core/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── repositories/
│   ├── db/
│   ├── utils/
│   ├── middleware/
│   └── main.py
├── alembic/
├── requirements.txt
├── Dockerfile
├── .env.example
└── README.md
```

## Ejecución con Docker

1. Copiar variables de entorno:

```bash
cp backendFastApi/.env.example backendFastApi/.env
```

2. Ajustar secretos en `backendFastApi/.env`:

```env
SECRET_KEY=change-me-super-secret
REFRESH_SECRET_KEY=change-me-refresh-secret
```

3. Levantar servicios:

```bash
docker compose up --build
```

El backend queda disponible en:

- API: <http://localhost:8000>
- Swagger: <http://localhost:8000/docs>
- Healthcheck: <http://localhost:8000/health>

El contenedor backend ejecuta automáticamente:

```bash
alembic upgrade head
```

## Migraciones

Desde Docker:

```bash
docker compose exec backend alembic upgrade head
```

Crear una nueva migración:

```bash
docker compose exec backend alembic revision --autogenerate -m "descripcion"
```

## Crear primer administrador

El endpoint de creación de usuarios está protegido para administradores. Para crear el primer admin puedes abrir una shell dentro del contenedor y ejecutar un script corto:

```bash
docker compose exec backend python - <<'PY'
from app.db.session import SessionLocal
from app.models.enums import UserRole
from app.repositories.user_repository import create_user
from app.schemas.user import UserCreate

db = SessionLocal()
admin = UserCreate(
    first_name="Admin",
    last_name="Sistema",
    email="admin@example.com",
    username="admin",
    password="Admin12345",
    phone="+56900000000",
    document_id="ADMIN-1",
    role=UserRole.ADMIN,
    is_active=True,
)
create_user(db, admin)
db.close()
PY
```

## Endpoints principales

Base path: `/api/v1`

### Auth

- `POST /auth/login` OAuth2 password form. Retorna access token y refresh token.
- `POST /auth/refresh` renueva tokens.

### Usuarios

- `POST /users` crear usuario. Requiere ADMIN.
- `GET /users` listar usuarios. Requiere ADMIN.
- `GET /users/me` perfil autenticado.
- `GET /users/{user_id}` detalle. Requiere ADMIN.
- `PUT /users/{user_id}` actualizar. Requiere ADMIN.
- `DELETE /users/{user_id}` eliminar. Requiere ADMIN.

### Cuentas bancarias

- `POST /bank-accounts` crear cuenta del usuario autenticado.
- `GET /bank-accounts` listar cuentas propias; ADMIN puede filtrar por `user_id`.
- `GET /bank-accounts/{account_id}` detalle.
- `PUT /bank-accounts/{account_id}` actualizar.
- `DELETE /bank-accounts/{account_id}` eliminar.

### Préstamos

- `POST /loans` crear solicitud con multipart form y uno o muchos archivos.
- `GET /loans` listar préstamos. ADMIN puede filtrar por `status_filter`, `date_from`, `date_to`, `user_id`.
- `GET /loans/{loan_id}` detalle.
- `PATCH /loans/{loan_id}/status` cambiar estado. Requiere ADMIN.
- `POST /loans/{loan_id}/files` agregar archivos.
- `POST /loans/{loan_id}/deposit` registrar depósito, detalle, fecha y comprobante. Requiere ADMIN.

### Cuotas

- `POST /loans/{loan_id}/installments` registrar pago de cuota con comprobante opcional. Requiere ADMIN.
- `GET /loans/{loan_id}/installments` listar cuotas pagadas del préstamo.

### Reportes

- `GET /reports/monthly` reporte mensual.
- `GET /reports/weekly` reporte semanal.
- `GET /reports/dashboard` resumen preparado para dashboard.

## Correos electrónicos

El servicio de correos está desacoplado en `app/services/email_service.py`. Siempre registra una fila en `notifications`. Si `EMAILS_ENABLED=false`, deja la notificación registrada sin intentar SMTP. Para activar envío real:

```env
EMAILS_ENABLED=true
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=usuario
SMTP_PASSWORD=clave
SMTP_TLS=true
```

Eventos implementados:

1. Confirmación cuando el usuario crea un préstamo.
2. Notificación cuando el administrador deposita un préstamo, con detalle y comprobante adjunto si existe.

## Archivos

Los uploads se guardan en `UPLOAD_DIR` (`/app/uploads` en Docker), montado en el volumen persistente `uploaded_files`. Cada archivo se registra en base de datos con nombre original, ruta, tipo MIME y fecha.

## Estados de préstamo

Enum PostgreSQL `loan_status`:

- `SOLICITADO`
- `DEPOSITADO`
- `TERMINADO`

## Seguridad

- JWT access/refresh tokens.
- Passwords hasheadas con bcrypt.
- Dependencias de permisos por rol (`ADMIN`, `USER`).
- Validaciones Pydantic.
- CORS configurable por `.env`.
- Manejo de errores HTTP consistente.
- Logging básico por request.
