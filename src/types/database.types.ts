export interface Database {
  public: {
    Tables: {
      alumni: {
        Row: {
          id: string;
          email: string;
          name: string;
          batch_year: number;
          profile_photo_url: string | null;
          phone: string | null;
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          marital_status: 'single' | 'married' | 'divorced' | 'widowed' | 'separated' | 'prefer_not_to_say' | null;
          date_of_birth: string | null;
          age: number | null;
          bio: string | null;
          whatsapp_number: string | null;
          facebook_url: string | null;
          instagram_url: string | null;
          twitter_url: string | null;
          linkedin_url: string | null;
          snapchat_url: string | null;
          github_url: string | null;
          portfolio_url: string | null;
          current_city: string | null;
          current_country: string | null;
          role: 'admin' | 'alumni' | 'student' | 'guest';
          verified: boolean;
          profile_completed: boolean;
          last_active: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          batch_year: number;
          profile_photo_url?: string | null;
          phone?: string | null;
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          marital_status?: 'single' | 'married' | 'divorced' | 'widowed' | 'separated' | 'prefer_not_to_say' | null;
          date_of_birth?: string | null;
          age?: number | null;
          bio?: string | null;
          whatsapp_number?: string | null;
          facebook_url?: string | null;
          instagram_url?: string | null;
          twitter_url?: string | null;
          linkedin_url?: string | null;
          snapchat_url?: string | null;
          github_url?: string | null;
          portfolio_url?: string | null;
          current_city?: string | null;
          current_country?: string | null;
          role?: 'admin' | 'alumni' | 'student' | 'guest';
          verified?: boolean;
          profile_completed?: boolean;
          last_active?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          batch_year?: number;
          profile_photo_url?: string | null;
          phone?: string | null;
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          marital_status?: 'single' | 'married' | 'divorced' | 'widowed' | 'separated' | 'prefer_not_to_say' | null;
          date_of_birth?: string | null;
          age?: number | null;
          bio?: string | null;
          whatsapp_number?: string | null;
          facebook_url?: string | null;
          instagram_url?: string | null;
          twitter_url?: string | null;
          linkedin_url?: string | null;
          snapchat_url?: string | null;
          github_url?: string | null;
          portfolio_url?: string | null;
          current_city?: string | null;
          current_country?: string | null;
          role?: 'admin' | 'alumni' | 'student' | 'guest';
          verified?: boolean;
          profile_completed?: boolean;
          last_active?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'admin' | 'alumni' | 'student' | 'guest';
      gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
      marital_status: 'single' | 'married' | 'divorced' | 'widowed' | 'separated' | 'prefer_not_to_say';
    };
  };
}

// Additional type exports for easier use
export type Alumni = Database['public']['Tables']['alumni']['Row'];
export type AlumniInsert = Database['public']['Tables']['alumni']['Insert'];
export type AlumniUpdate = Database['public']['Tables']['alumni']['Update'];