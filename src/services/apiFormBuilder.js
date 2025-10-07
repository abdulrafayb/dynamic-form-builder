import supabase from "./supabase";

export async function getFormTabs(formId) {
  const { data, error } = await supabase
    .from("form_tabs")
    .select("*")
    .eq("form_id", formId)
    .order("order_index");

  if (error) {
    console.error(error);
    throw new Error("Form tabs could not be loaded");
  }

  return data;
}

export async function createFormTab(tabData) {
  const { data, error } = await supabase
    .from("form_tabs")
    .insert([tabData])
    .select();

  if (error) {
    console.error(error);
    throw new Error("Tab could not be created");
  }

  return data[0];
}

export async function deleteFormTab(tabId) {
  const { error } = await supabase.from("form_tabs").delete().eq("id", tabId);

  if (error) {
    console.error(error);
    throw new Error("Tab could not be deleted");
  }

  return null;
}

export async function getFormFields(formId) {
  const { data, error } = await supabase
    .from("form_fields")
    .select("*")
    .eq("form_id", formId)
    .order("order_index");

  if (error) {
    console.error(error);
    throw new Error("Form fields could not be loaded");
  }

  return data;
}

export async function createFormField(fieldData) {
  const { data, error } = await supabase
    .from("form_fields")
    .insert([fieldData])
    .select();

  if (error) {
    console.error(error);
    throw new Error("Field could not be created");
  }

  return data[0];
}

export async function deleteFormField(fieldId) {
  const { error } = await supabase
    .from("form_fields")
    .delete()
    .eq("id", fieldId);

  if (error) {
    console.error(error);
    throw new Error("Field could not be deleted");
  }

  return null;
}

export async function getFormStructure(formId) {
  const [form, tabs, fields] = await Promise.all([
    supabase.from("forms").select("*").eq("id", formId).maybeSingle(),
    supabase
      .from("form_tabs")
      .select("*")
      .eq("form_id", formId)
      .order("order_index"),
    supabase
      .from("form_fields")
      .select("*")
      .eq("form_id", formId)
      .order("order_index"),
  ]);

  if (form.error) {
    console.error(form.error);
    throw new Error("Form could not be loaded");
  }

  if (tabs.error) {
    console.error(tabs.error);
    throw new Error("Tabs could not be loaded");
  }

  if (fields.error) {
    console.error(fields.error);
    throw new Error("Fields could not be loaded");
  }

  return {
    form: form.data,
    tabs: tabs.data,
    fields: fields.data,
  };
}
