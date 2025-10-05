import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/**
 * Hook personalizado para God Mode
 * Proporciona funciones y estado para administrar usuarios, roles, eventos y noticias
 */
export const useGodMode = () => {
    const { user } = useAuth();
    const [isGod, setIsGod] = useState(false);
    const [loading, setLoading] = useState(true);

    // Verificar si el usuario actual es God
    useEffect(() => {
        const checkGodStatus = async () => {
            if (!user) {
                setIsGod(false);
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', user.id)
                    .eq('role', 'god')
                    .single();

                if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                    console.error('Error checking god status:', error);
                }

                setIsGod(!!data);
            } catch (error) {
                console.error('Error checking god status:', error);
                setIsGod(false);
            } finally {
                setLoading(false);
            }
        };

        checkGodStatus();
    }, [user]);

    // Obtener todos los usuarios con sus roles
    const getAllUsers = async () => {
        try {
            const { data, error } = await supabase
                .rpc('get_all_users_with_roles');

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error fetching users:', error);
            return { data: null, error };
        }
    };

    // Asignar rol a un usuario
    const assignRole = async (userId: string, role: string) => {
        try {
            const { data, error } = await supabase
                .rpc('assign_role_to_user', {
                    _user_id: userId,
                    _role: role
                });

            if (error) throw error;
            return { success: true, error: null };
        } catch (error) {
            console.error('Error assigning role:', error);
            return { success: false, error };
        }
    };

    // Remover rol de un usuario
    const removeRole = async (userId: string, role: string) => {
        try {
            const { data, error } = await supabase
                .rpc('remove_role_from_user', {
                    _user_id: userId,
                    _role: role
                });

            if (error) throw error;
            return { success: true, error: null };
        } catch (error) {
            console.error('Error removing role:', error);
            return { success: false, error };
        }
    };

    // Obtener todos los eventos (sin restricciones)
    const getAllEvents = async () => {
        try {
            const { data, error } = await supabase
                .from('events')
                .select(`
          *,
          profiles:created_by (
            email,
            full_name
          )
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error fetching events:', error);
            return { data: null, error };
        }
    };

    // Obtener todas las noticias (sin restricciones)
    const getAllNews = async () => {
        try {
            const { data, error } = await supabase
                .from('news')
                .select(`
          *,
          profiles:created_by (
            email,
            full_name
          )
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error fetching news:', error);
            return { data: null, error };
        }
    };

    // Eliminar evento (God puede eliminar cualquiera)
    const deleteEvent = async (eventId: string) => {
        try {
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', eventId);

            if (error) throw error;
            return { success: true, error: null };
        } catch (error) {
            console.error('Error deleting event:', error);
            return { success: false, error };
        }
    };

    // Eliminar noticia (God puede eliminar cualquiera)
    const deleteNews = async (newsId: string) => {
        try {
            const { error } = await supabase
                .from('news')
                .delete()
                .eq('id', newsId);

            if (error) throw error;
            return { success: true, error: null };
        } catch (error) {
            console.error('Error deleting news:', error);
            return { success: false, error };
        }
    };

    // Actualizar evento (God puede actualizar cualquiera)
    const updateEvent = async (eventId: string, updates: any) => {
        try {
            const { data, error } = await supabase
                .from('events')
                .update(updates)
                .eq('id', eventId)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error updating event:', error);
            return { data: null, error };
        }
    };

    // Actualizar noticia (God puede actualizar cualquiera)
    const updateNews = async (newsId: string, updates: any) => {
        try {
            const { data, error } = await supabase
                .from('news')
                .update(updates)
                .eq('id', newsId)
                .select()
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error updating news:', error);
            return { data: null, error };
        }
    };

    return {
        isGod,
        loading,
        getAllUsers,
        assignRole,
        removeRole,
        getAllEvents,
        getAllNews,
        deleteEvent,
        deleteNews,
        updateEvent,
        updateNews,
    };
};
