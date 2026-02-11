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
import { UserRole } from './backend';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { InstallPromptBanner } from './components/pwa/InstallPromptBanner';
import { UpdateAvailableBanner } from './components/pwa/UpdateAvailableBanner';
import { getCategoryById } from './lib/categories';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: false,
      retry: 1,
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

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [focusProviderId, setFocusProviderId] = useState<string | null>(null);

  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    }
  }, []);

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page as Page);
    if (params?.categoryId !== undefined) {
      setSelectedCategoryId(params.categoryId);
    }
    if (params?.provider) {
      setSelectedProviderId(params.provider);
    }
    if (params?.focusProvider) {
      setFocusProviderId(params.focusProvider);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ThemeProvider>
    );
  }

  if (showProfileSetup) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <AppLayout currentPage="landing" onNavigate={handleNavigate}>
            <RoleOnboarding />
          </AppLayout>
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    );
  }

  const userRole = userProfile?.role;

  let content: React.ReactNode;

  switch (currentPage) {
    case 'landing':
      content = (
        <LandingPage
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          profileLoading={profileLoading}
          onNavigate={handleNavigate}
        />
      );
      break;
    case 'client-access':
      content = <ClientAccessPage onComplete={() => handleNavigate('landing')} />;
      break;
    case 'provider-access':
      content = <ProviderAccessPage onComplete={() => handleNavigate('landing')} />;
      break;
    case 'categories':
      content = <CategoriesPage onNavigate={handleNavigate} />;
      break;
    case 'results':
      const category = selectedCategoryId ? getCategoryById(selectedCategoryId) : null;
      content = (
        <ProviderResultsPage
          categoryId={selectedCategoryId}
          categoryLabel={category?.label || null}
          onNavigate={handleNavigate}
        />
      );
      break;
    case 'provider-detail':
      content = (
        <ProviderDetailPage
          providerId={selectedProviderId || ''}
          onNavigate={handleNavigate}
        />
      );
      break;
    case 'map-view':
      const mapCategory = selectedCategoryId ? getCategoryById(selectedCategoryId) : null;
      content = (
        <MapViewPage
          selectedCategory={mapCategory?.businessType || null}
          focusProvider={focusProviderId}
          onNavigate={handleNavigate}
        />
      );
      break;
    case 'my-jobs':
      content = <MyJobsPage onNavigate={handleNavigate} />;
      break;
    case 'client-profile':
      content = <ClientProfilePage />;
      break;
    case 'provider-profile':
      content = <ProviderProfilePage />;
      break;
    case 'verification-upload':
      content = <VerificationUploadPage />;
      break;
    case 'verification-review':
      content = <VerificationReviewPage />;
      break;
    default:
      content = (
        <LandingPage
          isAuthenticated={isAuthenticated}
          userRole={userRole}
          profileLoading={profileLoading}
          onNavigate={handleNavigate}
        />
      );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AppLayout currentPage={currentPage} onNavigate={handleNavigate} userRole={userRole}>
          {content}
        </AppLayout>
        <InstallPromptBanner />
        <UpdateAvailableBanner />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
