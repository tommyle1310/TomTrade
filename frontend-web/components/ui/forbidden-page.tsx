"use client";

import { Button } from "@/components/ui/button";
import { Shield, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ForbiddenPageProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
}

export function ForbiddenPage({ 
  title = "Access Denied", 
  message = "You don't have permission to access this page.",
  showHomeButton = true 
}: ForbiddenPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{message}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Link>
          </Button>
          
          {showHomeButton && (
            <Button asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
