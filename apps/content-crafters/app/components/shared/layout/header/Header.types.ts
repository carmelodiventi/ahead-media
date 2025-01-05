import {ButtonProps} from "@radix-ui/themes";

interface QuickAction {
  label?: string;
  href?: string;
  action?: () => void;
  icon?: React.ReactNode;
  variant?: ButtonProps['variant'];
  color?: ButtonProps['color'];
  size?: ButtonProps['size'];
  component?: JSX.Element;
}
export interface HeaderProps {
  title: string;
  quickActions?: Array<QuickAction>;
  edited?: number;
}
