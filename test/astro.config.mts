import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import { StaticCms } from "../dist";

// https://astro.build/config
export default defineConfig({
  site: "https://example.com",
  integrations: [
    mdx(),
    sitemap(),
    StaticCms({
      config: {
        editor: {
          frame: false,
          size: "half",
        },
        backend: {
          name: "test-repo",
        },
        collections: [
          {
            name: "blog",
            label: "Blog Posts",
            label_singular: "Blog Post",
            folder: "src/content/blog",
            create: true,
            delete: true,
            // preview_path: "/blog/{{slug}}",
            fields: [
              {
                name: "title",
                widget: "string",
                label: "Post Title",
              },
              {
                name: "description",
                widget: "string",
                label: "Description",
              },
              {
                name: "pubDate",
                widget: "datetime",
                format: "MMM dd yyyy",
                date_format: "MMM dd yyyy",
                time_format: false,
                label: "Publish Date",
              },
              {
                name: "heroImage",
                widget: "string",
                label: "Hero image",
                required: false,
              },
              {
                name: "body",
                widget: "markdown",
                label: "Post Body",
              },
            ],
          },
        ],
      },
    }),
  ],
});
