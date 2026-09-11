import { Avatar, Burger, Button, Group, Text, TextInput } from "@mantine/core";
import { IconPlus, IconSearch } from "@tabler/icons-react";

interface Props {
  busca: string;
  onBuscaChange: (v: string) => void;
  onNovaVaga: () => void;
  opened: boolean;
  onToggle: () => void;
}

export function AppHeader({ busca, onBuscaChange, onNovaVaga, opened, onToggle }: Props) {
  return (
    <Group h="100%" px="md" justify="space-between" wrap="nowrap">
      <Group gap="sm">
        <Burger opened={opened} onClick={onToggle} hiddenFrom="sm" size="sm" />
        <Text fw={800} size="lg">RH App</Text>
      </Group>
      <TextInput placeholder="Buscar vaga..." leftSection={<IconSearch size={16} />} value={busca} onChange={(e) => onBuscaChange(e.currentTarget.value)} maw={360} style={{ flex: 1 }} visibleFrom="sm" />
      <Group gap="sm" wrap="nowrap">
        <Button leftSection={<IconPlus size={16} />} onClick={onNovaVaga} radius="md" size="sm">Nova Vaga</Button>
        <Avatar radius="xl" color="blue" size="sm">RH</Avatar>
      </Group>
    </Group>
  );
}
