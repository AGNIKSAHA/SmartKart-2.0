import { task } from "@trigger.dev/sdk/v3";
import { sendEmailDirectly } from "../common/utils/mail.js";
export const emailTask = task({
    id: "send-email",
    run: async (payload) => {
        // Send the email directly
        await sendEmailDirectly(payload);
        return {
            status: "sent",
            to: payload.to,
        };
    },
});
