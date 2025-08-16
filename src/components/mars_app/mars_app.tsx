import { useState } from "react";
import { InputBox } from "../input_box/input_box.tsx";

type MarsAppProps = {
  headlessMode?: boolean;
};

export const headlessModeText = "Entered Mars CLI in headless mode";

export const MarsApp = ({ headlessMode = false }: MarsAppProps) => {
  const [isHeadless, setIsHeadless] = useState<boolean>(headlessMode);

  // TODO: remove this and instead have some visual indicator of headless mode
  if (isHeadless) {
    console.log(headlessModeText);
  }

  return <InputBox />;
};
