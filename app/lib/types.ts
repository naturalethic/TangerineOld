import { z } from "zod";

export type Identified = z.infer<typeof Identified>;
export const Identified = z.object({ id: z.string() });

export type Collection = z.infer<typeof Collection>;
export const Collection = Identified.extend({ name: z.string() });

export type Field = z.infer<typeof Field>;
export const Field = Identified.extend({
    collection: z.string(),
    name: z.string(),
    type: z.enum([
        "checkbox",
        "text",
        "textarea",
        "radio",
        "date",
        "time",
        "datetime",
        "reference",
    ]),
    values: z.preprocess((value) => {
        if (typeof value === "string") {
            return value
                .split(",")
                .map((v) => v.trim())
                .filter((v) => v);
        }
        return value;
    }, z.string().array().optional()),
});

export type Tenant = z.infer<typeof Tenant>;
export const Tenant = Identified.extend({ name: z.string() });

export type Query = z.infer<typeof Query>;
export const Query = Identified.extend({
    created: z.string(),
    statement: z.string(),
});
