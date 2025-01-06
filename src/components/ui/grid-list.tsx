"use client"

import type React from "react"

import { IconHamburger } from "justd-icons"
import type { GridListItemProps, GridListProps } from "react-aria-components"
import {
  Button,
  GridListItem,
  GridList as GridListPrimitive,
  composeRenderProps,
} from "react-aria-components"
import { tv } from "tailwind-variants"

import { cn } from "@/utils/classes"
import { Checkbox } from "./checkbox"
import { composeTailwindRenderProps } from "./primitive"

const gridListStyles = tv({
  base: "relative max-h-96 overflow-auto rounded-lg border [scrollbar-width:thin] *:data-drop-target:border *:data-drop-target:border-accent [&::-webkit-scrollbar]:size-0.5",
})

const GridList = <T extends object>({ children, className, ...props }: GridListProps<T>) => (
  <GridListPrimitive className={composeTailwindRenderProps(className, gridListStyles())} {...props}>
    {children}
  </GridListPrimitive>
)

const itemStyles = tv({
  base: "group -mb-px -outline-offset-2 relative flex cursor-default select-none gap-3 border-y px-3 py-2 text-fg outline-hidden transition [--selected-item-hovered:theme(--color-muted/70%)] [--selected-item:theme(--color-muted/80%)] first:rounded-t-md first:border-t-0 last:mb-0 last:rounded-b-md last:border-b-0 sm:text-sm",
  variants: {
    isHovered: { true: "bg-subtle" },
    isSelected: {
      true: "z-20 border-border/50 bg-(--selected-item) data-hovered:bg-(--selected-item-hovered)",
    },
    isFocused: {
      true: "outline-hidden",
    },
    isFocusVisible: {
      true: "bg-(--selected-item) outline-hidden ring-1 ring-ring data-hovered:bg-(--selected-item-hovered) data-selected:bg-(--selected-item)",
    },
    isDisabled: {
      true: "text-muted-fg/70 forced-colors:text-[GrayText]",
    },
  },
})

const Item = ({ className, ...props }: GridListItemProps) => {
  const textValue = typeof props.children === "string" ? props.children : undefined
  return (
    <GridListItem
      textValue={textValue}
      {...props}
      className={composeRenderProps(className, (className, renderProps) =>
        itemStyles({ ...renderProps, className }),
      )}
    >
      {({ selectionMode, selectionBehavior, allowsDragging }) => (
        <>
          {allowsDragging && (
            <Button
              slot="drag"
              className="cursor-grab data-dragging:cursor-grabbing *:data-[slot=icon]:text-muted-fg"
            >
              <IconHamburger />
            </Button>
          )}

          <span
            aria-hidden
            className="absolute inset-y-0 left-0 hidden h-full w-0.5 bg-primary group-data-selected:block"
          />
          {selectionMode === "multiple" && selectionBehavior === "toggle" && (
            <Checkbox className="-mr-2" slot="selection" />
          )}
          {props.children as React.ReactNode}
        </>
      )}
    </GridListItem>
  )
}

const EmptyState = ({ ref, className, ...props }: React.ComponentProps<"div">) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
)

GridList.Item = Item
GridList.EmptyState = EmptyState

export type { GridListProps, GridListItemProps }
export { GridList }
