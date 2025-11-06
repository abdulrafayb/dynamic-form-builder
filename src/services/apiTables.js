import supabase from "./supabase";

export async function getTablesData() {
  try {
    const { data, error } = await supabase.from("tables").select("*");

    if (error) {
      throw new Error(error.message);
    }

    const parseJsonField = (field) => {
      try {
        if (
          typeof field === "string" &&
          field !== "" &&
          field !== "[object Object]"
        ) {
          return JSON.parse(field);
        } else if (typeof field === "object" && field !== null) {
          return field;
        }
      } catch (e) {
        console.warn(`Failed to parse JSON for field: ${field}`, e);
      }
      return [];
    };

    const parsedData = data.map((item) => ({
      ...item,
      header: parseJsonField(item.header),
      lines: parseJsonField(item.lines),
      lineDetails: parseJsonField(item.lineDetails),
    }));

    return parsedData;
  } catch (error) {
    console.error("Error fetching table data:", error.message);
    throw error;
  }
}

export async function getTableDataById(id) {
  try {
    const { data, error } = await supabase
      .from("tables")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const parseJsonField = (field) => {
      try {
        if (
          typeof field === "string" &&
          field !== "" &&
          field !== "[object Object]"
        ) {
          return JSON.parse(field);
        } else if (typeof field === "object" && field !== null) {
          return field;
        }
      } catch (e) {
        console.warn(`Failed to parse JSON for field: ${field}`, e);
      }
      return [];
    };

    if (data) {
      return {
        ...data,
        header: parseJsonField(data.header),
        lines: parseJsonField(data.lines),
        lineDetails: parseJsonField(data.lineDetails),
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching single table data:", error.message);
    throw error;
  }
}

export async function updateTableDataItem(id, updatedFields) {
  try {
    const { data, error } = await supabase
      .from("tables")
      .update(updatedFields)
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error updating table data item:", error.message);
    throw error;
  }
}

export async function saveTableData(data) {
  try {
    const { data: newTable, error } = await supabase.from("tables").insert([
      {
        header: JSON.stringify(data.header),
        lines: JSON.stringify(data.lines),
        lineDetails: JSON.stringify(data.lineDetails),
      },
    ]);

    if (error) {
      throw new Error(error.message);
    }

    return newTable;
  } catch (error) {
    console.error("Error saving table data:", error.message);
    throw error;
  }
}
