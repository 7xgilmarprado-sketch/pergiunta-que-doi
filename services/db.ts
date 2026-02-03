
import { supabase } from './supabaseClient';
import { Question, Response, UserDisplayMode } from '../types';
import { aiService } from './ai';

export const db = {
  mapQuestion(q: any): Question {
    return {
      id: q.id,
      text: q.text,
      date: q.scheduled_for,
      verseReference: q.verse_reference
    };
  },

  mapResponse(r: any): Response {
    return {
      id: r.id,
      questionId: r.question_id,
      userId: r.user_id,
      userName: r.user_name,
      userPseudonym: r.user_pseudonym,
      displayMode: r.display_mode,
      content: r.content,
      createdAt: r.created_at,
      reactions: {
        identificado: r.reactions?.filter((re: any) => re.type === 'identificado').length || 0,
        orando: r.reactions?.filter((re: any) => re.type === 'orando').length || 0,
      }
    };
  },

  async getTodayQuestion(): Promise<Question | null> {
    const now = new Date();
    const today = now.toLocaleDateString('en-CA');

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('scheduled_for', today)
      .single();

    if (error || !data) {
      return await aiService.generateDailyQuestion(today);
    }
    
    return this.mapQuestion(data);
  },

  async getResponses(questionId: string): Promise<Response[]> {
    const { data, error } = await supabase
      .from('responses')
      .select(`
        *,
        reactions(type)
      `)
      .eq('question_id', questionId)
      .eq('is_flagged', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erro RLS ao buscar respostas:", error.message);
      return [];
    }
    return data.map((r: any) => this.mapResponse(r));
  },

  async saveResponse(payload: {
    questionId: string;
    userId: string;
    content: string;
    displayMode: UserDisplayMode;
    userName?: string;
    userPseudonym?: string;
  }) {
    const { data, error } = await supabase
      .from('responses')
      .insert({
        question_id: payload.questionId,
        user_id: payload.userId,
        content: payload.content,
        display_mode: payload.displayMode,
        user_name: payload.userName,
        user_pseudonym: payload.userPseudonym
      })
      .select()
      .single();

    if (error) {
      // Erro 23505 = Violation of UNIQUE constraint (one_response_per_day)
      if (error.code === '23505') {
        throw new Error("ALREADY_ANSWERED");
      }
      throw error;
    }
    return this.mapResponse(data);
  },

  async getUserHistory(userId: string): Promise<Response[]> {
    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data.map((r: any) => this.mapResponse(r));
  },

  async addReaction(responseId: string, userId: string, type: 'identificado' | 'orando') {
    const { error } = await supabase
      .from('reactions')
      .insert({
        response_id: responseId,
        user_id: userId,
        type: type
      });
    return !error;
  }
};
