import express from "express";
import { PreInterviewBody } from "./types";
import axios from "axios";
import cors from "cors";
import { prisma } from "./db";


const app = express();
app.use(express.json());
app.use(cors());

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

        const interview = await prisma.interview.create({
            data: {
                githubMetaData: JSON.stringify(githubusername),
                status: "Pre",

            }
        })

        res.json({ id: interview.id });
    }
)


app.listen(3001);
