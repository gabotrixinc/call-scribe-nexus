
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Papa from 'papaparse';

interface Contact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  [key: string]: string;
}

interface ContactsImporterProps {
  onImportComplete?: (contacts: Contact[]) => void;
}

const ContactsImporter: React.FC<ContactsImporterProps> = ({ onImportComplete }) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Formato no válido",
        description: "Por favor seleccione un archivo CSV",
        variant: "destructive"
      });
      return;
    }
    
    setFile(file);
    setErrors([]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = () => {
    if (!file) return;
    
    setIsProcessing(true);
    setProgress(0);
    setContacts([]);
    setErrors([]);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ',',
      step: (results, parser) => {
        // Update progress as each row is processed
        const progressValue = Math.round((results.meta.cursor / file.size) * 100);
        setProgress(progressValue);
      },
      complete: (results) => {
        const validationResults = validateContacts(results.data as Contact[]);
        setContacts(validationResults.validContacts);
        setErrors(validationResults.errors);
        
        if (validationResults.validContacts.length > 0) {
          toast({
            title: "Importación completa",
            description: `Se procesaron ${validationResults.validContacts.length} contactos con ${validationResults.errors.length} errores.`,
          });
          
          if (onImportComplete) {
            onImportComplete(validationResults.validContacts);
          }
        } else if (validationResults.errors.length > 0) {
          toast({
            title: "Error en la importación",
            description: "No se pudo importar ningún contacto. Revise el archivo CSV.",
            variant: "destructive"
          });
        }
        
        setIsProcessing(false);
        setProgress(100);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        toast({
          title: "Error",
          description: "No se pudo procesar el archivo CSV.",
          variant: "destructive"
        });
        setIsProcessing(false);
      }
    });
  };

  const validateContacts = (data: Contact[]): { validContacts: Contact[], errors: string[] } => {
    const validContacts: Contact[] = [];
    const errors: string[] = [];
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{8,15}$/;
    
    data.forEach((row, index) => {
      // Map CSV columns to standard fields
      const contact: Contact = {
        firstName: row.firstName || row.first_name || row.nombre || '',
        lastName: row.lastName || row.last_name || row.apellido || '',
        email: row.email || row.correo || row.email_address || '',
        phone: row.phone || row.phoneNumber || row.telefono || row.mobile || '',
        company: row.company || row.empresa || '',
        notes: row.notes || row.notas || '',
      };
      
      // Validation checks
      let isValid = true;
      
      // Check required fields
      for (const field of requiredFields) {
        if (!contact[field]) {
          errors.push(`Fila ${index + 1}: Falta el campo obligatorio "${field}"`);
          isValid = false;
          break;
        }
      }
      
      // Validate email
      if (isValid && !emailRegex.test(contact.email)) {
        errors.push(`Fila ${index + 1}: Email inválido "${contact.email}"`);
        isValid = false;
      }
      
      // Validate phone
      if (isValid && !phoneRegex.test(contact.phone)) {
        errors.push(`Fila ${index + 1}: Teléfono inválido "${contact.phone}"`);
        isValid = false;
      }
      
      if (isValid) {
        validContacts.push(contact);
      }
    });
    
    return { validContacts, errors };
  };

  const clearFile = () => {
    setFile(null);
    setContacts([]);
    setErrors([]);
    setProgress(0);
  };

  const downloadTemplate = () => {
    // Create CSV content
    const csvContent = 
      "firstName,lastName,email,phone,company,notes\n" +
      "Juan,Pérez,juan@example.com,+34612345678,Mi Empresa,Cliente VIP\n" +
      "María,García,maria@example.com,+34698765432,,Nuevo contacto";
    
    // Create download link
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "plantilla_contactos.csv");
    document.body.appendChild(link);
    
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center hover:bg-secondary/20 transition-colors",
          isDragging ? "border-primary bg-secondary/20" : "border-border",
          file ? "border-green-500/50" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          {!file ? (
            <>
              <div className="bg-secondary/50 rounded-full p-3">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium">Arrastra o selecciona un archivo CSV</p>
              <p className="text-sm text-muted-foreground">
                El archivo debe tener las columnas: firstName, lastName, email, phone
              </p>
              <Button variant="outline" onClick={downloadTemplate} size="sm">
                Descargar plantilla
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">{file.name}</span>
                <Button variant="ghost" size="icon" onClick={clearFile} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {isProcessing ? (
                <div className="w-full mt-2">
                  <Progress value={progress} className="h-1" />
                  <p className="text-sm text-muted-foreground mt-1">Procesando {progress}%</p>
                </div>
              ) : contacts.length > 0 ? (
                <p className="text-sm text-green-500 mt-1">
                  Se importaron {contacts.length} contactos correctamente
                </p>
              ) : null}
            </>
          )}
        </div>

        <Input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-upload"
        />
      </div>

      <div className="flex justify-between items-center">
        <Label htmlFor="csv-upload" className="cursor-pointer">
          <Button variant="outline" type="button" tabIndex={-1}>
            Seleccionar archivo
          </Button>
        </Label>

        <Button
          onClick={processFile}
          disabled={!file || isProcessing}
        >
          {isProcessing ? 'Procesando...' : 'Importar contactos'}
        </Button>
      </div>

      {errors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <h4 className="font-medium text-destructive">Errores de validación ({errors.length})</h4>
          </div>
          <ul className="text-sm space-y-1 max-h-32 overflow-y-auto pl-4">
            {errors.slice(0, 10).map((error, index) => (
              <li key={index} className="text-destructive/80">{error}</li>
            ))}
            {errors.length > 10 && (
              <li className="text-destructive/80">... y {errors.length - 10} errores más</li>
            )}
          </ul>
        </div>
      )}

      {contacts.length > 0 && (
        <div className="border rounded-md overflow-hidden mt-4">
          <div className="bg-secondary/30 p-2">
            <h4 className="font-medium">Vista previa ({contacts.length} contactos)</h4>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-secondary/20 border-b border-border">
                  <th className="p-2 text-left font-medium">Nombre</th>
                  <th className="p-2 text-left font-medium">Apellido</th>
                  <th className="p-2 text-left font-medium">Email</th>
                  <th className="p-2 text-left font-medium">Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {contacts.slice(0, 5).map((contact, index) => (
                  <tr key={index} className="border-b border-border last:border-0 hover:bg-secondary/10">
                    <td className="p-2">{contact.firstName}</td>
                    <td className="p-2">{contact.lastName}</td>
                    <td className="p-2">{contact.email}</td>
                    <td className="p-2">{contact.phone}</td>
                  </tr>
                ))}
                {contacts.length > 5 && (
                  <tr>
                    <td className="p-2 text-center text-sm text-muted-foreground" colSpan={4}>
                      ... y {contacts.length - 5} contactos más
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsImporter;
