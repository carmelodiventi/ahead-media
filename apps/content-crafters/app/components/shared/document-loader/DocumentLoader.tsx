interface DocumentLoaderProps {
  text?: string;
}

const DocumentLoader = ({ text }: DocumentLoaderProps) => {
  return (
    <div className="flex flex-col items-center justify-center px-12 py-1">
      <svg
        width="120"
        height="30"
        viewBox="0 0 120 30"
        xmlns="http://www.w3.org/2000/svg"
        fill="#12a594"
      >
        <rect x="10" y="10" width="10" height="10" rx="2">
          <animate
            attributeName="height"
            from="10"
            to="20"
            begin="0s"
            dur="0.6s"
            values="10;20;10"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            from="10"
            to="5"
            begin="0s"
            dur="0.6s"
            values="10;5;10"
            repeatCount="indefinite"
          />
        </rect>

        <rect x="30" y="10" width="10" height="10" rx="2">
          <animate
            attributeName="height"
            from="10"
            to="20"
            begin="0.2s"
            dur="0.6s"
            values="10;20;10"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            from="10"
            to="5"
            begin="0.2s"
            dur="0.6s"
            values="10;5;10"
            repeatCount="indefinite"
          />
        </rect>

        <rect x="50" y="10" width="10" height="10" rx="2">
          <animate
            attributeName="height"
            from="10"
            to="20"
            begin="0.4s"
            dur="0.6s"
            values="10;20;10"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            from="10"
            to="5"
            begin="0.4s"
            dur="0.6s"
            values="10;5;10"
            repeatCount="indefinite"
          />
        </rect>

        <rect x="70" y="10" width="10" height="10" rx="2">
          <animate
            attributeName="height"
            from="10"
            to="20"
            begin="0.6s"
            dur="0.6s"
            values="10;20;10"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            from="10"
            to="5"
            begin="0.6s"
            dur="0.6s"
            values="10;5;10"
            repeatCount="indefinite"
          />
        </rect>

        <rect x="90" y="10" width="10" height="10" rx="2">
          <animate
            attributeName="height"
            from="10"
            to="20"
            begin="0.8s"
            dur="0.6s"
            values="10;20;10"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            from="10"
            to="5"
            begin="0.8s"
            dur="0.6s"
            values="10;5;10"
            repeatCount="indefinite"
          />
        </rect>
      </svg>
      {text && <span className="mt-4 text-slate-300">{text}</span>}
    </div>
  );
};

export default DocumentLoader;
