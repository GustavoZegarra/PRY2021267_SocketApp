const express = require('express');
const cors = require('cors');

const axios = require('axios');
const accountSid = "AC6a268689de3dc204cda8509153b59a1c";
const authToken = "d12bc4fa22d3b08a6ec09af35435aa00";
const twilio = require('twilio')(accountSid, authToken);

class Server {

    constructor() {
        this.app  = express();
        this.port = process.env.PORT;

        this.server = require('http').createServer(this.app);
        this.io = require('socket.io')(this.server);

        this.middlewares();
        this.sockets();
    }

    middlewares() {
        this.app.use( cors() );
        this.app.use( express.static('public') );
    }

    sockets() {

        this.io.on('connection', socket => {

            socket.on('sms:request',() => {
                this.alert_numbers();
                this.io.emit('sms:response','Los mensajes de textos han sido enviados...');
            });

        });
    }

    alert_numbers(){
        let numeros=[];
        axios.get('https://safetysat.azurewebsites.net/api/Usuarios')
        .then((response) => {
          for(var i = 0; i < response.data.length; i++) {
            var obj = response.data[i];
            numeros.push(obj.celular)
          }
          for (var i = 0; i < numeros.length; i++) {
            twilio.messages
            .create({body: 'Nivel de Riesgo alto de activacion de la quebrada Carossio. Por favor tome sus precauciones', from: '+18144812299', to: numeros[i]})
            .then(message => console.log(message.sid));
          }
        });
    }

    listen() {
        this.server.listen( this.port, () => {
            console.log('Servidor corriendo en puerto', this.port );
        });
    }
    
}

module.exports = Server;