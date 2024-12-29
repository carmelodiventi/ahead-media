import React from 'react';
import { Slider, SliderProps, Text } from '@radix-ui/themes';

interface InputSliderProps extends SliderProps {
  label: string;
  placeholder?: string;
}

const InputSlider: React.FC<InputSliderProps> = ({
  label,
  ...props
}) => {
  return (
    <>
      <Text size={'2'}>
        {label}: {props.defaultValue?.at(0)}
      </Text>
      <Slider className={'nodrag'} {...props} />
    </>
  );
};

export default InputSlider;
