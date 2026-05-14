# Frontend React - Sistema de Préstamos

Frontend moderno y profesional para el sistema de gestión de préstamos. Construido con React, TypeScript, Material-UI y preparado para producción con Docker.

## 🚀 Stack Tecnológico

- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool ultrarrápido
- **Material-UI (MUI)** - Componentes UI profesionales
- **React Router v6** - Navegación
- **Zustand** - State management
- **Axios** - Cliente HTTP
- **React Hook Form** - Manejo de formularios
- **Chart.js** - Gráficos y visualizaciones
- **React Dropzone** - Upload de archivos
- **Docker** - Containerización
- **Nginx** - Servidor web en producción

## 📁 Estructura del Proyecto

```
frontendReact/
├── src/
│   ├── components/
│   │   └── shared/          # Componentes reutilizables
│   ├── config/              # Configuración de la app
│   ├── core/
│   │   └── http/            # Axios instance e interceptors
│   ├── guards/              # Protección de rutas
│   ├── layouts/             # Layouts principales
│   ├── models/              # Tipos TypeScript
│   ├── pages/
│   │   ├── auth/            # Login
│   │   ├── user/            # Páginas de usuario
│   │   └── admin/           # Páginas de administrador
│   ├── routes/              # Configuración de rutas
│   ├── services/            # Servicios API
│   ├── store/               # Zustand stores
│   ├── theme/               # Tema Material-UI
│   ├── App.tsx
│   └── main.tsx
├── Dockerfile
├── nginx.conf
└── package.json
```

## 🎯 Características

### Autenticación y Seguridad
- ✅ Login con JWT
- ✅ Refresh token automático
- ✅ Guards de autenticación
- ✅ Guards por roles (USER/ADMIN)
- ✅ Interceptor HTTP para tokens
- ✅ Logout automático en sesión expirada

### Funcionalidades Usuario (USER)
- ✅ Dashboard con estadísticas y gráficos
- ✅ Gestión de perfil
- ✅ CRUD de cuentas bancarias
- ✅ Solicitud de préstamos con simulación
- ✅ Upload de archivos (drag & drop)
- ✅ Listado de préstamos
- ✅ Detalle de préstamo con historial
- ✅ Cambio de contraseña

### Funcionalidades Administrador (ADMIN)
- ✅ Dashboard administrativo con reportes
- ✅ Gestión de usuarios (CRUD)
- ✅ Gestión de solicitudes de préstamos
- ✅ Aprobación/Rechazo de préstamos
- ✅ Registro de depósitos con comprobantes
- ✅ Gestión de cuotas y pagos
- ✅ Reportes mensuales con gráficos
- ✅ Filtros avanzados

### UX/UI
- ✅ Diseño moderno y profesional
- ✅ Responsive (mobile, tablet, desktop)
- ✅ Sidebar dinámico por rol
- ✅ Notificaciones toast
- ✅ Loading states
- ✅ Empty states
- ✅ Confirmaciones de acciones
- ✅ Manejo de errores elegante

## 🛠️ Desarrollo Local

### Requisitos
- Node.js 18+
- npm o yarn

### Instalación

```bash
# Clonar e instalar dependencias
cd frontendReact
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env con la URL del backend
# VITE_API_URL=http://localhost:8000

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: http://localhost:3000

### Scripts Disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run preview    # Preview del build
npm run lint       # Linter
```

## 🐳 Docker

### Build y ejecución con Docker

```bash
# Build de la imagen
docker build -t sistema-creditos-frontend .

# Ejecutar contenedor
docker run -p 3000:80 sistema-creditos-frontend
```

### Docker Compose (Recomendado)

Desde la raíz del proyecto:

```bash
# Levantar todos los servicios
docker compose up --build

# Solo frontend
docker compose up frontend

# Detener servicios
docker compose down
```

## 🌐 Servicios Disponibles

Cuando ejecutas `docker compose up`:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432
- **pgAdmin**: http://localhost:5050
  - Email: admin@admin.com
  - Password: admin

## 🔐 Credenciales de Prueba

Debes crear un usuario administrador en el backend primero. Ver README del backend.

```bash
# Usuario de ejemplo
Username: admin
Password: Admin12345
```

## 📊 Rutas de la Aplicación

### Públicas
- `/login` - Inicio de sesión

### Usuario (USER)
- `/user/dashboard` - Dashboard del usuario
- `/profile` - Perfil personal
- `/bank-accounts` - Cuentas bancarias
- `/loans/request` - Solicitar préstamo
- `/loans` - Mis préstamos
- `/loans/:id` - Detalle de préstamo

### Administrador (ADMIN)
- `/admin/dashboard` - Dashboard administrativo
- `/admin/users` - Gestión de usuarios
- `/admin/requests` - Solicitudes de préstamos
- `/admin/installments` - Gestión de cuotas
- `/admin/reports` - Reportes y estadísticas

## 🎨 Personalización del Tema

El tema se puede personalizar en `src/theme/theme.ts`:

```typescript
export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Cambiar color primario
    },
    // ...
  },
});
```

## 🔧 Configuración de Producción

### Variables de Entorno

```env
VITE_API_URL=https://api.tudominio.com
```

### Nginx

La configuración de nginx está en `nginx.conf`. Incluye:
- Compresión gzip
- Proxy reverso al backend
- Soporte para SPA (Single Page Application)
- Headers de seguridad

## 📦 Build de Producción

```bash
npm run build
```

Los archivos optimizados se generan en `dist/`:
- HTML, CSS, JS minificados
- Assets optimizados
- Source maps
- Lazy loading de rutas

## 🧪 Testing

```bash
# Ejecutar tests (cuando se implementen)
npm run test
```

## 🚀 Deployment

### Con Docker

```bash
docker build -t sistema-creditos-frontend .
docker push tu-registry/sistema-creditos-frontend
```

### Manual

```bash
npm run build
# Copiar carpeta dist/ a tu servidor
# Configurar nginx para servir los archivos estáticos
```

## 📝 Notas Importantes

1. **CORS**: El backend debe tener configurado CORS para permitir peticiones desde el frontend
2. **API URL**: Asegúrate de configurar correctamente `VITE_API_URL` en producción
3. **Tokens**: Los tokens JWT se almacenan en localStorage mediante Zustand persist
4. **Archivos**: Los uploads se envían como FormData al backend
5. **Refresh Token**: Se maneja automáticamente en el interceptor de Axios

## 🐛 Troubleshooting

### El frontend no se conecta al backend
- Verifica que `VITE_API_URL` esté correctamente configurado
- Revisa que el backend esté corriendo
- Verifica CORS en el backend

### Error de autenticación
- Limpia localStorage: `localStorage.clear()`
- Verifica que el token no haya expirado
- Revisa las credenciales

### Problemas con Docker
- Limpia imágenes: `docker compose down -v`
- Rebuild: `docker compose up --build`
- Verifica logs: `docker compose logs frontend`

## 📄 Licencia

Este proyecto es parte del Sistema de Créditos desarrollado con FastAPI + React.

## 👥 Contribución

Para contribuir al proyecto:
1. Crea una rama feature
2. Realiza tus cambios
3. Asegúrate de que el código pase el linter
4. Crea un Pull Request

## 📞 Soporte

Para problemas o preguntas, contacta al equipo de desarrollo.
