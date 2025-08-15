import { useState } from "react";

type MarsAppProps = {
  headlessMode?: boolean;
};

const MarsApp = ({ headlessMode = false }: MarsAppProps) => {
  const [isHeadless, setIsHeadless] = useState<boolean>(headlessMode);

  // TODO: remove this and instead have some visual indicator of headless mode
  if (isHeadless) {
    console.log("Entered Mars CLI in headless mode");
  }

  return <span></span>;
};

export default MarsApp;
