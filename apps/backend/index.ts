import express from "express";
import { PreInterviewBody } from "./types";
import axios from "axios";
import cors from "cors";
import { prisma } from "./db";


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.text({ type: ["application/sdp", "text/plain" ]}));

    app.post("/api/v1/pre-interview", async (req, res) => {
    
        const { success, data } = PreInterviewBody.safeParse(req.body);
        
        if (!success) {
            res.status(411).json({
                message: "Incorrect Body"
            });
            return;
        }

        const githubUrl = data.github.endsWith("/") ? data.github.slice(0, -1) : data.github;
        const githubusername = githubUrl.split("/").pop();

        const userRepos = await axios.get(`https://api.github.com/users/${githubusername}/repos`);

        const ScrapeGithub = userRepos.data.map((x: any) => ({
            description: x.description,
            name: x.name,
            fullName: x.full_name,
            starCount: x.stargazers_count
        }));

        try{
        const interview = await prisma.interview.create({
            data: {
                githubMetaData: JSON.stringify(githubusername),
                status: "Pre",

            }
        })
        res.json({ id: interview.id });
        } catch(e){
            console.log(e)
        }
    })

    app.post("api/v1/session", async (req, res) => {
            const sessionConfig = JSON.stringify({
                type: "realtime",
                model: "gpt-realtime", 
                audio: { output: {voice: "cedar" }},
            })

            const fd = new FormData();
            fd.set("sdp", req.body);
            fd.set("session", sessionConfig);

            try {
                const r = await fetch("https://api.openai.com/v1/realtime/calls", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    "OpenAI-Safety-Identifier": "hashed-user-id",
                },
                body: fd,
                });
                // Send back the SDP we received from the OpenAI REST API
                const sdp = await r.text();
                res.send(sdp);
            } catch (error) {
                console.error("Token generation error:", error);
                res.status(500).json({ error: "Failed to generate token" });
            }
} )

app.listen(3001);
