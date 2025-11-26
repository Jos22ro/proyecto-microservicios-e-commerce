<template>
  <div class="auth-fullscreen">
    <div class="auth-container">
      <div class="auth-form-section">
        <div class="auth-content">
          <div class="auth-header">
            <h1 class="auth-title">Crear Cuenta</h1>
            <p class="auth-subtitle">Gestiona tu inventario profesionalmente</p>
          </div>

          <form @submit.prevent="handleRegister" class="auth-form" novalidate>
            <div class="form-row">
              <div class="form-group">
                <label for="firstName" class="form-label">Nombre</label>
                <input
                  id="firstName"
                  v-model.trim="form.firstName"
                  type="text"
                  class="input-field"
                  :class="{ 'input-error': errors.firstName }"
                  placeholder="Juan"
                  @blur="validateField('firstName')"
                />
                <span v-if="errors.firstName" class="field-error-message">{{
                  errors.firstName
                }}</span>
              </div>

              <div class="form-group">
                <label for="lastName" class="form-label">Apellido</label>
                <input
                  id="lastName"
                  v-model.trim="form.lastName"
                  type="text"
                  class="input-field"
                  :class="{ 'input-error': errors.lastName }"
                  placeholder="Pérez"
                  @blur="validateField('lastName')"
                />
                <span v-if="errors.lastName" class="field-error-message">{{
                  errors.lastName
                }}</span>
              </div>
            </div>

            <div class="form-group">
              <label for="email" class="form-label">Correo Electrónico</label>
              <input
                id="email"
                v-model.trim="form.email"
                type="email"
                class="input-field"
                :class="{ 'input-error': errors.email }"
                placeholder="ejemplo@correo.com"
                @blur="validateField('email')"
              />
              <span v-if="errors.email" class="field-error-message">{{ errors.email }}</span>
            </div>

            <div class="form-group">
              <label for="password" class="form-label">Contraseña</label>
              <input
                id="password"
                v-model.trim="form.password"
                type="password"
                class="input-field"
                :class="{ 'input-error': errors.password }"
                placeholder="Mínimo 6 caracteres"
                @blur="validateField('password')"
              />
              <span v-if="errors.password" class="field-error-message">{{ errors.password }}</span>
            </div>

            <div class="form-group">
              <label for="confirmPassword" class="form-label">Confirmar Contraseña</label>
              <input
                id="confirmPassword"
                v-model.trim="form.confirmPassword"
                type="password"
                class="input-field"
                :class="{ 'input-error': errors.confirmPassword }"
                placeholder="Repite tu contraseña"
                @blur="validateField('confirmPassword')"
              />
              <span v-if="errors.confirmPassword" class="field-error-message">{{
                errors.confirmPassword
              }}</span>
            </div>

            <button type="submit" :disabled="loading || !isFormValid" class="btn-submit">
              <span v-if="loading" class="btn-content">
                <span class="loader"></span>
                Creando cuenta...
              </span>
              <span v-else class="btn-content">Registrarse</span>
            </button>

            <div v-if="error" class="error-message">⚠️ {{ error }}</div>

            <div class="auth-link">
              ¿Ya tienes cuenta?
              <router-link to="/login" class="link">Inicia sesión aquí</router-link>
            </div>
          </form>
        </div>
      </div>

      <div class="auth-hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h2>Empieza a gestionar tu stock hoy mismo</h2>
            <p>
              Crea tu cuenta en segundos y obtén acceso instantáneo a todas las herramientas de
              inventario que necesitas.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Quitamos la importación del logo y LoadingSpinner para simplificar y evitar errores
// Si tienes el logo, puedes descomentar y usarlo.

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const isFormValid = computed(() => {
  // Verificamos que no haya errores y que los campos no estén vacíos
  const noErrors = !Object.values(errors).some((e) => e !== '')
  const allFilled = Object.values(form).every((v) => v !== '')
  return noErrors && allFilled
})

const validateField = (field) => {
  switch (field) {
    case 'firstName':
      errors.firstName = form.firstName ? '' : 'Nombre requerido'
      break
    case 'lastName':
      errors.lastName = form.lastName ? '' : 'Apellido requerido'
      break
    case 'email': {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!form.email) errors.email = 'Correo requerido'
      else if (!emailRegex.test(form.email)) errors.email = 'Correo inválido'
      else errors.email = ''
      break
    }
    case 'password':
      if (!form.password) errors.password = 'Contraseña requerida'
      else if (form.password.length < 6) errors.password = 'Mínimo 6 caracteres'
      else errors.password = ''
      break
    case 'confirmPassword':
      if (!form.confirmPassword) errors.confirmPassword = 'Confirma tu contraseña'
      else if (form.password !== form.confirmPassword)
        errors.confirmPassword = 'Las contraseñas no coinciden'
      else errors.confirmPassword = ''
      break
  }
}

