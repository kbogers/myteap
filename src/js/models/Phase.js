import { supabase } from '../services/supabase.js';

export class Phase {
    static async getAllForProgram(programId) {
        const { data, error } = await supabase
            .from('phases')
            .select('*, milestones(*)')
            .eq('program_id', programId)
            .order('sequence');
        if (error) throw error;
        return data;
    }

    static async create({ programId, name, sequence }) {
        const { data, error } = await supabase
            .from('phases')
            .insert([{
                program_id: programId,
                name,
                sequence
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    }
}