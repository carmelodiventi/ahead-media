import styled from 'styled-components';

interface StyledNodeProps {
  selected: boolean;
  theme?: string;
}

export const Node = styled.div<StyledNodeProps>`
  padding: 10px 20px;
  border-radius: 5px;
  background: ${({ theme }) =>
    theme === 'dark' ? 'var(--gray-1)' : 'var(--gray-12)'}; // Use resolvedTheme
  color: ${({ theme }) =>
    theme === 'dark' ? 'var(--gray-12)' : 'var(--gray-1)'};
  border: 1px solid
    ${({ selected, theme }) =>
      selected ? 'var(--gray-9)' : theme === 'dark' ? 'var(--gray-12)' : 'var(--gray-12)'};

  .react-flow__handle {
    background: var(--gray-12);
    width: 8px;
    height: 8px;
    border-radius: 100%;
  }
  .label {
    font-family: 'Segoe UI', sans-serif;
    > p {
      margin: 0 0 1rem 0;
      font-size: 12px;
    }
  }
`;
