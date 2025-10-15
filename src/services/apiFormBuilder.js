import supabase from "./supabase";

export async function getFormStructure(formId) {
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .eq("id", formId)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error("Form could not be loaded");
  }

  // Attempt to parse JSON fields, handling potential `"[object Object]"` strings
  const parseJsonField = (field) => {
    try {
      // Check if the field is a string and not the problematic "[object Object]"
      if (typeof field === "string" && field !== "[object Object]") {
        return JSON.parse(field);
      } else if (typeof field === "object" && field !== null) {
        // If it's already an object, return it directly
        return field;
      }
    } catch (e) {
      console.warn(`Failed to parse JSON for field: ${field}`, e);
    }
    return []; // Default to empty array if parsing fails or field is malformed
  };

  if (data) {
    return {
      ...data,
      header: parseJsonField(data.header),
      lines: parseJsonField(data.lines),
      lineDetails: parseJsonField(data.lineDetails),
    };
  }

  return data;
}

export async function createFormTab(formId, level, tabData) {
  const { data: form, error: fetchError } = await supabase
    .from("forms")
    .select("*")
    .eq("id", formId)
    .maybeSingle();

  if (fetchError) {
    console.error(fetchError);
    throw new Error("Form could not be loaded");
  }

  const currentArray = form[level] || [];
  const newTab = {
    id: crypto.randomUUID(),
    ...tabData,
    fields: [],
  };
  const updatedArray = [...currentArray, newTab];

  const { data, error } = await supabase
    .from("forms")
    .update({ [level]: updatedArray })
    .eq("id", formId)
    .select();

  if (error) {
    console.error(error);
    throw new Error("Tab could not be created");
  }

  return data[0];
}

export async function deleteFormTab(formId, level, tabId) {
  const { data: form, error: fetchError } = await supabase
    .from("forms")
    .select("*")
    .eq("id", formId)
    .maybeSingle();

  if (fetchError) {
    console.error(fetchError);
    throw new Error("Form could not be loaded");
  }

  const currentArray = form[level] || [];
  const updatedArray = currentArray.filter((tab) => tab.id !== tabId);

  const { error } = await supabase
    .from("forms")
    .update({ [level]: updatedArray })
    .eq("id", formId);

  if (error) {
    console.error(error);
    throw new Error("Tab could not be deleted");
  }

  return null;
}

export async function createFormField(formId, level, tabId, fieldData) {
  const { data: form, error: fetchError } = await supabase
    .from("forms")
    .select("*")
    .eq("id", formId)
    .maybeSingle();

  if (fetchError) {
    console.error(fetchError);
    throw new Error("Form could not be loaded");
  }

  const currentArray = form[level] || [];
  const updatedArray = currentArray.map((tab) => {
    if (tab.id === tabId) {
      return {
        ...tab,
        fields: [
          ...(tab.fields || []),
          {
            id: crypto.randomUUID(),
            ...fieldData,
          },
        ],
      };
    }
    return tab;
  });

  const { data, error } = await supabase
    .from("forms")
    .update({ [level]: updatedArray })
    .eq("id", formId)
    .select();

  if (error) {
    console.error(error);
    throw new Error("Field could not be created");
  }

  return data[0];
}

export async function deleteFormField(formId, level, tabId, fieldId) {
  const { data: form, error: fetchError } = await supabase
    .from("forms")
    .select("*")
    .eq("id", formId)
    .maybeSingle();

  if (fetchError) {
    console.error(fetchError);
    throw new Error("Form could not be loaded");
  }

  const currentArray = form[level] || [];
  const updatedArray = currentArray.map((tab) => {
    if (tab.id === tabId) {
      return {
        ...tab,
        fields: (tab.fields || []).filter((field) => field.id !== fieldId),
      };
    }
    return tab;
  });

  const { error } = await supabase
    .from("forms")
    .update({ [level]: updatedArray })
    .eq("id", formId);

  if (error) {
    console.error(error);
    throw new Error("Field could not be deleted");
  }

  return null;
}
