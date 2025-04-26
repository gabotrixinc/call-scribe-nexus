
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ActiveCallsList from '@/components/calls/ActiveCallsList';
import CallMaker from '@/components/calls/CallMaker';
import TwilioConnectionTest from '@/components/calls/TwilioConnectionTest';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhoneCall, Settings } from 'lucide-react';
import { useCallsService } from '@/hooks/useCallsService';
import CallControlPanel from '@/components/calls/CallControlPanel';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const CallsPage: React.FC = () => {
  const { activeCalls, isLoadingActiveCalls } = useCallsService();
  const [selectedTab, setSelectedTab] = useState<string>('active');
  const [showSettings, setShowSettings] = useState(false);

  // Filtrar las llamadas activas para mostrar los paneles de control
  const activeCallsForDisplay = activeCalls?.slice(0, 3) || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Llamadas</h1>
            <p className="text-muted-foreground">Monitoreo y gestión de llamadas activas en su centro de contacto.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
        </div>
        
        {showSettings && (
          <Card>
            <CardHeader>
              <CardTitle>Configuración de llamadas</CardTitle>
              <CardDescription>Verifique la conexión con Twilio y configure parámetros</CardDescription>
            </CardHeader>
            <CardContent>
              <TwilioConnectionTest />
            </CardContent>
          </Card>
        )}
        
        {activeCallsForDisplay.length > 0 && (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-4">
            {activeCallsForDisplay.map((call) => (
              <CallControlPanel
                key={call.id}
                callId={call.id}
                phoneNumber={call.caller_number}
                callerName={call.caller_name}
                startTime={call.start_time}
              />
            ))}
          </div>
        )}
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          <CallMaker />

          <Card className="col-span-full md:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhoneCall className="h-5 w-5 text-primary" />
                <span>Estado de las Llamadas</span>
              </CardTitle>
              <CardDescription>
                Estadísticas en tiempo real de su centro de llamadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-accent rounded-lg p-4 flex flex-col items-center justify-center">
                  <span className="text-sm text-muted-foreground">Llamadas Activas</span>
                  <span className="text-3xl font-bold">{isLoadingActiveCalls ? "..." : activeCalls?.length || 0}</span>
                </div>
                <div className="bg-accent rounded-lg p-4 flex flex-col items-center justify-center">
                  <span className="text-sm text-muted-foreground">En Cola</span>
                  <span className="text-3xl font-bold">0</span>
                </div>
                <div className="bg-accent rounded-lg p-4 flex flex-col items-center justify-center">
                  <span className="text-sm text-muted-foreground">Tiempo de Espera Prom.</span>
                  <span className="text-3xl font-bold">0:42</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="active" className="w-full" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="active">Llamadas Activas</TabsTrigger>
            <TabsTrigger value="recent">Llamadas Recientes</TabsTrigger>
            <TabsTrigger value="scheduled">Programadas</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-4">
            <ActiveCallsList />
          </TabsContent>
          <TabsContent value="recent" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Llamadas Recientes</CardTitle>
                <CardDescription>Ver llamadas de las últimas 24 horas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">El historial de llamadas recientes aparecerá aquí...</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="scheduled" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Llamadas Programadas</CardTitle>
                <CardDescription>Próximas llamadas programadas y devoluciones de llamada</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No tiene llamadas programadas en este momento.</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Llamadas</CardTitle>
                <CardDescription>Revisar llamadas pasadas y análisis</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">El historial de llamadas aparecerá aquí...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CallsPage;
