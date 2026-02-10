import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
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
import { ProviderProfilePage } from './pages/provider/ProviderProfilePage';
import { VerificationUploadPage } from './pages/provider/VerificationUploadPage';
import { VerificationReviewPage } from './pages/backoffice/VerificationReviewPage';
import { UserRole } from './backend';

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
  | 'categories'
  | 'results'
  | 'provider-detail'
  | 'map-view'
  | 'my-jobs'
  | 'provider-profile'
  | 'verification-upload'
  | 'verification-review';

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const isAuthenticated = !!identity;
  const showOnboarding = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing || (isAuthenticated && profileLoading)) {
    return (
      <AppLayout>
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
      <AppLayout>
        <RoleOnboarding />
      </AppLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <LandingPage />
      </AppLayout>
    );
  }

  const userRole = userProfile?.role;

  const navigate = (page: string, params?: { category?: string; provider?: string }) => {
    if (params?.category) setSelectedCategory(params.category);
    if (params?.provider) setSelectedProvider(params.provider);
    setCurrentPage(page as Page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'categories':
        return userRole === UserRole.client ? (
          <CategoriesPage onNavigate={navigate} />
        ) : (
          <AccessDenied />
        );
      case 'results':
        return userRole === UserRole.client ? (
          <ProviderResultsPage 
            selectedCategory={selectedCategory} 
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
            selectedCategory={selectedCategory}
            onNavigate={navigate}
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
        return <LandingPage />;
    }
  };

  return (
    <AppLayout currentPage={currentPage} onNavigate={navigate} userRole={userRole}>
      {renderPage()}
    </AppLayout>
  );
}

function AccessDenied() {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="mt-2 text-muted-foreground">
          You don't have permission to view this page.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
