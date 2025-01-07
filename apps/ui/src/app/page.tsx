import { HomePageInner } from '@/components/pages/home/HomePage';
import { PageLayout } from '@/components/shared/PageLayout';
// import { PageLoader } from '@/components/shared/PageLoader';

export default function HomePage() {
  return (
    <>
      {/* <PageLoader /> */}
      <PageLayout>
        <HomePageInner />
      </PageLayout>
    </>
  );
}
