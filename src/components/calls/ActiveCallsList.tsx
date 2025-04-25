
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PhoneCall, MessageSquare, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Call {
  id: string;
  caller: string;
  time: string;
  duration: string;
  status: "active" | "queued" | "transferring";
  agentType: "ai" | "human";
  sentiment?: "positive" | "negative" | "neutral";
}

const activeCalls: Call[] = [
  {
    id: "call-1",
    caller: "+1 (555) 123-4567",
    time: "12:34 PM",
    duration: "4:28",
    status: "active",
    agentType: "ai",
    sentiment: "positive"
  },
  {
    id: "call-2",
    caller: "+1 (555) 234-5678",
    time: "12:37 PM",
    duration: "0:57",
    status: "active",
    agentType: "ai",
    sentiment: "neutral"
  },
  {
    id: "call-3",
    caller: "+1 (555) 345-6789",
    time: "12:39 PM",
    duration: "0:15",
    status: "transferring",
    agentType: "human"
  },
  {
    id: "call-4",
    caller: "+1 (555) 456-7890",
    time: "12:42 PM",
    duration: "queued",
    status: "queued",
    agentType: "ai"
  }
];

const ActiveCallsList: React.FC = () => {
  const { toast } = useToast();
  
  const handleListenIn = (callId: string) => {
    toast({
      title: "Call Monitoring",
      description: `Now listening to call ${callId}`,
    });
  };
  
  const handleTakeOver = (callId: string) => {
    toast({
      title: "Call Transfer",
      description: `Taking over call ${callId}`,
    });
  };
  
  const getStatusColor = (status: Call["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "queued":
        return "bg-yellow-500";
      case "transferring":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };
  
  const getSentimentColor = (sentiment?: Call["sentiment"]) => {
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
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">
          <div className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-primary" />
            <span>Active Calls</span>
          </div>
        </CardTitle>
        <Badge variant="outline" className="ml-auto">
          {activeCalls.length} active
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Caller</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Started At</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Duration</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Agent</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Sentiment</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeCalls.map((call) => (
                <tr key={call.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(call.status)}`}></div>
                      <span className="capitalize">{call.status}</span>
                    </div>
                  </td>
                  <td className="p-4 align-middle font-medium">{call.caller}</td>
                  <td className="p-4 align-middle">{call.time}</td>
                  <td className="p-4 align-middle">{call.duration}</td>
                  <td className="p-4 align-middle">
                    <Badge variant={call.agentType === "ai" ? "secondary" : "default"}>
                      {call.agentType === "ai" ? "AI" : "Human"}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle">
                    {call.sentiment ? (
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getSentimentColor(call.sentiment)}`}></div>
                        <span className="capitalize">{call.sentiment}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleListenIn(call.id)}>Listen</Button>
                      <Button size="sm" variant="secondary" onClick={() => handleTakeOver(call.id)}>Take Over</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveCallsList;
