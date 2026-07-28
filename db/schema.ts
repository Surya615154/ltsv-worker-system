import { sql } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const officeState = sqliteTable(
  "office_state",
  {
    id: text("id").primaryKey(),
    payload: text("payload").notNull(),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("office_state_updated_at_idx").on(table.updatedAt)],
);
