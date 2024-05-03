import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';

interface ConnectedClients {
    [id: string]: {
        socket: Socket,
        user: User
    }
}

@Injectable()
export class MessagesWsService {

    private connectedClients: ConnectedClients = {};

    constructor(
        @InjectRepository(User)
        private readonly useRepository: Repository<User>
    ) {}

    async registerClient(client: Socket, userId: string) {
        const user= await this.useRepository.findOneBy({ id: userId });
        if(!user) throw new Error('User not found');
        if(!user.isActive) throw new Error('User not active');

        this.connectedClients[client.id] = {
            socket: client,
            user
        };
    }

    removeClient(clientId: string) {
        delete this.connectedClients[clientId];
    }

    getConnectedClients():string[] {
        return Object.keys(this.connectedClients);
    }

    getUserFullName(sockerId: string) {
        return this.connectedClients[sockerId].user.fullName;
    }
}
