# 🚀 Arquitectura de Microservicios Políglota

Este proyecto implementa una arquitectura de microservicios utilizando un **enfoque políglota**, donde cada servicio está optimizado usando diferentes tecnologías para su propósito específico. La orquestación y despliegue se gestionan mediante **Docker** y **Docker Compose**.

## 🎯 Servicios del Proyecto

La aplicación se compone de un **Frontend** y múltiples **Microservicios** que interactúan mediante **APIs REST**.

| Servicio | Tecnología Principal | Base de Datos | Responsabilidad |
| :--- | :--- | :--- | :--- |
| **Frontend** | Vue.js 3 + Vite | N/A | Interfaz de Usuario (UI) |
| **Auth Service** | Node.js (Express) | SQL (e.g., PostgreSQL) | Autenticación y Autorización (JWT) |
| **Inventory Service** | Rust (Actix-web) | PostgreSQL | Gestión de stock y unidades |
| **Products Service** | PHP (Laravel/Lumen) | SQL | Gestión de productos y categorías |
| **Orders Service** | Node.js (Express) | MongoDB | Procesamiento y seguimiento de pedidos |

---

## 🏗️ Estructura de la Arquitectura General

El sistema sigue los principios de microservicios, asegurando independencia, escalabilidad y desacoplamiento.

### 1. Comunicación
* **APIs REST:** Todos los servicios exponen puntos finales RESTful para la comunicación.
* **API Gateway (Nginx):** Actúa como el punto de entrada principal, enrutando las peticiones del Frontend a los Microservicios apropiados.

### 2. Base de Datos por Servicio
Cada microservicio es propietario de su propia base de datos (Database per Service pattern), garantizando la máxima autonomía.

### 3. Autenticación
El **Auth Service** centraliza la autenticación, emitiendo y validando **JSON Web Tokens (JWT)** para la autorización a través de los demás servicios.

---

## 📂 Descripción Detallada de la Estructura de Carpetas

### 1. Frontend (Vue.js 3 + Vite)

Proyecto SPA (Single Page Application) construido con Vue 3.

| Directorio | Propósito |
| :--- | :--- |
| `src/api` | Módulos de **Axios** para consumir los microservicios. |
| `src/components` | Componentes reutilizables de la UI. |
| `src/router` | Configuración de rutas (Vue Router). |
| `src/stores` | **Almacenes de estado** de la aplicación (Pinia). |
| `src/views` | Componentes principales que actúan como páginas/vistas. |
| `src/utils` | Funciones auxiliares y configuraciones globales. |
| `Dockerfile` | Define la imagen del contenedor para el frontend. |
| `nginx.conf` | Configuración para servir la aplicación y actuar como API Gateway/Reverse Proxy. |

### 2. Microservicios de Backend

Cada microservicio sigue una estructura modular para separar la lógica.

#### ⚙️ Auth Service (Node.js) & Orders Service (Node.js)

| Directorio | Propósito |
| :--- | :--- |
| `src/controllers` | Contiene la lógica de negocio principal para manejar las peticiones HTTP. |
| `src/models` | Esquemas o modelos de datos (e.g., Mongoose). |
| `src/routes` | Define los *endpoints* de la API. |
| `src/middlewares` | Lógica ejecutada antes o después de los controladores (e.g., validación JWT). |
| `src/services` | Lógica de negocio reusable, separada de los controladores. |

#### 🦀 Inventory Service (Rust Actix-web)

| Directorio | Propósito |
| :--- | :--- |
| `src/handlers` | Equivalente a **Controllers**: maneja las peticiones HTTP. |
| `src/models` | Estructuras de datos (Structs) y lógica de dominio. |
| `src/repositories` | Lógica de acceso directo a la base de datos (SQLx). |
| `src/routes` | Definición de los *endpoints* de la API. |
| `migrations` | Archivos de migración de base de datos. |

#### 🐘 Products Service (PHP Laravel/Lumen)

| Directorio | Propósito |
| :--- | :--- |
| `app/Http/Controllers` | Lógica para manejar las peticiones HTTP. |
| `app/Models` | Modelos de datos (**Eloquent**). |
| `database/migrations` | Archivos de migración de base de datos. |
| `routes` | Definición de los *endpoints* de la API. |

---

## 🐳 Despliegue y Orquestación con Docker

Cada microservicio está preparado para la contención, facilitando el despliegue y la consistencia del entorno.

* **`Dockerfile` (Por Servicio):** Define el proceso para construir la imagen de cada servicio.
* **`docker-compose.yml`:** Archivo principal para orquestar todos los servicios, bases de datos y el API Gateway.
    * Configura **redes aisladas** para la comunicación interna entre contenedores.
    * Define **volúmenes** para la persistencia de datos de las bases de datos.

### ⚙️ Instrucciones de Inicio Rápido

1.  Asegúrate de tener **Docker** y **Docker Compose** instalados.
2.  Clona el repositorio.
3.  Ejecuta el siguiente comando para construir y levantar todos los servicios:
    ```bash
    docker-compose up --build -d
    ```
4.  La aplicación estará accesible a través del puerto configurado por **Nginx (API Gateway)**.
