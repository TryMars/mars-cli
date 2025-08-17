import { MessageProvider } from "#context/message_context/message_context.tsx";
import { Mars } from "#components/mars/mars.tsx";
import { MarsAppProps } from "#components/mars/mars_types.ts";
import { InputHandlerProvider } from "#context/input_handler_context/input_handler_context.tsx";
import { LoadingProvider } from "#context/loading_context/loading_context.tsx";

export const App = (marsProps: MarsAppProps) => {
  return (
    <MessageProvider>
      <LoadingProvider>
        <InputHandlerProvider>
          <Mars {...marsProps} />
        </InputHandlerProvider>
      </LoadingProvider>
    </MessageProvider>
  );
};
