import express from "express";
import { PreInterviewBody } from "./types";
import axios from "axios";
import cors from "cors";
import { prisma } from "./db";
import { initSideband } from "./sideband";
import { scrapeGithub } from "./githubbscrap";

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
       
        const githubUsername = githubUrl.split("/").pop();

        const githubData = await scrapeGithub(githubUsername!);

        try{
        const interview = await prisma.interview.create({
            data: {
                githubMetaData: JSON.stringify(githubData),
                status: "Pre",

            }
        })
        res.json({ id: interview.id });
        } catch(e){
            console.log(e)
        }
    })

    app.post("api/v1/session/:interviewId", async (req, res) => {
            const sessionConfig = JSON.stringify({
                type: "realtime",
                model: "gpt-realtime", 
                audio: { output: {voice: "cedar" }},
            })

            const fd = new FormData();
            fd.set("sdp", req.body);
            fd.set("session", sessionConfig);

            try {
                const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    "OpenAI-Safety-Identifier": "hashed-user-id",
                },
                body: fd,
                });

                const location = sdpResponse.headers.get("Location");
                const callId = location?.split("/").pop()!;

                // Send back the SDP we received from the OpenAI REST API
                const sdp = await sdpResponse.text();
                
                initSideband(callId, req.params.interviewId)
                
                res.send(sdp);

            } catch (error) {
                console.error("Token generation error:", error);
                res.status(500).json({ error: "Failed to generate token" });
            }
} )

app.post("/api/v1/session/user/response/:interviewId", async (req, res) => {
    const { message } = req.body;
    await prisma.message.create({
        data: {
            interviewId: req.params.interviewId!,
            type: "User",
            message: message,
        }
    })
    res.json({ message: "message saved"});
})

app.listen(3001);
