"use client";

import { useFilters } from "@/hooks/use-filters";
import { Button, Popover, TextField } from "../ui";
import { useDebounceCallback } from "usehooks-ts";
import { IconCircleQuestionmark, IconX } from "justd-icons";
import { useCallback, useState } from "react";

export default function FilterSearch() {
  const [filters, setFilters] = useFilters();
  const [query, setQuery] = useState(filters.search ?? "");

  const debounced = useDebounceCallback((value: string) => {
    setFilters({
      search: value === "" ? null : value,
    });
  }, 250);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      debounced(value);
    },
    [setQuery, debounced]
  );

  return (
    <div>
      <TextField
        placeholder={`Quick search..`}
        onChange={handleChange}
        className="min-w-65"
        value={query}
        aria-label="Search"
        suffix={
          query.length > 0 ? (
            <Button appearance="plain" onPress={() => handleChange("")}>
              <IconX />
            </Button>
          ) : (
            <Popover>
              <Button appearance="plain">
                <IconCircleQuestionmark />
              </Button>
              <Popover.Content className="sm:max-w-96">
                <Popover.Header>
                  <Popover.Title hidden>Info</Popover.Title>
                  <Popover.Description className="prose text-fg">
                    This quick search support:
                    <ul>
                      <li>Multiple query separate by comma ( , )</li>
                      <li>Member name in shortform (e.g. naky, yy)</li>
                      <li>Collection No. range (e.g. 301z-302z)</li>
                      <li>Serial No. range (e.g. #1-20)</li>
                    </ul>
                    <p>Example: yy c301-302 #10-100, jw 201z</p>
                  </Popover.Description>
                </Popover.Header>
              </Popover.Content>
            </Popover>
          )
        }
      />
    </div>
  );
}
