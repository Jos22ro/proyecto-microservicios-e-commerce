<template>
  <div class="login-fullscreen">
    <div class="login-container">
      <div class="login-form-section">
        <div class="login-content">
          <div class="login-header">
            <div class="logo">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="8" fill="#4a90e2" />
                <path d="M20 12L26 18H22V28H18V18H14L20 12Z" fill="white" />
              </svg>
              <span class="logo-text">MiApp</span>
            </div>
            <h1 class="login-title">Bienvenido de nuevo</h1>
            <p class="login-subtitle">Ingresa a tu cuenta para continuar</p>
          </div>

          <form @submit.prevent="handleLogin" class="login-form" novalidate>
            <div class="form-group">
              <label for="email" class="form-label"> Correo Electrónico </label>
              <input
                id="email"
                v-model.trim="email"
                type="email"
                required
                placeholder="ejemplo@correo.com"
                class="input-field"
                :class="{ 'input-error': emailError }"
                autocomplete="email"
                @blur="validateEmail"
              />
              <div v-if="emailError" class="field-error-message">
                {{ emailError }}
              </div>
            </div>

            <div class="form-group">
              <div class="password-label-container">
                <label for="password" class="form-label"> Contraseña </label>
                <router-link to="/recuperar" class="forgot-password"
                  >¿Olvidaste tu contraseña?</router-link
                >
              </div>
              <input
                id="password"
                v-model.trim="password"
                type="password"
                required
                placeholder="••••••••"
                class="input-field"
                :class="{ 'input-error': passwordError }"
                autocomplete="current-password"
                @blur="validatePassword"
              />
              <div v-if="passwordError" class="field-error-message">
                {{ passwordError }}
              </div>
            </div>

            <div class="form-options">
              <label class="checkbox-container">
                <input type="checkbox" v-model="rememberMe" />
                <span class="checkmark"></span>
                Recordar mis datos
              </label>
            </div>

            <button
              type="submit"
              :disabled="loading || !isFormValid"
              class="btn-submit"
              :class="{ 'btn-loading': loading }"
            >
              <span v-if="loading" class="btn-content">
                <span class="loader"></span>
                Iniciando sesión...
              </span>
              <span v-else class="btn-content"> Iniciar Sesión </span>
            </button>

            <div class="login-divider">
              <span>o continúa con</span>
            </div>

            <div class="social-login">
              <button type="button" class="social-btn google-btn">
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path
                    fill="#4285F4"
                    d="M16.51 7.55H9v3.48h4.28c-.38 1.97-1.89 3.48-4.28 3.48-2.47 0-4.47-2-4.47-4.48s2-4.48 4.47-4.48c1.12 0 2.14.42 2.91 1.11l2.17-2.17C13.24 2.2 11.32 1.5 9 1.5 4.86 1.5 1.5 4.86 1.5 9s3.36 7.5 7.5 7.5c4.14 0 6.75-2.9 6.75-6.9 0-.46-.05-.91-.15-1.35z"
                  />
                </svg>
                Google
              </button>
              <button type="button" class="social-btn github-btn">
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path
                    fill="currentColor"
                    d="M9 1.5a7.5 7.5 0 0 0-2.37 14.6c.375.075.5-.15.5-.35 0-.175-.012-.65-.012-1.2-1.875.375-2.375-.45-2.525-.9-.075-.2-.4-.9-.675-1.075-.225-.125-.55-.425-.012-.425.5-.012.875.45 1 .65.6 1.025 1.55.875 1.925.675.075-.425.225-.875.425-1.075-1.5-.175-3-.75-3-3.375 0-.75.275-1.375.725-1.85-.075-.175-.325-.9.075-1.875 0 0 .6-.175 1.925.75.575-.175 1.175-.25 1.775-.25s1.2.075 1.775.25c1.325-.925 1.925-.75 1.925-.75.4.975.15 1.7.075 1.875.45.475.725 1.1.725 1.85 0 2.625-1.525 3.2-3 3.375.225.2.45.6.45 1.2 0 .875-.012 1.575-.012 1.8 0 .2.125.425.5.35A7.5 7.5 0 0 0 9 1.5z"
                  />
                </svg>
                GitHub
              </button>
            </div>

            <div class="signup-link">
              ¿No tienes una cuenta? <router-link to="/registro">Regístrate ahora</router-link>
            </div>

            <div v-if="error" class="error-message">
              <span class="error-icon">⚠️</span>
              {{ error }}
            </div>
          </form>
        </div>
      </div>

      <div class="login-hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h2>Potencia tu productividad</h2>
            <p>
              Accede a todas las herramientas que necesitas para optimizar tu flujo de trabajo y
              alcanzar tus objetivos.
            </p>
          </div>
          <div class="hero-features">
            <div class="feature">
              <div class="feature-icon">⚡</div>
              <div class="feature-text">
                <h3>Rápido y eficiente</h3>
                <p>Interfaz optimizada para máxima velocidad</p>
              </div>
            </div>
            <div class="feature">
              <div class="feature-icon">🔒</div>
              <div class="feature-text">
                <h3>Seguro y confiable</h3>
                <p>Tus datos están protegidos con encriptación</p>
              </div>
            </div>
            <div class="feature">
              <div class="feature-icon">🚀</div>
              <div class="feature-text">
                <h3>Potentes funciones</h3>
                <p>Todo lo que necesitas en un solo lugar</p>
              </div>
            </div>
          </div>
        </div>
        <div class="hero-background">
          <div class="floating-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router' // Importación correcta
