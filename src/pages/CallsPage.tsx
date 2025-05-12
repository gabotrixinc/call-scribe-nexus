import React, { useState, useEffect } from 'react';
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
import { PhoneCall, Settings, BarChart2, Calendar, History } from 'lucide-react';
import { useCallsService } from '@/hooks/useCallsService';
import CallControlPanel from '@/components/calls/CallControlPanel';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';

const CallsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeCalls, isLoadingActiveCalls } = useCallsService();
  const [selectedTab, setSelectedTab] = useState<string>('active');
  const [showSettings, setShowSettings] = useState(false);

  // Get phone number from URL parameters (if coming from contacts)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const phoneFromUrl = params.get('phone');
    if (phoneFromUrl) {
      // Here we could auto-populate the phone number in the call maker
      console.log("Phone from URL:", phoneFromUrl);
    }
  }, [location.search]);

  // Filter active calls for display
  const activeCallsForDisplay = activeCalls?.slice(0, 3) || [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Llamadas</h1>
            <p className="text-muted-foreground">Monitoreo y gestión de llamadas en su centro de contacto.</p>
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
        
        <div className="grid gap-6 grid-cols-1">
          {/* Call Maker and Stats Section */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
            <CallMaker />
            
            <Card className="lg:col-span-9">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  <span>Estadísticas del Centro de Llamadas</span>
                </CardTitle>
                <CardDescription>
                  Métricas en tiempo real de su centro de contacto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 flex flex-col items-center justify-center">
                    <span className="text-sm text-muted-foreground mb-1">Llamadas Activas</span>
                    <span className="text-3xl font-bold text-green-600 dark:text-green-400">{isLoadingActiveCalls ? "..." : activeCalls?.length || 0}</span>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 flex flex-col items-center justify-center">
                    <span className="text-sm text-muted-foreground mb-1">En Cola</span>
                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">0</span>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg p-4 flex flex-col items-center justify-center">
                    <span className="text-sm text-muted-foreground mb-1">Tiempo de Espera</span>
                    <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">0:42</span>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 flex flex-col items-center justify-center">
                    <span className="text-sm text-muted-foreground mb-1">Satisfacción</span>
                    <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">96%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Active Call Control Panels */}
          {activeCallsForDisplay.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Llamadas Activas</h2>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mb-4">
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
            </div>
          )}
        </div>
        
        <Tabs defaultValue="active" className="w-full" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full md:w-auto grid-cols-4">
            <TabsTrigger value="active" className="flex items-center gap-1">
              <PhoneCall className="h-4 w-4 hidden md:block" />
              <span>Llamadas Activas</span>
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-1">
              <History className="h-4 w-4 hidden md:block" />
              <span>Recientes</span>
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-1">
              <Calendar className="h-4 w-4 hidden md:block" />
              <span>Programadas</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <History className="h-4 w-4 hidden md:block" />
              <span>Historial</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PhoneCall className="h-5 w-5 text-primary" />
                  <span>Llamadas Activas</span>
                </CardTitle>
                <CardDescription>Llamadas actualmente en curso</CardDescription>
              </CardHeader>
              <CardContent>
                <ActiveCallsList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="recent" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Llamadas Recientes</CardTitle>
                <CardDescription>Ver llamadas de las últimas 24 horas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground p-8 flex flex-col items-center justify-center">
                  <p>El historial de llamadas recientes aparecerá aquí.</p>
                  <p>Las llamadas completadas se guardarán automáticamente.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="scheduled" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Llamadas Programadas</CardTitle>
                <CardDescription>Próximas llamadas programadas y devoluciones de llamada</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground p-8 flex flex-col items-center justify-center">
                  <p>No tiene llamadas programadas en este momento.</p>
                  <p>Podrá programar llamadas desde la sección de contactos próximamente.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Llamadas</CardTitle>
                <CardDescription>Revisar llamadas pasadas y análisis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground p-8 flex flex-col items-center justify-center">
                  <p>El historial de llamadas aparecerá aquí.</p>
                  <p>Podrá filtrar, buscar y exportar este historial próximamente.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CallsPage;
