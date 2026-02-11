import { useState, useEffect } from 'react';

interface ServiceWorkerUpdateState {
  updateAvailable: boolean;
  updateAndReload: () => void;
}

export function useServiceWorkerUpdate(): ServiceWorkerUpdateState {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const handleControllerChange = () => {
      console.log('[SW Update] Controller changed, reloading page');
      window.location.reload();
    };

    const handleUpdateFound = (registration: ServiceWorkerRegistration) => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      console.log('[SW Update] New service worker installing');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker is installed and waiting
          console.log('[SW Update] New service worker installed and waiting');
          setWaitingWorker(newWorker);
          setUpdateAvailable(true);
        }
      });
    };

    // Check for existing registration
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) return;

      // Check if there's already a waiting worker
      if (registration.waiting) {
        console.log('[SW Update] Waiting worker found on load');
        setWaitingWorker(registration.waiting);
        setUpdateAvailable(true);
      }

      // Listen for new updates
      registration.addEventListener('updatefound', () => handleUpdateFound(registration));
    });

    // Listen for controller changes
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // Check for updates periodically (every 60 seconds)
    const intervalId = setInterval(() => {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          console.log('[SW Update] Checking for updates...');
          registration.update();
        }
      });
    }, 60000);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      clearInterval(intervalId);
    };
  }, []);

  const updateAndReload = () => {
    if (!waitingWorker) {
      console.warn('[SW Update] No waiting worker available');
      return;
    }

    console.log('[SW Update] Sending SKIP_WAITING message');
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  };

  return {
    updateAvailable,
    updateAndReload,
  };
}
