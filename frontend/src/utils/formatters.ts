export const formatarDataLocal = (dateString?: string | Date) => {
  if (!dateString) return "";
  const dateStr = typeof dateString === "string" ? dateString.split("T")[0] : dateString.toISOString().split("T")[0];
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};
