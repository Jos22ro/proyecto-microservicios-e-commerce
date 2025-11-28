use crate::EstadoAplicacion;
use axum::{
    async_trait,
    extract::{FromRequestParts, State},
    http::{request::Parts, HeaderMap, StatusCode},
};
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use serde::Deserialize;
use std::sync::Arc;

#[derive(Debug, Clone, Deserialize)]
pub struct DatosToken {
    pub sub: String,
    pub correo: Option<String>,
    pub rol: Option<String>,
    pub exp: usize,
}

#[derive(Clone)]
pub struct ClaveJwtCompartida {
    pub clave: Arc<String>,
}

impl ClaveJwtCompartida {
    pub fn desde_entorno() -> Result<Self, String> {
        let valor = std::env::var("JWT_SECRET")
            .map_err(|_| "La variable de entorno JWT_SECRET no está definida".to_string())?;
        Ok(Self { clave: Arc::new(valor) })
    }
}

#[derive(Debug, Clone)]
pub struct UsuarioAutenticado {
    pub id_usuario: String,
    pub correo: Option<String>,
    pub rol: Option<String>,
}

#[async_trait]
impl FromRequestParts<EstadoAplicacion> for UsuarioAutenticado
{
    type Rejection = (StatusCode, String);

    async fn from_request_parts(
        partes: &mut Parts,
        estado: &EstadoAplicacion,
    ) -> Result<Self, Self::Rejection> {
        let encabezados: &HeaderMap = &partes.headers;

        let Some(autorizacion) = encabezados.get(axum::http::header::AUTHORIZATION) else {
            return Err((StatusCode::UNAUTHORIZED, "Falta encabezado Authorization".to_string()));
        };

        let valor = autorizacion
            .to_str()
            .map_err(|_| (StatusCode::BAD_REQUEST, "Encabezado Authorization inválido".to_string()))?;

        if !valor.starts_with("Bearer ") {
            return Err((
                StatusCode::BAD_REQUEST,
                "El encabezado Authorization debe usar el esquema Bearer".to_string(),
            ));
        }

        let token = valor.trim_start_matches("Bearer ").trim();

        let datos = verificar_token(token, &estado.clave_jwt.clave).map_err(|mensaje| {
            (StatusCode::UNAUTHORIZED, format!("Token inválido: {mensaje}"))
        })?;

        Ok(UsuarioAutenticado {
            id_usuario: datos.sub,
            correo: datos.correo,
            rol: datos.rol,
        })
    }
}

fn verificar_token(token: &str, clave: &str) -> Result<DatosToken, String> {
    let clave_decodificacion = DecodingKey::from_secret(clave.as_bytes());
    let mut validacion = Validation::new(Algorithm::HS256);
    validacion.validate_exp = true;

    let datos = decode::<DatosToken>(token, &clave_decodificacion, &validacion)
        .map_err(|error| error.to_string())?;

    Ok(datos.claims)
}
