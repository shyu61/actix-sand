FROM rust:1.51.0

WORKDIR /app

SHELL ["/bin/bash", "-c"]

RUN apt update && \
    apt install libssl-dev

# CMD ["cargo", "build", "--target", "x86_64-unknown-linux-gnu", "--release"]
CMD ["cargo", "build", "--release"]

# USAGE
# $ docker build -t compile-for-linux .
# $ docker run -it -v "$PWD":/app compile-for-linux

# output binary file to /target/release/backend
