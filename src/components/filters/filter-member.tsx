"use client";

import type { Selection } from "react-aria-components";
import { Button, Menu } from "../ui";
import { CosmoArtistWithMembersBFF } from "@/lib/universal/cosmo/artists";
import { useCallback, useMemo } from "react";
import { useFilters } from "@/hooks/use-filters";

type Props = {
  artists: CosmoArtistWithMembersBFF[];
};

export default function MemberFilter({ artists }: Props) {
  const [filters, setFilters] = useFilters();
  const selected = useMemo(() => new Set(filters.member), [filters.member]);

  const update = useCallback(
    (key: Selection) => {
      const newFilters = [...key] as string[];
      setFilters({
        member: newFilters.length > 0 ? newFilters : null,
        artist: null,
      });
    },
    [setFilters]
  );

  return (
    <Menu>
      <Button
        appearance="outline"
        className={
          filters.member
            ? "data-pressed:border-primary data-hovered:border-primary border-primary"
            : ""
        }
      >
        Member
      </Button>
      <Menu.Content
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectionChange={update}
        items={artists}
        className="min-w-52"
      >
        {(artist) => (
          <Menu.Section
            title={artist.title}
            items={artist.artistMembers}
            id={artist.name}
          >
            {(member) => (
              <Menu.Checkbox id={member.name} textValue={member.name}>
                {member.name}
              </Menu.Checkbox>
            )}
          </Menu.Section>
        )}
      </Menu.Content>
    </Menu>
  );
}