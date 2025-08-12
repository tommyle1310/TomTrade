"use client";

import { useMemo, useState } from "react";
import { Bell, LogOut, Menu } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// Auth dialog uses only shadcn components to avoid styling conflicts
import { loginMutation, signUpMutation } from "@/lib/graphqlClient";

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 10.2v3.9h5.5c-.2 1.3-1.7 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.8 3.1 14.6 2 12 2 6.9 2 2.7 6.2 2.7 11.3S6.9 20.7 12 20.7c6.9 0 8.2-4.8 7.6-7.3H12z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2.4V12h2.4V9.7c0-2.4 1.4-3.7 3.5-3.7 1 0 2 .2 2 .2v2.2h-1.1c-1.1 0-1.5.7-1.5 1.4V12h2.6l-.4 2.9h-2.2v7A10 10 0 0 0 22 12z"/>
    </svg>
  );
}

const loginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(6, { message: "At least 6 characters" }),
});

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name is too short" }),
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(8, { message: "At least 8 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

export default function Topbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [count] = useState(4);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "buyer2@example.com", password: "123456" },
    mode: "onChange",
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onChange",
  });

  const onSubmitLogin = async (values: LoginFormValues) => {
    const { login } = await loginMutation({ email: values.email, password: values.password });
    if (login?.accessToken) {
      localStorage.setItem("accessToken", login.accessToken);
    }
    setAuthOpen(false);
  };

  const onSubmitSignup = async (values: SignupFormValues) => {
    const { signUp } = await signUpMutation({ email: values.email, password: values.password, name: values.name });
    if (signUp?.accessToken) {
      localStorage.setItem("accessToken", signUp.accessToken);
    }
    setAuthOpen(false);
  };

  const avatarFallback = useMemo(() => "AD", []);

  const handleSocial = (provider: "google" | "facebook") => {
    // TODO: integrate real OAuth flow
    console.log("OAuth start:", provider);
    setAuthOpen(false);
  };

  return (
    <header className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur supports-backdrop-blur:bg-background/60">
      <div className="flex items-center gap-3 px-4 lg:px-6 h-14">
        <Button variant="outline" size="sm" className="lg:hidden" onClick={onToggleSidebar}>
          <Menu className="size-4" />
        </Button>
        <div className="font-semibold">Admin</div>
        <div className="ml-auto flex items-center gap-2">
          <button aria-label="Notifications" className="relative rounded-full border p-2">
            <Bell className="size-4" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]">
                {count}
              </span>
            )}
          </button>

          <Popover>
            <PopoverTrigger asChild>
              <button aria-label="Profile" className="rounded-full border p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/file.svg" alt="avatar" />
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-1">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => {
                  setAuthMode("signin");
                  setAuthOpen(true);
                }}
              >
                <LogOut className="size-4" /> Logout
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-6">
              <DialogHeader className="mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={authMode === "signin" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAuthMode("signin")}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant={authMode === "signup" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAuthMode("signup")}
                  >
                    Sign Up
                  </Button>
                </div>
                <DialogTitle className="mt-2">
                  {authMode === "signin" ? "Welcome back" : "Create your account"}
                </DialogTitle>
                <DialogDescription>
                  {authMode === "signin"
                    ? "Enter your credentials to continue"
                    : "Fill the form below to get started"}
                </DialogDescription>
              </DialogHeader>

              {authMode === "signin" ? (
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onSubmitLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="name@example.com" type="email" {...field} />
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
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input placeholder="••••••••" type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" className="w-full" disabled={!loginForm.formState.isValid}>
                        Sign In
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              ) : (
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSubmitSignup)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="name@example.com" type="email" {...field} />
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
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input placeholder="Minimum 8 characters" type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" className="w-full" disabled={!signupForm.formState.isValid}>
                        Create Account
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              )}

              <div className="mt-6">
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full justify-center gap-2" onClick={() => handleSocial("google")}>
                    <GoogleIcon />
                    Google
                  </Button>
                  <Button variant="outline" className="w-full justify-center gap-2" onClick={() => handleSocial("facebook")}>
                    <FacebookIcon />
                    Facebook
                  </Button>
                </div>
              </div>
            </div>
            <div className="hidden md:block bg-gradient-to-br from-primary/10 via-muted to-primary/10" />
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}


