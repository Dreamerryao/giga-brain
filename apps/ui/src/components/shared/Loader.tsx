import { LoaderIcon } from '@aurory/react-hot-toast';

export function Loader({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center ${className}`}>
      {!text ? null : <span className='mr-1'>{text} ...</span>}
      <LoaderIcon />
    </div>
  );
}
