import styled from 'styled-components';

interface StyledNodeProps {
  selected: boolean;
  theme?: string;
}

export const Node = styled.div<StyledNodeProps>`
  font-family: 'Segoe UI', sans-serif;
  border-radius: 5px;
  background: ${({ theme }) =>
    theme === 'dark' ? 'var(--white-a11)' : 'var(--gray-12)'}; // Use resolvedTheme
  color: ${({ theme }) =>
    theme === 'dark' ? 'var(--gray-12)' : 'var(--gray-1)'};
  border: 3px solid
    ${({ selected, theme }) =>
      selected ? 'var(--gray-9)' : theme === 'dark' ? 'var(--gray-5)' : 'var(--gray-8)'};
`;
