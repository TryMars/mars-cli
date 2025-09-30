import { MessageProvider } from "#context/message_context/message_context.tsx";
import { InputHandlerProvider } from "#context/input_handler_context/input_handler_context.tsx";
import { LoadingProvider } from "#context/loading_context/loading_context.tsx";
import { LLMProvider } from "#context/llm_context/llm_context.tsx";
import { ChatProvider } from "#context/chat_context/chat_context.tsx";
import { MoonlightAppProps } from "#components/moonlight/moonlight_types.ts";
import { Moonlight } from "#components/moonlight/moonlight.tsx";

export const App = (moonlightProps: MoonlightAppProps) => {
  return (
    <ChatProvider>
      <MessageProvider>
        <LoadingProvider>
          <LLMProvider>
            <InputHandlerProvider>
              <Moonlight {...moonlightProps} />
            </InputHandlerProvider>
          </LLMProvider>
        </LoadingProvider>
      </MessageProvider>
    </ChatProvider>
  );
};
