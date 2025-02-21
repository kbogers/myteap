import { supabase } from '../services/supabase.js';
import { Request } from './Request.js';

export class Milestone {
    static async getAllForPhase(phaseId) {
        const { data, error } = await supabase
            .from('milestones')
            .select('*, tasks(*)')
            .eq('phase_id', phaseId)
            .order('sequence');
        if (error) throw error;
        return data;
    }

    static async create({ phaseId, name, sequence, isRequired }) {
        const { data, error } = await supabase
            .from('milestones')
            .insert([{
                phase_id: phaseId,
                name,
                sequence,
                is_required: isRequired
            }])
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    static async complete(id, requestId) {
        const { error } = await supabase
            .from('milestones')
            .update({ completed_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;

        // Check if all required milestones in the current phase are completed
        const request = await Request.getById(requestId);
        const currentPhase = request.phases.find(p => p.id === request.current_phase);
        const allRequiredCompleted = currentPhase.milestones
            .filter(m => m.is_required)
            .every(m => m.completed_at);

        // If all required milestones are completed, advance to the next phase
        if (allRequiredCompleted) {
            await Request.advancePhase(requestId);
        }
    }

    static async addTask({ milestoneId, title, dueDate, assignee }) {
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
}