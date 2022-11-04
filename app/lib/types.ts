import { z } from "zod";

export type Identified = z.infer<typeof Identified>;
export const Identified = z.object({ id: z.string() });

export type Field = z.infer<typeof Field>;
export const Field = z.object({
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

export type Collection = z.infer<typeof Collection>;
export const Collection = Identified.extend({
    name: z.string(),
    fields: z.array(Field),
});

export type Tenant = z.infer<typeof Tenant>;
export const Tenant = Identified.extend({ name: z.string() });

export type Query = z.infer<typeof Query>;
export const Query = Identified.extend({
    created: z.string(),
    statement: z.string(),
});

export type Session = z.infer<typeof Session>;
export const Session = Identified.extend({
    data: z.record(z.any()),
    expires: z.date().optional(),
});

export type Identity = z.infer<typeof Identity>;
export const Identity = Identified.extend({
    username: z.string(),
    password: z.string(),
    admin: z.boolean(),
    roles: z.record(z.enum(["owner", "editor", "creator", "moderator"])),
});
