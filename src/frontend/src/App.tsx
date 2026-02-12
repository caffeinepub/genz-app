import { useState, useEffect } from 'react';
import { AppLayout } from './components/AppLayout';
import { LandingPage } from './pages/LandingPage';
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
import { RoleOnboarding } from './components/auth/RoleOnboarding';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { UserRole } from './backend';
import { checkClientProfileCompletion, checkProviderProfileCompletion } from './utils/profileCompletion';

type Page =
  | 'landing'
  | 'client-access'
  | 'provider-access'
  | 'role-onboarding'
  | 'categories'
  | 'results'
  | 'provider-detail'
  | 'map-view'
  | 'my-jobs'
  | 'client-profile'
  | 'provider-profile'
  | 'verification-upload'
  | 'verification-review';

interface PageParams {
  categoryId?: string | null;
  categoryLabel?: string;
  provider?: string;
  focusProvider?: string;
}

function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [pageParams, setPageParams] = useState<PageParams>({});

  const isAuthenticated = !!identity;

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page as Page);
    setPageParams(params || {});
  };

  const handleAccessComplete = () => {
    if (!userProfile) {
      handleNavigate('role-onboarding');
    } else {
      // Route based on role and profile completion
      if (userProfile.role === UserRole.client) {
        const completionStatus = checkClientProfileCompletion(userProfile.clientProfile);
        if (!completionStatus.isComplete) {
          handleNavigate('client-profile');
        } else {
          handleNavigate('categories');
        }
      } else if (userProfile.role === UserRole.provider) {
        const completionStatus = checkProviderProfileCompletion(userProfile.providerProfile);
        if (!completionStatus.isComplete) {
          handleNavigate('provider-profile');
        } else {
          handleNavigate('provider-profile');
        }
      } else if (userProfile.role === UserRole.backOffice) {
        handleNavigate('verification-review');
      }
    }
  };

  const handleRoleOnboardingComplete = () => {
    handleAccessComplete();
  };

  // Redirect authenticated users from access pages
  useEffect(() => {
    if (isAuthenticated && !profileLoading && isFetched) {
      if (currentPage === 'client-access' || currentPage === 'provider-access') {
        handleAccessComplete();
      }
    }
  }, [isAuthenticated, profileLoading, isFetched, currentPage]);

  // Check profile completion for gating
  const clientCompletionStatus = userProfile?.role === UserRole.client 
    ? checkClientProfileCompletion(userProfile.clientProfile)
    : null;
  
  const providerCompletionStatus = userProfile?.role === UserRole.provider
    ? checkProviderProfileCompletion(userProfile.providerProfile)
    : null;

  const isClientProfileIncomplete = clientCompletionStatus && !clientCompletionStatus.isComplete;
  const isProviderProfileIncomplete = providerCompletionStatus && !providerCompletionStatus.isComplete;

  // Gate client pages if profile is incomplete
  useEffect(() => {
    if (isAuthenticated && userProfile?.role === UserRole.client && isClientProfileIncomplete) {
      const clientPages: Page[] = ['categories', 'results', 'provider-detail', 'map-view', 'my-jobs'];
      if (clientPages.includes(currentPage)) {
        handleNavigate('client-profile');
      }
    }
  }, [isAuthenticated, userProfile, isClientProfileIncomplete, currentPage]);

  // Gate provider pages if profile is incomplete
  useEffect(() => {
    if (isAuthenticated && userProfile?.role === UserRole.provider && isProviderProfileIncomplete) {
      const providerPages: Page[] = ['verification-upload'];
      if (providerPages.includes(currentPage)) {
        handleNavigate('provider-profile');
      }
    }
  }, [isAuthenticated, userProfile, isProviderProfileIncomplete, currentPage]);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage
            isAuthenticated={isAuthenticated}
            userRole={userProfile?.role}
            profileLoading={profileLoading}
            onNavigate={handleNavigate}
          />
        );
      case 'client-access':
        return <ClientAccessPage onComplete={handleAccessComplete} />;
      case 'provider-access':
        return <ProviderAccessPage onComplete={handleAccessComplete} />;
      case 'role-onboarding':
        return <RoleOnboarding onComplete={handleRoleOnboardingComplete} />;
      case 'categories':
        return <CategoriesPage onNavigate={handleNavigate} />;
      case 'results':
        return (
          <ProviderResultsPage
            categoryId={pageParams.categoryId || null}
            categoryLabel={pageParams.categoryLabel || 'All Providers'}
            onNavigate={handleNavigate}
          />
        );
      case 'provider-detail':
        return pageParams.provider ? (
          <ProviderDetailPage providerId={pageParams.provider} onNavigate={handleNavigate} />
        ) : (
          <div>Provider not found</div>
        );
      case 'map-view':
        return <MapViewPage selectedCategory={null} onNavigate={handleNavigate} />;
      case 'my-jobs':
        return <MyJobsPage onNavigate={handleNavigate} />;
      case 'client-profile':
        return <ClientProfilePage />;
      case 'provider-profile':
        return <ProviderProfilePage />;
      case 'verification-upload':
        return <VerificationUploadPage />;
      case 'verification-review':
        return <VerificationReviewPage />;
      default:
        return (
          <LandingPage
            isAuthenticated={isAuthenticated}
            userRole={userProfile?.role}
            profileLoading={profileLoading}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <AppLayout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      userRole={userProfile?.role}
    >
      {renderPage()}
    </AppLayout>
  );
}

export default App;
