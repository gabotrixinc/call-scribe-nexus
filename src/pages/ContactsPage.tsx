
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, PhoneCall, Pencil, Trash2, RefreshCw, Users } from "lucide-react";

type Contact = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  last_contact?: string;
  created_at: string;
};

const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: ''
  });
  const { toast } = useToast();

  const fetchContacts = async () => {
    setLoading(true);
    try {
      let { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Simulamos datos si la tabla no existe todavía
      if (!data) {
        data = sampleContacts;
      }
      
      setContacts(data as Contact[]);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      // Usar datos de muestra si hay un error
      setContacts(sampleContacts);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los contactos. Usando datos locales.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast({
        title: 'Error',
        description: 'Nombre y teléfono son campos obligatorios',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      if (isEditing && currentContact) {
        // Update existing contact
        const { error } = await supabase
          .from('contacts')
          .update(formData)
          .eq('id', currentContact.id);
          
        if (error) throw error;
        
        toast({
          title: 'Contacto actualizado',
          description: `${formData.name} ha sido actualizado correctamente.`
        });
      } else {
        // Create new contact
        const { error } = await supabase
          .from('contacts')
          .insert([formData]);
          
        if (error) throw error;
        
        toast({
          title: 'Contacto creado',
          description: `${formData.name} ha sido agregado a tus contactos.`
        });
      }
      
      // Refresh contacts list
      fetchContacts();
      resetForm();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving contact:', error);
      
      // Update local state for demo purposes
      if (isEditing) {
        setContacts(contacts.map(c => 
          c.id === currentContact?.id ? { ...c, ...formData } : c
        ));
      } else {
        const newContact = {
          id: `temp-${Date.now()}`,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          company: formData.company,
          created_at: new Date().toISOString()
        };
        setContacts([newContact, ...contacts]);
      }
      
      toast({
        title: isEditing ? 'Contacto actualizado' : 'Contacto creado',
        description: 'Cambio realizado en modo local.'
      });
      
      resetForm();
      setOpenDialog(false);
    }
  };

  const handleEdit = (contact: Contact) => {
    setIsEditing(true);
    setCurrentContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
      company: contact.company || ''
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setContacts(contacts.filter(c => c.id !== id));
      
      toast({
        title: 'Contacto eliminado',
        description: 'El contacto ha sido eliminado correctamente.'
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      
      // Update local state for demo
      setContacts(contacts.filter(c => c.id !== id));
      
      toast({
        title: 'Contacto eliminado',
        description: 'Eliminado en modo local.'
      });
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentContact(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      company: ''
    });
  };

  const filteredContacts = contacts.filter(contact => {
    const searchLower = search.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchLower) ||
      contact.phone.toLowerCase().includes(searchLower) ||
      (contact.email && contact.email.toLowerCase().includes(searchLower)) ||
      (contact.company && contact.company.toLowerCase().includes(searchLower))
    );
  });

  const makeCall = (phoneNumber: string) => {
    toast({
      title: 'Iniciando llamada',
      description: `Llamando a ${phoneNumber}...`
    });
    
    // Redirigir a la página de llamadas
    window.location.href = `/calls?phone=${encodeURIComponent(phoneNumber)}`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Contactos</h1>
            <p className="text-muted-foreground">Administra tu directorio de contactos y realiza llamadas directamente.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => fetchContacts()} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Contacto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEditing ? 'Editar Contacto' : 'Añadir Nuevo Contacto'}</DialogTitle>
                  <DialogDescription>
                    {isEditing 
                      ? 'Actualiza la información del contacto.' 
                      : 'Completa los datos para agregar un nuevo contacto a tu directorio.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Nombre *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">
                        Teléfono *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="col-span-3"
                        placeholder="+1234567890"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="col-span-3"
                        type="email"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="company" className="text-right">
                        Empresa
                      </Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      resetForm();
                      setOpenDialog(false);
                    }}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {isEditing ? 'Actualizar' : 'Guardar'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Directorio de Contactos</span>
                </CardTitle>
                <CardDescription>Lista de todos tus contactos</CardDescription>
              </div>
              <div className="w-[350px]">
                <Input
                  placeholder="Buscar contactos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableCaption>Lista de contactos</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Último contacto</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">No se encontraron contactos</p>
                        {search && (
                          <Button 
                            variant="link" 
                            onClick={() => setSearch('')}
                            className="mt-2"
                          >
                            Limpiar búsqueda
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {contact.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{contact.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{contact.phone}</TableCell>
                        <TableCell>{contact.email || '-'}</TableCell>
                        <TableCell>{contact.company || '-'}</TableCell>
                        <TableCell>
                          {contact.last_contact ? new Date(contact.last_contact).toLocaleDateString() : 'Nunca'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              onClick={() => makeCall(contact.phone)}
                              size="icon"
                              variant="ghost"
                              title="Llamar"
                            >
                              <PhoneCall className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleEdit(contact)}
                              size="icon"
                              variant="ghost"
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(contact.id)}
                              size="icon"
                              variant="ghost"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

// Datos de contactos de muestra para modo offline/demo
const sampleContacts: Contact[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    phone: '+34612345678',
    email: 'juan@empresa.com',
    company: 'Empresa ABC',
    last_contact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    name: 'María López',
    phone: '+34623456789',
    email: 'maria@outlook.com',
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    phone: '+34634567890',
    company: 'Consultores XYZ',
    last_contact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    name: 'Ana Martínez',
    phone: '+34645678901',
    email: 'ana.martinez@gmail.com',
    company: 'Distribuciones Rápidas',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    name: 'Roberto Fernández',
    phone: '+34656789012',
    email: 'roberto@empresa.net',
    last_contact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export default ContactsPage;
