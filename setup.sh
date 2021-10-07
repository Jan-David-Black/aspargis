#!/bin/bash
usage(){
    echo "sudo ./setup.sh -<h|d|f|n>"
    echo "-h this help"
    echo "-d restart docker-compose"
    echo "-f force install (overwrites .env)"
    echo "-n no install (even if .env doesn't exist yet)"
}

while getopts "hdfns" arg; do
  case $arg in
    d) DockerRestart=true;;
    f) Force=true;;
    n) NoInstall=true;;
    h) Help=true;;
    s) ServerInstall=true;;
  esac
done

if [ "$Help" = "true" ]; then
    usage
    exit
fi

if [ ! -f .env ]||[ "$Force" = "true" ]&&[ ! "$NoInstall" = "true" ]; then
    if [ "$EUID" -ne 0 ];
        then echo "Please run as root"
        exit
    fi

    echo "SECRET=$(< /dev/urandom tr -dc _A-Z-a-z-0-9 | head -c${1:-32})">.env
    echo "POSTGRESSPWD=$(< /dev/urandom tr -dc _A-Z-a-z-0-9 | head -c${1:-32})">>.env

    cp .env populate/

    curl -fsSL https://get.docker.com -o get-docker.sh
    sh ./get-docker.sh

    sudo apt install -y python3-pip libffi-dev
    sudo pip3 install docker-compose

    sudo usermod -aG docker $SUDO_USER

#TODO select right yaml

    if [ $(dpkg --print-architecture) == amd64 ]; then
        echo "usual procedure (not a  pi)"
    else
        echo "assuming its a pi"
    fi
fi

if [ "$ServerInstall" = "true" ]; then
    if [ "$EUID" -ne 0 ];   
        then echo "Please run as root"
        exit
    fi
    echo "installing node and running npm i"
    su $SUDO_USER -c"
            curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
            export NVM_DIR=\"\$HOME/.nvm\"
            [ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\"
            echo \$HOME
            nvm install node
            if [ ! -d aspargis/node_modules ]; then
                cd aspargis
                npm install
                cd ..
            fi 

            if [ ! -d populate/node_modules ]; then
                cd populate
                npm install
                cd ..
            fi 
            "
fi

if [ "$DockerRestart" = "true" ]; then
    echo "restarting docker-compose"
    docker-compose down
    docker-compose up -d
fi