import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { LookupOptions } from "@/lib/types/signals";

export async function getLookupOptions(): Promise<LookupOptions> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return emptyLookups();
  }
  const client = supabase;

  const [sectors, responseHorizons, directions, statuses, sourceTypes, implicationTypes, timeHorizons, relationshipTypes, signalTargets] = await Promise.all([
    getLookup("sectors"),
    getLookup("response_horizons"),
    getLookup("directions"),
    getLookup("signal_statuses"),
    getLookup("source_types"),
    getLookup("implication_types"),
    getLookup("time_horizons"),
    getLookup("relationship_types"),
    getSignalTargets()
  ]);

  return {
    sectors,
    responseHorizons,
    directions,
    statuses,
    sourceTypes,
    implicationTypes,
    timeHorizons,
    relationshipTypes,
    signalTargets
  };

  async function getLookup(table: string) {
    const { data } = await client
      .from(table)
      .select("id, code, name_fi, name_en, display_order")
      .order("display_order", { ascending: true });

    return (data ?? []).map((row) => ({
      id: typeof row.id === "string" ? row.id : String(row.id),
      code: typeof row.code === "string" ? row.code : "",
      label:
        typeof row.name_fi === "string"
          ? row.name_fi
          : typeof row.name_en === "string"
            ? row.name_en
            : typeof row.code === "string"
              ? row.code
              : ""
    }));
  }

  async function getSignalTargets() {
    const { data } = await client
      .from("signals")
      .select("id, signal_code, title")
      .order("updated_at", { ascending: false });

    return (data ?? []).map((row) => {
      const code = typeof row.signal_code === "string" ? row.signal_code : "";
      const title = typeof row.title === "string" ? row.title : "";
      return {
        id: typeof row.id === "string" ? row.id : String(row.id),
        code,
        label: code ? `${code} - ${title}` : title
      };
    });
  }
}

function emptyLookups(): LookupOptions {
  return {
    sectors: [],
    responseHorizons: [],
    directions: [],
    statuses: [],
    sourceTypes: [],
    implicationTypes: [],
    timeHorizons: [],
    relationshipTypes: [],
    signalTargets: []
  };
}
