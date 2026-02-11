import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { AppLayout } from './components/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { RoleOnboarding } from './components/auth/RoleOnboarding';
import { CategoriesPage } from './pages/client/CategoriesPage';
import { ProviderResultsPage } from './pages/client/ProviderResultsPage';
import { ProviderDetailPage } from './pages/client/ProviderDetailPage';
import { MapViewPage } from './pages/client/MapViewPage';
import { MyJobsPage } from './pages/client/MyJobsPage';
import { ClientProfilePage } from './pages/client/ClientProfilePage';
import { ProviderProfilePage } from './pages/provider/ProviderProfilePage';
import { VerificationUploadPage } from './pages/provider/VerificationUploadPage';
import { VerificationReviewPage } from './pages/backoffice/VerificationReviewPage';
import { ClientAccessPage } from './pages/auth/ClientAccessPage';
import { ProviderAccessPage } from './pages/auth/ProviderAccessPage';
import { InstallPromptBanner } from './components/pwa/InstallPromptBanner';
import { UpdateAvailableBanner } from './components/pwa/UpdateAvailableBanner';
import { UserRole, BusinessType } from './backend';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

type Page = 
  | 'landing'
  | 'client-access'
  | 'provider-access'
  | 'categories'
  | 'results'
  | 'provider-detail'
  | 'map-view'
  | 'my-jobs'
  | 'client-profile'
  | 'provider-profile'
  | 'verification-upload'
  | 'verification-review';

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const isAuthenticated = !!identity;
  const showOnboarding = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Register service worker with version parameter
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Use a version derived from the current build
      // In production, Vite generates hashed asset URLs, so we can use the script URL as version indicator
      const version = import.meta.url ? new URL(import.meta.url).searchParams.get('v') || Date.now().toString() : Date.now().toString();
      
      navigator.serviceWorker
        .register(`/sw.js?v=${version}`)
        .then((registration) => {
          console.log('Service Worker registered with version:', version);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Define navigate handler before conditional returns
  const navigate = (page: string, params?: { businessType?: BusinessType | null; provider?: string; focusProvider?: string }) => {
    if (params?.businessType !== undefined) setSelectedBusinessType(params.businessType);
    if (params?.provider) setSelectedProvider(params.provider);
    if (params?.focusProvider) setSelectedProvider(params.focusProvider);
    setCurrentPage(page as Page);
  };

  const userRole = userProfile?.role;

  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <AppLayout currentPage={currentPage} onNavigate={navigate}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (showOnboarding) {
    return (
      <AppLayout currentPage={currentPage} onNavigate={navigate}>
        <RoleOnboarding />
      </AppLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppLayout currentPage={currentPage} onNavigate={navigate}>
        <LandingPage 
          isAuthenticated={false}
          onNavigate={navigate}
        />
        <InstallPromptBanner />
        <UpdateAvailableBanner />
      </AppLayout>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage
            isAuthenticated={isAuthenticated}
            userRole={userRole}
            profileLoading={profileLoading}
            onNavigate={navigate}
          />
        );
      case 'client-access':
        return (
          <ClientAccessPage
            onComplete={() => navigate('categories')}
          />
        );
      case 'provider-access':
        return (
          <ProviderAccessPage
            onComplete={() => navigate('provider-profile')}
          />
        );
      case 'categories':
        return userRole === UserRole.client ? (
          <CategoriesPage onNavigate={navigate} />
        ) : (
          <AccessDenied />
        );
      case 'results':
        return userRole === UserRole.client ? (
          <ProviderResultsPage 
            businessType={selectedBusinessType} 
            onNavigate={navigate}
          />
        ) : (
          <AccessDenied />
        );
      case 'provider-detail':
        return userRole === UserRole.client && selectedProvider ? (
          <ProviderDetailPage 
            providerId={selectedProvider}
            onNavigate={navigate}
          />
        ) : (
          <AccessDenied />
        );
      case 'map-view':
        return userRole === UserRole.client ? (
          <MapViewPage 
            selectedCategory={selectedBusinessType}
            onNavigate={navigate}
            focusProvider={selectedProvider}
          />
        ) : (
          <AccessDenied />
        );
      case 'my-jobs':
        return userRole === UserRole.client ? (
          <MyJobsPage onNavigate={navigate} />
        ) : (
          <AccessDenied />
        );
      case 'client-profile':
        return userRole === UserRole.client ? (
          <ClientProfilePage />
        ) : (
          <AccessDenied />
        );
      case 'provider-profile':
        return userRole === UserRole.provider ? (
          <ProviderProfilePage />
        ) : (
          <AccessDenied />
        );
      case 'verification-upload':
        return userRole === UserRole.provider ? (
          <VerificationUploadPage />
        ) : (
          <AccessDenied />
        );
      case 'verification-review':
        return userRole === UserRole.backOffice ? (
          <VerificationReviewPage />
        ) : (
          <AccessDenied />
        );
      default:
        if (userRole === UserRole.client) {
          return <CategoriesPage onNavigate={navigate} />;
        } else if (userRole === UserRole.provider) {
          return <ProviderProfilePage />;
        } else if (userRole === UserRole.backOffice) {
          return <VerificationReviewPage />;
        }
        return <LandingPage isAuthenticated={isAuthenticated} onNavigate={navigate} />;
    }
  };

  return (
    <AppLayout currentPage={currentPage} onNavigate={navigate}>
      {renderPage()}
      <InstallPromptBanner />
      <UpdateAvailableBanner />
    </AppLayout>
  );
}

function AccessDenied() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
        <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
        <p className="mt-2 text-muted-foreground">
          You do not have permission to view this page.
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
