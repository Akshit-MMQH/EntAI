import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { toast } from "sonner"
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";

export function Form() {

    const [github, setGithub] = useState("");

    async function onSubmit() {
        if(!github){
            toast("Please Provide Valid Github URL")
            return;
        }

        await axios.post(`${BACKEND_URL}/api/v1/pre-interview`), {
            github
        }
    }

    return <div className="h-screen w-screen flex justify-center items-center">
      <div>
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            Start Interview with AI
            </h2>
            <div className="p-4">
              <Input type="text" placeholder="Github URL" onChange={ e=> setGithub(e.target.value)} />
            </div>
            <div className="flex justify-center p-2">
                <Button onClick={onSubmit}>Start Interview</Button>
            </div>
      </div>
    </div>
}