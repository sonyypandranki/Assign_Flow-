import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: 'student' | 'admin' | null;
  signUp: (email: string, password: string, fullName: string, role: 'student' | 'admin') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'student' | 'admin' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Fetch user role when user is authenticated
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id).then(async (role) => {
              if (!role) {
                // Try to set pending role saved during signup
                try {
                  const pendingRole = localStorage.getItem('pendingRole') as 'student' | 'admin' | null;
                  if (pendingRole) {
                    await supabase.from('user_roles').insert({ user_id: session.user!.id, role: pendingRole });
                    localStorage.removeItem('pendingRole');
                    setUserRole(pendingRole);
                  }
                } catch {}
              }
            });
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (data && !error) {
      setUserRole(data.role as 'student' | 'admin');
      return data.role as 'student' | 'admin';
    }
    return null;
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'student' | 'admin'
  ) => {
    // 1. Supabase sign up request
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) {
      return { error };
    }

    // Debug log the signUp payload
    console.log('Supabase signup:', data);

    // If session is returned, user is instantly authenticated (email auto-confirmed or magic link flows)
    if (data.session && data.user?.id) {
      // 2. Insert user_roles row for this newly logged in user
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{ user_id: data.user.id, role }]);
      if (roleError) {
        return { error: roleError };
      }
      return { error: null };
    } else if (data.user?.id) {
      // No session: this means Supabase expects the user to confirm email manually first
      // Don't try to insert role: RLS will block us (not authenticated as that user yet)
      return {
        error: {
          message:
            'Sign up successful. Please check your email and confirm your account before signing in.'
        }
      };
    } else {
      // No usable user object
      return {
        error: {
          message: 'Unexpected error: No user information returned from Supabase.'
        }
      };
    }
  };
  
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
    toast({
      title: "Signed out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, userRole, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