const handleRegister = async () => {
  // Validar todo antes de enviar
  Object.keys(form).forEach((field) => validateField(field))

  // Si hay algún error en el objeto errors, detenemos
  if (Object.values(errors).some((e) => e !== '')) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authStore.register({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
    })
    // Redirigir después de registro exitoso
    router.push('/productos')
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al crear la cuenta.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* --- VARIABLES GLOBALES (Coherencia con Login) --- */
:root {
  --primary-color: #4a90e2;
  --primary-hover: #357abd;
  --error-color: #dc2626;
  --error-bg: #fee2e2;
  --error-border: #fecaca;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --border-focus: #4a90e2;
  --bg-focus: #f9fbff;
  --radius: 12px;
  --shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  --transition: all 0.3s ease;
}

/* --- LAYOUT SPLIT SCREEN --- */
.auth-fullscreen {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
}

/* El auth-container ahora actúa como el grid 1fr 1fr */
.auth-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  height: 100%;
}

/* Sección del formulario (Izquierda) */
.auth-form-section {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 2rem;
  overflow-y: auto;
}

.auth-content {
  width: 100%;
  max-width: 440px;
  padding: 2rem 0;
}

/* Cabecera */
.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.auth-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.auth-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Logo (Si lo usas en el template) */
.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}
.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

/* --- FORMULARIO Y GRUPO DE CAMPOS --- */
.auth-form {
  width: 100%;
}

/* Fila para Nombre y Apellido */
.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 1.5rem;
}

.form-group {
  flex: 1; /* Esto garantiza que los campos en form-row se dividan 50/50 */
  margin-bottom: 1.5rem; /* Ajuste para que el margen esté en form-row y en el grupo normal */
}

/* Ajuste de margen para campos individuales fuera de form-row */
.auth-form > .form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9rem;
}

/* Inputs */
.input-field {
  width: 100%;
  padding: 1rem; /* Más padding para un toque moderno */
  border: 2px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 1rem;
  transition: var(--transition);
  box-sizing: border-box;
  background: white;
}

.input-field:focus {
  outline: none;
  border-color: var(--border-focus);
  background-color: var(--bg-focus);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.input-field.input-error {
  border-color: var(--error-color);
  background-color: var(--error-bg);
}

.field-error-message {
  margin-top: 0.5rem;
  color: var(--error-color);
  font-size: 0.8rem;
  font-weight: 500;
}

/* --- BOTÓN SUBMIT --- */
.btn-submit {
  width: 100%;
  padding: 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  margin-top: 1.5rem; /* Separación del último campo */
  margin-bottom: 1.5rem;
}

.btn-submit:hover:not(:disabled) {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}

.btn-submit:disabled {
  background-color: #f3f4f6; /* Usar un color más suave para disabled */
  color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Loader Animado CSS */
.loader {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* --- FOOTER & ERROR --- */

.auth-link {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.auth-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.auth-link a:hover {
  text-decoration: underline;
}

.error-message {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: var(--error-bg);
  color: var(--error-color);
  border-radius: var(--radius);
  text-align: center;
  font-size: 0.9rem;
  border: 1px solid var(--error-border);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* --- SECCIÓN HERO (DERECHA) --- */
.auth-hero-section {
  position: relative;
  /* Mismo fondo atractivo que el Login */
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Puedes añadir contenido de bienvenida o features aquí si lo deseas. 
   Por ahora, solo mantendremos el fondo visual. */
.auth-hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('tu-imagen-registro.svg') no-repeat center center; /* Reemplaza con una imagen */
  opacity: 0.1;
  background-size: cover;
  z-index: 1;
}

/* --- RESPONSIVIDAD (IMPORTANTE) --- */
@media (max-width: 1024px) {
  .auth-container {
    grid-template-columns: 1fr; /* Una sola columna en tabletas y móviles */
  }

  /* Ocultar la sección hero en dispositivos pequeños */
  .auth-hero-section {
    display: none;
  }

  .auth-form-section {
    padding: 1rem;
  }

  .auth-content {
    padding: 1rem 0;
    max-width: 380px;
  }
}

@media (max-width: 480px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  .form-group {
    margin-bottom: 1rem;
  }
}
</style>
