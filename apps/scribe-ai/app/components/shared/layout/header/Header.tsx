import { Box, Button, Flex, Text, Tooltip } from '@radix-ui/themes';
import { HeaderProps } from './Header.types';
import { useNavigate } from 'react-router';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';

const Header = ({ quickActions, title, edited, actions }: HeaderProps) => {
  const navigate = useNavigate();
  const formattedDate = edited
    ? formatDistanceToNow(new Date(edited), { addSuffix: true })
    : '';
  return (
    <Flex px="6" py="5" align="center" justify="between">
      <Flex gap="4" align="center">
        <Box>
          <Text as="label" weight="medium" size="5" color="gray">
            {title}
          </Text>
        </Box>
      </Flex>

      <Flex gap="4" align="center" px={'4'}>
        {formattedDate && <Text size={'1'}>Edited {formattedDate}</Text>}
        {quickActions?.map((button, idx) =>
          button.component ? (
            React.cloneElement(button.component, { key: idx })
          ) : (
            <Button
              key={idx}
              {...(button.color && { color: button.color })}
              {...(button.size && { variant: button.size })}
              highContrast={true}
              variant={button.variant ?? 'ghost'}
              onClick={
                button.action
                  ? button.action
                  : () => {
                      if (button.href) navigate(button.href);
                    }
              }
            >
              {button?.label ?? button.icon}
            </Button>
          )
        )}

        {actions &&
          actions.map(({ action, label, icon }) => (
            <Tooltip content={label} key={label}>
              <Button
                onClick={action}
                variant={'ghost'}
                size={'1'}
                color={'gray'}
              >
                {icon ? icon : label}
              </Button>
            </Tooltip>
          ))}
      </Flex>
    </Flex>
  );
};

export default Header;
