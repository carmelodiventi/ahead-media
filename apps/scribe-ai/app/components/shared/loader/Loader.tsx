import {Spinner} from "@radix-ui/themes";

export default function Loader({ showing }: { showing: boolean }) {
  if (!showing) return null;
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        <Spinner className="h-12 w-12 text-primary" />
    </div>
  );
}
