import { AuthError, User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

export const signUp = async (email: string, password: string, metadata?: Record<string, any>): Promise<{ user: User | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...metadata,
          empresa_id: metadata?.empresa_id, // Garante que empresa_id está sendo passado
          nome: metadata?.nome || email.split('@')[0], // Usa parte do email como nome se não fornecido
          cargo: metadata?.cargo || 'Usuário' // Usa 'Usuário' como cargo padrão se não fornecido
        },
      },
    });
    
    if (error) {
      console.error('Erro ao cadastrar:', error.message);
      return { user: null, error: error.message };
    }

    return { user: data.user, error: null };
  } catch (err) {
    console.error('Erro inesperado:', err);
    return { user: null, error: 'Ocorreu um erro inesperado' };
  }
};

export const signIn = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Erro ao fazer login:', error.message);
      return { user: null, error: error.message };
    }

    return { user: data.user, error: null };
  } catch (err) {
    console.error('Erro inesperado durante o login:', err);
    return { user: null, error: 'Ocorreu um erro inesperado durante o login' };
  }
};

export const signOut = async (): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    // Limpar o estado local independentemente do resultado da API
    localStorage.removeItem('supabase.auth.token');
    
    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('Erro inesperado durante o logout:', err);
    // Retornar null para indicar que o logout local foi bem-sucedido
    return { error: null };
  }
};
