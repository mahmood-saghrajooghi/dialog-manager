import React, {
  useEffect,
  useRef,
  useState,
  MutableRefObject,
  Suspense,
} from 'react';
import ReactDOM from 'react-dom';
import { useDialogManager } from './store';
import type { DialogId } from './types';

export interface UseDialogOptions {
  target?: HTMLElement | MutableRefObject<HTMLElement | null>
  context?: Record<string, unknown>
}

/**
 * A hook that programmatically creates a React component and attaches it to the DOM,
 * useful for modals, dialogs, etc. that need to be opened imperatively.
 *
 * @param Component The React component to render.
 * @param initialProps Initial props to pass to the component.
 * @param options Additional options for controlling the mount target and context.
 *
 * @example
 *
 * function App() {
 *   const openDialog = () => {
 *     const { close, isMounted } = useDialog(MyModal, { title: 'Hello' })
 *     setTimeout(() => {
 *       // close dialog after 2 seconds
 *       close()
 *     }, 2000)
 *   }
 *
 *   return <button onClick={openDialog}>Open Dialog</button>
 * }
 */
export function useDialog<T extends { id: DialogId } & Record<string, unknown>>(
  Component: React.ComponentType<T>,
  initialProps: T = {} as T,
) {
  // Guard for non-browser environments
  if (typeof window === 'undefined') {
    console.warn('[useDialog]: Cannot use outside of a browser context!');
  }

  const [{ id, ...props }, setProps] = useState<T>(initialProps);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mountTargetRef = useRef<HTMLElement | null>(null);
  const { registerDialog, openDialog, closeDialog } = useDialogManager();

  function open() {
    // Create a container if we don't have one yet
    if (!containerRef.current) {
      containerRef.current = document.createElement('div');
      containerRef.current.id = id;
    }

    // Determine where to mount
    mountTargetRef.current = document.body;

    // Append to target if not appended yet
    if (containerRef.current && !containerRef.current.parentNode) {
      mountTargetRef.current.appendChild(containerRef.current);
    }

    // Render the component
    const element = (
      <Suspense fallback={null}>
        <Component {...props} id={id} />
      </Suspense>
    );

    if (containerRef.current) {
      ReactDOM.render(element, containerRef.current);
      setIsMounted(true);
      openDialog(id);
    }
  }

  useEffect(() => {
    registerDialog(id);
  }, [id, registerDialog]);

  // Update the component when props change, but only if already mounted
  useEffect(() => {
    if (isMounted && containerRef.current) {
      const element = (
        <Suspense fallback={<div>Loading...</div>}>
          <Component {...props} id={id} />
        </Suspense>
      );
      ReactDOM.render(element, containerRef.current);
    }
  }, [props, Component, isMounted, id]);

  /**
   * Close (unmount) the dialog. You can optionally delay by `debounce` ms.
   */
  function close(debounce = 0) {
    closeDialog(id);

    if (containerRef.current) {
      ReactDOM.unmountComponentAtNode(containerRef.current);
    }

    // Remove container from the DOM
    if (containerRef.current && containerRef.current.parentNode) {
      containerRef.current.parentNode.removeChild(containerRef.current);
    }

    containerRef.current = null;
    setIsMounted(false);
    // If you want an "onClose" callback or event, trigger it here.
  }

  /**
   * If you need to update props from outside the hook,
   * you can use this function or simply manage them in your calling component.
   */
  function updateProps(newProps: Partial<T>) {
    setProps((oldProps) => ({ ...oldProps, ...newProps }));
  }

  return {
    /** Tells you if the dialog is currently mounted */
    isMounted,
    /** Imperatively open the dialog */
    open,
    /** Imperatively close the dialog */
    close,
    /** If you want to update props after creation */
    updateProps,
    /** If you want direct access to the container DOM node */
    container: containerRef.current,
  };
}
