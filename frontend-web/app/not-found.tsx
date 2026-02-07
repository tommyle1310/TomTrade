'use client';

import { Home, ArrowLeft, Search, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';

export default function NotFound() {
    const router = useRouter();

    const quickLinks = [
        { label: 'Dashboard', href: '/', icon: <Home className="size-4" /> },
        { label: 'Trade', href: '/trade', icon: <Search className="size-4" /> },
        { label: 'Portfolio', href: '/portfolio', icon: <FileQuestion className="size-4" /> },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg"
            >
                <Card className="glass-strong border-glass-border shadow-elevated">
                    <CardContent className="p-8 text-center">
                        {/* 404 Illustration */}
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="mb-6"
                        >
                            <div className="relative inline-flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl" />
                                <div className="relative p-6 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 border border-glass-border">
                                    <FileQuestion className="size-16 text-primary" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Error Code */}
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-7xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2"
                        >
                            404
                        </motion.h1>

                        {/* Title */}
                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-xl font-semibold tracking-tight mb-2"
                        >
                            Page Not Found
                        </motion.h2>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-muted-foreground mb-8"
                        >
                            The page you&apos;re looking for doesn&apos;t exist or has been moved.
                            Let&apos;s get you back on track.
                        </motion.p>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
                        >
                            <Button
                                onClick={() => router.back()}
                                variant="outline"
                                className="gap-2 hover:bg-primary/5 transition-colors"
                            >
                                <ArrowLeft className="size-4" />
                                Go Back
                            </Button>
                            <Button
                                onClick={() => router.push('/')}
                                className="gap-2 shadow-md hover:shadow-lg transition-shadow"
                            >
                                <Home className="size-4" />
                                Back to Home
                            </Button>
                        </motion.div>

                        {/* Quick Links */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                        >
                            <p className="text-sm text-muted-foreground mb-4">Or try these pages:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {quickLinks.map((link) => (
                                    <Button
                                        key={link.href}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.push(link.href)}
                                        className="gap-2 text-muted-foreground hover:text-foreground hover:bg-primary/5"
                                    >
                                        {link.icon}
                                        {link.label}
                                    </Button>
                                ))}
                            </div>
                        </motion.div>
                    </CardContent>
                </Card>

                {/* Decorative Elements */}
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            </motion.div>
        </div>
    );
}
