import * as Keyv from 'keyv'
import { IdentifaibleData } from 'src/interfaces';
import { ISimpleStorageService } from './adapter';

export const WEEK_EXPIRATION = 7 * 24 * 60 * 60 * 1000 // in milliseconds

export class InMemoryCache<T extends IdentifaibleData = IdentifaibleData> implements ISimpleStorageService<T> {

    keyv: Keyv

    constructor(private readonly expirationTime: number) {
        this.keyv = new Keyv();
    }

    async get(id: number): Promise<T> {
        return await this.keyv.get(`${id}`)
    }

    async save(data: T) {
        return await this.keyv.set(`${data.id}`, data, this.expirationTime);
    }

    
    
} 