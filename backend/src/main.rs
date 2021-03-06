use actix_files::NamedFile;
use actix_web::{web, App, HttpResponse, HttpServer, Responder, Result, http::header, middleware::Logger};
use serde::{Serialize, Deserialize};
use rusoto_core::{Region, credential::{DefaultCredentialsProvider, ProvideAwsCredentials}};
use rusoto_s3::{GetObjectRequest, PutObjectRequest, util::PreSignedRequest, S3Client, S3};
use dotenv::dotenv;
use std::env;
use actix_cors::Cors;
use log::{info, warn};
use regex::Regex;
use bytes::BytesMut;
use futures::stream::TryStreamExt;

#[derive(Deserialize, Clone)]
struct UploadRequeset {
    file_name: String,
}

#[derive(Serialize)]
struct UploadResponse {
    signed_url: String,
    key: String,
}

async fn get_s3_presign(params: web::Json<UploadRequeset>) -> impl Responder {
    dotenv().ok();

    let bucket = env::var("BUCKET").expect("BUCKET is not found");
    let region = Region::ApNortheast1;
    let key = format!("input/{}", params.file_name.clone());
    let req = PutObjectRequest {
        bucket,
        key: key.clone(),
        ..Default::default()
    };
    let credentials = DefaultCredentialsProvider::new()
            .unwrap()
            .credentials()
            .await
            .unwrap();
    
    let signed_url = req.get_presigned_url(&region, &credentials, &Default::default());
    let response = serde_json::to_string(&UploadResponse { signed_url, key }).unwrap();
    info!("debug! response: {}", response);
    HttpResponse::Ok()
        .content_type("application/json")
        .body(response)
}

#[derive(Deserialize)]
struct GetTranscriptionRequest {
    key: String,
}

async fn get_transcription(info: web::Query<GetTranscriptionRequest>) -> impl Responder {
    dotenv().ok();

    let bucket = env::var("BUCKET").expect("BUCKET is not found");
    let region = Region::ApNortheast1;
    let key = info.key.clone();
    let ext = Regex::new(r"\..+$").unwrap();
    let real_key = key.replace("input", "output");
    let real_real_key = ext.replace(&real_key, ".txt").into_owned();
    let req = GetObjectRequest {
        bucket,
        key: real_real_key,
        ..Default::default()
    };
    let client = S3Client::new(region);
    let result = client.get_object(req).await.expect("Cloudn't GET object");

    let stream = result.body.unwrap();
    let body = stream.map_ok(|b| BytesMut::from(&b[..])).try_concat().await.unwrap();

    // async_read???????????????
    // use tokio::io::AsyncReadExt;
    // let mut stream = result.body.unwrap().into_async_read();
    // let mut body = Vec::new();
    // stream.read_to_end(&mut body).await.unwrap();
    let converted: String = String::from_utf8(body.to_vec()).unwrap();

    warn!("=====BODY=====: {:?}", body);

    let response = serde_json::to_string(&converted).unwrap();
    HttpResponse::Ok()
        .content_type("application/json")
        .body(response)
}

async fn index() -> Result<NamedFile> {
    Ok(NamedFile::open("target/public/index.html")?)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "debug");
    env_logger::init();

    HttpServer::new(|| {
        let cors = Cors::default()
            .allowed_origin_fn(|_origin, _req_head| {
                true
            })
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
            .allowed_headers(vec![header::AUTHORIZATION, header::ACCEPT])
            .allowed_header(header::CONTENT_TYPE)
            .supports_credentials()
            .max_age(3600);

        App::new()
        .wrap(Logger::default())
        .wrap(cors)
        .route("/", web::get().to(index))
        .service(
            web::scope("/api")
                .route("/upload", web::post().to(get_s3_presign))
                .route("/transcription", web::get().to(get_transcription)),
        )
        .service(actix_files::Files::new("", "target/public"))
        .default_service(web::route().to(index))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
