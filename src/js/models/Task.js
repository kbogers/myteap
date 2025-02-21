import { supabase } from '../services/supabase.js';

export class Task {
    static async getAllForMilestone(milestoneId) {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('milestone_id', milestoneId)
            .order('created_at');
        if (error) throw error;
        return data;
    }

    static async create({ milestoneId, title, dueDate, assignee }) {
        const { data, error } = await supabase
            .from('tasks')
            .insert([{
                milestone_id: milestoneId,
                title,
                due_date: dueDate,
                assignee
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async complete(id) {
        const { error } = await supabase
            .from('tasks')
            .update({ completed_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
    }

    static async update({ id, title, dueDate, assignee }) {
        const { error } = await supabase
            .from('tasks')
            .update({
                title,
                due_date: dueDate,
                assignee
            })
            .eq('id', id);
        if (error) throw error;
    }
}