
import React, { useState, useEffect } from 'react';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, PhoneCall, Clock, Calendar, DownloadCloud } from 'lucide-react';
import { useContactsService } from '@/hooks/useContactsService';
import { useToast } from "@/components/ui/use-toast";

interface ContactCallHistoryProps {
  contactPhone: string;
}

const ContactCallHistory: React.FC<ContactCallHistoryProps> = ({ contactPhone }) => {
  const { getContactCallHistory } = useContactsService();
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCallHistory = async () => {
      setLoading(true);
      try {
        const history = await getContactCallHistory(contactPhone);
        setCallHistory(history);
      } catch (error) {
        console.error('Error fetching call history:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar el historial de llamadas',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (contactPhone) {
      fetchCallHistory();
    }
  }, [contactPhone, getContactCallHistory]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'abandoned':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // If no call history is available yet, show sample data
  const displayHistory = callHistory.length > 0 ? callHistory : Array(3).fill({}).map((_, i) => ({
    id: `sample-${i}`,
    start_time: new Date(Date.now() - (i+1) * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() - (i+1) * 24 * 60 * 60 * 1000 + 300000).toISOString(),
    status: i === 0 ? 'completed' : i === 1 ? 'abandoned' : 'completed',
    duration: i === 0 ? 300 : i === 1 ? 45 : 180,
    ai_agent_id: i === 0 ? 'sample-agent-1' : i === 1 ? null : 'sample-agent-2',
    human_agent_id: i === 1 ? 'sample-human-1' : null,
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <span>Historial de Llamadas</span>
        </CardTitle>
        <CardDescription>
          Llamadas realizadas con este contacto
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableCaption>
              {callHistory.length === 0 ? 'No hay historial de llamadas disponible para este contacto.' : 'Historial de llamadas del contacto'}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Agente</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayHistory.map((call) => (
                <TableRow key={call.id}>
                  <TableCell className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(call.start_time)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(call.status)}>
                      {call.status === 'active' ? 'En curso' : 
                        call.status === 'completed' ? 'Completada' : 
                        call.status === 'abandoned' ? 'Abandonada' : 
                        call.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDuration(call.duration)}</TableCell>
                  <TableCell>
                    {call.ai_agent_id ? 'IA' : call.human_agent_id ? 'Humano' : 'No asignado'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" title="Llamar">
                        <PhoneCall className="h-4 w-4" />
                      </Button>
                      {call.recording_url && (
                        <Button size="icon" variant="ghost" title="Descargar grabación">
                          <DownloadCloud className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactCallHistory;
