import {
  Dumbbell,
  Gift,
  Scissors,
  Shirt,
  Smartphone,
  Sofa,
  Ticket,
  Utensils,
  Wrench,
  type LucideProps,
} from "lucide-react";
import type { CategoryIcon as CategoryIconName } from "@/types";

const icons = {
  utensils: Utensils,
  shirt: Shirt,
  scissors: Scissors,
  smartphone: Smartphone,
  dumbbell: Dumbbell,
  sofa: Sofa,
  wrench: Wrench,
  gift: Gift,
  ticket: Ticket,
} satisfies Record<CategoryIconName, unknown>;

export function CategoryIcon({ name, ...props }: LucideProps & { name: CategoryIconName }) {
  const Icon = icons[name];
  return <Icon strokeWidth={1.6} aria-hidden {...props} />;
}
