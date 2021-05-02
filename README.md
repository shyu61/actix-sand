## Deploy
```sh
# build
$ yarn build

# compile
$ cd backend && docker build -t compile-for-linux .
$ docker run -it -v "$PWD":/app compile-for-linux

# deploy
$ scp -r -i {path_to_keypem} target/public ec2-user@{ip}:~/target/public
$ scp -i {path_to_keypem} backend ec2-user@{ip}:~

# execute
$ ssh -i {path_to_keypem} ec2-user@{ip}
$ ./backend
```
