import { IdentifaibleData } from "src/interfaces";
import { Context } from 'telegraf';
import type {Chat, User} from 'typegram'

/** Can be conversation with user or group */
export class ChatDto implements IdentifaibleData {
    id: number;
    chat: Chat
    from: User

    constructor({message: {chat, from}}: Context) {
        this.id = chat.id
        this.chat = chat
        this.from = from
    }
}