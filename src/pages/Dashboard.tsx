
import { RecentActivity } from '@/components/RecentActivity';
import { ContentQueue } from '@/components/ContentQueue';
import { UpcomingPosts } from '@/components/UpcomingPosts';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your content creation and publishing activity
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ContentQueue />
          <UpcomingPosts />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
