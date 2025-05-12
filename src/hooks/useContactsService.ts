
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Contact } from '@/types/contacts';

export const useContactsService = () => {
  const queryClient = useQueryClient();
  
  // Get all contacts
  const { data: contacts, isLoading: isLoadingContacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        return data as Contact[] || [];
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los contactos',
          variant: 'destructive'
        });
        return [] as Contact[];
      }
    }
  });
  
  // Get contact by ID
  const getContact = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      return data as Contact;
    } catch (error) {
      console.error('Error fetching contact:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el contacto',
        variant: 'destructive'
      });
      return null;
    }
  };
  
  // Get call history for contact
  const getContactCallHistory = async (contactPhone: string) => {
    try {
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('caller_number', contactPhone)
        .order('start_time', { ascending: false });
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching contact call history:', error);
      return [];
    }
  };
  
  // Create contact
  const createContact = useMutation({
    mutationFn: async (contactData: Omit<Contact, 'id' | 'created_at'>) => {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .insert([contactData])
          .select()
          .single();
          
        if (error) throw error;
        
        return data as Contact;
      } catch (error) {
        console.error('Error creating contact:', error);
        toast({
          title: 'Error',
          description: 'No se pudo crear el contacto',
          variant: 'destructive'
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Contacto creado',
        description: 'El contacto ha sido creado correctamente'
      });
    }
  });
  
  // Update contact
  const updateContact = useMutation({
    mutationFn: async ({ id, ...contactData }: Partial<Contact> & { id: string }) => {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .update(contactData)
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        
        return data as Contact;
      } catch (error) {
        console.error('Error updating contact:', error);
        toast({
          title: 'Error',
          description: 'No se pudo actualizar el contacto',
          variant: 'destructive'
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Contacto actualizado',
        description: 'El contacto ha sido actualizado correctamente'
      });
    }
  });
  
  // Delete contact
  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('contacts')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        return id;
      } catch (error) {
        console.error('Error deleting contact:', error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el contacto',
          variant: 'destructive'
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast({
        title: 'Contacto eliminado',
        description: 'El contacto ha sido eliminado correctamente'
      });
    }
  });
  
  // Find or create contact from phone number
  const findOrCreateContactFromPhone = async (phoneNumber: string, name?: string) => {
    try {
      // First, try to find existing contact
      const { data: existingContact } = await supabase
        .from('contacts')
        .select('*')
        .eq('phone', phoneNumber)
        .maybeSingle();
        
      if (existingContact) {
        // Update last contact time
        await updateContact.mutateAsync({
          id: existingContact.id,
          last_contact: new Date().toISOString()
        });
        return existingContact;
      }
      
      // If no existing contact, create a new one
      const newContactData = {
        name: name || `Contacto ${phoneNumber}`,
        phone: phoneNumber,
        last_contact: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('contacts')
        .insert([newContactData])
        .select()
        .single();
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      return data;
    } catch (error) {
      console.error('Error finding or creating contact:', error);
      return null;
    }
  };

  return {
    contacts,
    isLoadingContacts,
    getContact,
    getContactCallHistory,
    createContact,
    updateContact,
    deleteContact,
    findOrCreateContactFromPhone
  };
};
