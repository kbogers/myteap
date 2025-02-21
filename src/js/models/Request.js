import { supabase } from '../services/supabase.js';

export class Request {
    static async getAllForProgram(programId) {
        try {
            const { data, error } = await supabase
                .from('requests')
                .select(`
                    *,
                    current_phase (
                        id,
                        name
                    )
                `)
                .eq('program_id', programId);
            if (error) {
                console.error('Error in Request.getAllForProgram:', error);
                throw error;
            }
            return data || [];
        } catch (error) {
            console.error('Unexpected error in Request.getAllForProgram:', error);
            throw error;
        }
    }

    static async getById(requestId) {
        try {
            // First get the request details
            const { data: request, error: requestError } = await supabase
                .from('requests')
                .select('*, program_id')
                .eq('id', requestId)
                .single();

            if (requestError) throw requestError;

            // Then get all phases for the program with their milestones and tasks
            const { data: phases, error: phasesError } = await supabase
                .from('phases')
                .select(`
                    *,
                    milestones (
                        *,
                        tasks (*)
                    )
                `)
                .eq('program_id', request.program_id)
                .order('sequence');

            if (phasesError) throw phasesError;

            // Combine the data
            return {
                ...request,
                phases: phases || []
            };
        } catch (error) {
            console.error('Error in Request.getById:', error);
            throw error;
        }
    }

    static async create({ programId, physician, institution, country, owner }) {
        try {
            // Get the first phase of the program
            const { data: firstPhase, error: phaseError } = await supabase
                .from('phases')
                .select('id')
                .eq('program_id', programId)
                .order('sequence')
                .limit(1)
                .single();
                
            if (phaseError) {
                console.error('Error fetching first phase:', phaseError);
                throw phaseError;
            }

            if (!firstPhase) {
                throw new Error('No phases found for this program. Please create phases first.');
            }

            const { data, error } = await supabase
                .from('requests')
                .insert([{
                    program_id: programId,
                    physician,
                    institution,
                    country,
                    owner,
                    current_phase: firstPhase.id
                }])
                .select()
                .single();

            if (error) {
                console.error('Error in Request.create:', error);
                throw error;
            }
            return data;
        } catch (error) {
            console.error('Unexpected error in Request.create:', error);
            throw error;
        }
    }

    static async updatePhase(requestId, phaseId) {
        try {
            const { error } = await supabase
                .from('requests')
                .update({ current_phase: phaseId })
                .eq('id', requestId);
            if (error) {
                console.error('Error in Request.updatePhase:', error);
                throw error;
            }
        } catch (error) {
            console.error('Unexpected error in Request.updatePhase:', error);
            throw error;
        }
    }

    static async advancePhase(requestId) {
        try {
            const request = await this.getById(requestId);
            const { data: phases, error: phaseError } = await supabase
                .from('phases')
                .select('*')
                .eq('program_id', request.program_id)
                .order('sequence');
                
            if (phaseError) {
                console.error('Error fetching phases:', phaseError);
                throw phaseError;
            }

            const currentPhaseIndex = phases.findIndex(p => p.id === request.current_phase);
            if (currentPhaseIndex < phases.length - 1) {
                await this.updatePhase(requestId, phases[currentPhaseIndex + 1].id);
            }
        } catch (error) {
            console.error('Unexpected error in Request.advancePhase:', error);
            throw error;
        }
    }
}