export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type LooseRow = Record<string, unknown>;

export type Database = {
  public: {
    Tables: Record<
      string,
      {
        Row: LooseRow;
        Insert: LooseRow;
        Update: LooseRow;
        Relationships: [];
      }
    >;
    Views: Record<
      string,
      {
        Row: LooseRow;
        Relationships: [];
      }
    >;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
