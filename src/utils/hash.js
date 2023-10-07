import bcrypt from "bcryptjs";

// import crypto from "crypto-js";
// export const hashFunction = (input) => {
//     const hash = crypto.SHA256(input);
//     const hashString = hash.toString(crypto.enc.Hex);
//     return hashString;
// };

// export const generateSalt = () => {
//     const chars = "abcdefghijklmnopqrstuvwxyz";
//     let salt = "";

//     for (let i = 0; i < 10; i++) {
//         const randomIdx = Math.floor(Math.random() * 26);
//         salt += chars[randomIdx];
//     }
//     return salt;
// };

class Bcrypt {
    hash = async (password) => {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    };

    compare = async (password, hash) => {
        return await bcrypt.compare(password, hash);
    };
}

export const hasher = new Bcrypt();
