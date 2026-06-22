import WebSocket from "ws";
import { prisma } from "./db";


export async function initSideband(callId: string, interviewId: string) {
    const url = "wss://api.openai.com/v1/realtime?call_id=" + callId;

    const ws = new WebSocket(url, {
        headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        }
    })

    const interview = await prisma.interview.findFirst({
        where: {
            id: interviewId
        }
    });

    ws.on("open", function open() {
        console.log("connecting to the server");

        ws.send(
            JSON.stringify({
                type: "session.update",
                session: {
                    type: "realtime",
                    instructions:  `ledged mild rudeness, prioritized helpfulness over
                    escalationTalk to the candidate live and keep it friendly,
                    not a gotcha test — they're junior, so look for potential,
                    not perfection. Use the GitHub profile you've been given: pick 2-3 real projects (not forks)
                    and look at the code, commits, and any teamwork signs. Use what you find to
                    ask real questions, not generic ones. Cover these in order: have them walk
                    you through a project, ask about one real choice they made in the code, ask
                    one or two basic CS questions, give a small coding problem and watch how they think, ask how
                    they handle being stuck, and leave room for their questions. At the end, give a
                    simple verdict (yes / maybe / no), rate them 1-5 on a few areas like coding, problem-solving, 
                    and communication, and note what stood out, good or bad.
                    ${interview?.githubMetaData}
                    `
                                },
            })
        )
    })

    ws.on("message",async function incoming(message) {
        const parsedMessage = (JSON.parse(message.toString()));

        if(parsedMessage.type == "response.done") {
            let contents: {type: string, transcript: string}[] = [];

            parsedMessage.response.output.map(x=> contents = [...contents, ...x.content]);
            const assistantMessage = contents.filter(x => x.type === "output_audio").map(x => x.transcript).join(" ");
            await prisma.message.create({
                data: {
                    interviewId: interviewId,    
                    type: "Assistent",
                    message: assistantMessage,

                }
            })
        }
    }   )
}