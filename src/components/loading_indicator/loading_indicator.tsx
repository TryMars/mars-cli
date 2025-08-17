import { useState, useEffect } from "react";
import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import {
  calculateElapsedSeconds,
  formatTime,
} from "./loading_indicator_utils.ts";

export const LoadingIndicator = () => {
  const [startTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(calculateElapsedSeconds(startTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <Box marginTop={1}>
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
