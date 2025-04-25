
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ActiveCallsList from '@/components/calls/ActiveCallsList';
import { Button } from '@/components/ui/button';
import { 
  Input 
} from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import { PhoneCall, Phone } from 'lucide-react';

const CallsPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const { toast } = useToast();

  const handleMakeCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Initiating Call",
      description: `Calling ${phoneNumber}...`,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Call Management</h1>
          <p className="text-muted-foreground">Monitor and manage active calls in your contact center.</p>
        </div>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          <Card className="col-span-full md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <span>Make a Call</span>
              </CardTitle>
              <CardDescription>Place an outbound call</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMakeCall} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  <PhoneCall className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="col-span-full md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhoneCall className="h-5 w-5 text-primary" />
                <span>Call Status</span>
              </CardTitle>
              <CardDescription>
                Real-time statistics for your call center
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-accent rounded-lg p-4 flex flex-col items-center justify-center">
                  <span className="text-sm text-muted-foreground">Active Calls</span>
                  <span className="text-3xl font-bold">26</span>
                </div>
                <div className="bg-accent rounded-lg p-4 flex flex-col items-center justify-center">
                  <span className="text-sm text-muted-foreground">In Queue</span>
                  <span className="text-3xl font-bold">3</span>
                </div>
                <div className="bg-accent rounded-lg p-4 flex flex-col items-center justify-center">
                  <span className="text-sm text-muted-foreground">Avg Wait Time</span>
                  <span className="text-3xl font-bold">0:42</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="active">Active Calls</TabsTrigger>
            <TabsTrigger value="recent">Recent Calls</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-4">
            <ActiveCallsList />
          </TabsContent>
          <TabsContent value="recent" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Calls</CardTitle>
                <CardDescription>View calls from the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Recent calls history will appear here...</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="scheduled" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Calls</CardTitle>
                <CardDescription>Upcoming scheduled calls and callbacks</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">You have no scheduled calls at this time.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Call History</CardTitle>
                <CardDescription>Review past calls and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Call history will appear here...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CallsPage;
