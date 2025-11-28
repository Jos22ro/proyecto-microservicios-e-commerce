use axum::{extract::{Path, State}, Json};
use serde::{Deserialize, Serialize};

use crate::autenticacion::UsuarioAutenticado;
use crate::base_datos::RepositorioInventario;
use crate::EstadoAplicacion;

#[derive(Serialize)]
pub struct RespuestaStock {
    pub id_producto: String,
    pub cantidad: i64,
}

#[derive(Deserialize)]
pub struct PeticionCambioStock {
    pub cantidad: i64,
}

pub async fn obtener_stock_producto(
    State(estado): State<EstadoAplicacion>,
    Path(id_producto): Path<String>,
) -> Result<Json<RespuestaStock>, (axum::http::StatusCode, String)> {
    let cantidad = estado
        .repositorio_inventario
        .obtener_cantidad(&id_producto)
        .await
        .map_err(|error| {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Error al consultar stock: {error}"))
        })?;

    Ok(Json(RespuestaStock { id_producto, cantidad }))
}

pub async fn aumentar_stock_producto(
    State(estado): State<EstadoAplicacion>,
    Path(id_producto): Path<String>,
    _usuario: UsuarioAutenticado,
    Json(cuerpo): Json<PeticionCambioStock>,
) -> Result<Json<RespuestaStock>, (axum::http::StatusCode, String)> {
    if cuerpo.cantidad <= 0 {
        return Err((
            axum::http::StatusCode::BAD_REQUEST,
            "La cantidad debe ser mayor que cero".to_string(),
        ));
    }

    let cantidad = estado
        .repositorio_inventario
        .aumentar_stock(&id_producto, cuerpo.cantidad)
        .await
        .map_err(|error| {
            (axum::http::StatusCode::INTERNAL_SERVER_ERROR, format!("Error al aumentar stock: {error}"))
        })?;

    Ok(Json(RespuestaStock { id_producto, cantidad }))
}

pub async fn disminuir_stock_producto(
    State(estado): State<EstadoAplicacion>,
    Path(id_producto): Path<String>,
    _usuario: UsuarioAutenticado,
    Json(cuerpo): Json<PeticionCambioStock>,
) -> Result<Json<RespuestaStock>, (axum::http::StatusCode, String)> {
    if cuerpo.cantidad <= 0 {
        return Err((
            axum::http::StatusCode::BAD_REQUEST,
            "La cantidad restada debe ser mayor que cero".to_string(),
        ));
    }

    let resultado = estado
        .repositorio_inventario
        .disminuir_stock(&id_producto, cuerpo.cantidad)
        .await;

    let cantidad = match resultado {
        Ok(cantidad) => cantidad,
        Err(error) => {
            // Aquí simplificamos: si viene un error por stock negativo, devolvemos 409
            let mensaje = error.to_string();
            if mensaje.contains("Stock negativo") {
                return Err((
                    axum::http::StatusCode::CONFLICT,
                    "No hay stock suficiente para realizar la operación".to_string(),
                ));
            }

            return Err((
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                format!("Error al disminuir stock: {mensaje}"),
            ));
        }
    };

    Ok(Json(RespuestaStock { id_producto, cantidad }))
}
