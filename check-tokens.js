import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, expo_push_token");
    
  if (error) {
    console.error("Error fetching profiles:", error);
  } else {
    console.log("Profiles in DB:", JSON.stringify(data, null, 2));
  }
}

check();
