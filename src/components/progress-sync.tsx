'use client';
import {
  Component,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from 'react';
import { useConvex, useConvexAuth, useMutation } from 'convex/react';
import { api } from '@/lib/convex-api';
import { mergeProgress, reconcileProgress, type Progress } from '@/lib/progress';

export class ProgressSyncBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div className="storage-warning" role="status">
          Account storage is unavailable. Your browser copy is available.{' '}
          <button type="button" onClick={() => this.setState({ failed: false })}>
            Retry connection
          </button>
        </div>
      );
    return this.props.children;
  }
}

export function ProgressSync({
  progress,
  setProgress,
}: {
  progress: Progress;
  setProgress: Dispatch<SetStateAction<Progress>>;
}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const client = useConvex();
  const save = useMutation(api.progress.save);
  const lastSaved = useRef<string | undefined>(undefined);
  const lastRemote = useRef<string | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<'loading' | 'saving' | 'saved' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [initialProgress] = useState(progress);
  const currentProgress = useRef(progress);

  useEffect(() => {
    currentProgress.current = progress;
  }, [progress]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let initialized = false;
    const watch = client.watchQuery(api.progress.get, {});
    const update = () => {
      try {
        const remote = watch.localQueryResult();
        if (remote === undefined) return;
        const snapshot = JSON.stringify(remote);
        if (initialized && lastRemote.current === snapshot) return;
        lastRemote.current = snapshot;
        if (!initialized) {
          lastSaved.current = snapshot;
          if (remote) setProgress((local) => reconcileProgress(initialProgress, local, remote));
          setReady(true);
          initialized = true;
        } else if (JSON.stringify(currentProgress.current) === lastSaved.current && remote) {
          lastSaved.current = snapshot;
          setProgress(remote);
        }
        setStatus('saved');
      } catch {
        setReady(false);
        setStatus('error');
      }
    };
    const unsubscribe = watch.onUpdate(update);
    // A cached watch may already have a result before it emits its next update.
    const timer = setTimeout(update, 0);
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [client, isAuthenticated, attempt, initialProgress, setProgress]);

  useEffect(() => {
    if (!ready || !isAuthenticated) return;
    const snapshot = JSON.stringify(progress);
    if (snapshot === lastSaved.current) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setStatus('saving');
      try {
        const saved = await save({ progress });
        if (cancelled) return;
        lastSaved.current = JSON.stringify(saved);
        setProgress((current) =>
          JSON.stringify(current) === snapshot ? saved : mergeProgress(saved, current),
        );
        setStatus('saved');
      } catch {
        if (!cancelled) setStatus('error');
      }
    }, 750);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [ready, isAuthenticated, progress, save, setProgress, attempt]);

  if (!isLoading && !isAuthenticated)
    return (
      <div className="storage-warning" role="status">
        Account sync could not authenticate. Your browser copy is available. Try signing in again.
      </div>
    );
  return (
    <div className="progress-sync-status" role="status">
      {status === 'error' ? (
        <>
          Progress could not sync. Your browser copy is available.{' '}
          <button type="button" onClick={() => setAttempt((value) => value + 1)}>
            Retry sync
          </button>
        </>
      ) : status === 'loading' ? (
        'Connecting to your saved progress…'
      ) : status === 'saving' ? (
        'Saving progress…'
      ) : (
        'Progress synced to your account.'
      )}
    </div>
  );
}
