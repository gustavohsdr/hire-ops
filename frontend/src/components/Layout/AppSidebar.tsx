import { NavLink, Stack, Text } from "@mantine/core";
import { IconChartBar, IconLayoutKanban, IconSettings } from "@tabler/icons-react";

const links = [
  { label: "Controle de Vagas", icon: IconLayoutKanban, active: true },
  { label: "Indicadores", icon: IconChartBar, active: false },
  { label: "Configurações", icon: IconSettings, active: false },
];

export function AppSidebar() {
  return (
    <Stack gap={4} p="sm">
      <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" mb={4}>Menu</Text>
      {links.map((l) => (
        <NavLink key={l.label} label={l.label} leftSection={<l.icon size={16} />} active={l.active} variant="light" color="blue" style={{ borderRadius: 8 }} />
      ))}
    </Stack>
  );
}
