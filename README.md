# Aspargis
Aspargis is a dashboard for monitoring and logging the temperatures on an asparagus field in different depth underground. This can be used to adjust the foil covering the soil to regulate the temperature the asparagus is exposed to. By such methods the yield can be increased drastically. In the future this system could be used in conjunction with active measures to cool the asparagus during hot summer days to avoid damage to the fruit body.

## TL;DR: how to get running. 
The application should be fully dockerized. So a `docker-compose up` should you get up and running. Make sure to set a `$POSTGRESSPWD` and a hasura secret in `$SECRET`in youe environment variables (e.g. by a `.env` file). Also make sure to change the `HASURA_GRAPHQL_JWT_SECRET` (probably also a good idea to pull that to an `.env` file too. For reference an example is provided in the `docker-compose.yaml`.)

## Software Stack
We use a postgress database with an secured Graphql API provided by hasura. The `populator`converts the CoAP communication from the NB-IoT sensor nodes to sql-queries populating the DB with the measured sensor values. A react frontend with an Auth0 integration is used for viewing and sharing the measured temperature curves:
TODO image

## Sensors
TODO: image
The sensors are based on the NBSN95 by Dragino (the replacement [NBSN95A](https://www.dragino.com/products/nb-iot/item/186-nbsn95a.html) should also work. This version is however untested). The changed firmware will be published in the future also. Before deploying the sensors make sure to connect to the Node using UART and set the address of your populator CoAP server (part of the docker-compose). Note that the NBSN95 networking capabilities are quite limited and that your CoAP server needs to have a static IPv4 address (No domainname resolution possible and incompatible to IPv6). The Address can be set using the AT commands according to the [Dragino documentation](http://wiki.dragino.com/xwiki/bin/view/Main/User%20Manual%20for%20LoRaWAN%20End%20Nodes/NBSN95_NBSN95A%20NB-IoT%20Sensor%20Node%20User%20Manual/#H1.5A0PinDefinitions26Switch)

The sensors are connected to the NBSN95 nodes via a cable (e.g. a length of outdoor cat5 ethernet cable), that is inserted to the sensor from the bottom. We typically use a five pin [GX12 connector](https://www.aliexpress.com/af/gx12.html) in the hole of the NBSN95 connecting the three wires (Power, GND and signal) for the "one-wire" [DS18B20 temperature sensors](https://www.aliexpress.com/af/ds18b20.html). and UART-RX/TX for easy access according to the pinout provided (TODO). All three signal wires of the DS18B20 are joined in the Sensor housing and connected to pin `PB3` of the NBSN95. as described in section 2.4.5 of the dragino docs. A firmware update is required to allow reading multiple sensors from one pin. Please find more info in the respective repo (TODO). 

The 3D-printed parts to assemble the sensor holders into a PVC pipe are provided on Thingiverse (TODO).

## Problems
The sensor assembly was quite fiddely and one of 12 deployed sensor-nodes had a water/humidity leak (probably at the GX12 connector), which completely destroyed it: (TODO add photo).

## Certificates
To serve the app over ssl one has to place cert and key files in the `ssl`folder. These can for example be generated using `certbot`and Let's encrypt. The certificates in this repo (and it's history) are expired but can be used as dummy certificates for testing.






