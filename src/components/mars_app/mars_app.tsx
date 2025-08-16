import { useContext, useEffect, useState } from "react";
import { InputBox } from "#components/input_box/input_box.tsx";
import { MessageList } from "#components/message_list/message_list.tsx";
import { MarsAppProps } from "#components/mars_app/mars_app_types.ts";
import { MessageContext } from "#context/message_context/message_context.tsx";

export const headlessModeText = "Entered Mars CLI in headless mode";

export const MarsApp = ({ headlessMode = false }: MarsAppProps) => {
  const { addMessage } = useContext(MessageContext);
  const [isHeadless, setIsHeadless] = useState<boolean>(headlessMode);

  /**
   * Monitors headless mode state and creates a system notification message
   * when headless mode is active. This provides visual feedback to users
   * about the current operating mode of the CLI.
   */
  useEffect(() => {
    if (isHeadless) {
      addMessage({
        content: headlessModeText,
        from: "system",
        state: "success",
      });
    }
  }, [isHeadless]);

  return (
    <>
      <MessageList />
      <InputBox />
    </>
  );
};
