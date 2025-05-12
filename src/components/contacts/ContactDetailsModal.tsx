
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PhoneCall, Mail, Building, Clock, MessageCircle, Edit, Trash2 } from 'lucide-react';
import { Contact } from '@/types/contacts';
import ContactCallHistory from './ContactCallHistory';
import { useRouter } from 'next/router';

interface ContactDetailsModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

const ContactDetailsModal: React.FC<ContactDetailsModalProps> = ({
  contact,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('info');
    }
  }, [isOpen]);

  const handleMakeCall = () => {
    if (contact) {
      router.push(`/calls?phone=${encodeURIComponent(contact.phone)}`);
    }
  };

  if (!contact) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalles del Contacto</DialogTitle>
          <DialogDescription>
            Información completa y actividad del contacto
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
          <Avatar className="w-20 h-20 text-2xl">
            <AvatarFallback className="bg-primary/10 text-primary">
              {contact.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-semibold">{contact.name}</h2>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 text-sm text-muted-foreground mt-1 items-center md:items-start">
              <div className="flex items-center gap-1">
                <PhoneCall className="h-4 w-4" />
                <span>{contact.phone}</span>
              </div>
              
              {contact.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{contact.email}</span>
                </div>
              )}
              
              {contact.company && (
                <div className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  <span>{contact.company}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onEdit(contact)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="icon"
              onClick={() => {
                onDelete(contact.id);
                onClose();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {contact.last_contact && (
          <div className="bg-muted p-3 rounded-md flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Último contacto: <span className="font-medium">{new Date(contact.last_contact).toLocaleString()}</span>
            </span>
          </div>
        )}
        
        <div className="flex gap-2 mb-6">
          <Button 
            className="flex-1 gap-2" 
            onClick={handleMakeCall}
          >
            <PhoneCall className="h-4 w-4" />
            Llamar
          </Button>
          <Button 
            variant="secondary"
            className="flex-1 gap-2"
            disabled
          >
            <MessageCircle className="h-4 w-4" />
            Enviar mensaje
          </Button>
        </div>
        
        <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="calls">Llamadas</TabsTrigger>
            <TabsTrigger value="messages">Mensajes</TabsTrigger>
          </TabsList>
          <TabsContent value="info">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Nombre completo</p>
                <p className="text-muted-foreground">{contact.name || 'No especificado'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Teléfono</p>
                <p className="text-muted-foreground">{contact.phone}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Email</p>
                <p className="text-muted-foreground">{contact.email || 'No especificado'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Empresa</p>
                <p className="text-muted-foreground">{contact.company || 'No especificada'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Creado</p>
                <p className="text-muted-foreground">{new Date(contact.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="calls">
            <ContactCallHistory contactPhone={contact.phone} />
          </TabsContent>
          <TabsContent value="messages">
            <div className="h-[300px] flex items-center justify-center text-center p-4">
              <div className="text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No hay mensajes disponibles</p>
                <p className="text-sm">Los mensajes con este contacto aparecerán aquí</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDetailsModal;
