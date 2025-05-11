
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from '@/lib/utils';

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [dateRange, setDateRange] = useState<{from: Date, to: Date}>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()
  });
  const [period, setPeriod] = useState('week');

  // Datos de ejemplo para los gráficos
  const callData = [
    { name: 'Lun', entrantes: 40, atendidas: 38, abandonadas: 2 },
    { name: 'Mar', entrantes: 35, atendidas: 32, abandonadas: 3 },
    { name: 'Mié', entrantes: 50, atendidas: 48, abandonadas: 2 },
    { name: 'Jue', entrantes: 45, atendidas: 43, abandonadas: 2 },
    { name: 'Vie', entrantes: 60, atendidas: 55, abandonadas: 5 },
    { name: 'Sáb', entrantes: 30, atendidas: 28, abandonadas: 2 },
    { name: 'Dom', entrantes: 20, atendidas: 19, abandonadas: 1 },
  ];

  const messagingData = [
    { name: 'Lun', recibidos: 150, enviados: 120 },
    { name: 'Mar', recibidos: 130, enviados: 110 },
    { name: 'Mié', recibidos: 170, enviados: 140 },
    { name: 'Jue', recibidos: 160, enviados: 135 },
    { name: 'Vie', recibidos: 190, enviados: 150 },
    { name: 'Sáb', recibidos: 100, enviados: 80 },
    { name: 'Dom', recibidos: 90, enviados: 70 },
  ];

  const agentPerformanceData = [
    { name: 'Asistente Principal', llamadas: 120, mensajes: 450, satisfaccion: 4.7 },
    { name: 'Especialista Ventas', llamadas: 85, mensajes: 320, satisfaccion: 4.5 },
    { name: 'Soporte Técnico', llamadas: 95, mensajes: 380, satisfaccion: 4.8 },
    { name: 'Servicio Cliente', llamadas: 75, mensajes: 290, satisfaccion: 4.6 },
  ];

  const satisfactionData = [
    { name: 'Muy Satisfecho', value: 55 },
    { name: 'Satisfecho', value: 30 },
    { name: 'Neutral', value: 10 },
    { name: 'Insatisfecho', value: 4 },
    { name: 'Muy Insatisfecho', value: 1 },
  ];

  const COLORS = ['#4ade80', '#22c55e', '#facc15', '#f97316', '#ef4444'];

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    const today = new Date();
    let fromDate = new Date();
    
    switch (value) {
      case 'day':
        fromDate = new Date(today);
        break;
      case 'week':
        fromDate = new Date(today.setDate(today.getDate() - 7));
        break;
      case 'month':
        fromDate = new Date(today.setMonth(today.getMonth() - 1));
        break;
      case 'year':
        fromDate = new Date(today.setFullYear(today.getFullYear() - 1));
        break;
      default:
        fromDate = new Date(today.setDate(today.getDate() - 7));
    }
    
    setDateRange({ from: fromDate, to: new Date() });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
            <p className="text-muted-foreground">Analiza el rendimiento de tu centro de contacto.</p>
          </div>
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "d MMM, yyyy", { locale: es })} -{" "}
                        {format(dateRange.to, "d MMM, yyyy", { locale: es })}
                      </>
                    ) : (
                      format(dateRange.from, "d MMM, yyyy", { locale: es })
                    )
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={(range) => range && setDateRange(range as any)}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Hoy</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="year">Este año</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">Exportar</Button>
          </div>
        </div>
        
        <Tabs 
          defaultValue="general" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="calls">Llamadas</TabsTrigger>
            <TabsTrigger value="messaging">Mensajería</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Interacciones</CardTitle>
                  <CardDescription>Llamadas + Mensajes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">1,248</div>
                  <p className="text-xs text-muted-foreground">+12% respecto al período anterior</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Satisfacción Media</CardTitle>
                  <CardDescription>En una escala de 1 a 5</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">4.6</div>
                  <p className="text-xs text-muted-foreground">+0.2 respecto al período anterior</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Tiempo Promedio</CardTitle>
                  <CardDescription>Resolución de consultas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">3:24</div>
                  <p className="text-xs text-muted-foreground">-15% respecto al período anterior</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Volumen de Interacciones</CardTitle>
                <CardDescription>Llamadas y mensajes por día</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={callData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="entrantes" stroke="#8884d8" activeDot={{ r: 8 }} name="Llamadas" />
                      <Line type="monotone" dataKey="abandonadas" stroke="#ff7300" name="Abandonos" />
                      <Line type="monotone" dataKey="recibidos" stroke="#4ade80" name="Mensajes" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rendimiento de Agentes</CardTitle>
                  <CardDescription>Interacciones por agente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={agentPerformanceData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="llamadas" fill="#8884d8" name="Llamadas" />
                        <Bar dataKey="mensajes" fill="#4ade80" name="Mensajes" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Satisfacción del Cliente</CardTitle>
                  <CardDescription>Distribución de valoraciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={satisfactionData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {satisfactionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="calls" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Llamadas</CardTitle>
                <CardDescription>Estadísticas detalladas de llamadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={callData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="entrantes" fill="#8884d8" name="Entrantes" />
                      <Bar dataKey="atendidas" fill="#4ade80" name="Atendidas" />
                      <Bar dataKey="abandonadas" fill="#ef4444" name="Abandonadas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messaging" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Mensajería</CardTitle>
                <CardDescription>Estadísticas detalladas de mensajes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={messagingData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="recibidos" fill="#8884d8" name="Recibidos" />
                      <Bar dataKey="enviados" fill="#4ade80" name="Enviados" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ReportsPage;
