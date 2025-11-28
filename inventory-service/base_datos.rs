use sqlx::{Pool, Postgres};

#[derive(Clone)]
pub struct RepositorioInventario {
    pub pool_conexiones: Pool<Postgres>,
}

#[derive(Debug, Clone)]
pub struct RegistroInventario {
    pub id_producto: String,
    pub cantidad: i64,
}

impl RepositorioInventario {
    pub fn nuevo(pool_conexiones: Pool<Postgres>) -> Self {
        Self { pool_conexiones }
    }

    pub async fn obtener_cantidad(&self, id_producto: &str) -> Result<i64, sqlx::Error> {
        let registro = sqlx::query!(
            r#"SELECT product_id, quantity FROM inventory WHERE product_id = $1"#,
            id_producto
        )
        .fetch_optional(&self.pool_conexiones)
        .await?;

        Ok(registro.map(|r| r.quantity).unwrap_or(0))
    }

    pub async fn establecer_cantidad(&self, id_producto: &str, nueva_cantidad: i64) -> Result<i64, sqlx::Error> {
        let resultado = sqlx::query!(
            r#"
            INSERT INTO inventory (product_id, quantity)
            VALUES ($1, $2)
            ON CONFLICT (product_id)
            DO UPDATE SET quantity = EXCLUDED.quantity
            RETURNING quantity
            "#,
            id_producto,
            nueva_cantidad
        )
        .fetch_one(&self.pool_conexiones)
        .await?;

        Ok(resultado.quantity)
    }

    pub async fn aumentar_stock(&self, id_producto: &str, aumento: i64) -> Result<i64, sqlx::Error> {
        let cantidad_actual = self.obtener_cantidad(id_producto).await?;
        let nueva_cantidad = cantidad_actual + aumento;
        self.establecer_cantidad(id_producto, nueva_cantidad).await
    }

    pub async fn disminuir_stock(&self, id_producto: &str, disminucion: i64) -> Result<i64, sqlx::Error> {
        let cantidad_actual = self.obtener_cantidad(id_producto).await?;
        let nueva_cantidad = cantidad_actual - disminucion;
        if nueva_cantidad < 0 {
            // Más adelante convertiremos esto en un error de dominio mejor
            return Err(sqlx::Error::Protocol("Stock negativo no permitido".into()));
        }
        self.establecer_cantidad(id_producto, nueva_cantidad).await
    }
}
