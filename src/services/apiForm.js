import supabase from "./supabase";

export async function getForms() {
  const { data, error } = await supabase.from("forms").select("*");

  if (error) {
    console.error(error);
    throw new Error("Forms data could not be loaded");
  }

  return data;
}

export async function getFormById(id) {
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    throw new Error(`Form with ID ${id} could not be loaded`);
  }

  return data;
}

export async function createForm(templateName) {
  const { data, error } = await supabase
    .from("forms")
    .insert([
      { templateName: templateName, header: [], lines: [], lineDetails: [] },
    ])
    .select();

  if (error) {
    console.error(error);
    throw new Error("Form could not be created");
  }

  return data;
}

export async function deleteForm(id) {
  const { error } = await supabase.from("forms").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Form could not be deleted");
  }

  return null;
}
