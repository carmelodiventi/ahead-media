import { Card, Heading, Text } from "@radix-ui/themes";
import * as Collapsible from "@radix-ui/react-collapsible";
import { useState } from "react";

interface QuestionItemProps {
  question: string;
  snippet: string;
}

const QuestionItem = ({ question, snippet }: QuestionItemProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Card variant="surface">
      <Collapsible.Root
        className="w-[300px]"
        open={open}
        onOpenChange={setOpen}
      >
        <Collapsible.Trigger asChild>
          <Heading size="2" className={"hover:cursor-pointer"}>{question}</Heading>
        </Collapsible.Trigger>

        <Collapsible.Content>
          <Text as="p" size="2" color="gray" mt={"2"}>
            {snippet}
          </Text>
        </Collapsible.Content>
      </Collapsible.Root>
    </Card>
  );
};

export default QuestionItem;
