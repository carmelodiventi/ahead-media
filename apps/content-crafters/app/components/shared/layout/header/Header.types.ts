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

interface Action {
  label?: string;
  icon?: React.ReactNode
  action: () => void;
}

export interface HeaderProps {
  title: string;
  quickActions?: Array<QuickAction>;
  actions?: Array<Action>
  edited?: number;
}
