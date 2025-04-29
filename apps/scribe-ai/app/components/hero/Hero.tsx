import React, {ReactNode} from 'react';
import {Box} from "@radix-ui/themes";

const Hero = ({children}: {children: ReactNode}) => {
  return (
    <Box
      width="100%"
      style={{
        backgroundRepeat: 'no-repeat',
        backgroundImage: `
          radial-gradient(circle 800px at 700px 200px, var(--purple-2), transparent),
          radial-gradient(circle 600px at calc(100% - 300px) 300px, var(--blue-3), transparent),
          radial-gradient(circle 800px at right center, var(--sky-3), transparent),
          radial-gradient(circle 800px at right bottom, var(--sky-1), transparent),
          radial-gradient(circle 800px at calc(50% - 600px) calc(100% - 100px), var(--pink-3), var(--pink-1), transparent)
        `
      }}
    >
      {children}
    </Box>
  );
};

export default Hero;
