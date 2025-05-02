
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserWithRole, UserRole } from '@/types/auth';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Shield, 
  UserPlus
} from 'lucide-react';
import AddUserDialog from '@/components/users/AddUserDialog';
import EditUserDialog from '@/components/users/EditUserDialog';
import DeleteUserDialog from '@/components/users/DeleteUserDialog';

// Datos de ejemplo - En una aplicación real, estos vendrían de Supabase
const mockUsers: UserWithRole[] = [
  {
    id: '1',
    email: 'admin@gabotrix.com',
    firstName: 'Admin',
    lastName: 'Usuario',
    role: 'admin',
    createdAt: '2023-01-15T00:00:00',
    lastSignIn: '2023-06-10T14:30:00',
    status: 'active'
  },
  {
    id: '2',
    email: 'manager@gabotrix.com',
    firstName: 'Manager',
    lastName: 'Equipo',
    role: 'manager',
    createdAt: '2023-02-10T00:00:00',
    lastSignIn: '2023-06-09T10:15:00',
    status: 'active'
  },
  {
    id: '3',
    email: 'agent1@gabotrix.com',
    firstName: 'Agente',
    lastName: 'Uno',
    role: 'agent',
    createdAt: '2023-03-05T00:00:00',
    lastSignIn: '2023-06-08T09:45:00',
    status: 'active'
  },
  {
    id: '4',
    email: 'viewer@gabotrix.com',
    firstName: 'Visualizador',
    lastName: 'Solo Lectura',
    role: 'viewer',
    createdAt: '2023-04-20T00:00:00',
    status: 'inactive'
  },
];

const UserManagementPage: React.FC = () => {
  const { hasRole } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserWithRole | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserWithRole | null>(null);
  
  const canManageUsers = hasRole(['admin']);
  
  const filteredUsers = users.filter(user => 
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddUser = (newUser: UserWithRole) => {
    setUsers([...users, { ...newUser, id: String(users.length + 1) }]);
  };
  
  const handleEditUser = (updatedUser: UserWithRole) => {
    setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
    setEditUser(null);
  };
  
  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    setDeleteUser(null);
  };
  
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-primary text-white">Administrador</Badge>;
      case 'manager':
        return <Badge className="bg-blue-500 text-white">Gerente</Badge>;
      case 'agent':
        return <Badge className="bg-green-500 text-white">Agente</Badge>;
      case 'viewer':
        return <Badge className="bg-gray-500 text-white">Visualizador</Badge>;
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status: 'active' | 'inactive' | 'pending') => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Activo</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">Inactivo</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pendiente</Badge>;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-xl animate-fade-in mb-6">
          <h1 className="text-3xl font-bold tracking-tight neo-gradient glow-text">
            Gestión de Usuarios
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra los usuarios y sus roles en la plataforma
          </p>
        </div>
        
        <div className="glass-card rounded-xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-card border-white/20"
              />
            </div>
            
            {canManageUsers && (
              <Button 
                onClick={() => setIsAddUserOpen(true)}
                className="bg-primary hover:bg-primary/80"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Añadir Usuario
              </Button>
            )}
          </div>
          
          <div className="rounded-lg overflow-hidden border border-white/10">
            <Table>
              <TableCaption>Lista de usuarios de la plataforma</TableCaption>
              <TableHeader className="bg-secondary/30">
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Fecha registro</TableHead>
                  {canManageUsers && <TableHead className="text-right">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-white/5">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-white font-medium text-sm">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-xs text-muted-foreground md:hidden">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    {canManageUsers && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Menú</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-card border-white/20">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem 
                              onClick={() => setEditUser(user)}
                              className="cursor-pointer flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Editar usuario</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteUser(user)}
                              className="cursor-pointer text-destructive flex items-center gap-2"
                            >
                              <Trash className="h-4 w-4" />
                              <span>Eliminar usuario</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      <AddUserDialog 
        open={isAddUserOpen} 
        onOpenChange={setIsAddUserOpen} 
        onAddUser={handleAddUser} 
      />
      
      <EditUserDialog 
        user={editUser} 
        open={!!editUser} 
        onOpenChange={() => setEditUser(null)} 
        onSaveUser={handleEditUser} 
      />
      
      <DeleteUserDialog 
        user={deleteUser} 
        open={!!deleteUser} 
        onOpenChange={() => setDeleteUser(null)} 
        onDeleteUser={handleDeleteUser} 
      />
    </Layout>
  );
};

export default UserManagementPage;
