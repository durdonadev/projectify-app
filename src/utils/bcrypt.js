import bcryptjs from "bcryptjs";

class Bcrypt {
    hash = async (password) => {
        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(password, salt);
        return hash;
    };

    compare = async (password, hash) => {
        return await bcryptjs.compare(password, hash);
    };
}

export const bcrypt = new Bcrypt();
