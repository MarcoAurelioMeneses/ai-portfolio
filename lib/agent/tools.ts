import { tool } from "ai";
import { z } from "zod";
import { site } from "@/content/site";
import {
  allowedScrollTargets,
  isCaseId,
  isSectionId,
} from "@/lib/agent/targets";

export const agentTools = {
  scroll_to: tool({
    description:
      "Move the visitor to a home section (scroll) or open a case page. Call this when the user asks to see, open, or go to a part of the site. A case id opens /cases/[id].",
    inputSchema: z.object({
      target: z
        .string()
        .describe(
          `Section or case id. Allowed: ${allowedScrollTargets().join(", ")}.`,
        ),
    }),
    execute: async ({ target }) => {
      if (!isSectionId(target) && !isCaseId(target)) {
        return {
          action: "scroll" as const,
          ok: false as const,
          error: `Unknown target. Allowed: ${allowedScrollTargets().join(", ")}.`,
        };
      }
      return { action: "scroll" as const, ok: true as const, target };
    },
  }),
  show_contact: tool({
    description:
      "Show Marco's contact card in the chat (email, LinkedIn, and GitHub). Call this when the user asks how to get in touch or asks for any contact link.",
    inputSchema: z.object({
      reason: z
        .string()
        .optional()
        .describe("Short reason the card is being shown, for the trace."),
    }),
    execute: async () => ({
      action: "show_contact" as const,
      ok: true as const,
      contact: {
        email: site.contact.email,
        links: site.contact.links.map((link) => ({
          label: link.label,
          href: link.href,
        })),
      },
    }),
  }),
};
