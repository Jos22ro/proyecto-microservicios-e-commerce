<template>
  <div class="user-dashboard">
    <!-- Barra de navegación del usuario -->
    <nav class="user-navbar">
      <div class="nav-brand">
        <h2>Sistema de Inventario</h2>
        <span class="user-role">Usuario</span>
      </div>
      <div class="nav-user">
        <span>{{ userName }}</span>
        <button @click="logout" class="logout-btn">Cerrar Sesión</button>
      </div>
    </nav>

    <div class="dashboard-container">
      <!-- Sidebar del usuario -->
      <aside class="sidebar">
        <ul class="menu">
          <li 
            :class="{ active: activeSection === 'inventory' }" 
            @click="activeSection = 'inventory'"
          >
            📦 Inventario
          </li>
          <li 
            :class="{ active: activeSection === 'requests' }" 
            @click="activeSection = 'requests'"
          >
            📋 Mis Solicitudes
          </li>
          <li 
            :class="{ active: activeSection === 'profile' }" 
            @click="activeSection = 'profile'"
          >
            👤 Mi Perfil
          </li>
        </ul>
      </aside>

      <!-- Contenido principal -->
      <main class="main-content">
        <!-- Inventario (Vista por defecto) -->
        <div v-if="activeSection === 'inventory'" class="inventory-section">
          <div class="section-header">
            <h3>Inventario Disponible</h3>
            <div class="search-filter">
              <input 
                v-model="searchTerm" 
                placeholder="Buscar items..." 
                class="search-input"
              >
              <select v-model="categoryFilter" class="category-select">
                <option value="">Todas las categorías</option>
                <option v-for="cat in categories" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
            </div>
          </div>

          <!-- Tarjetas de items -->
          <div class="inventory-grid">
            <div 
              v-for="item in filteredItems" 
              :key="item.id" 
              class="item-card"
              :class="{ 'low-stock': item.stock <= item.min_stock }"
            >
              <div class="item-header">
                <h4>{{ item.name }}</h4>
                <span class="item-category">{{ item.category }}</span>
              </div>
              
              <div class="item-details">
                <p>{{ item.description }}</p>
                <div class="stock-info">
                  <span>Stock: {{ item.stock }}</span>
                  <span v-if="item.stock <= item.min_stock" class="low-stock-alert">
                    ¡Stock bajo!
                  </span>
                </div>
                <div class="item-location">
                  <small>📍 {{ item.location }}</small>
                </div>
              </div>

              <div class="item-actions">
                <button 
                  @click="openRequestModal(item)"
                  :disabled="item.stock === 0"
                  class="request-btn"
                  :class="{ disabled: item.stock === 0 }"
                >
                  {{ item.stock === 0 ? 'Agotado' : 'Solicitar' }}
                </button>
              </div>
            </div>
          </div>

          <div v-if="filteredItems.length === 0" class="no-items">
            No se encontraron items con los filtros seleccionados.
          </div>
        </div>

        <!-- Mis Solicitudes -->
        <div v-if="activeSection === 'requests'" class="requests-section">
          <h3>Mis Solicitudes</h3>
          
          <div class="requests-tabs">
            <button 
              @click="requestFilter = 'all'"
              :class="{ active: requestFilter === 'all' }"
            >
              Todas
            </button>
            <button 
              @click="requestFilter = 'pending'"
              :class="{ active: requestFilter === 'pending' }"
            >
              Pendientes
            </button>
            <button 
              @click="requestFilter = 'approved'"
              :class="{ active: requestFilter === 'approved' }"
            >
              Aprobadas
            </button>
            <button 
              @click="requestFilter = 'rejected'"
              :class="{ active: requestFilter === 'rejected' }"
            >
              Rechazadas
            </button>
          </div>

          <div class="requests-list">
            <div 
              v-for="request in filteredRequests" 
              :key="request.id"
              class="request-card"
              :class="request.status"
            >
              <div class="request-header">
                <h4>{{ request.item_name }}</h4>
                <span class="request-status" :class="request.status">
                  {{ getStatusText(request.status) }}
                </span>
              </div>
              
              <div class="request-details">
                <p><strong>Cantidad:</strong> {{ request.quantity }}</p>
                <p><strong>Fecha:</strong> {{ formatDate(request.created_at) }}</p>
                <p><strong>Motivo:</strong> {{ request.reason }}</p>
                
                <div v-if="request.admin_notes" class="admin-notes">
                  <strong>Notas del administrador:</strong>
                  <p>{{ request.admin_notes }}</p>
                </div>
              </div>
              
              <div v-if="request.status === 'pending'" class="request-actions">
                <button @click="cancelRequest(request.id)" class="cancel-btn">
                  Cancelar Solicitud
                </button>
              </div>
            </div>
            
            <div v-if="filteredRequests.length === 0" class="no-requests">
              No hay solicitudes {{ getRequestFilterText() }}.
            </div>
          </div>
          
          <button @click="openRequestModal(null)" class="new-request-btn">
            + Nueva Solicitud
          </button>
        </div>

        <!-- Perfil del Usuario -->
        <div v-if="activeSection === 'profile'" class="profile-section">
          <h3>Mi Perfil</h3>
          
          <div class="profile-card">
            <div class="profile-header">
              <div class="avatar">
                {{ getUserInitials() }}
              </div>
              <h4>{{ userName }}</h4>
              <span class="user-email">{{ userEmail }}</span>
            </div>
            
            <div class="profile-info">
              <div class="info-item">
                <label>Departamento:</label>
                <span>{{ userProfile.department || 'No especificado' }}</span>
              </div>
              <div class="info-item">
                <label>Teléfono:</label>
                <span>{{ userProfile.phone || 'No especificado' }}</span>
              </div>
              <div class="info-item">
                <label>Fecha de registro:</label>
                <span>{{ formatDate(userProfile.created_at) }}</span>
              </div>
            </div>
            
            <div class="profile-stats">
              <div class="stat">
                <span class="stat-value">{{ userStats.totalRequests }}</span>
                <span class="stat-label">Solicitudes totales</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ userStats.approvedRequests }}</span>
                <span class="stat-label">Aprobadas</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ userStats.pendingRequests }}</span>
                <span class="stat-label">Pendientes</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Modal para solicitar items -->
    <div v-if="showRequestModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Solicitar {{ selectedItem?.name || 'Item' }}</h3>
          <button @click="closeRequestModal" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div v-if="selectedItem" class="item-summary">
            <p><strong>Disponible:</strong> {{ selectedItem.stock }} unidades</p>
          </div>
          
          <div class="form-group">
            <label>Cantidad *</label>
            <input 
              type="number" 
              v-model="requestForm.quantity"
              :max="selectedItem?.stock || 100"
              min="1"
              class="form-input"
            >
          </div>
          
          <div class="form-group">
            <label>Motivo de la solicitud *</label>
            <textarea 
              v-model="requestForm.reason"
              placeholder="Explica por qué necesitas este item..."
              rows="4"
              class="form-textarea"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>Fecha necesaria</label>
            <input 
              type="date" 
              v-model="requestForm.needed_date"
              class="form-input"
            >
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeRequestModal" class="btn-secondary">
            Cancelar
          </button>
          <button @click="submitRequest" class="btn-primary">
            Enviar Solicitud
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserDashboard',
  data() {
    return {
      activeSection: 'inventory',
      searchTerm: '',
      categoryFilter: '',
      showRequestModal: false,
      selectedItem: null,
      requestFilter: 'all',
      requestForm: {
        quantity: 1,
        reason: '',
        needed_date: ''
      },
      userProfile: {
        name: 'Juan Pérez',
        email: 'juan.perez@empresa.com',
        department: 'Ventas',
        phone: '+52 55 1234 5678',
        created_at: '2024-01-15'
      },
      userStats: {
        totalRequests: 12,
        approvedRequests: 8,
        pendingRequests: 2
      },
      // Datos de ejemplo - reemplazar con tu API
      inventoryItems: [
        {
          id: 1,
          name: 'Laptop Dell XPS',
          category: 'Electrónica',
          description: 'Laptop de 15 pulgadas, 16GB RAM, 512GB SSD',
          stock: 5,
          min_stock: 2,
          location: 'Almacén A'
        },
        {
          id: 2,
          name: 'Monitor 24"',
          category: 'Electrónica',
          description: 'Monitor Full HD',
          stock: 10,
          min_stock: 3,
          location: 'Almacén B'
        },
        {
          id: 3,
          name: 'Silla Ergonómica',
          category: 'Mobiliario',
          description: 'Silla de oficina ergonómica',
          stock: 3,
          min_stock: 2,
          location: 'Almacén C'
        }
      ],
      userRequests: [
        {
          id: 1,
          item_id: 1,
          item_name: 'Laptop Dell XPS',
          quantity: 1,
          reason: 'Para nuevo empleado',
          status: 'approved',
          created_at: '2024-03-15',
          admin_notes: 'Entregado el 2024-03-16'
        },
        {
          id: 2,
          item_id: 3,
          item_name: 'Silla Ergonómica',
          quantity: 1,
          reason: 'Reemplazo de silla dañada',
          status: 'pending',
          created_at: '2024-03-18'
        }
      ]
    }
  },
  computed: {
    userName() {
      return this.userProfile.name;
    },
    userEmail() {
      return this.userProfile.email;
    },
    categories() {
      return [...new Set(this.inventoryItems.map(item => item.category))];
    },
    filteredItems() {
      return this.inventoryItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            item.description.toLowerCase().includes(this.searchTerm.toLowerCase());
        const matchesCategory = !this.categoryFilter || item.category === this.categoryFilter;
        return matchesSearch && matchesCategory;
      });
    },
    filteredRequests() {
      if (this.requestFilter === 'all') return this.userRequests;
      return this.userRequests.filter(req => req.status === this.requestFilter);
    }
  },
  methods: {
    openRequestModal(item) {
      if (item && item.stock === 0) return;
      this.selectedItem = item;
      this.requestForm = {
        quantity: 1,
        reason: '',
        needed_date: ''
      };
      this.showRequestModal = true;
    },
    closeRequestModal() {
      this.showRequestModal = false;
      this.selectedItem = null;
    },
    async submitRequest() {
      if (!this.requestForm.quantity || !this.requestForm.reason) {
        alert('Por favor completa todos los campos obligatorios');
        return;
      }

      try {
        // Aquí iría la llamada a tu API
        const newRequest = {
          id: Date.now(),
          item_id: this.selectedItem?.id || null,
          item_name: this.selectedItem?.name || 'Item General',
          quantity: this.requestForm.quantity,
          reason: this.requestForm.reason,
          status: 'pending',
          created_at: new Date().toISOString().split('T')[0],
          needed_date: this.requestForm.needed_date
        };

        this.userRequests.unshift(newRequest);
        this.closeRequestModal();
        alert('Solicitud enviada exitosamente');
        
        // Cambiar a la vista de solicitudes
        this.activeSection = 'requests';
        this.requestFilter = 'pending';
      } catch (error) {
        console.error('Error al enviar solicitud:', error);
        alert('Error al enviar la solicitud');
      }
    },
    async cancelRequest(requestId) {
      if (!confirm('¿Estás seguro de cancelar esta solicitud?')) return;

      try {
        // Aquí iría la llamada a tu API
        const index = this.userRequests.findIndex(req => req.id === requestId);
        if (index !== -1) {
          this.userRequests[index].status = 'cancelled';
        }
      } catch (error) {
        console.error('Error al cancelar solicitud:', error);
        alert('Error al cancelar la solicitud');
      }
    },
    logout() {
      // Implementar lógica de logout
      localStorage.removeItem('userToken');
      this.$router.push('/login');
    },
    getStatusText(status) {
      const statusMap = {
        pending: 'Pendiente',
        approved: 'Aprobado',
        rejected: 'Rechazado',
        cancelled: 'Cancelado'
      };
      return statusMap[status] || status;
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('es-ES');
    },
    getRequestFilterText() {
      const filterMap = {
        all: '',
        pending: 'pendientes',
        approved: 'aprobadas',
        rejected: 'rechazadas'
      };
      return filterMap[this.requestFilter];
    },
    getUserInitials() {
      return this.userName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
  }
}
</script>

