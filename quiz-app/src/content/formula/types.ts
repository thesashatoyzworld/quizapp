// Типы дерева контента «Формула Вирусного Контента» (см. content.json).

export type RichLink = { to?: string; anchor?: string; href?: string };
export type Rich = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  link?: RichLink | null;
};

export type Block =
  | { t: 'p'; rich: Rich[] }
  | { t: 'heading'; level?: number; anchor?: string; rich: Rich[] }
  | { t: 'video'; loomId: string }
  | { t: 'image'; src: string; alt?: string }
  | { t: 'file'; name: string; available: boolean }
  | { t: 'list'; ordered: boolean; items: ListItem[] }
  | { t: 'toggle'; title: string; color?: string; children: Block[] }
  | { t: 'callout'; icon?: string; color?: string; children: Block[] }
  | { t: 'childpage'; to: string; title: string }
  | { t: 'divider' };

export type ListItem = { rich?: Rich[]; children?: Block[] };

export type Page = {
  slug: string;
  title: string;
  color?: string;
  videos?: { loomId: string; title?: string }[];
  images?: string[];
  files?: { name: string; available: boolean }[];
  blocks: Block[];
  prev?: string | null;
  next?: string | null;
};

export type NavNode = {
  slug: string;
  title: string;
  color?: string;
  children?: NavNode[];
};

export type Content = { nav: NavNode[]; pages: Record<string, Page> };
