import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Shield,
    Users,
    UserPlus,
    UserMinus,
    Loader2,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useGodMode } from '@/hooks/useGodMode';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Tipos de datos
interface UserWithRoles {
    user_id: string;
    email: string;
    full_name: string | null;
    roles: string[];
}

// Colores para badges de roles
const roleColors: Record<string, string> = {
    god: 'bg-purple-500 hover:bg-purple-600 text-white',
    event_creator: 'bg-blue-500 hover:bg-blue-600 text-white',
    news_creator: 'bg-green-500 hover:bg-green-600 text-white',
    viewer: 'bg-gray-500 hover:bg-gray-600 text-white',
};

// Nombres amigables para roles
const roleNames: Record<string, string> = {
    god: 'God Mode',
    event_creator: 'Creador de Eventos',
    news_creator: 'Creador de Noticias',
    viewer: 'Espectador',
};

const GodModePanel = () => {
    const { isGod, loading: godLoading, getAllUsers, assignRole, removeRole } = useGodMode();
    const [users, setUsers] = useState<UserWithRoles[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [actionLoading, setActionLoading] = useState(false);

    // Cargar usuarios al montar el componente
    useEffect(() => {
        if (isGod) {
            loadUsers();
        }
    }, [isGod]);

    const loadUsers = async () => {
        setLoading(true);
        const { data, error } = await getAllUsers();

        if (error) {
            toast.error('Error al cargar usuarios');
            console.error(error);
        } else {
            setUsers(data || []);
        }

        setLoading(false);
    };

    // Asignar rol a usuario
    const handleAssignRole = async () => {
        if (!selectedUser || !selectedRole) {
            toast.error('Selecciona un usuario y un rol');
            return;
        }

        setActionLoading(true);
        const { success, error } = await assignRole(selectedUser, selectedRole);

        if (success) {
            toast.success(`Rol "${roleNames[selectedRole]}" asignado correctamente`);
            await loadUsers();
            setSelectedUser(null);
            setSelectedRole('');
        } else {
            toast.error('Error al asignar rol');
            console.error(error);
        }

        setActionLoading(false);
    };

    // Remover rol de usuario
    const handleRemoveRole = async (userId: string, role: string) => {
        if (role === 'god' && userId === selectedUser) {
            toast.error('No puedes remover tu propio rol de God');
            return;
        }

        setActionLoading(true);
        const { success, error } = await removeRole(userId, role);

        if (success) {
            toast.success(`Rol "${roleNames[role]}" removido correctamente`);
            await loadUsers();
        } else {
            toast.error('Error al remover rol');
            console.error(error);
        }

        setActionLoading(false);
    };

    // Mostrar loader mientras se verifica si es God
    if (godLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Si no es God, no mostrar nada
    if (!isGod) {
        return null;
    }

    return (
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-700">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                <div>
                    <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        God Mode Panel
                    </h2>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                        Administración total del sistema
                    </p>
                </div>
            </div>

            {/* Sección de asignación de roles */}
            <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Asignar Rol a Usuario
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Selector de usuario */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Usuario</label>
                        <Select value={selectedUser || ''} onValueChange={setSelectedUser}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar usuario" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map(user => (
                                    <SelectItem key={user.user_id} value={user.user_id}>
                                        {user.email}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Selector de rol */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Rol</label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="god">God Mode</SelectItem>
                                <SelectItem value="event_creator">Creador de Eventos</SelectItem>
                                <SelectItem value="news_creator">Creador de Noticias</SelectItem>
                                <SelectItem value="viewer">Espectador</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Botón de asignar */}
                    <div className="flex items-end">
                        <Button
                            onClick={handleAssignRole}
                            disabled={!selectedUser || !selectedRole || actionLoading}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                            {actionLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Asignar Rol
                        </Button>
                    </div>
                </div>
            </div>

            {/* Lista de usuarios */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Lista de Usuarios ({users.length})
                </h3>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    </div>
                ) : users.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        No hay usuarios registrados
                    </p>
                ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {users.map(user => (
                            <Card key={user.user_id} className="p-4 bg-white dark:bg-gray-800">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-semibold text-foreground">
                                            {user.full_name || 'Sin nombre'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>

                                        {/* Roles del usuario */}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {user.roles && user.roles.length > 0 ? (
                                                user.roles.map(role => (
                                                    <div key={role} className="flex items-center gap-1">
                                                        <Badge className={roleColors[role] || roleColors.viewer}>
                                                            {roleNames[role] || role}
                                                        </Badge>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleRemoveRole(user.user_id, role)}
                                                            disabled={actionLoading}
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))
                                            ) : (
                                                <Badge variant="outline" className="text-muted-foreground">
                                                    Sin roles
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
};

export default GodModePanel;
