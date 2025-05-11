
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface BusinessInfo {
  companyName: string;
  industry: string;
  description: string;
  mainGoal: string;
}

interface OnboardingStepTwoProps {
  businessInfo: BusinessInfo;
  setBusinessInfo: React.Dispatch<React.SetStateAction<BusinessInfo>>;
  onNext: () => void;
}

const industries = [
  { value: 'retail', label: 'Comercio minorista' },
  { value: 'healthcare', label: 'Salud' },
  { value: 'finance', label: 'Finanzas y bancos' },
  { value: 'education', label: 'Educación' },
  { value: 'technology', label: 'Tecnología' },
  { value: 'hospitality', label: 'Hostelería y turismo' },
  { value: 'manufacturing', label: 'Fabricación' },
  { value: 'professional_services', label: 'Servicios profesionales' },
  { value: 'real_estate', label: 'Bienes raíces' },
  { value: 'other', label: 'Otro' }
];

const businessGoals = [
  { value: 'customer_service', label: 'Mejorar servicio al cliente' },
  { value: 'sales', label: 'Aumentar ventas' },
  { value: 'lead_gen', label: 'Generación de leads' },
  { value: 'support', label: 'Soporte técnico' },
  { value: 'engagement', label: 'Mayor engagement' }
];

const OnboardingStepTwo: React.FC<OnboardingStepTwoProps> = ({ 
  businessInfo, 
  setBusinessInfo, 
  onNext 
}) => {
  const [errors, setErrors] = useState<Partial<Record<keyof BusinessInfo, string>>>({});
  
  const validateForm = () => {
    const newErrors: Partial<Record<keyof BusinessInfo, string>> = {};
    
    if (!businessInfo.companyName.trim()) {
      newErrors.companyName = 'El nombre de la empresa es obligatorio';
    }
    
    if (!businessInfo.industry) {
      newErrors.industry = 'Selecciona una industria';
    }
    
    if (!businessInfo.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    } else if (businessInfo.description.trim().length < 10) {
      newErrors.description = 'La descripción debe ser más detallada';
    }
    
    if (!businessInfo.mainGoal) {
      newErrors.mainGoal = 'Selecciona un objetivo principal';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };
  
  const handleChange = (field: keyof BusinessInfo, value: string) => {
    setBusinessInfo(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is changed
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl"
    >
      <Card className="border-0 bg-black/50 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-full flex justify-center mb-5"
          >
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Building className="h-8 w-8 text-primary" />
            </div>
          </motion.div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-300 text-transparent bg-clip-text">
            Cuéntanos sobre tu negocio
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Esta información nos ayudará a personalizar tu centro de contacto
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName">Nombre de la empresa</Label>
            <Input
              id="companyName"
              placeholder="Ej. Innovación Tecnológica S.A."
              value={businessInfo.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className={errors.companyName ? 'border-red-500' : ''}
            />
            {errors.companyName && (
              <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Industria</Label>
            <Select
              value={businessInfo.industry}
              onValueChange={(value) => handleChange('industry', value)}
            >
              <SelectTrigger id="industry" className={errors.industry ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecciona una industria" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry.value} value={industry.value}>
                    {industry.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.industry && (
              <p className="text-red-500 text-sm mt-1">{errors.industry}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción de tu negocio</Label>
            <Textarea
              id="description"
              placeholder="Describe a qué se dedica tu empresa, qué servicios o productos ofrece y quiénes son tus clientes principales..."
              value={businessInfo.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mainGoal">Objetivo principal</Label>
            <Select 
              value={businessInfo.mainGoal}
              onValueChange={(value) => handleChange('mainGoal', value)}
            >
              <SelectTrigger id="mainGoal" className={errors.mainGoal ? 'border-red-500' : ''}>
                <SelectValue placeholder="¿Cuál es tu objetivo principal?" />
              </SelectTrigger>
              <SelectContent>
                {businessGoals.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>
                    {goal.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.mainGoal && (
              <p className="text-red-500 text-sm mt-1">{errors.mainGoal}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pb-6">
          <Button variant="outline" onClick={() => window.history.back()}>
            Atrás
          </Button>
          <Button onClick={handleNext}>
            Continuar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default OnboardingStepTwo;
