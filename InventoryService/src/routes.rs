    use crate::{
        db::Db,
        handlers::{create_order, get_orders, get_order_by_id_handler, get_orders_by_user_id_handler, get_all_stock, get_stock_by_id},
    };
    use axum::{
        routing::get,
        Router,
    };

    pub fn create_router(db: Db) -> Router {
        Router::new()
            .route("/orders", get(get_orders).post(create_order))
            .route("/orders/:order_id", get(get_order_by_id_handler))
            .route("/orders/user/:user_id", get(get_orders_by_user_id_handler))
            .route("/stock", get(get_all_stock))
            .route("/stock/:product_id", get(get_stock_by_id))
            .with_state(db)
    }
