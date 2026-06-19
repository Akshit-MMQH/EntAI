import "styles/globals.css";
import { Form } from "./components/ui/form";
import { useState } from "react";
import { Interview } from "./components/ui/Interview";
import { Result } from "./components/ui/Result";
import { Toaster } from "sonner";


export function App() {

  const [page, setPage] = useState<"form" | "interview" | "result">("form");

  return (
    <div>
      {page == "form" && <Form /> }
      {page == "interview" && <Interview /> }
      {page == "result" && <Result /> }
      <Toaster position="top-center"/>
    </div>
  );
}

export default App;
