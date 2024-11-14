import { Request, Response } from "express";
import model from "./model";
import { generateShortcode, validate } from "./utils";
import validator from "validator";
import { DEFAULT_LIFETIME, MAX_CREATION_ATTEMPTS } from "./config";


export async function shortenURL(req: Request, res: Response): Promise<any> {
    try {
        let attempts = 0;
        let doc;

        const { url, lifetime } = req.body;

        if (!validate.url(url)) return res.status(400).json({ error: "Invalid URL" });
        if (lifetime && !validate.lifetime(lifetime)) return res.status(400).json({ error: "Invalid expiration date" });

        const submit = async (code: string) => await model.create({
            url,
            clicks: 0,
            code,
            short: `http://localhost:1337/${code}`,
            expires_at: new Date(Date.now() + (lifetime || DEFAULT_LIFETIME))
        })

        let code = await generateShortcode(url);

        while (!doc) {
            if (attempts >= MAX_CREATION_ATTEMPTS) return res.status(500).json({ error: "Max attempts reached" });
            try {
                attempts++;
                doc = await submit(code)
            } catch (error: any) {
                if (error.code === 11000) { // MongoDB duplicate key error code
                    code = await generateShortcode(url); // Regenerate if duplicate found
                } else {
                    throw error; // Rethrow other errors
                }
            }
        }

        res.status(201).json({ short: doc.short });

    } catch (error) {
        console.log("Error interacting with database -> ", error);
        res.status(500).json({ error: "Error interacting with database" });
    }
}

export async function redirectToURL(req: Request, res: Response): Promise<any> {
    try {
        const { code } = req.params;

        const doc = await model.findOneAndUpdate(
            { code },
            { $inc: { clicks: 1 } }, // Increment the click count
            { new: true }
        );

        if (!doc) return res.status(404).json({ error: "URL not found" });

        res.redirect(doc.url);
    } catch (error) {
        console.log("Error interacting with database -> ", error);
        res.status(500).json({ error: "Error interacting with database" });
    }
}


export async function getStats(req: Request, res: Response): Promise<any> {
    try {
        const { code } = req.params;

        const doc = await model.findOne({ code }).select("clicks createdAt expires_at");

        if (!doc) return res.status(404).json({ error: "URL not found" });

        res.status(200).json(doc);

    } catch (error) {
        console.log("Error interacting with database -> ", error);
        res.status(500).json({ error: "Error interacting with database" });
    }
}

