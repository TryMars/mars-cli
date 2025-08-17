import { MessageProvider } from "#context/message_context/message_context.tsx";
import { Mars } from "#components/mars/mars.tsx";
import { MarsAppProps } from "#components/mars/mars_types.ts";
import { InputHandlerProvider } from "#context/input_handler_context/input_handler_context.tsx";

export const App = (marsProps: MarsAppProps) => {
  return (
    <MessageProvider>
      <InputHandlerProvider>
        <Mars {...marsProps} />
      </InputHandlerProvider>
    </MessageProvider>
  );
};
