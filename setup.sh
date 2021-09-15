#!/bin/bash 

if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi


if [ ! -f .env ]; then
    echo "SECRET=$(< /dev/urandom tr -dc _A-Z-a-z-0-9 | head -c${1:-32})">.env
    echo "POSTGRESSPWD=$(< /dev/urandom tr -dc _A-Z-a-z-0-9 | head -c${1:-32})">>.env

    cp .env populate/
    cp .env time-series-chart/
    sed -i 's/SECRET/REACT_APP_SECRET/' time-series-chart/.env

    apt-get update
    apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release

    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io

    echo "granting docker privileges to $SUDO_USER"
    usermod -aG docker $SUDO_USER

    curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    su $SUDO_USER -c"
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
        export NVM_DIR=\"\$HOME/.nvm\"
        [ -s \"\$NVM_DIR/nvm.sh\" ] && \. \"\$NVM_DIR/nvm.sh\"
        echo \$HOME
        nvm install node
        if [ ! -d time-series-chart/node_modules ]; then
            cd time-series-chart
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

docker kill $(docker ps -q)
docker rm $(docker ps -a -q)
docker-compose up -d