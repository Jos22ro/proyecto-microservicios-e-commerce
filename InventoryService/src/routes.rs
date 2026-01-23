use crate::{
    db::Db,
    handlers::{
        add_stock_handler, create_order, delete_stock_handler, get_all_stock,
        get_order_by_id_handler, get_orders, get_orders_by_user_id_handler, get_stock_by_id,
        update_stock_handler,
    },
};
use axum::{
    routing::{delete, get, post, put},
    Router,
};

pub fn create_router(db: Db) -> Router {
    Router::new()
        .route("/orders", get(get_orders).post(create_order))
        .route("/orders/:order_id", get(get_order_by_id_handler))
        .route("/orders/user/:user_id", get(get_orders_by_user_id_handler))
        .route("/stock", get(get_all_stock).post(add_stock_handler))
        // Agrupamos GET, PUT y DELETE para el ID
        .route(
            "/stock/:product_id",
            get(get_stock_by_id)
                .put(update_stock_handler)
                .delete(delete_stock_handler),
        )
        .with_state(db)
}
