import React from 'react';
import { Flex, Slider, SliderProps, Text} from '@radix-ui/themes';

interface InputSliderProps extends SliderProps {
  label: string;
  placeholder?: string;
}

const InputSlider: React.FC<InputSliderProps> = ({ label, ...props }) => {
  return (
    <Flex gap="4" direction={"column"} px={'4'}>
      <Text size={'2'}>
        {label}: {props.defaultValue?.at(0)}
      </Text>
      <Slider className={'nodrag'} {...props} />
    </Flex>
  );
};

export default InputSlider;
