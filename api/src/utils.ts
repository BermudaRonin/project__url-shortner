import mongoose from "mongoose";
import crypto from "crypto";
import validator from "validator";

export async function connectDB() {
    const url = `mongodb+srv://bermudaronin:${process.env.DB_PASSWORD}@cluster0.0zmtd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    try {
        await mongoose.connect(url);
        console.log('[🤖] Database connected!');
    } catch (error) {
        console.log('[🤖]" Error connecting to database! -> ', error);
    }
}

export function isUrl(url: string) {
    return validator.isURL(url);
}

export async function generateShortcode(url: string) {
    // Step 1: Hash the URL using SHA-256
    const hash = crypto.createHash('sha256').update(url).digest('hex');

    // Step 2: Create a custom Base62 alphabet (A-Z, a-z, 0-9)
    const base62Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // Step 3: Generate a short string of length 10
    let str = '';
    for (let i = 0; i < 10; i++) {
        const index = parseInt(hash.slice(i * 2, i * 2 + 2), 16) % base62Alphabet.length; // Use slice() instead of substr()
        str += base62Alphabet[index];
    }

    return str;
}

export const validate = {
    url : (url: string) => {
        return validator.isURL(url);
    },
    code : (code: string) => {
        return validator.isAlphanumeric(code);
    },
    lifetime: (lifetime: number) => {
        return lifetime >= 0;
    }
}