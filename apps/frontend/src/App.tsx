import "styles/globals.css";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

export function App() {
  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <div >
        T <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">AI Interview Start</h2>
          <div className="p-4">
              <Input type="text" placeholder="Github URL"/>
          </div>
          <div className="flex justify-center p-2">
            <Button>Start Interview</Button>
          </div>
      </div>
    </div>
  );
}

export default App;
