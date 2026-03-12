import { useCallback, useEffect, useRef, useState } from 'react';

type IdleState = {
  status: 'idle';
};

type LoadingState = {
  status: 'loading';
};

type SuccessState<T> = {
  status: 'success';
  data: T;
  loadedAt: Date;
};

type ErrorState = {
  status: 'error';
  error: Error;
  retry: () => void;
};

export type TypedDataState<T> =
  | IdleState
  | LoadingState
  | SuccessState<T>
  | ErrorState;

export const useTypedData = <T>(
  loader: () => Promise<T>
): TypedDataState<T> => {
  const [state, setState] = useState<TypedDataState<T>>({ status: 'loading' });
  const runLoadRef = useRef<() => void>(() => undefined);

  const runLoad = useCallback((setLoading: boolean) => {
    if (setLoading) {
      setState({ status: 'loading' });
    }

    loader()
      .then((data) => {
        setState({
          status: 'success',
          data,
          loadedAt: new Date(),
        });
      })
      .catch((error: unknown) => {
        const safeError = error instanceof Error ? error : new Error('Load failed');
        setState({
          status: 'error',
          error: safeError,
          retry: () => {
            runLoadRef.current();
          },
        });
      });
  }, [loader]);

  useEffect(() => {
    runLoadRef.current = () => {
      runLoad(true);
    };

    loader()
      .then((data) => {
        setState({
          status: 'success',
          data,
          loadedAt: new Date(),
        });
      })
      .catch((error: unknown) => {
        const safeError = error instanceof Error ? error : new Error('Load failed');
        setState({
          status: 'error',
          error: safeError,
          retry: () => {
            runLoadRef.current();
          },
        });
      });
  }, [loader, runLoad]);

  return state;
};
