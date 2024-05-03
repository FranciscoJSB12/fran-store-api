import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MessagesWsService } from './messages-ws.service';
import { NewMessageDto } from './dtos/new-message.dto';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() wss: Server;
  
  constructor(private readonly messagesWsService: MessagesWsService) {}

  handleConnection(client: Socket) {
    this.messagesWsService.registerClient(client);
    //console.log({ conectados: this.messagesWsService.getConnectedClients()});
    const token = client.handshake.headers.authentication; //IMPORTANTE: la variable token almacenará los headers que mandemos desde el cliente, por ello hay que ver el nombre que se le dio en el cliente para poder desestructurarlo, en este caso fue authentication.

    console.log(token);

    //clients-updated es el nombre del evento, puede ser cualquier string, lo segundo es el lo que se quiere mandar al cliente
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);
    //Igualmente, cuando ocurre una desconexión se quiere escuchar
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  @SubscribeMessage('message-from-client')
  handleMessageFromClient (client: Socket, payload: NewMessageDto) {
    //Emite unicamente al cliente que lo mandó
    /*client.emit('message-from-server', {
      message: payload.message
    });*/

    //Emite a todos MENOS, al cliente inicial
    /*client.broadcast.emit('message-from-server', {
      message: payload.message
    });*/

    //Emitir a todos los que estén conectados, incluyendo a quien emitió el mensaje
    this.wss.emit('message-from-server', {
      message: payload.message
    });
  }
}