import { useAuthStore } from '@/stores/auth'

// Inicializa el router (Declaración ÚNICA)
const router = useRouter()

// Reactive data
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const emailError = ref('')
const passwordError = ref('')
const rememberMe = ref(false)

// La línea duplicada fue eliminada:
// const router = useRouter(); // <--- ESTO CAUSABA EL ERROR DE RE-DECLARACIÓN

// Store
const authStore = useAuthStore()

// Computed properties
const isFormValid = computed(() => {
  // Sólo es válido si no hay errores Y ambos campos principales tienen valor
  return email.value && password.value && !emailError.value && !passwordError.value
})

// Validation functions (Ya incluidas en el código que enviaste)
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email.value) {
    emailError.value = 'El correo electrónico es obligatorio'
  } else if (!emailRegex.test(email.value)) {
    emailError.value = 'Por favor, introduce un correo electrónico válido'
  } else {
    emailError.value = ''
  }
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = 'La contraseña es obligatoria'
  } else if (password.value.length < 6) {
    passwordError.value = 'La contraseña debe tener al menos 6 caracteres'
  } else {
    passwordError.value = ''
  }
}

// Main login function (Ya incluida en el código que enviaste)
const handleLogin = async () => {
  validateEmail()
  validatePassword()

  if (!isFormValid.value) {
    error.value = 'Por favor, corrige los errores en el formulario'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await authStore.login({
      email: email.value,
      password: password.value,
      rememberMe: rememberMe.value,
    })
    // Navegar a la página principal después de un login exitoso
    router.push('/')
  } catch (err) {
    if (err.response?.status === 401) {
      error.value = 'Credenciales incorrectas. Verifica tu email y contraseña.'
    } else if (err.response?.status >= 500) {
      error.value = 'Error del servidor. Por favor, intenta más tarde.'
    } else if (err.request) {
      error.value = 'Error de conexión. Verifica tu conexión a internet.'
    } else {
      error.value = 'Ha ocurrido un error inesperado.'
    }

    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* --- VARIABLES --- */
:root {
  --primary-color: #4a90e2;
  --primary-hover: #357abd;
  --error-color: #dc2626;
  --error-bg: #fee2e2;
  --error-border: #fecaca;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --border-color: #e5e7eb;
  --border-focus: #4a90e2;
  --bg-focus: #f9fbff;
  --disabled-bg: #f3f4f6;
  --disabled-text: #9ca3af;
  --shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  --radius: 12px;
  --transition: all 0.3s ease;
}

/* --- LAYOUT SPLIT SCREEN --- */
.login-fullscreen {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.login-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100vh;
  width: 100%;
}

/* Sección del formulario (Izquierda) */
.login-form-section {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 2rem;
  overflow-y: auto;
}

.login-content {
  width: 100%;
  max-width: 440px;
  padding: 2rem 0;
}

/* Logo y header */
.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.login-header {
  margin-bottom: 2.5rem;
}

.login-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.login-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* --- FORMULARIO & INPUTS --- */
.login-form {
  width: 100%;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9rem;
}

.password-label-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
}

.input-field {
  width: 100%;
  padding: 1rem;
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

/* Checkbox (Recordarme) */
.form-options {
  margin-bottom: 1.5rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.checkbox-container input {
  /* Oculta el checkbox nativo */
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  flex-shrink: 0;
}

.checkbox-container input:checked + .checkmark {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.checkbox-container input:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 12px;
  font-weight: bold;
}

/* --- BOTONES & ACCIONES --- */
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
  margin-bottom: 1.5rem;
}

.btn-submit:hover:not(:disabled) {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}

.btn-submit:disabled {
  background-color: var(--disabled-bg);
  color: var(--disabled-text);
  cursor: not-allowed;
  transform: none;
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Divisor */
.login-divider {
  text-align: center;
  position: relative;
  margin: 2rem 0;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.login-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border-color);
  z-index: 1;
}

.login-divider span {
  background: white;
  padding: 0 1rem;
  position: relative;
  z-index: 2; /* Asegura que el texto esté sobre la línea */
}

/* Login social */
.social-login {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.875rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius);
  background: white;
  color: var(--text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.social-btn:hover {
  border-color: var(--primary-color);
}

/* Enlace de registro */
.signup-link {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.signup-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

/* Mensaje de error */
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
.login-hero-section {
  position: relative;
  /* Degradado principal */
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content {
  position: relative;
  z-index: 2;
  color: white;
  max-width: 500px;
  padding: 2rem;
}

.hero-text h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-text p {
  font-size: 1.125rem;
  opacity: 0.9;
  line-height: 1.6;
  margin-bottom: 3rem;
}

.hero-features {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.feature {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.feature-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.feature-text h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.feature-text p {
  font-size: 0.9rem;
  opacity: 0.8;
  margin: 0;
}

/* Fondo animado (Formas flotantes) */
.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 100px;
  height: 100px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

/* --- ANIMACIONES --- */
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* Loader */
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

/* --- RESPONSIVIDAD --- */
@media (max-width: 1024px) {
  .login-container {
    grid-template-columns: 1fr;
  }

  /* Ocultar la sección hero en dispositivos pequeños */
  .login-hero-section {
    display: none;
  }

  .login-form-section {
    padding: 1rem;
  }

  .login-content {
    padding: 1rem 0;
    max-width: 380px;
  }
}
</style>
