import { NavLink, Stack, Text } from "@mantine/core";
import { IconChartBar, IconLayoutKanban, IconSettings } from "@tabler/icons-react";

export function AppSidebar({ page, onNavigate }: { page: string; onNavigate: (p: string) => void }) {
  const links = [
    { label: "Controle de Vagas", icon: IconLayoutKanban, id: "kanban" },
    { label: "Indicadores", icon: IconChartBar, id: "indicadores" },
    { label: "Configurações", icon: IconSettings, id: "configuracoes" },
  ];
  return (
    <Stack gap={4} p="sm">
      <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" mb={4}>Menu</Text>
      {links.map((l) => (
        <NavLink key={l.id} label={l.label} leftSection={<l.icon size={16} />} active={page === l.id} onClick={() => onNavigate(l.id)} variant="light" color="blue" style={{ borderRadius: 8 }} />
      ))}
    </Stack>
  );
}
