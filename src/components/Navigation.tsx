
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Upload, 
  FileText, 
  Settings, 
  Palette,
  User,
  LogOut
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Upload, label: 'Upload', path: '/upload' },
    { icon: FileText, label: 'Drafts', path: '/drafts' },
    { icon: Palette, label: 'Style', path: '/style' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleSignOut = () => {
    // TODO: Implement real sign out
    console.log('Sign out');
    navigate('/auth');
  };

  return (
    <nav className="bg-card border-r border-border h-screen w-64 p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Draft Weaver</h1>
        <p className="text-sm text-muted-foreground">Content Management</p>
      </div>

      <div className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              variant={isActive ? "default" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => navigate(item.path)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </div>

      <div className="border-t border-border pt-4 space-y-2">
        <Button variant="ghost" className="w-full justify-start gap-3">
          <User className="h-4 w-4" />
          Profile
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-destructive hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;
