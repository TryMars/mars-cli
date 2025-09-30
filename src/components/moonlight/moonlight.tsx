import { useContext, useEffect, useState } from "react";
import { InputBox } from "#components/input_box/input_box.tsx";
import { MessageList } from "#components/message_list/message_list.tsx";
import { MessageContext } from "#context/message_context/message_context.tsx";
import { MoonlightAppProps } from "./moonlight_types.ts";
import { LoadingIndicator } from "#components/loading_indicator/loading_indicator.tsx";
import { LoadingContext } from "#context/loading_context/loading_context.tsx";
import { moonlightMessages } from "./moonlight_messages.ts";
import Logo from "#components/logo/logo.tsx";

export const Moonlight = ({ headlessMode = false }: MoonlightAppProps) => {
  const { addMessage } = useContext(MessageContext);
  const { isLoading } = useContext(LoadingContext);
  const [isHeadless] = useState<boolean>(headlessMode);

  useEffect(() => {
    if (isHeadless) {
      addMessage({
        content: moonlightMessages.headless.enabled(),
        from: "system",
        state: "success",
      });
    }
  }, [isHeadless]);

  return (
    <>
      <Logo />
      <MessageList />
      {isLoading && <LoadingIndicator />}
      <InputBox />
    </>
  );
};
