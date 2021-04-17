use actix_files;
use actix_web::{web, App, HttpResponse, HttpServer, Responder, Result};
use serde::{Serialize, Deserialize};
use rusoto_core::{Region, credential::{DefaultCredentialsProvider, ProvideAwsCredentials}};
use rusoto_s3::{PutObjectRequest, util::PreSignedRequest};
use dotenv::dotenv;
use std::env;

#[derive(Deserialize, Clone)]
struct UploadRequeset {
    file_name: String,
}

async fn get_s3_presign(params: web::Json<UploadRequeset>) -> impl Responder {
    dotenv().ok();
    
    let bucket = env::var("BUCKET").expect("BUCKET is not found");
    let region = Region::ApNortheast1;
    let req = PutObjectRequest {
        bucket: bucket,
        key: params.file_name.clone(),
        ..Default::default()
    };
    let credentials = DefaultCredentialsProvider::new()
            .unwrap()
            .credentials()
            .await
            .unwrap();
    
    let signed_url = req.get_presigned_url(&region, &credentials, &Default::default());
    let response = serde_json::to_string(&signed_url).unwrap();
    HttpResponse::Ok()
        .content_type("application/json")
        .body(response)
}

async fn index() -> Result<actix_files::NamedFile> {
    Ok(actix_files::NamedFile::open("target/public/index.html")?)
}

#[derive(Serialize)]
struct SecondData {
    id: i32,
    name: String,
}

#[derive(Serialize)]
struct SecondDataResponse {
    list: Vec<SecondData>,
}

async fn first() -> impl Responder {
    let first_data: Vec<String> = vec!["hoge".to_string(), "huga".to_string(), "piyo".to_string()];
    let first_data_response = serde_json::to_string(&first_data).unwrap();

    HttpResponse::Ok()
        .content_type("application/json")
        .body(first_data_response)
}

async fn second() -> impl Responder {
    let data: Vec<SecondData> = vec![
        SecondData {
            id: 1,
            name: "hoge".to_string(),
        },
        SecondData {
            id: 2,
            name: "huga".to_string(),
        },
        SecondData {
            id: 3,
            name: "piyo".to_string(),
        },
    ];
    let second_data_response = serde_json::to_string(&SecondDataResponse { list: data }).unwrap();

    HttpResponse::Ok()
        .content_type("application/json")
        .body(second_data_response)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
        .route("/", web::get().to(index))
        .service(
            web::scope("/api")
                .route("/first", web::get().to(first))
                .route("/second", web::get().to(second))
                .route("/upload", web::post().to(get_s3_presign)),
        )
        .service(actix_files::Files::new("", "target/public"))
        .default_service(web::route().to(index))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
