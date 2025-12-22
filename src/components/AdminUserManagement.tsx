import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Trash2, Shield, User, Search } from 'lucide-react';

interface UserWithRole {
  user_id: string;
  role: 'admin' | 'user';
  display_name: string | null;
}

const AdminUserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('admin');
  const [adding, setAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          profiles!inner(display_name)
        `)
        .order('role', { ascending: true });

      if (error) throw error;

      const formattedUsers = (data || []).map((item: any) => ({
        user_id: item.user_id,
        role: item.role as 'admin' | 'user',
        display_name: item.profiles?.display_name || 'Unknown User',
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback: fetch without join
      try {
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .order('role', { ascending: true });

        if (rolesData) {
          const userIds = rolesData.map(r => r.user_id);
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('user_id, display_name')
            .in('user_id', userIds);

          const profileMap = new Map(profilesData?.map(p => [p.user_id, p.display_name]) || []);

          setUsers(rolesData.map(r => ({
            user_id: r.user_id,
            role: r.role as 'admin' | 'user',
            display_name: profileMap.get(r.user_id) || 'Unknown User',
          })));
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddRole = async () => {
    if (!newUserEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a user email',
        variant: 'destructive',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail.trim())) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setAdding(true);
    try {
      // Look up user by email using edge function
      const { data: userData, error: lookupError } = await supabase.functions.invoke('get-user-by-email', {
        body: { email: newUserEmail.trim() }
      });

      if (lookupError) {
        console.error('Lookup error:', lookupError);
        throw new Error('Failed to look up user');
      }

      if (!userData?.user) {
        toast({
          title: 'User Not Found',
          description: 'No user found with that email. Make sure the user has signed up first.',
          variant: 'destructive',
        });
        setAdding(false);
        return;
      }

      const userId = userData.user.id;

      // Check if role already exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', newUserRole)
        .maybeSingle();

      if (existingRole) {
        toast({
          title: 'Role Already Exists',
          description: `This user already has the ${newUserRole} role.`,
          variant: 'destructive',
        });
        setAdding(false);
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: newUserRole as 'admin' | 'moderator' | 'user' }]);

      if (error) throw error;

      toast({ title: `${newUserRole} role added to ${newUserEmail}` });
      setNewUserEmail('');
      fetchUsers();
    } catch (error) {
      console.error('Error adding role:', error);
      toast({
        title: 'Error',
        description: 'Failed to add role. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveRole = async (userId: string, role: 'admin' | 'user') => {
    if (!confirm(`Are you sure you want to remove the ${role} role from this user?`)) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role as 'admin' | 'moderator' | 'user');

      if (error) throw error;

      toast({ title: 'Role removed successfully' });
      fetchUsers();
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove role',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminUsers = filteredUsers.filter(u => u.role === 'admin');
  const regularUsers = filteredUsers.filter(u => u.role === 'user');

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Role Form */}
      <div className="rounded-xl border-2 border-foreground/20 bg-card p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add Role to User
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="User email address"
            type="email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            className="flex-1 border-2 border-foreground/20"
          />
          <Select
            value={newUserRole}
            onValueChange={(value: 'admin' | 'user') => setNewUserRole(value)}
          >
            <SelectTrigger className="w-full sm:w-32 border-2 border-foreground/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddRole} disabled={adding} className="rounded-full">
            {adding ? 'Adding...' : 'Add Role'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Enter the user's email address. The user must have signed up first.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-2 border-foreground/20"
        />
      </div>

      {/* Admins Section */}
      <div>
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Admins ({adminUsers.length})
        </h3>
        {adminUsers.length === 0 ? (
          <p className="text-muted-foreground text-sm">No admins found</p>
        ) : (
          <div className="space-y-2">
            {adminUsers.map((user) => (
              <div
                key={`${user.user_id}-admin`}
                className="flex items-center justify-between p-3 rounded-lg border-2 border-foreground/10 bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{user.display_name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{user.user_id.slice(0, 8)}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Admin</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveRole(user.user_id, 'admin')}
                    className="rounded-full text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Regular Users Section */}
      <div>
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          Users ({regularUsers.length})
        </h3>
        {regularUsers.length === 0 ? (
          <p className="text-muted-foreground text-sm">No regular users with explicit role found</p>
        ) : (
          <div className="space-y-2">
            {regularUsers.map((user) => (
              <div
                key={`${user.user_id}-user`}
                className="flex items-center justify-between p-3 rounded-lg border-2 border-foreground/10 bg-card"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{user.display_name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{user.user_id.slice(0, 8)}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">User</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveRole(user.user_id, 'user')}
                    className="rounded-full text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;
