import { memo } from 'react';
import { Node } from './CustomNode.styles';
import { useTheme } from 'next-themes';
import {Box, Strong, Text} from "@radix-ui/themes";

interface CustomNodeProps {
  data: {
    label: string;
    description?: string;
  };
  selected?: boolean;
  children: React.ReactNode;
}

export default memo(
  ({ data, selected, children, ...rest }: CustomNodeProps) => {
    const { resolvedTheme } = useTheme();

    return (
      <Node selected={selected ?? false} theme={resolvedTheme} {...rest}>
        <Box p={"4"}>
          <Strong>{data.label}</Strong>
          {data.description && <Text as={"p"} size={"2"}>{data.description}</Text>}
        </Box>
        <Box>{children}</Box>
      </Node>
    );
  }
);
