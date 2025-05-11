
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MessageCircle, Filter, ThumbsUp, ThumbsDown, Settings, Download } from "lucide-react";

const FeedbackPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [filterPeriod, setFilterPeriod] = useState('month');

  // Datos de ejemplo
  const recentFeedback = [
    { id: 1, customer: "María López", agent: "Asistente Principal", rating: 5, comment: "El servicio fue excelente, resolvieron mi problema rápidamente.", date: "2025-05-10", channel: "whatsapp" },
    { id: 2, customer: "Juan Pérez", agent: "Especialista Ventas", rating: 4, comment: "Buena atención pero tardaron un poco en responder.", date: "2025-05-09", channel: "call" },
    { id: 3, customer: "Ana Gómez", agent: "Soporte Técnico", rating: 5, comment: "Muy profesional y claro en sus explicaciones.", date: "2025-05-08", channel: "whatsapp" },
    { id: 4, customer: "Carlos Rodríguez", agent: "Asistente Principal", rating: 3, comment: "Me ayudaron pero tuve que explicar mi problema varias veces.", date: "2025-05-07", channel: "call" },
    { id: 5, customer: "Laura Martínez", agent: "Especialista Ventas", rating: 5, comment: "Excelente servicio y muy amable.", date: "2025-05-06", channel: "whatsapp" },
  ];

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  const getChannelBadge = (channel: string) => {
    if (channel === 'whatsapp') {
      return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">WhatsApp</Badge>;
    } else {
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Llamada</Badge>;
    }
  };

  // Calcular estadísticas de feedback
  const calculateStats = () => {
    const totalFeedback = recentFeedback.length;
    const totalRating = recentFeedback.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / totalFeedback;
    
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    recentFeedback.forEach(item => {
      ratingCounts[item.rating as keyof typeof ratingCounts]++;
    });
    
    const ratingPercentages = Object.entries(ratingCounts).reduce((acc, [rating, count]) => {
      acc[rating] = (count / totalFeedback) * 100;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalFeedback,
      averageRating,
      ratingCounts,
      ratingPercentages
    };
  };
  
  const stats = calculateStats();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
            <p className="text-muted-foreground">Gestiona el feedback de tus clientes y mejora la calidad del servicio.</p>
          </div>
          <div className="flex space-x-2">
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="quarter">Este trimestre</SelectItem>
                <SelectItem value="year">Este año</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configuración
            </Button>
          </div>
        </div>
        
        <Tabs 
          defaultValue="overview" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="reviews">Opiniones</TabsTrigger>
            <TabsTrigger value="surveys">Encuestas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Calificación Promedio</CardTitle>
                  <CardDescription>De todas las interacciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</span>
                    <div className="flex">{renderStars(Math.round(stats.averageRating))}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Basado en {stats.totalFeedback} opiniones</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Satisfacción (CSAT)</CardTitle>
                  <CardDescription>Clientes satisfechos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">92%</div>
                  <p className="text-xs text-green-500 flex items-center">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    +2% respecto al período anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">NPS Score</CardTitle>
                  <CardDescription>Net Promoter Score</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">+42</div>
                  <p className="text-xs text-green-500 flex items-center">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    +5 respecto al período anterior
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Calificaciones</CardTitle>
                  <CardDescription>Desglose por número de estrellas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <div key={rating} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <div className="flex">
                          {renderStars(rating)}
                        </div>
                        <span>{stats.ratingCounts[rating as keyof typeof stats.ratingCounts]} opiniones</span>
                      </div>
                      <Progress value={stats.ratingPercentages[rating.toString()]} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Opiniones Recientes</CardTitle>
                  <CardDescription>Últimas 5 opiniones recibidas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentFeedback.slice(0, 3).map(feedback => (
                    <div key={feedback.id} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{feedback.customer}</div>
                          <div className="text-sm text-muted-foreground">Atendido por: {feedback.agent}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="flex mr-2">{renderStars(feedback.rating)}</div>
                          {getChannelBadge(feedback.channel)}
                        </div>
                      </div>
                      <p className="mt-2 text-sm">{feedback.comment}</p>
                      <div className="mt-2 text-xs text-muted-foreground">{feedback.date}</div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full">Ver todas las opiniones</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Todas las Opiniones</CardTitle>
                  <CardDescription>Listado completo de feedback de clientes</CardDescription>
                </div>
                <Button size="sm" variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recentFeedback.map(feedback => (
                    <div key={feedback.id} className="border-b pb-6 last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{feedback.customer}</div>
                          <div className="text-sm text-muted-foreground">Atendido por: {feedback.agent}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="flex mr-2">{renderStars(feedback.rating)}</div>
                          {getChannelBadge(feedback.channel)}
                        </div>
                      </div>
                      <p className="mt-2">{feedback.comment}</p>
                      <div className="mt-2 text-sm text-muted-foreground">{feedback.date}</div>
                      <div className="mt-3 flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Responder
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" disabled>Anterior</Button>
                <div className="text-sm text-muted-foreground">Página 1 de 1</div>
                <Button variant="outline" size="sm" disabled>Siguiente</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="surveys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Encuestas de Satisfacción</CardTitle>
                <CardDescription>Gestiona tus encuestas y cuestionarios</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <MessageCircle className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Crea tu primera encuesta</h3>
                  <p className="text-muted-foreground max-w-md mb-4">
                    Las encuestas de satisfacción te ayudan a recopilar información valiosa sobre la experiencia de tus clientes.
                  </p>
                  <Button>
                    Crear encuesta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default FeedbackPage;
