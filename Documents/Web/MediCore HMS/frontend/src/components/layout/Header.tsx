import { Bell, Search, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components';
import { useOffline } from '@/store/OfflineContext';

export default function Header({ title }: { title: string }) {
  const { isOnline, pendingSyncCount } = useOffline();

  return (
    <header className="h-16 bg-white border-b border-secondary-200 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-secondary-800">{title}</h1>

      <div className="flex items-center gap-4">
        <Input icon={Search} placeholder="Search..." className="w-64" />

        <button className="relative p-2 text-secondary-500 hover:bg-secondary-100 rounded-md transition-colors">
          <Bell className="w-5 h-5" />
          {pendingSyncCount > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-danger-500 rounded-full" />
          )}
        </button>

        <div
          className={cn(
            'flex items-center gap-2 px-3 py-1 rounded-full text-sm',
            isOnline
              ? 'bg-success-50 text-success-600'
              : 'bg-warning-50 text-warning-600'
          )}
        >
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>Offline</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