<style scoped>
.user-dashboard {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.user-navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-role {
  background: rgba(255,255,255,0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logout-btn {
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: rgba(255,255,255,0.2);
}

.dashboard-container {
  display: flex;
  min-height: calc(100vh - 70px);
}

.sidebar {
  width: 250px;
  background: white;
  padding: 2rem 1rem;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
}

.menu {
  list-style: none;
  padding: 0;
}

.menu li {
  padding: 1rem;
  margin: 0.5rem 0;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.menu li:hover {
  background: #f0f2f5;
}

.menu li.active {
  background: #667eea;
  color: white;
}

.main-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-filter {
  display: flex;
  gap: 1rem;
}

.search-input, .category-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 0.9rem;
}

.inventory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.item-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
}

.item-card.low-stock {
  border-left: 4px solid #f56565;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.item-category {
  background: #e2e8f0;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.75rem;
  color: #4a5568;
}

.item-details {
  margin-bottom: 1rem;
}

.stock-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.5rem 0;
}

.low-stock-alert {
  color: #f56565;
  font-weight: bold;
  font-size: 0.875rem;
}

.item-actions {
  display: flex;
  justify-content: flex-end;
}

.request-btn {
  background: #48bb78;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.request-btn:hover:not(.disabled) {
  background: #38a169;
}

.request-btn.disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.requests-tabs {
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
}

.requests-tabs button {
  padding: 0.5rem 1.5rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.requests-tabs button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.request-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  border-left: 4px solid #ddd;
}

.request-card.pending {
  border-left-color: #f6ad55;
}

.request-card.approved {
  border-left-color: #48bb78;
}

.request-card.rejected {
  border-left-color: #f56565;
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.request-status {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: bold;
}

.request-status.pending {
  background: #fef3c7;
  color: #d97706;
}

.request-status.approved {
  background: #d1fae5;
  color: #059669;
}

.request-status.rejected {
  background: #fee2e2;
  color: #dc2626;
}

.request-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.cancel-btn {
  background: #fed7d7;
  color: #c53030;
  border: 1px solid #fc8181;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: #feb2b2;
}

.new-request-btn {
  margin-top: 2rem;
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}

.profile-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.profile-header {
  text-align: center;
  margin-bottom: 2rem;
}

.avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 auto 1rem;
}

.profile-info {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-item label {
  font-weight: 600;
  color: #4a5568;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  text-align: center;
}

.stat {
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 0.875rem;
  color: #718096;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.form-textarea {
  resize: vertical;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a67d8;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.no-items, .no-requests {
  text-align: center;
  padding: 3rem;
  color: #718096;
  font-style: italic;
}

@media (max-width: 768px) {
  .dashboard-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    padding: 1rem;
  }
  
  .menu {
    display: flex;
    overflow-x: auto;
  }
  
  .menu li {
    white-space: nowrap;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-filter {
    flex-direction: column;
  }
  
  .inventory-grid {
    grid-template-columns: 1fr;
  }
}
</style>