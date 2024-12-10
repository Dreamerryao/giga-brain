import { ToastBar, Toaster, toast } from '@aurory/react-hot-toast';

export function Toast() {
  return (
    <Toaster
      containerStyle={{ zIndex: 99910001 }}
      toastOptions={{
        style: {
          background: 'rgba(78, 68, 206)',
          color: 'white',
          width: 'auto',
          zIndex: 99910001,
        },
        success: {
          style: {
            background: '#3aff6f',
            color: '#190834',
          },
        },
        error: {
          style: {
            background: 'rgba(235, 55, 66)',
          },
        },
      }}
      position='bottom-center'
      reverseOrder={false}
    >
      {(t) => (
        <ToastBar
          toast={t}
          style={{
            ...t.style,
            cursor: 'pointer',
          }}
          onClick={() => toast.remove()}
        />
      )}
    </Toaster>
  );
}
