use actix_files;
use actix_web::{web, App, HttpResponse, HttpServer, Responder, Result};

async fn index() -> Result<actix_files::NamedFile> {
    Ok(actix_files::NamedFile::open("target/public/index.html")?)
}

async fn manual_hello() -> impl Responder {
    HttpResponse::Ok().body("Hey there!")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
        .route("/", web::get().to(index))
        .route("/hey", web::get().to(manual_hello))
        .service(actix_files::Files::new("", "target/public"))
        .default_service(web::route().to(index))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
