'use client';

import { useCallback, PropsWithChildren } from 'react';
import toast, { LoaderIcon } from '@aurory/react-hot-toast';

import { getExplorerTxUrl } from '@/lib/explorer';

type TxState =
  | 'unsent'
  | 'prompting'
  | 'signing'
  | 'sending'
  | 'sent'
  | 'signed'
  | 'failed'
  | 'custom';

export type SetStatusFn = (status: {
  status: TxState;
  message?: string;
  loading?: boolean;
  data?: string;
}) => void;

export function useStatus() {
  return useCallback(
    (status: {
      status: TxState;
      message?: string;
      loading?: boolean;
      data?: string;
    }) => {
      toast.remove();

      switch (status.status) {
        case 'failed': {
          if (status.message) {
            toast.error(status.message);
          }
          break;
        }

        case 'sent': {
          toast.success(
            <Container className='flex flex-wrap justify-center'>
              Success!
              <a
                href={getExplorerTxUrl(status.data!)}
                target='_blank'
                rel='noreferrer'
                style={{ color: '#190834' }}
                className='ml-1 underline text-center'
              >
                View on Explorer
              </a>
            </Container>,
            {
              duration: 15 * 1e3,
            }
          );
          break;
        }

        case 'signed': {
          toast.success(
            <Container className='flex flex-wrap'>Success!</Container>,
            {
              duration: 2 * 1e3,
            }
          );
          break;
        }

        case 'sending': {
          toast('Sending', {
            icon: (
              <Container>
                <LoaderIcon />
              </Container>
            ),
            duration: Infinity,
          });
          break;
        }

        case 'prompting': {
          toast(
            <Container className='flex justify-center'>
              Confirm transaction in your wallet
            </Container>,
            {
              icon: <LoaderIcon />,
              duration: Infinity,
            }
          );
          break;
        }

        case 'signing': {
          toast(
            <Container className='flex justify-center'>
              Sign transaction in your wallet
            </Container>,
            {
              icon: <LoaderIcon />,
              duration: Infinity,
            }
          );
          break;
        }

        default: {
          toast(
            <Container className='flex justify-center'>
              {status.message}
            </Container>,
            status.loading ? { icon: <LoaderIcon />, duration: Infinity } : {}
          );
          break;
        }
      }
    },
    []
  );
}

function Container({
  children,
  className,
}: PropsWithChildren<{
  className?: string;
}>) {
  return (
    <div data-testid='notifications-container' className={className}>
      {children}
    </div>
  );
}
