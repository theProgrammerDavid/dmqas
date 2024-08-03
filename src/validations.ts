import { z } from "zod";

export const Flow = z.object({
    url: z.string().url({ message: "invalid url" }),
    logLevel: z.enum(['info']),
    actions: z.array(z.any()),
});

export const Config = z.object({
    customSize: z.boolean({
        required_error: "isActive is required",
        invalid_type_error: "isActive must be a boolean",
    }),
    width: z.number({
        required_error: "width is required",
        invalid_type_error: "width must be a number",
    }),
    height: z.number({
        required_error: "height is required",
        invalid_type_error: "height must be a number",
    }),
    flows: z.array(Flow),
});

export const CliArgs = z.object({
    _: z.any(),
    headless: z.boolean({
        required_error: "headless is required",
        invalid_type_error: "headless must be a boolean",
    }),
    updateScreenshots: z.boolean({
        // required_error: "headless is required",
        invalid_type_error: "updateScreenshots must be a boolean",
    }),
    config: z.string({
        required_error: "config is required",
        invalid_type_error: "config must be a string",
    })
})