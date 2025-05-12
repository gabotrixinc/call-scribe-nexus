import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, Building, Calendar } from "lucide-react";

interface ContactDetailsModalProps {
  contact: any;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (contact: any) => void;
  onDelete: (id: string) => void;
}

const ContactDetailsModal: React.FC<ContactDetailsModalProps> = ({ contact, isOpen, onClose, onEdit, onDelete }) => {
  const navigate = useNavigate();
  
  if (!contact) {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalles del Contacto</DialogTitle>
          <DialogDescription>
            Información detallada sobre {contact.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary">
                {contact.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{contact.name}</p>
              <p className="text-sm text-muted-foreground">
                Contacto desde {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : 'desconocido'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{contact.phone}</span>
            </div>
            {contact.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{contact.email}</span>
              </div>
            )}
            {contact.company && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{contact.company}</span>
              </div>
            )}
            {contact.last_contact && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Último contacto: {new Date(contact.last_contact).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button type="button" onClick={() => onEdit(contact)}>
            Editar
          </Button>
          <Button type="button" variant="destructive" onClick={() => onDelete(contact.id)}>
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactDetailsModal;
