import { Button, Text, DropdownMenu } from '@radix-ui/themes';
import { useNavigate } from 'react-router';
import useSession from '../../../hooks/useSession';
import { useTheme } from 'next-themes';

export default function CurrentUser() {
  const session = useSession();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="ghost" size="2" style={{ width: '180px' }}>
          <Text as="div" weight={'bold'} size="2" color="gray" truncate>
            {session?.user?.email}
          </Text>
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item shortcut="⌘ E" onClick={() => navigate('/profile')}>
          Profile
        </DropdownMenu.Item>
        <DropdownMenu.Item shortcut="⌘ S" onClick={() => navigate('/settings')}>
          Settings
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item shortcut="⌘ N" onClick={() => navigate('/archive')}>
          Archive
        </DropdownMenu.Item>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>More</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item>Move to project…</DropdownMenu.Item>
            <DropdownMenu.Item>Move to folder…</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Advanced options…</DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>

        <DropdownMenu.Separator />
        <DropdownMenu.Item>Share</DropdownMenu.Item>
        <DropdownMenu.Item>Add to favorites</DropdownMenu.Item>
        <DropdownMenu.Item shortcut="⌘ E" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          Switch theme
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          shortcut="⌘ ⌫"
          color="red"
          onClick={() => navigate('/auth/logout')}
        >
          Logout
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
