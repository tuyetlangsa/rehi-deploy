"use client";
import React from "react";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const SettingsPage = () => {
  return (
    <div className="container mx-auto py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-6">
            <p className="text-sm text-muted-foreground">
              Development in progress...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default withPageAuthRequired(SettingsPage);
