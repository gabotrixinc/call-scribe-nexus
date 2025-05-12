import React from 'react';
import Layout from '@/components/Layout';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, PhoneCall, Pencil, Trash2, RefreshCw, Users, Eye } from "lucide-react";
import { Contact } from '@/types/contacts';
import { useContactsService } from '@/hooks/useContactsService';
import ContactDetailsModal from '@/components/contacts/ContactDetailsModal';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

const ContactsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { contacts, isLoadingContacts, createContact, updateContact, deleteContact } = useContactsService();
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: ''
  });
  const { toast } = useToast();

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
        await updateContact.mutateAsync({
          id: currentContact.id,
          ...formData
        });
      } else {
        // Create new contact
        await createContact.mutateAsync(formData);
      }
      
      resetForm();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving contact:', error);
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
      await deleteContact.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleViewContact = (contact: Contact) => {
    setViewingContact(contact);
    setIsDetailsOpen(true);
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

  const makeCall = (phoneNumber: string) => {
    toast({
      title: 'Iniciando llamada',
      description: `Llamando a ${phoneNumber}...`
    });
    
    // Redirect to calls page with phone number
    navigate(`/calls?phone=${encodeURIComponent(phoneNumber)}`);
  };

  const filteredContacts = (contacts || []).filter(contact => {
    const searchLower = search.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchLower) ||
      contact.phone.toLowerCase().includes(searchLower) ||
      (contact.email && contact.email.toLowerCase().includes(searchLower)) ||
      (contact.company && contact.company.toLowerCase().includes(searchLower))
    );
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Contactos</h1>
            <p className="text-muted-foreground">Administra tu directorio de contactos y realiza llamadas directamente.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => {}} variant="outline" size="icon">
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
            {isLoadingContacts ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableCaption>Lista de contactos</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead className="hidden md:table-cell">Email</TableHead>
                      <TableHead className="hidden md:table-cell">Empresa</TableHead>
                      <TableHead className="hidden md:table-cell">Último contacto</TableHead>
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
                        <TableRow key={contact.id} className="hover:bg-muted/50 cursor-pointer">
                          <TableCell className="font-medium" onClick={() => handleViewContact(contact)}>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {contact.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span>{contact.name}</span>
                            </div>
                          </TableCell>
                          <TableCell onClick={() => handleViewContact(contact)}>{contact.phone}</TableCell>
                          <TableCell className="hidden md:table-cell" onClick={() => handleViewContact(contact)}>{contact.email || '-'}</TableCell>
                          <TableCell className="hidden md:table-cell" onClick={() => handleViewContact(contact)}>{contact.company || '-'}</TableCell>
                          <TableCell className="hidden md:table-cell" onClick={() => handleViewContact(contact)}>
                            {contact.last_contact ? new Date(contact.last_contact).toLocaleDateString() : 'Nunca'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                onClick={() => handleViewContact(contact)}
                                size="icon"
                                variant="ghost"
                                title="Ver detalles"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
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
              </div>
            )}
          </CardContent>
        </Card>
        
        <ContactDetailsModal
          contact={viewingContact}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </Layout>
  );
};

export default ContactsPage;
