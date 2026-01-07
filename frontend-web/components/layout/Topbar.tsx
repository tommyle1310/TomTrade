'use client';

import { useMemo, useState } from 'react';
import { Bell, LogOut, Menu } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'motion/react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useAuthStore } from '@/lib/authStore';
import { useTranslation } from '@/lib/translations';
import { Label } from '../ui/label';
import { bellShake, fadeInUp, scaleIn } from '@/lib/motionVariants';

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M12 10.2v3.9h5.5c-.2 1.3-1.7 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.8 3.1 14.6 2 12 2 6.9 2 2.7 6.2 2.7 11.3S6.9 20.7 12 20.7c6.9 0 8.2-4.8 7.6-7.3H12z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2.4V12h2.4V9.7c0-2.4 1.4-3.7 3.5-3.7 1 0 2 .2 2 .2v2.2h-1.1c-1.1 0-1.5.7-1.5 1.4V12h2.6l-.4 2.9h-2.2v7A10 10 0 0 0 22 12z" />
    </svg>
  );
}

const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z.string().min(6, { message: 'At least 6 characters' }),
});

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name is too short' }),
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z.string().min(8, { message: 'At least 8 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function Topbar({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
}) {
  const { t } = useTranslation();
  const [count] = useState(4);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    signup,
    logout,
    clearError,
    getUserDisplayName,
    isAdmin,
  } = useAuthStore();

  const loginSchema = z.object({
    email: z.string().email({ message: t('auth.emailInvalid') }),
    password: z.string().min(6, { message: t('auth.passwordMin') }),
  });

  const signupSchema = z.object({
    name: z.string().min(2, { message: t('auth.nameTooShort') }),
    email: z.string().email({ message: t('auth.emailInvalid') }),
    password: z.string().min(8, { message: t('auth.passwordMinSignup') }),
  });

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'buyer1@example.com', password: '123456' },
    mode: 'onChange',
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onChange',
  });

  const onSubmitLogin = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password);
      setAuthOpen(false);
      clearError();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const onSubmitSignup = async (values: SignupFormValues) => {
    try {
      await signup(values.name, values.email, values.password);
      setAuthOpen(false);
      clearError();
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const avatarFallback = useMemo(() => {
    if (!user) return 'U';
    return getUserDisplayName().charAt(0).toUpperCase();
  }, [user, getUserDisplayName]);

  const handleSocial = (provider: 'google' | 'facebook') => {
    // TODO: integrate real OAuth flow
    console.log('OAuth start:', provider);
    setAuthOpen(false);
  };

  const handleDemoAccount = (role: 'admin' | 'buyer') => {
    // TODO: integrate real OAuth flow
    console.log('Demo account');
    if (role === 'admin') {
      login('admin@example.com', 'admin123');
    } else {
      login('buyer1@example.com', '123456');
    }
    setAuthOpen(false);
  };

  return (
    <header className="sticky top-4 mx-4 z-20 glass-strong border border-glass-border rounded-xl shadow-elevated-lg">
      <div className="flex items-center gap-3 px-4 lg:px-6 h-16">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9 hover:bg-primary/10 transition-colors"
          onClick={onToggleSidebar}
        >
          <Menu className="size-5" />
        </Button>
        <div className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {isAdmin() ? t('nav.adminPanel') : 'TomTrade'}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />

          {isAuthenticated ? (
            <>
              <motion.button
                aria-label={t('notifications.title')}
                className="relative rounded-full p-2.5 hover:bg-primary/10 transition-colors cursor-pointer"
                variants={bellShake}
                initial="idle"
                whileHover="shake"
              >
                <Bell className="size-5" />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 inline-flex size-4 items-center justify-center rounded-full bg-danger text-white text-[10px] font-medium"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    aria-label={t('user.profile')}
                    className="rounded-full p-0.5 hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer"
                  >
                    <Avatar className="h-9 w-9 border-2 border-primary/20 shadow-md hover:border-primary/40 transition-colors">
                      <AvatarImage
                        src={user?.avatar || undefined}
                        alt="avatar"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                        {avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2 glass-strong border-glass-border shadow-elevated-lg" align="end">
                  <div className="px-3 py-2.5 text-sm font-medium border-b border-glass-border mb-2">
                    <div className="truncate font-semibold">{getUserDisplayName()}</div>
                    <div className="text-xs text-muted-foreground font-normal mt-0.5">
                      {isAdmin() ? t('user.admin') : t('user.regularUser')}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="size-4" /> {t('auth.signOut')}
                  </Button>
                </PopoverContent>
              </Popover>
            </>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="shadow-md hover:shadow-lg transition-shadow font-medium"
              onClick={() => {
                setAuthMode('signin');
                setAuthOpen(true);
              }}
            >
              {t('auth.signIn')}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-0 shadow-xl">
          <motion.div
            className="grid md:grid-cols-2"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <div className="p-6">
              <DialogHeader className="mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={authMode === 'signin' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAuthMode('signin')}
                    className="transition-all"
                  >
                    {t('auth.signIn')}
                  </Button>
                  <Button
                    variant={authMode === 'signup' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAuthMode('signup')}
                    className="transition-all"
                  >
                    {t('auth.signUp')}
                  </Button>
                </div>
                <DialogTitle className="mt-2">
                  {authMode === 'signin'
                    ? t('auth.welcomeBack')
                    : t('auth.createAccount')}
                </DialogTitle>
                <DialogDescription>
                  {authMode === 'signin'
                    ? t('auth.signInToContinue')
                    : t('auth.signUpToStart')}
                </DialogDescription>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </DialogHeader>

              <AnimatePresence mode="wait">
                {authMode === 'signin' ? (
                  <motion.div
                    key="signin"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Form {...loginForm}>
                      <form
                        onSubmit={loginForm.handleSubmit(onSubmitLogin)}
                        className="space-y-4"
                      >
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('auth.email')}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="name@example.com"
                                  type="email"
                                  className="transition-all focus:ring-2 focus:ring-primary/20"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('auth.password')}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="••••••••"
                                  type="password"
                                  className="transition-all focus:ring-2 focus:ring-primary/20"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button
                            type="submit"
                            className="w-full shadow-sm"
                            disabled={!loginForm.formState.isValid || loading}
                          >
                            {loading ? (
                              <LoadingSpinner size="sm" variant="spinner" />
                            ) : (
                              t('auth.signIn')
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Form {...signupForm}>
                      <form
                        onSubmit={signupForm.handleSubmit(onSubmitSignup)}
                        className="space-y-4"
                      >
                        <FormField
                          control={signupForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('auth.name')}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t('auth.name')}
                                  className="transition-all focus:ring-2 focus:ring-primary/20"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('auth.email')}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="name@example.com"
                                  type="email"
                                  className="transition-all focus:ring-2 focus:ring-primary/20"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signupForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('auth.password')}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t('auth.passwordMinSignup')}
                                  type="password"
                                  className="transition-all focus:ring-2 focus:ring-primary/20"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button
                            type="submit"
                            className="w-full shadow-sm"
                            disabled={!signupForm.formState.isValid || loading}
                          >
                            {loading ? (
                              <LoadingSpinner size="sm" variant="spinner" />
                            ) : (
                              t('auth.createAccount')
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6">
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {t('auth.orContinueWith')}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-2 hover:bg-accent/80 transition-colors"
                    onClick={() => handleSocial('google')}
                  >
                    <GoogleIcon />
                    {t('auth.google')}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-2 hover:bg-accent/80 transition-colors"
                    onClick={() => handleSocial('facebook')}
                  >
                    <FacebookIcon />
                    {t('auth.facebook')}
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="col-span-2">Demo Account</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 flex justify-between gap-2">
                      <Button className='w-[48%]' onClick={() => handleDemoAccount('admin')}>{t('user.admin')}</Button>
                      <Button className='w-[48%]' onClick={() => handleDemoAccount('buyer')}>{t('user.regularUser')}</Button>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <div className="hidden md:block bg-gradient-to-br from-primary/20 via-primary/5 to-transparent relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,var(--primary)_0%,transparent_50%)] opacity-20" />
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
