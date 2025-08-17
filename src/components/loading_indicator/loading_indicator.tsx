import { useState, useEffect } from "react";
import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import { formatTime } from "./loading_indicator_utils.ts";

export const LoadingIndicator = () => {
  const [startTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);

      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <Box marginBottom={1}>
      <Box marginRight={1}>
        <Spinner type="star" />
      </Box>
      <Text dimColor>
        <Text bold color="red">
          Thinking...
        </Text>
        {" · "}
        {formatTime(elapsedTime)}
        {" · "}
        {/* TODO: make this esc functionality work */}
        <Text italic>(esc to interrupt)</Text>
      </Text>
    </Box>
  );
};
