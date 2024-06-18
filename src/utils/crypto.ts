import cryptojs from 'crypto-js';

class Crypto {
    generateRandomString = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
        let randomString = '';

        for (let i = 0; i < 10; i++) {
            const randomIdx = Math.floor(Math.random() * 36);
            randomString += chars[randomIdx];
        }
        return new Date().toISOString() + randomString;
    };
    hash = (input: string) => {
        const hash = cryptojs.SHA256(input);
        const hashString = hash.toString(cryptojs.enc.Hex);
        return hashString;
    };

    createToken = () => {
        const randomString = this.generateRandomString();
        const hashedString = this.hash(randomString);
        return hashedString;
    };

    compare(token: string, hashedToken: string) {
        return hashedToken === this.hash(token);
    }
}

export const crypto = new Crypto();
