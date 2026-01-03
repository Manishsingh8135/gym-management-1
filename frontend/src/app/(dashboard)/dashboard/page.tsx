import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ExpiringMemberships } from "@/components/dashboard/expiring-memberships";
import { TodayClasses } from "@/components/dashboard/today-classes";

export default function DashboardPage() {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section - Spotify Style */}
      <section>
        <h1 className="text-3xl font-bold text-white mb-6">
          {getGreeting()}
        </h1>
        
        {/* Stats Cards */}
        <StatsCards />
      </section>

      {/* Quick Actions Section */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickActions />
          <TodayClasses />
          <RecentActivity />
        </div>
      </section>

      {/* Expiring Memberships Section */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Needs Attention</h2>
        <ExpiringMemberships />
      </section>
    </div>
  );
}
