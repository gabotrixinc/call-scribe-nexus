
import React from 'react';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Search, 
  ChevronRight,
  Calendar,
  CalendarIcon
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useToast } from '@/components/ui/use-toast';

interface Conversation {
  id: string;
  caller: string;
  date: string;
  time: string;
  duration: string;
  agent: string;
  agentType: "ai" | "human";
  sentiment?: "positive" | "negative" | "neutral";
  summary: string;
}

const conversations: Conversation[] = [
  {
    id: "conv-1",
    caller: "+1 (555) 123-4567",
    date: "2023-04-25",
    time: "10:23 AM",
    duration: "4:28",
    agent: "General Assistant",
    agentType: "ai",
    sentiment: "positive",
    summary: "Customer inquired about their account balance and recent transactions. Provided statement information and explained recent fees."
  },
  {
    id: "conv-2",
    caller: "+1 (555) 234-5678",
    date: "2023-04-25",
    time: "11:42 AM",
    duration: "6:12",
    agent: "Technical Support",
    agentType: "ai",
    sentiment: "neutral",
    summary: "Troubleshooted connection issues with the mobile app. Guided through reinstallation and account recovery process."
  },
  {
    id: "conv-3",
    caller: "+1 (555) 345-6789",
    date: "2023-04-25",
    time: "01:15 PM",
    duration: "8:54",
    agent: "Sarah Johnson",
    agentType: "human",
    sentiment: "negative",
    summary: "Customer expressed dissatisfaction with recent service outage. Explained situation and provided credit to account as compensation."
  },
  {
    id: "conv-4",
    caller: "+1 (555) 456-7890",
    date: "2023-04-24",
    time: "03:37 PM",
    duration: "3:18",
    agent: "Sales Agent",
    agentType: "ai",
    sentiment: "positive",
    summary: "Customer inquired about premium subscription options. Explained benefits and pricing tiers, customer indicated interest but wants to think it over."
  },
  {
    id: "conv-5",
    caller: "+1 (555) 567-8901",
    date: "2023-04-24",
    time: "04:52 PM",
    duration: "5:46",
    agent: "David Miller",
    agentType: "human",
    sentiment: "positive",
    summary: "Customer needed assistance with updating their payment information. Guided through the process successfully."
  }
];

const ConversationsPage: React.FC = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const { toast } = useToast();
  
  const handleViewConversation = (id: string) => {
    toast({
      title: "View Conversation",
      description: `Opening conversation ${id}`,
    });
  };
  
  const getSentimentColor = (sentiment?: Conversation["sentiment"]) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500";
      case "negative":
        return "bg-red-500";
      case "neutral":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conversations</h1>
          <p className="text-muted-foreground">Review past conversations and analyze performance.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search conversations..."
              className="pl-8 w-full"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Agent Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="ai">AI Agents</SelectItem>
                <SelectItem value="human">Human Agents</SelectItem>
              </SelectContent>
            </Select>
            
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiments</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full md:w-auto pl-3 text-left font-normal"
                >
                  {date ? format(date, "MMM dd, yyyy") : "Pick a date"}
                  <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="all">All Conversations</TabsTrigger>
            <TabsTrigger value="flagged">Flagged</TabsTrigger>
            <TabsTrigger value="unresolved">Unresolved</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span>Recent Conversations</span>
                </CardTitle>
                <CardDescription>Call records for review and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b transition-colors hover:bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium">Date/Time</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Caller</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Duration</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Agent</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Sentiment</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Summary</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conversations.map((conv) => (
                        <tr key={conv.id} className="border-b transition-colors hover:bg-muted/50">
                          <td className="p-4 align-middle">
                            <div className="flex flex-col">
                              <span>{conv.date}</span>
                              <span className="text-muted-foreground text-xs">{conv.time}</span>
                            </div>
                          </td>
                          <td className="p-4 align-middle font-medium">{conv.caller}</td>
                          <td className="p-4 align-middle">{conv.duration}</td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-2">
                              <Badge variant={conv.agentType === "ai" ? "secondary" : "default"}>
                                {conv.agentType === "ai" ? "AI" : "Human"}
                              </Badge>
                              <span>{conv.agent}</span>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            {conv.sentiment ? (
                              <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${getSentimentColor(conv.sentiment)}`}></div>
                                <span className="capitalize">{conv.sentiment}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">--</span>
                            )}
                          </td>
                          <td className="p-4 align-middle max-w-xs">
                            <p className="truncate text-muted-foreground">{conv.summary}</p>
                          </td>
                          <td className="p-4 align-middle">
                            <Button size="sm" variant="ghost" onClick={() => handleViewConversation(conv.id)}>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="flagged" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Flagged Conversations</CardTitle>
                <CardDescription>Conversations that require special attention</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No flagged conversations found.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="unresolved" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Unresolved Issues</CardTitle>
                <CardDescription>Conversations that need follow-up</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No unresolved issues found.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="insights" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Conversation Insights</CardTitle>
                <CardDescription>Analytics and patterns from your conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Insights feature is currently in development.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ConversationsPage;
