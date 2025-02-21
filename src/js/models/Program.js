import { supabase } from '../services/supabase.js';

export class Program {
    static async getAll() {
        try {
            const { data, error } = await supabase
                .from('programs')
                .select('*');
            if (error) {
                console.error('Error in Program.getAll:', error);
                throw error;
            }
            return data;
        } catch (error) {
            console.error('Unexpected error in Program.getAll:', error);
            throw error;
        }
    }

    static async getById(id) {
        try {
            const { data, error } = await supabase
                .from('programs')
                .select('*, requests(*)')
                .eq('id', id)
                .single();
            if (error) {
                console.error('Error in Program.getById:', error);
                throw error;
            }
            return data;
        } catch (error) {
            console.error('Unexpected error in Program.getById:', error);
            throw error;
        }
    }

    static async create({ name, description }) {
        try {
            const { data, error } = await supabase
                .from('programs')
                .insert([{ 
                    name, 
                    description,
                    owner_id: (await supabase.auth.getUser()).data.user?.id 
                }])
                .select()
                .single();
            if (error) {
                console.error('Error in Program.create:', error);
                throw error;
            }
            return data;
        } catch (error) {
            console.error('Unexpected error in Program.create:', error);
            throw error;
        }
    }
}