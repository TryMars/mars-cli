import { MessageProvider } from "#context/message_context/message_context.tsx";
import { Mars } from "#components/mars/mars.tsx";
import { MarsAppProps } from "#components/mars/mars_types.ts";

export const App = (marsProps: MarsAppProps) => {
  return (
    <MessageProvider>
      <Mars {...marsProps} />
    </MessageProvider>
  );
};
