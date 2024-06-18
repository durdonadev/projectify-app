import bcryptjs from 'bcryptjs';

class Bcrypt {
    hash = async (password: string) => {
        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(password, salt);
        return hash;
    };

    compare = async (password: string, hash: string) => {
        return await bcryptjs.compare(password, hash);
    };
}

export const bcrypt = new Bcrypt();
